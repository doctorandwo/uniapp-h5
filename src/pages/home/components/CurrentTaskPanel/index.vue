<template>
    <view class="current-task-panel">
        <swiper class="swiper" @change="handleChange">
            <swiper-item v-for="(item, index) in curTaskList" :key="item.code">
                <view class="card" :style="{ backgroundImage: `url(${getBgImage(index)})` }">
                    <view class="card-content">
                        <view>
                            <span>正在运输中</span>
                            <span class="text-blue" style="margin: 0 10rpx">{{ getNumAndUnit(item).doing }}</span>
                            <span>{{ getNumAndUnit(item).unit }}</span>
                        </view>
                    </view>
                    <view class="card-header">
                        <view class="card-header-title">
                            <view class="goods-name">{{ item.goodsName }}</view>
                            <view class="progress">
                                <span class="progress-done">{{ getNumAndUnit(item).done }}</span>
                                <span class="progress-slash">/</span>
                                <span class="progress-total">{{ getNumAndUnit(item).total }}{{ getNumAndUnit(item).unit }}</span>
                            </view>
                        </view>
                        <view class="line">|</view>
                        <view class="time-predict">{{ getTimePredict(item) }}</view>
                    </view>
                </view>
            </swiper-item>
        </swiper>
    </view>
</template>

<script>
import { stowageStatusMap } from '@/pages/goods/constants.js';

import { useList } from '@/pages/home/hooks.js';
const { state, fetchCurTaskList } = useList();
import dayjs from 'dayjs';
export default {
    name: 'CurrentTaskPanel',
    props: {},
    components: {},
    data() {
        return {
            list: [],
            queryPage: {
                pageNum: 1,
                pageSize: 10,
            },
            total: 0,
            loading: false,
            current: 0,
        };
    },
    computed: {
        curTaskList() {
            return state.curTaskList;
        },
    },
    methods: {
        async init() {
            await this.getList();
            this.$emit('initComplete', this.curTaskList.length > 0);
        },
        async getList() {
            // 与个人中心 isAuth 一致
            if (!uni.isLogin() || !this.$store.getters.isAuth) {
                state.curTaskList = [];
                return;
            }
            this.loading = true;
            const res = await fetchCurTaskList(this.queryPage);
            this.loading = false;
            if (!res) return;
            this.total = res.total;
        },
        getBgImage(index) {
            // return this.current == index ? this.$global.getImageUrl('pages/home/bg-task-active.png') : this.$global.getImageUrl('pages/home/bg-task-normal.png');
            return this.current == index ? this.$global.getImageUrl('pages/home/bg-task-active.webp') : this.$global.getImageUrl('pages/home/bg-task-normal.png');
        },
        handleChange(e) {
            this.current = e.detail.current;
            console.log(this.current);
        },
        getNumAndUnit(item) {
            const unit = stowageStatusMap[item.stowageStatus] || '';
            const total = item.stowageStatus == '2' ? item.number : item.weight;
            const remain = item.stowageStatus == '2' ? item.remainingNumber : item.remainingWeight;
            const done = (total - remain).toFixed(2);

            const doing = item.loadingNumber || 0;
            return {
                total: total || 0,
                done: done || 0,
                unit,
                doing,
            };
        },
        getTimePredict(item) {
            const endTime = `${item.executionExpirationTime} ${item.workEndTime}`;
            const diffHour = dayjs(endTime).diff(dayjs(), 'hour');

            if (diffHour <= 0) return '延期';
            else if (diffHour >= 24) {
                const str = dayjs(endTime).diff(dayjs(), 'day') + '天';
                return `预计${str}内完成`;
            } else {
                const str = diffHour + '小时';
                return `预计${str}内完成`;
            }
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';
%bg-style {
    background-size: 100% 100%;
    background-position: left top;
    background-repeat: no-repeat;
}

.text-blue {
    color: #416aff;
}
.swiper {
    width: 100%;
    height: 205rpx;
}
.current-task-panel {
    overflow-x: auto;
    display: flex;
    @include flex-gap(4rpx);
    .card {
        min-width: 0;
        flex-shrink: 0;
        box-sizing: border-box;
        width: 750rpx;
        // height: 205rpx;
        height: 100%;
        padding: 63rpx 66rpx;
        padding-right: 200rpx;
        @extend %bg-style;

        &:nth-child(2) {
            margin-left: -68rpx;
        }

        &-content {
            display: flex;
            align-items: center;
            font-size: 32rpx;
            font-weight: bold;
            color: #333;
            @include flex-gap(12rpx);
            margin-bottom: 6rpx;
        }
        &-header {
            display: flex;
            font-size: 20rpx;
            color: #333;
            box-sizing: border-box;

            &-title {
                display: flex;
                font-size: 20rpx;
                font-weight: bold;

                .goods-name {
                    word-break: break-all;
                }

                .progress {
                    margin-left: 5rpx;
                    font-weight: bold;
                    &-done {
                    }
                    &-slash {
                        margin: 0 5rpx;
                    }
                    &-total {
                    }
                }
            }
            .line {
                margin: 0 10rpx;
            }
            .time-predict {
            }
        }
    }
}
</style>
