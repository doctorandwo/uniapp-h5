<template>
    <view class="cu-modal" :class="{ show: visible }">
        <view class="cu-dialog">
            <view class="icon-auth">
                <image :src="$global.getImageUrl('ModalAuth/icon-auth.png')" class="icon-auth__img" />
            </view>
            <view class="content-frame">
                <view class="title">完善资质认证</view>
                <view class="desc">
                    <image :src="$global.getImageUrl('ModalAuth/icon-tip.png')" class="icon-tip" />
                    <view class="desc-text">资料不全或过期影响派单、接单和提现</view>
                </view>
                <view class="main-content">
                    <view class="icon-idCard">
                        <image :src="$global.getImageUrl('ModalAuth/icon-idCard.png')" class="icon-idCard__img" />
                    </view>
                    <view class="main-content__right">
                        <view class="main-content__right__title">
                            你还需要完成
                            <span class="num-to-auth">{{ certAuth.num }}</span>
                            项认证
                        </view>
                        <view class="main-content__right__desc">{{ certAuth.desc }}</view>
                    </view>
                </view>
                <view class="btn-group">
                    <view class="btn primary" @click="goAuthDetail">去完善</view>
                    <view class="btn text" @click="close">稍后再说</view>
                </view>
            </view>
            <view class="close-wrap" v-if="hasClose">
                <image class="icon-close" :src="images.close" @click="close"></image>
            </view>
        </view>
        <!-- 暂时关闭认证类型选择，默认企业认证
        <AuthTypeModal :visible="showAuthTypeModal" @confirm="onAuthTypeConfirm" @cancel="showAuthTypeModal = false" />
        -->
    </view>
</template>

<script>
// import AuthTypeModal from '@/pages/user/components/AuthTypeModal.vue';
import { LEADER_TYPE } from '@/common/constants/auth';
export default {
    props: {
        // open: Boolean,
        hasClose: Boolean,
    },
    // components: {
    //     AuthTypeModal,
    // },
    data() {
        return {
            images: {
                close: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/171558441514151acb2.png',
            },
            visible: false,
            // showAuthTypeModal: false,
        };
    },
    computed: {
        /* visible: {
            get() {
                return this.open;
            },
            set(v) {
                this.$emit('update:open', v);
            },
        }, */
        certAuth() {
            return {
                num: 2,
                desc: '身份证认证，企业营业执照',
            };
        },
        visibleToAuth() {
            return this.$store.getters.visibleToAuth;
        },
    },
    watch: {
        visibleToAuth: {
            handler(newVal) {
                this.visible = newVal;
            },
            immediate: true,
        },
    },

    methods: {
        goAuthDetail() {
            // 暂时关闭认证类型选择，默认企业认证
            // this.showAuthTypeModal = true;
            uni.navigateTo({ url: `/pages_auth/auth/index?shipperType=${LEADER_TYPE.ENTERPRISE}` });
        },
        /** 关闭弹窗 */
        close() {
            this.visible = false;
        },
        // onAuthTypeConfirm(shipperType) {
        //     this.showAuthTypeModal = false;
        //     uni.navigateTo({ url: `/pages_auth/auth/index?shipperType=${shipperType}` });
        // },
    },
};
</script>

<style lang="scss" scoped>
@import './modal.scss';

.flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
}
.cu-modal {
    background: rgba(0, 0, 0, 0.5);
}
.cu-dialog {
    transform: translateY(-50rpx);
    position: relative;
    padding-top: 50rpx;
    background-color: transparent;
    width: 590rpx;
    .icon-auth {
        position: absolute;
        top: 0;
        right: 0;
        &__img {
            width: 281rpx;
            height: 236rpx;
        }
    }
    .content-frame {
        border-radius: 32rpx;
        padding: 46rpx 40rpx 0;
        box-sizing: border-box;
        background: linear-gradient(180deg, #c8dcff 0%, #ffffff 150rpx);
        text-align: left;

        .title {
            font-family: Douyin Sans, Douyin Sans;
            font-weight: bold;
            font-size: 44rpx;
            color: #013697;
            -webkit-text-stroke: 1px rgba(0, 0, 0, 0);
            margin-bottom: 12rpx;
        }
        .desc {
            display: flex;
            align-items: center;
            margin-bottom: 44rpx;
            .icon-tip {
                flex-shrink: 0;
                $w: 25rpx;
                height: $w;
                width: $w;
                margin-right: 10rpx;
            }
            &-text {
                font-size: 24rpx;
                color: #999;
            }
        }
        .main-content {
            display: flex;
            margin-bottom: 51rpx;
            .icon-idCard {
                margin-right: 20rpx;
                &__img {
                    $w: 86rpx;
                    height: $w;
                    width: $w;
                }
            }
            &__right {
                min-width: 0;
                flex: 1;
                &__title {
                    font-size: 32rpx;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 8rpx;

                    .num-to-auth {
                        color: #3a65ff;
                        margin: 0 10rpx;
                    }
                }
                &__desc {
                    font-size: 24rpx;
                    color: #999;
                }
            }
        }
        .btn-group {
            display: flex;
            flex-direction: column;
            .btn {
                width: 510rpx;
                height: 80rpx;
                text-align: center;
                line-height: 80rpx;
                &.primary {
                    background: linear-gradient(90deg, #3a65ff 0%, #5c8bfe 100%);
                    color: #fff;
                    border-radius: 20rpx;
                    font-size: 32rpx;
                    font-weight: bold;
                    margin-bottom: 10rpx;
                    margin-bottom: 22rpx;
                }
                &.text {
                    background-color: transparent;
                    color: #999;
                    font-size: 28rpx;
                    height: initial;
                    line-height: initial;
                    padding-bottom: 32rpx;
                }
            }
        }
    }
}
.close-wrap {
    @extend .flex-center;
    .icon-close {
        height: 60rpx;
        width: 60rpx;
        margin-top: 44rpx;
    }
}
</style>
