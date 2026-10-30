<!--
 * @by oh-my-zerone
 * @desc 首页顶部「需关注」轮播卡片（开关控制 mock 数据 + 组件内处理 + 缩小适配顶部区域）
 * @date 2026-10-12
-->
<template>
    <view v-if="list.length" class="attention">
        <!-- 后景：倾斜的正方形叠层装饰 -->
        <view class="attention__bg-square" />

        <!-- 轮播主体 -->
        <swiper
            class="attention__swiper"
            :current="current"
            :autoplay="autoplay"
            :interval="interval"
            :duration="duration"
            :circular="circular"
            :skip-hidden-item-layout="true"
            @change="onSwiperChange"
        >
            <swiper-item v-for="item in list" :key="item.id" class="attention__swiper-item">
                <view class="attention-card">
                    <!-- 左上角「需关注」标签 -->
                    <view class="attention-card__badge">
                        <view class="attention-card__badge-icon">!</view>
                        <view class="attention-card__badge-text">需关注</view>
                    </view>

                    <!-- 航线标题 -->
                    <view class="attention-card__route">
                        <view class="attention-card__city g-single-row">{{ item.fromCity }}</view>
                        <image :src="$global.getImageUrl('pages/home/arrow.png')" class="attention-card__arrow" />
                        <view class="attention-card__city g-single-row">{{ item.toCity }}</view>
                    </view>

                    <!-- 延迟副标题 -->
                    <view class="attention-card__delay g-single-row">{{ item.delayText }}</view>

                    <!-- 去处理 -->
                    <view class="attention-card__handle" @click="onHandle(item)">
                        <view class="attention-card__handle-text">去处理</view>
                        <uni-icons type="right" size="22rpx" color="#3a65ff" />
                    </view>
                </view>
            </swiper-item>
        </swiper>

        <!-- 指示点：当前项长条胶囊，其余小圆点 -->
        <view class="attention__dots">
            <view v-for="(item, index) in list" :key="item.id" class="attention__dot" :class="{ 'attention__dot--active': index === current }" />
        </view>
    </view>
</template>

<script>
// hooks
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { parseAbnormalVo2Card } from './model.js';

// const
import { LIST_PAGE_SIZE, ABNORMAL_HANDLER_STATUS } from './constants.js';
import { ApiSelectAbnormalList } from '@/pages/home/services.js';

// 本地 mock 数据（useMock 开启时使用）
const MOCK_LIST = [
    { id: 1, fromCity: '福州福州福州', toCity: '天津天津天津', delayText: '延迟 3 小时延迟 3 小时延迟 3 小时延迟 3 小时' },
    { id: 2, fromCity: '上海', toCity: '北京', delayText: '延迟 1 小时' },
    { id: 3, fromCity: '广州', toCity: '成都', delayText: '延迟 5 小时' },
];

export default {
    name: 'HomeAttention',
    props: {
        // 外部可传入关注列表（可序列化数组，仅传纯数据）
        value: {
            type: Array,
            default: () => [],
        },
        // 是否自动轮播
        autoplay: {
            type: Boolean,
            default: true,
        },
        // 开关：是否使用本地 mock 数据。开启则强制使用 mock，关闭则使用外部传入的 value
        useMock: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            current: 0,
            interval: 3500,
            duration: 400,
            circular: true,

            // 接口拉取的异常列表（仿 ListPanel）
            listData: [],
            total: 0,
            // 查询条件：处理状态（需关注区取未处理）
            queryForm: {
                handlerStatus: ABNORMAL_HANDLER_STATUS,
            },
            // 分页参数
            queryPage: {
                pageNum: 1,
                pageSize: LIST_PAGE_SIZE,
            },
            loading: false,
        };
    },
    computed: {
        // 开关开启时使用 mock；关闭时优先外部 value，否则使用接口拉取的 listData
        list() {
            if (this.useMock) return MOCK_LIST;
            if (this.value && this.value.length) return this.value;
            return this.listData;
        },
    },
    methods: {
        /**
         * 初始化异常列表：重置分页并拉取首屏数据。
         * 由父页面 home/index.vue 的 updateData() 统一驱动刷新（仿 ListPanel.init）。
         * @returns {Promise<void>}
         */
        async init() {
            if (!uni.isLogin()) {
                this.listData = [];
                return;
            }
            this.queryPage.pageNum = 1;
            this.listData = [];
            await this.getList();
        },

        /**
         * 拉取异常列表（仿 ListPanel 的 useRequest + 分页模式）。
         * 将 AbnormalListVo 经 parseAbnormalVo2Card 转换为卡片展示字段。
         * @returns {Promise<void>}
         */
        async getList() {
            this.loading = true;
            const payload = { ...this.queryPage, ...this.queryForm };
            const [err, res] = await useRequest(ApiSelectAbnormalList, payload);
            this.loading = false;
            if (err) return;

            // 响应结构假设与 ListPanel 一致：{ rows:[...], total }
            const rows = (res && res.rows) || [];
            this.listData = rows.map(parseAbnormalVo2Card);
            this.total = (res && res.total) || 0;
        },

        /**
         * 轮播切换回调：同步当前指示点
         * @param {Object} e uni swiper change 事件对象，e.detail.current 为当前索引
         */
        onSwiperChange(e) {
            this.current = e.detail.current;
        },

        /**
         * 「去处理」点击事件（组件内处理）
         * 当前为 mock，仅做轻提示；接入真实业务后在此替换为路由跳转（如 Nav.to(...)）
         * @param {Object} item 当前卡片数据（纯数据对象）
         */
        onHandle(item) {
            uni.showToast({
                title: `处理：${item.fromCity} → ${item.toCity}`,
                icon: 'none',
            });
            // TODO: 真实跳转（示例）
            // this.$Nav && this.$Nav.to({ url: '/pages/...', params: { id: item.id } });
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

$card-w: 218rpx;
$card-h: 205rpx;

/* 缩小适配：整体固定宽度，融入首页顶部右侧区域 */
.attention {
    position: relative;
    padding-top: 20rpx;
    padding-left: 25rpx;

    /* 后景倾斜正方形 */
    &__bg-square {
        position: absolute;
        top: 20rpx;
        right: 0;
        z-index: 0;

        width: $card-w;
        height: $card-h;
        background: #f8f9fc;
        border-radius: 32rpx;
        border: 1rpx solid #fff;
        box-sizing: border-box;
        transform: rotate(-15deg);
        transform-origin: 39% 75%;
    }

    &__swiper {
        width: $card-w;
        height: $card-h;

        &-item {
            width: 100%;
            height: 100%;
        }
    }

    /* 指示点 */
    &__dots {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 8rpx;
        @include flex-gap(4rpx);
    }

    &__dot {
        width: 5rpx;
        height: 4rpx;
        border-radius: 35rpx;
        background: rgba($color: #333, $alpha: 0.33);
        transition: all 0.3s ease;

        &--active {
            width: 17rpx;
            background: #444953;
        }
    }
}

/* 卡片 */
.attention-card {
    width: $card-w;
    height: $card-h;
    box-sizing: border-box;
    padding: 24rpx;
    border-radius: 32rpx;
    overflow: hidden;
    border: 2rpx solid #fff;
    backdrop-filter: blur(16rpx);
    background: linear-gradient(163deg, #fcdada 10%, #f8f9fc 60%, #fff 100%);

    &__badge {
        padding: 4rpx 8rpx;
        display: flex;
        align-items: center;
        border-radius: 6px;
        background: linear-gradient(29.25deg, #f19a9a 0%, #e64b4b 64.516%);
        width: max-content;

        &-icon {
            $w: 16rpx;
            width: $w;
            height: $w;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #fff;
            border-radius: 50%;
            color: #f19a9a;
            font-size: 14rpx;
            font-weight: bold;
            margin-right: 4rpx;
        }
        &-text {
            font-family: 'Douyin Sans';
            font-size: 20rpx;
            font-weight: bold;
            color: #fff;
        }
    }

    /* 路线 */
    &__route {
        display: flex;
        align-items: center;
        margin-top: 16rpx;
        @include flex-gap(4rpx);
    }

    &__city {
        display: inline-block;
        max-width: 60rpx; /* 约 2 个中文字宽，超出省略 */
        font-size: 28rpx;
        color: #333;
        font-weight: bold;
    }

    &__arrow {
        $w: 24rpx;
        width: $w;
        height: $w;
        flex-shrink: 0;
    }

    /* 延迟 */
    &__delay {
        margin-top: 8rpx;
        font-size: 20rpx;
        color: #333;
        max-width: 100%;
    }

    /* 去处理 */
    &__handle {
        margin-top: 16rpx;
        display: flex;
        align-items: center;
        color: #3a65ff;
        &-text {
            font-size: 20rpx;
            font-weight: bold;
        }
        &-arrow {
            margin-left: 4rpx;
            font-size: 22rpx;
            color: #2f6bff;
        }
    }
}
</style>
