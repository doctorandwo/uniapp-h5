<!--
 * @by oh-my-zerone 2026-10-19
 * 常用地址列表页（地址簿）
 * 顶部搜索（地址别名 + 地址名称）+ 卡片列表 + 触底分页 + 下拉刷新 + 新增/编辑/删除
 * 布局：Header / 搜索框 / 底部按钮常驻固定，仅列表区内部滚动
 * @by oh-my-zerone 2026-10-20 滚动区收敛到列表区（搜索框与底部按钮固定）
 * @by oh-my-zerone 2026-10-20 搜索按钮、卡片删除按钮增加 loading 态并拦截重复点击
-->
<template>
    <SubPageLayout :title="pageTitle" body-padding="24rpx 32rpx" :scrollable="false" :footer-buttons="footerButtons" @footer-click="onFooterClick">
        <view class="address-book">
            <!-- 搜索区：常驻顶部，不随列表滚动 -->
            <view class="address-book__search">
                <input
                    class="address-book__input"
                    type="text"
                    confirm-type="search"
                    placeholder="搜索地址别名 / 地址名称"
                    placeholder-class="address-book__placeholder"
                    :value="keyword"
                    @input="onKeywordInput"
                    @confirm="onSearch"
                />
                <text v-if="keyword" class="address-book__clear" @click="onClearKeyword">清空</text>
                <!-- @by oh-my-zerone 搜索按钮加载态：转圈 + 文案替换，点击由 searching 拦截 -->
                <view
                    class="address-book__search-btn"
                    :class="{ 'address-book__search-btn--loading': searching }"
                    @click="onSearch"
                >
                    <text v-if="searching" class="address-book__search-spinner"></text>
                    <text class="address-book__search-btn-text">{{ searching ? '搜索中' : '搜索' }}</text>
                </view>
            </view>

            <!-- 列表区：页面内唯一滚动容器，承载下拉刷新与触底分页 -->
            <scroll-view
                class="address-book__scroll"
                :scroll-y="true"
                :refresher-enabled="true"
                :refresher-triggered="refreshing"
                refresher-background="transparent"
                @scrolltolower="onScrollToLower"
                @refresherrefresh="onRefresherRefresh"
            >
                <view class="address-book__list" v-if="list.length > 0">
                    <AddressCard
                        v-for="item in list"
                        :key="item.id"
                        :item="item"
                        :deleting="deletingId === item.id"
                        @action="onCardAction"
                    />
                </view>

                <Empty v-else-if="!loading" content="暂无常用地址" />

                <uni-load-more v-if="list.length > 0" :status="loadMoreStatus"></uni-load-more>
            </scroll-view>
        </view>
    </SubPageLayout>
</template>

<script>
// components
import SubPageLayout from '@/components/SubPageLayout/index.vue';
import Empty from '@/components/Empty/index.vue';
import uniLoadMore from '@/uni_modules/uni-load-more/components/uni-load-more/uni-load-more.vue';
import AddressCard from './components/AddressCard.vue';

// hooks
import { parseAddressToCard } from '../model.js';
import { setEditingAddress } from '../cache.js';

// const
import { PAGE_SIZE, ADDRESS_BOOK_REFRESH_EVENT } from '../constants.js';

// services
import { ApiGetAddressList, ApiRemoveAddress } from '../service.js';

// platform（跨端 Modal 兼容层）
import { showModal } from '@/common/platform/modal.js';

export default {
    name: 'AddressBookList',
    components: { SubPageLayout, Empty, uniLoadMore, AddressCard },
    data() {
        return {
            /** 搜索关键词 */
            keyword: '',
            /** 生效的搜索关键词（点击搜索后同步） */
            searchKeyword: '',
            /** 卡片列表 */
            list: [],
            /** 当前页码 */
            pageNum: 1,
            /** 总数 */
            total: 0,
            /** 是否请求中 */
            loading: false,
            /** 搜索请求中（按钮加载态） */
            searching: false,
            /** 正在删除的地址 id（null 表示无），用于卡片按钮加载态 */
            deletingId: null,
            /** 是否已加载全部 */
            finished: false,
            /** 下拉刷新状态（受控） */
            refreshing: false,
            /** 从表单页返回时是否需要刷新 */
            needRefresh: false,
        };
    },
    computed: {
        /**
         * 页面标题：携带地址总数，如「常用地址（12）」；无数据时保持原标题
         * @returns {string} 标题文案
         */
        pageTitle() {
            return this.total > 0 ? `常用地址(${this.total})` : '常用地址';
        },
        /**
         * 底部声明式按钮
         * @returns {Array<{key:string,text:string,type:string}>} 按钮配置
         */
        footerButtons() {
            return [{ key: 'add', text: '+ 新增地址', type: 'primary' }];
        },
        /**
         * 分页加载状态（供 uni-load-more 使用）
         * @returns {string} loading / noMore / more
         */
        loadMoreStatus() {
            if (this.loading) return 'loading';
            return this.finished ? 'noMore' : 'more';
        },
    },
    onLoad() {
        this.fetchList(true);
        uni.$on(ADDRESS_BOOK_REFRESH_EVENT, this.onRemoteRefresh);
    },
    onUnload() {
        uni.$off(ADDRESS_BOOK_REFRESH_EVENT, this.onRemoteRefresh);
    },
    onShow() {
        // 从新增/编辑页返回时刷新，保证列表与地址簿数量同步
        if (this.needRefresh) {
            this.needRefresh = false;
            this.fetchList(true);
        }
    },
    methods: {
        /**
         * 搜索框输入：仅记录输入值，点击搜索或回车才发起请求
         * @param {Object} e input 事件对象
         * @returns {void}
         */
        onKeywordInput(e) {
            this.keyword = (e && e.detail && e.detail.value) || '';
        },
        /**
         * 点击搜索：重置分页并重新请求（带按钮 loading）
         * @returns {void}
         */
        onSearch() {
            if (this.searching) return;
            this.searchKeyword = this.keyword;
            this.fetchList(true, 'search');
        },
        /** 清空关键词并恢复全部列表 */
        onClearKeyword() {
            this.keyword = '';
            this.searchKeyword = '';
            this.fetchList(true);
        },
        /**
         * 拉取地址列表
         * @param {boolean} [isReset=false] 是否为重置刷新（搜索 / 下拉刷新 / 变更后的刷新）
         * @param {string} [scene=''] 触发场景：'search' 时展示搜索按钮 loading
         * @returns {Promise<void>}
         */
        async fetchList(isReset = false, scene = '') {
            if (this.loading) return;
            if (!isReset && this.finished) return;
            const pageNum = isReset ? 1 : this.pageNum;
            const isSearch = scene === 'search';
            this.loading = true;
            if (isSearch) this.searching = true;
            try {
                const res = await ApiGetAddressList({
                    pageNum,
                    pageSize: PAGE_SIZE,
                    addressAlias: this.searchKeyword,
                    isAsc: 'desc',
                    orderByColumn: 'createTime',
                });
                const rows = (res && (res.rows || (res.data && res.data.rows))) || [];
                const mapped = rows.map(parseAddressToCard);
                this.list = isReset ? mapped : this.list.concat(mapped);
                this.total = Number((res && (res.total != null ? res.total : res.data && res.data.total)) || 0);
                this.finished = rows.length < PAGE_SIZE;
                this.pageNum = this.finished ? pageNum : pageNum + 1;
            } catch (error) {
                console.error('[addressBook] fetchList error', error);
                uni.showToast({ title: '获取地址列表失败', icon: 'none' });
            } finally {
                this.loading = false;
                this.refreshing = false;
                if (isSearch) this.searching = false;
            }
        },
        /**
         * 触底加载下一页
         * @returns {void}
         */
        onScrollToLower() {
            this.fetchList(false);
        },
        /** 下拉刷新：重置列表 */
        onRefresherRefresh() {
            this.refreshing = true;
            this.fetchList(true);
        },
        /**
         * 表单页保存成功广播的刷新事件
         * @returns {void}
         */
        onRemoteRefresh() {
            this.needRefresh = false;
            this.fetchList(true);
        },
        /**
         * 底部按钮点击：新增地址
         * @param {string} key 按钮 key
         * @returns {void}
         */
        onFooterClick(key) {
            if (key !== 'add') return;
            this.goForm(0, null);
        },
        /**
         * 卡片操作分发
         * @param {{id:number|string, action:string}} payload 纯数据事件载荷
         * @returns {void}
         */
        onCardAction(payload) {
            const { id, action } = payload || {};
            const record = this.list.find(item => String(item.id) === String(id));
            if (!record) return;
            if (action === 'edit') {
                this.goForm(record.id, record);
                return;
            }
            if (action === 'delete') {
                this.confirmRemove(record);
            }
        },
        /**
         * 跳转新增/编辑页
         * @param {number|string} id 地址主键，0 表示新增
         * @param {Object|null} record 待编辑记录（新增传 null）
         * @returns {void}
         */
        goForm(id, record) {
            setEditingAddress(record);
            this.needRefresh = true;
            uni.navigateTo({ url: `/pages_user/addressBook/form/index?id=${id || 0}` });
        },
        /**
         * 删除二次确认
         * @param {Object} record 待删除记录
         * @returns {void}
         */
        confirmRemove(record) {
            showModal({
                title: '删除地址',
                content: `确认删除「${record.addressAlias || '未命名地址'}」？`,
                confirmText: '删除',
                cancelText: '取消',
                onConfirm: () => {
                    this.doRemove(record.id);
                },
            });
        },
        /**
         * 调用删除接口并刷新列表
         * @param {number|string} id 地址主键
         * @returns {Promise<void>}
         */
        async doRemove(id) {
            // 删除中：标记卡片加载态，拦截重复点击（卡片侧同样兜底拦截）
            if (this.deletingId !== null) return;
            this.deletingId = id;
            try {
                await ApiRemoveAddress(id);
                uni.showToast({ title: '删除成功', icon: 'none' });
                uni.$emit(ADDRESS_BOOK_REFRESH_EVENT);
            } catch (error) {
                console.error('[addressBook] remove error', error);
                uni.showToast({ title: '删除失败，请重试', icon: 'none' });
            } finally {
                this.deletingId = null;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
$primary: #3a65ff;

.address-book {
    /* 列向撑满内容区：搜索区固定高度，剩余高度全部交给列表滚动区 */
    display: flex;
    flex-direction: column;
    height: 100%;

    &__search {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        height: 80rpx;
        padding: 0 20rpx 0 28rpx;
        margin-bottom: 24rpx;
        background-color: #ffffff;
        border-radius: 16rpx;
        box-sizing: border-box;
    }

    &__scroll {
        flex: 1;
        /* min-height: 0 是 H5 下 flex 子项可滚动的关键 */
        min-height: 0;
        width: 100%;
        box-sizing: border-box;
    }

    &__input {
        flex: 1;
        min-width: 0;
        height: 80rpx;
        font-size: 28rpx;
        color: #333333;
    }

    &__placeholder {
        color: #bbbbbb;
    }

    &__clear {
        flex-shrink: 0;
        padding: 0 16rpx;
        font-size: 26rpx;
        color: #999999;
    }

    &__search-btn {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        padding-left: 24rpx;
        font-size: 28rpx;
        font-weight: bold;
        color: $primary;

        /* 搜索中弱化，配合 searching 拦截重复点击 */
        &--loading {
            opacity: 0.6;
        }
    }

    &__search-btn-text {
        flex-shrink: 0;
    }

    /* 搜索转圈：currentColor 继承主色 */
    &__search-spinner {
        flex-shrink: 0;
        width: 24rpx;
        height: 24rpx;
        margin-right: 8rpx;
        border: 4rpx solid currentColor;
        border-top-color: transparent;
        border-radius: 50%;
        box-sizing: border-box;
        animation: address-book-spin 0.7s linear infinite;
    }
}

@keyframes address-book-spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
