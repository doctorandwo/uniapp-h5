<template>
    <PageFrame class="page-goods" bg="#F0F2F6" withTabbarBg showTabbar>
        <image slot="headerTitle" class="title-goods" :src="$global.getImageUrl('pages/goods/title-goods.png')" />
        <view class="page-goods__body">
            <view class="input-wrap">
                <z1-input
                    v-model="keyword"
                    placeholder="请输入需要搜索的品类名称"
                    shape="circle"
                    :prefixIcon="$global.getImageUrl('pages/goods/icon-search.png')"
                    :prefixIconStyle="{ marginRight: '6rpx', width: '38rpx', height: '38rpx' }"
                    border="none"
                    placeholderStyle="color: #999;font-size: 26rpx;"
                    style="width: 100%"
                    @confirm="handleSearch"
                    @keyup.enter="handleSearch"
                />
            </view>
            <SearchFilterPanel @change="handleFilterChange" />
            <view class="scroll-wrap">
                <view v-if="scrollTop > 30" class="scroll-shadow" />
                <scroll-view
                    class="scroll"
                    refresher-background="transparent"
                    :refresher-triggered="triggered"
                    scroll-y
                    refresher-enabled
                    @scroll="onScroll"
                    @scrolltolower="scrolltolower"
                    @refresherrefresh="onRefresh"
                >
                    <view v-for="(item, index) in list" :key="item.code" class="card-box">
                        <CardInfo :info="item" :highlight="index === 0" :priceModelsMap="priceModelsMap" @refresh="refresh" />
                    </view>
                    <Empty v-if="!list.length" style="position: absolute; left: 50%; top: 35%; transform: translate(-50%, -35%)" />
                    <template v-else>
                        <uni-load-more :status="status" :icon-size="16" style="margin-bottom: 20rpx" />
                    </template>
                    <view :style="{ height: tabbarHeight + 'px' }" />
                </scroll-view>
            </view>
        </view>
        <template #components>
            <view class="publish-btn" :style="{ bottom: publishBtnBottom + 'px' }" @click="handlePublish">
                <view class="publish-btn__icon" />
                <text class="publish-btn__text">发布货源</text>
            </view>
            <ModalIncrement
                v-if="visibleIncrement"
                :visible.sync="visibleIncrement"
                :goodsName="modalIncrementOptions.goodsName"
                :current="modalIncrementOptions.total"
                :unit="modalIncrementOptions.unit"
                @close="closeModal"
                @confirm="handleConfirmIncrement"
            />
            <!-- @by oh-my-zerone 货源码图片遮罩：直接展示接口图片，无关闭按钮，点击遮罩关闭 -->
            <view v-if="visibleQr" class="qr-mask" @click="closeQr">
                <image
                    v-if="qrModal.qrCode"
                    :key="qrModal.qrCode"
                    class="qr-mask__img"
                    :src="qrModal.qrCode"
                    mode="aspectFit"
                    style="width: 640rpx; height: 940rpx"
                    @error="handleQrImgError"
                    @click.stop
                />
                <view v-else class="qr-mask__tip" style="width: 640rpx; height: 940rpx" @click.stop>
                    {{ qrModal.loading ? '加载中…' : '暂无货源码' }}
                </view>
                <!-- <view v-if="qrModal.orderCode" class="qr-mask__code" @click.stop>{{ qrModal.orderCode }}</view> -->
            </view>
        </template>
    </PageFrame>
</template>

<script>
import PageFrame from '@/pages/components/PageFrame/index.vue';
import Empty from '@/components/Empty/index.vue';
import CardInfo from './components/CardInfo/index.vue';
import SearchFilterPanel from './components/SearchFilterPanel/index.vue';
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { ApiGetSourceList, ApiGetCym } from './services.js';
import throttle from '@/common/utils/throttle.js';
import ModalIncrement from './components/CardInfo/OperateRow/ModalIncrement.vue';
import { ApiIncrementDkOrderStowage } from '@/pages/goods/services.js';
import { useDicts } from './dicts.js';
const { dicts, fetchPriceModels } = useDicts();

export default {
    components: { PageFrame, Empty, CardInfo, SearchFilterPanel, ModalIncrement },
    data() {
        return {
            keyword: '',
            filterForm: null,
            list: [],
            total: 0,
            queryPage: {
                // @by oh-my-zerone 筛选字段对齐接口文档（货源查询.md），按需由 handleFilterChange 写入
                // beginTime: '',   // 开始时间
                // endTime: '',     // 结束时间
                // status: [],      // 订单状态（0 已发布 / 1 下架 / 2 未发布 / 3 已完成）
                // publishMode: '', // 发布方式（0 大厅不可见 / 1 大厅可见）
                pageNum: 1,
                pageSize: 10,
            },
            triggered: false,
            loading: false,
            scrollTop: 0,
            pendingAuthFetch: false, // 认证信息未就绪导致请求被拦截时置位，就绪后自动补发

            visibleIncrement: false,
            modalIncrementOptions: {},

            visibleQr: false,
            qrModal: {},
            // @by oh-my-zerone 货源码 src 缓存：orderCode → 已落地可渲染 src，避免每次点开重复请求/写盘
            qrCache: {},
        };
    },
    computed: {
        isAuth() {
            // 与个人中心 isAuth 一致
            return this.$store.getters.isAuth;
        },
        isBottom() {
            return this.list?.length >= this.total;
        },
        status() {
            if (this.loading) return 'loading';
            return this.isBottom ? 'no-more' : 'more';
        },
        tabbarHeight() {
            return this.$store.getters.tabbarHeight;
        },
        /** 悬浮「发布货源」按钮距底部：tabbar 高度 + 14rpx 间距（设计稿 tabbar 上方 14rpx） */
        publishBtnBottom() {
            const { windowWidth } = uni.getSystemInfoSync();
            return this.tabbarHeight + (14 * windowWidth) / 750;
        },
        priceModelsMap() {
            if (!dicts.priceModels?.length) return {};
            return dicts.priceModels.reduce((prev, cur) => {
                prev[cur.dictValue] = cur.dictLabel;
                return prev;
            }, {});
        },
    },
    watch: {
        isAuth(val) {
            // 认证信息异步就绪且此前请求被拦截时，补发一次列表请求
            if (val && this.pendingAuthFetch) {
                this.pendingAuthFetch = false;
                this.handleSearch();
            }
        },
    },
    onLoad() {
        this.refreshPage();
        uni.$on('pages/goods/index:refresh', this.refreshPage);
        uni.$on('pages/goods/index:showIncrementModal', this.handleShowIncrementModal);
        uni.$on('pages/goods/index:showQr', this.handleShowQr);
    },
    onShow() {
        // 将 tabbar 选中态对齐为当前页面路由：覆盖服务号通知直达、返回等非点击 tabbar 的进入场景
        this.$store.dispatch('SyncTabbar');
    },
    onUnload() {
        uni.$off('pages/goods/index:refresh', this.refreshPage);
        uni.$off('pages/goods/index:showIncrementModal', this.handleShowIncrementModal);
        uni.$off('pages/goods/index:showQr', this.handleShowQr);
    },
    methods: {
        refreshPage() {
            fetchPriceModels();
            this.handleSearch();
        },
        /**
         * 「发布货源」按钮：先做货主认证校验，通过后进入发布货源流程（与首页快速发布一致）。
         */
        async handlePublish() {
            // TODO：后续需要放开
            // if (!(await this.$store.dispatch('IsOwnerAuth'))) return;
            // @by oh-my-zerone 与首页快速发布链路一致：先进入选点页 selectRoute，再由选点页引导进入 createQuote
            uni.navigateTo({ url: '/pages_goodsSource/sourcePublish/selectRoute/index' });
        },
        handleShowIncrementModal({ total, unit, goodsName, stowageStatus, code }) {
            this.visibleIncrement = true;
            this.modalIncrementOptions = {
                total,
                goodsName,
                unit,
                code,
                stowageStatus,
            };
        },
        closeModal() {
            this.modalIncrementOptions = {};
        },
        /**
         * 展示货源码弹窗（由卡片右上角二维码徽标触发）
         * 二维码不在列表数据中下发，弹窗打开时调 getCym 接口获取
         * @param {{ orderCode: string }} payload 货源编码（info.code）
         */
        async handleShowQr({ orderCode } = {}) {
            if (!orderCode) {
                uni.showToast({ title: '缺少货源编码', icon: 'none' });
                return;
            }
            // @by oh-my-zerone 性能优化：命中缓存直接展示，不再请求接口 / 重复写盘
            const cached = this.qrCache[orderCode];
            if (cached) {
                this.qrModal = { qrCode: cached, orderCode, loading: false };
                this.visibleQr = true;
                return;
            }
            this.qrModal = { qrCode: '', orderCode, loading: true };
            this.visibleQr = true;
            const [err, res] = await useRequest(ApiGetCym, orderCode, {
                carrierCodeType: 'zjzy',
            });
            if (!this.visibleQr) return; // 请求期间用户已关闭遮罩
            if (err) {
                // 原先失败直接关闭，表现为「点了没反应」；改为保留遮罩并提示
                this.qrModal = { qrCode: '', orderCode, loading: false };
                uni.showToast({ title: typeof err === 'string' ? err : '货源码加载失败', icon: 'none' });
                return;
            }
            const rawSrc = this.normalizeQrSrc(res);
            // @by oh-my-zerone
            // 小程序 <image> 对长 base64 data URL 渲染不稳定（常表现为白图不报错），
            // 因此统一把 base64 落地为本地临时文件后再交给 image 渲染
            const qrCode = await this.resolveQrRenderSrc(rawSrc, orderCode);
            // 成功即写缓存：用户中途关闭也不影响下次复用，避免重复请求
            if (qrCode) this.qrCache[orderCode] = qrCode;
            if (!this.visibleQr) return; // 写盘期间用户已关闭遮罩
            this.qrModal = { qrCode, orderCode, loading: false };
            if (!qrCode) {
                uni.showToast({ title: '暂无货源码', icon: 'none' });
            }
        },
        /**
         * 归一化 getCym 返回为 image 可用的 src
         * 兼容：完整 data URL / http(s) / 纯 base64 / { data: string }
         * @param {string|object} res useRequest 成功响应
         * @returns {string}
         */
        normalizeQrSrc(res) {
            let raw = '';
            if (typeof res === 'string') {
                raw = res;
            } else if (res && typeof res === 'object') {
                raw = res.data ?? res.qrCode ?? res.cargoCodeQr ?? '';
            }
            if (raw == null) return '';
            const s = String(raw).trim();
            if (!s) return '';
            // @by oh-my-zerone
            // base64 形式的 data URL：必须去掉换行/空白。服务端常按 MIME 每 76 字符换行，
            // 而小程序 <image> 解析含换行的 base64 会静默失败（白图、不报错）。
            const base64Match = /^(data:image\/[\w.+-]+;base64,)([\s\S]*)$/i.exec(s);
            if (base64Match) return base64Match[1] + base64Match[2].replace(/\s+/g, '');
            if (/^(data:image|https?:\/\/|\/\/|\/)/i.test(s)) return s;
            // 接口偶发只回纯 base64，补前缀才能在 image 上渲染
            return `data:image/png;base64,${s.replace(/\s+/g, '').replace(/^data:image\/\w+;base64,/i, '')}`;
        },
        /**
         * @by oh-my-zerone
         * 将 base64 data URL 落地为小程序本地临时文件，返回可直接渲染的路径。
         * 背景：微信小程序 <image> 直接渲染长 base64 data URL 不稳定（常白图且不报错），
         * 写盘为临时文件后渲染是官方推荐规避方式。
         * 兼容：非 base64（http / 已是本地路径）原样返回；写盘失败回退原始 src。
         * @param {string} src normalizeQrSrc 的输出
         * @param {string} [orderCode] 货源编码，用于命名临时文件
         * @returns {Promise<string>} 可渲染的 src
         */
        resolveQrRenderSrc(src, orderCode = '') {
            if (!src) return Promise.resolve('');
            // #ifdef MP-WEIXIN
            // 注意 [\s\S] 而非 .：base64 可能含换行，'.' 不匹配换行会导致匹配失败
            const matched = /^data:image\/([\w.+-]+);base64,([\s\S]+)$/i.exec(src);
            if (matched) {
                const ext = matched[1] || 'png';
                const base64 = matched[2].replace(/\s+/g, '');
                const dir = (typeof wx !== 'undefined' && wx.env && wx.env.USER_DATA_PATH) || '';
                const filePath = `${dir}/qr_${orderCode || Date.now()}.${ext}`;
                return new Promise(resolve => {
                    uni.getFileSystemManager().writeFile({
                        filePath,
                        data: base64,
                        encoding: 'base64',
                        success: () => resolve(filePath),
                        // 写盘失败回退 base64，保留原始渲染可能
                        fail: err => {
                            console.error('[货源码] base64 写临时文件失败', err);
                            resolve(src);
                        },
                    });
                });
            }
            // #endif
            return Promise.resolve(src);
        },
        /** 二维码图片加载失败诊断（小程序端 base64/路径异常时可在控制台看到原因） */
        handleQrImgError(e) {
            console.error('[货源码] 二维码图片加载失败', e);
        },
        closeQr() {
            this.visibleQr = false;
            this.qrModal = {};
        },
        async handleConfirmIncrement(increment) {
            if (!increment) {
                uni.showToast({ title: '请输入增量', icon: 'none' });
                return;
            }
            const { code, stowageStatus } = this.modalIncrementOptions;
            const key = stowageStatus == '2' ? 'number' : 'weight';
            const payload = {
                code,
                [key]: increment,
            };
            const [err, res] = await useRequest(ApiIncrementDkOrderStowage, payload);
            if (err) return;
            uni.showToast({ title: '操作成功', icon: 'success' });
            this.visibleIncrement = false;
            this.refresh();
        },
        handleFilterChange(filterForm) {
            this.filterForm = filterForm;
            console.log('filterForm', filterForm);
            const { time } = filterForm;
            // @by oh-my-zerone 时间字段对齐接口文档（货源查询.md）：
            // beginTime 取「开始时间」筛选范围的起点，endTime 取「结束时间」筛选范围的终点；
            // 空值置 undefined，交由 cleanGetParams 剔除，避免向后端传空串
            this.queryPage.beginTime = this.getTargetDateRange(time.loadStart).startTime || undefined;
            this.queryPage.endTime = this.getTargetDateRange(time.unloadEnd).endTime || undefined;
            // @by oh-my-zerone 发布方式（0 大厅不可见 / 1 大厅可见），0 是有效值，不能用 || 判空
            this.queryPage.publishMode = filterForm.smart === '' ? undefined : filterForm.smart;
            // @by oh-my-zerone 货源状态单选，status 为 integer；空串置 undefined 由 cleanGetParams 剔除
            this.queryPage.status = filterForm.all || undefined;
            this.handleSearch();
        },
        async handleSearch() {
            this.reset();
            await this.getList();
        },
        async getList() {
            if (!uni.isLogin()) return;
            // TODO: 后续需要放开
            // 认证信息可能尚未就绪（异步加载中），先标记，待 isAuth 就绪后由 watch 补发请求
            // if (!this.isAuth) {
            //     this.pendingAuthFetch = true;
            //     return;
            // }
            this.pendingAuthFetch = false;

            this.loading = true;
            // @by oh-my-zerone 空串转 undefined，交由 cleanGetParams 剔除，避免向后端传 goodsName= 空值参数
            const payload = { ...this.queryPage, goodsName: this.keyword || undefined };
            const [err, res] = await useRequest(ApiGetSourceList, payload);
            this.loading = false;
            if (err) return;
            console.log('getList-', res);
            // 数据在 res.data.list / res.data.total
            // 拍平后把订单原始结构透传给卡片，字段对接下沉到组件内
            const { list = [], total = 0 } = res?.data || {};
            const orders = this.flattenSourceList(list);
            this.queryPage.pageNum == 1 ? (this.list = orders) : this.list.push(...orders);
            this.total = total;
        },
        /**
         * 展开嵌套结构：data.list → 订单数组
         * 兼容两种返回形态：
         *   - 文档声明：数组套数组 [[ { redisOrderInfoListVoList } ]]
         *   - 实际接口：扁平对象数组 [{ redisOrderInfoListVoList }]
         * @param {Array} list 接口返回的 data.list
         * @returns {Array} 订单（redisOrderInfoListVoList 元素）扁平数组
         */
        flattenSourceList(list = []) {
            const orders = [];
            (list || []).forEach(group => {
                const items = Array.isArray(group) ? group : [group];
                items.forEach(item => {
                    orders.push(...(item?.redisOrderInfoListVoList || []));
                });
            });
            return orders;
        },
        scrolltolower() {
            if (this.isBottom || this.loading) return;
            this.queryPage.pageNum++;
            this.getList();
        },
        /**
         * 根据传入的类型返回对应的日期或日期范围字符串
         * @param {string|number} type - 传入的值 ('1-3', '7', '14', '14+' 或者数字 1, 2, 3)
         * @returns {string} 格式化后的日期字符串 (yyyy-MM-dd)
         */
        getTargetDateRange(type) {
            // 辅助函数：格式化日期为 yyyy-MM-dd
            const formatDate = date => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const today = new Date();
            const todayStr = formatDate(today);

            // 辅助函数：计算未来第 N 天的日期
            // 注意：如果“第3天”包含今天（即今天、明天、后天），则是加 N-1 天。
            // 如果你的业务逻辑是直接往后推 N 天（即 24*N 小时后），请将 (days - 1) 改为 days
            const getFutureDateStr = days => {
                const futureDate = new Date(today.getTime() + (days - 1) * 24 * 60 * 60 * 1000);
                return formatDate(futureDate);
            };

            const val = String(type);
            let startTime = '';
            let endTime = '';

            // 1. 传入 1-3 (或者数字 1, 2, 3)
            if (val === '1-3' || ['1', '2', '3'].includes(val)) {
                startTime = todayStr;
                endTime = getFutureDateStr(3);
            }
            // 2. 传入 7
            else if (val === '7') {
                startTime = todayStr;
                endTime = getFutureDateStr(7);
            }
            // 3. 传入 14
            else if (val === '14') {
                startTime = todayStr;
                endTime = getFutureDateStr(14);
            }
            // 4. 传入 14+ (第14天及以后)
            else if (val === '14+') {
                startTime = getFutureDateStr(14);
                endTime = ''; // 14天以上通常没有结束时间，若需要固定为某天可自行修改
            }

            return { startTime, endTime };
        },
        reset() {
            this.queryPage.pageNum = 1;
            this.list = [];
            this.total = 0;
        },
        async refresh() {
            this.reset();
            await this.getList();
        },
        async onRefresh() {
            this.triggered = true;
            this.reset();
            await this.refresh();
            this.triggered = false;
        },
        onScroll: throttle(function (e) {
            this.scrollTop = e?.detail?.scrollTop || 0;
            // 滚动时关闭所有 MoreBtn 下拉框
            uni.$emit('close-all-more-btns');
        }, 16),
    },
};
</script>
<style lang="scss" scoped>
@import '@/common/css/compatible.scss';
$aside-p: 32rpx; // 侧边距

.page-goods {
    display: flex;
    flex-direction: column;

    .title-goods {
        height: 30rpx;
        width: 327rpx;
    }

    &__body {
        height: 100%;
        box-sizing: border-box;
        padding-bottom: 20rpx;
        display: flex;
        flex-direction: column;

        .input-wrap {
            background: #fff;
            border-radius: 44rpx;
            box-shadow: 0px 0px 12px 1px rgba(235, 238, 242, 0.54);
            height: 64rpx;
            padding: 14rpx 28rpx;
            margin: 0 $aside-p 32rpx;
            display: flex;
            align-items: center;
        }
        .scroll-wrap {
            position: relative;
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;

            .scroll-shadow {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 24rpx;
                background: linear-gradient(to bottom, rgba(0, 0, 0, 0.12), transparent);
                z-index: 10;
                pointer-events: none;
            }
        }

        .scroll {
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            background: linear-gradient(180deg, rgba(238, 240, 245, 0.82), #f8f9fb 100%);

            .card-box {
                padding: 0 32rpx;
                margin-bottom: 20rpx;

                &:last-child {
                    margin-bottom: 0;
                }
            }
        }
    }

    /* 悬浮「发布货源」按钮（设计稿：250×80，胶囊渐变 + 圆形加号 + 文案） */
    .publish-btn {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        z-index: 3;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        width: 250rpx;
        height: 80rpx;
        padding-left: 12rpx;
        border-radius: 40rpx;
        background: linear-gradient(287deg, #3a65ff 0%, #3baaff 100%);
        box-shadow: 0 3rpx 18rpx rgba(58, 101, 255, 0.6);

        &__icon {
            position: relative;
            flex-shrink: 0;
            width: 56rpx;
            height: 56rpx;
            border-radius: 50%;
            background: linear-gradient(135deg, #ffffff 0%, #d4eeff 100%);

            /* 加号：设计稿为圆形镂空透出按钮底色，此处用同色系实心绘制 */
            &::before,
            &::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: #3a9bff;
            }

            &::before {
                width: 5rpx;
                height: 30rpx;
            }

            &::after {
                width: 30rpx;
                height: 5rpx;
            }
        }

        &__text {
            margin-left: 16rpx;
            color: #ffffff;
            font-size: 32rpx;
            font-weight: bold;
            line-height: 46rpx;
        }
    }
}

/* @by oh-my-zerone 货源码图片遮罩：全屏蒙层 + 居中图片，点击蒙层关闭（无关闭按钮） */
.qr-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.6);

    &__img {
        width: 440rpx;
        height: 440rpx;
    }

    &__tip {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        color: #fff;
    }

    &__code {
        margin-top: 24rpx;
        max-width: 100%;
        padding: 0 60rpx;
        font-size: 28rpx;
        line-height: 40rpx;
        color: #fff;
        text-align: center;
        word-break: break-all;
    }
}
</style>
