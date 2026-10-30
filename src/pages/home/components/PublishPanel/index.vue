<template>
    <view class="publish-panel" :class="{ 'has-footer': footerMessage }">
        <!-- 主面板内容区：装卸货地址 + 快速发布按钮 -->
        <view class="publish-panel__main">
            <view class="publish-panel__main__shadow" />
            <view class="panel-row load" :class="{ empty: !startPoint }" @click="selectAddress('start')">
                <view class="icon-circle" />
                <view class="panel-row-content">
                    <span v-if="!startPoint">您要去哪装货</span>
                    <template v-else>
                        <view class="panel-row-content__main">
                            <span>将从</span>
                            <span class="address">{{ startPoint.addressName }}{{ startPoint.alias ? '(' + startPoint.alias + ')' : '' }}</span>
                            <span>装货</span>
                        </view>
                        <view class="panel-row-content__desc">{{ startPoint.detail }}</view>
                    </template>
                </view>
                <image :src="$global.getImageUrl('pages/home/icon-arrow-right.png')" class="icon-arrow-right" />
            </view>
            <view class="panel-row unload" :class="{ empty: !endPoint }" @click="selectAddress('end')">
                <view class="icon-circle" />
                <view class="panel-row-content">
                    <span v-if="!endPoint">您要去哪卸货</span>
                    <template v-else>
                        <view class="panel-row-content__main">
                            <span>{{ endPoint.addressName }}{{ endPoint.alias ? '(' + endPoint.alias + ')' : '' }}</span>
                        </view>
                        <!-- <view class="panel-row-content__main">
                        <span>将在</span>
                        <span class="address">{{ endPoint.addressName }}{{ endPoint.alias ? '(' + endPoint.alias + ')' : '' }}</span>
                        <span>卸货</span>
                    </view>
                    <view class="panel-row-content__desc">{{ endPoint.detail }}</view> -->
                    </template>
                </view>
                <image :src="$global.getImageUrl('pages/home/icon-arrow-right.png')" class="icon-arrow-right" />
            </view>
            <view class="btn-publish" @click="onPublishClick"> 快速发布货源 </view>
        </view>

        <!-- 底部运价提示条：展示常发布货源的近7日参考运价变化 -->
        <!-- 仅当 footerMessage 存在时才展示 -->
        <!-- @by oh-my-zerone -->
        <view v-if="footerMessage" class="publish-panel__footer">
            <view class="publish-panel__footer-text">{{ footerMessage }}</view>
            <image :src="$global.getImageUrl('pages/home/icon-arrow-right-with-bg.png')" class="publish-panel__footer-arrow" />
        </view>
    </view>
</template>

<script>
import { toShortProvinceCode, toShortCityCode, toShortDistrictCode } from '@/common/utils/adminCode.js';
import { proceedPublish } from './proceedPublish.js';
export default {
    // const
    props: {
        /**
         * 底部运价提示条文案。
         * 为空时不展示底部提示条；非空时展示对应运价提示。
         * @by oh-my-zerone
         */
        footerMessage: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            startPoint: null,
            endPoint: null,
        };
    },
    methods: {
        /**
         * 重置装卸货地址为空的统一入口。
         * @by oh-my-zerone
         * 触发时机：
         *   - 发布货源流程成功（home 通过 uni.$on('pages/home/index:resetAddress') 调用）；
         *   - 重新登录（home 侧监听 isLogin false→true 调用）。
         */
        resetAddress() {
            console.log('resetAddress')
            this.startPoint = null;
            this.endPoint = null;
        },

        selectAddress(type) {
            // 携带当前 type 对应的已选地址，供后续选点页回显
            // @by oh-my-zerone 2026-10-19 withContact=1 开启联系人/联系电话采集，
            // 保证跳转 selectRoute 时点位已带 contact / contactPhone，避免二次填写
            let url = `/pages_common/chooseLocation/index?type=${type}&withContact=1`;
            const point = this[`${type}Point`];
            if (point) {
                url += `&selected=${encodeURIComponent(JSON.stringify(point))}`;
            }
            uni.navigateTo({
                url,
                events: {
                    success: res => {
                        console.log('res------', res);

                        this.onAddressSelected(res);
                    },
                },
            });
        },
        onAddressSelected(res) {
            const { type, alias, poi, location } = res || {};
            const point = {
                longitude: location?.x || poi?.location?.split(',')[0] || '',
                latitude: location?.y || poi?.location?.split(',')[1] || '',
                provinceCode: toShortProvinceCode(poi?.provinceCode),
                cityCode: toShortCityCode(poi?.cityCode),
                districtCode: toShortDistrictCode(poi?.districtCode),
                province: poi?.province || '',
                city: poi?.city || '',
                district: poi?.district || '',
                addressName: poi?.name || '',
                detail: poi?.address || '',
                alias: alias || '',
                // @by oh-my-zerone 2026-10-19 透传选点页采集的联系人/联系电话，随点位带入 selectRoute
                contact: poi?.contact || '',
                contactPhone: poi?.contactPhone || '',
            };
            this[`${type}Point`] = point;
        },
        /**
         * 发布前置校验（扩展点）。
         * @by oh-my-zerone
         * 当前需求：快速发布不再校验装卸货地址，故直接通过 return true。
         * 后续如补充货主认证等前置校验，在此实现并返回布尔值，
         * onPublishClick 会据此决定是否继续发布。
         * @returns {boolean} 是否通过
         */
        precheck() {
            return true;
        },

        /**
         * "快速发布"按钮点击：组件内闭环完成校验 + 发布。
         * @by oh-my-zerone
         * 先 precheck 通过，再 proceedPublish 跳转选点页 selectRoute；
         * 由选点页引导进入 createQuote，发布成功由全局事件重置装卸货地址。
         */
        onPublishClick() {
            if (!this.precheck()) return;
            this.proceedPublish();
        },
        /**
         * 真正发起发布：前提是 precheck() 已通过。
         * @by oh-my-zerone
         * URL 拼接与 navigateTo 委托给 ./proceedPublish 工具函数，
         * 跳转选点页 selectRoute，装卸货地址作为参数透传用于回显。
         * 首页装卸货地址的重置不再依赖 eventChannel，而是等任意层级发布成功页
         * uni.$emit('pages/home/index:resetAddress') 后，由 home 侧
         * uni.$on 订阅触发 PublishPanel.resetAddress() 清空。
         */
        proceedPublish() {
            proceedPublish({
                startPoint: this.startPoint,
                endPoint: this.endPoint,
            });
        },
    },
};
</script>

<style lang="scss" scoped>
@mixin circle($color) {
    display: block;
    $w: 13rpx;
    width: $w;
    height: $w;
    border-radius: 50%;
    background-color: $color;
}

.publish-panel {
    position: relative;
    padding-bottom: 0;

    /* 底部运价提示条存在时才预留其占位高度，避免无提示时底部留白 */
    /* @by oh-my-zerone */
    &.has-footer {
        padding-bottom: 84rpx;
    }

    &__shadow {
        position: absolute;
        top: -14rpx;
        left: 19rpx;
        right: 19rpx;
        height: 41rpx;
        filter: blur(77rpx);
        background: #97afe8;
        &-img {
            width: 100%;
            height: 100%;
        }
    }

    /* 主内容区：原 .publish-panel 的背景与圆角样式上移至此 */
    &__main {
        padding: 31rpx 28rpx;
        border-radius: 32rpx;
        border: 2rpx solid #fff;
        box-sizing: border-box;
        backdrop-filter: blur(39px);
        background: rgba(255, 255, 255, 0.56);
        position: relative;
        z-index: 1;

        &__shadow {
            position: absolute;
            top: -14rpx;
            left: 19rpx;
            right: 19rpx;
            height: 41rpx;
            filter: blur(77rpx);
            background: #97afe8;
            &-img {
                width: 100%;
                height: 100%;
            }
        }
    }

    /* 底部运价提示条：贴附主面板底部，继承其底部圆角 */
    /* @by oh-my-zerone */
    &__footer {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 0;
        display: flex;
        align-items: center;
        padding: 60rpx 34rpx 28rpx;
        border-radius: 0px 0px 32rpx 32rpx;
        backdrop-filter: blur(98rpx);
        background: rgba(179, 189, 213, 0.5);

        &-text {
            flex: 1;
            min-width: 0;
            font-size: 24rpx;
            font-weight: bold;
            color: #162f4a;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        &-arrow {
            width: 31rpx;
            height: 31rpx;
            margin-left: 41rpx;
            flex-shrink: 0;
        }
    }

    .panel-row {
        padding: 20rpx 32rpx;
        display: flex;

        &-content {
            flex: 1;
            min-width: 0;
            line-height: 45rpx;

            &__main {
                font-size: 28rpx;
                font-weight: bold;

                .address {
                    color: #3a65ff;
                    margin: 0 12rpx;
                    display: inline-block;
                    max-width: 350rpx;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    vertical-align: bottom;
                }
            }

            &__desc {
                font-size: 20rpx;
                color: #999;
            }
        }

        .icon-arrow-right {
            width: 20rpx;
            height: 28rpx;
            align-self: center;
            margin-left: auto;
        }

        &.load {
            &.empty {
                padding: 32rpx;
                border: 2rpx solid #757b92;
                border-radius: 28rpx;
                margin-bottom: 20rpx;

                .panel-row-content {
                    font-size: 32rpx;
                    font-weight: bold;
                }
            }
            .icon-circle {
                height: 45rpx;
                line-height: 45rpx;
                margin-right: 26rpx;
                display: flex;
                align-items: center;

                &:before {
                    content: '';
                    @include circle(#3a65ff);
                }
            }
        }

        &.unload {
            border: 2rpx solid #757b92;
            border-radius: 28rpx;
            padding: 32rpx;
            .panel-row-content__main {
                font-size: 32rpx;
            }

            &.empty {
                margin-bottom: 20rpx;

                .panel-row-content {
                    font-size: 32rpx;
                    font-weight: bold;
                }
            }
            .icon-circle {
                height: 45rpx;
                line-height: 45rpx;
                margin-right: 26rpx;
                display: flex;
                align-items: center;

                &:before {
                    content: '';
                    @include circle(#34c7a9);
                }
            }
        }
    }
}
</style>

<style lang="scss">
/* .btn-publish 样式独立到非 scoped 块：快速发布按钮已内置到本组件，
   非 scoped 保证 mp-weixin 下视觉一致，且不影响 .publish-panel 其他 scoped 样式。 */
.btn-publish {
    background: linear-gradient(198deg, #5c8bfe 0%, #1e4df6 100%);
    border-radius: 24rpx;
    font-weight: bold;
    font-size: 30rpx;
    color: #fff;
    width: 582rpx;
    height: 90rpx;
    margin: 30rpx auto 0;
    line-height: 90rpx;
    text-align: center;
}
</style>
