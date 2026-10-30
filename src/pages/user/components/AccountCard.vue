<template>
    <view class="account-card">
        <image class="account-card__bg" :src="$global.getImageUrl('pages/user/bg-account.png')" />

        <view class="account-card__header">
            <view class="account-card__title">我的账户</view>
            <view class="account-card__detail" @click="onClickDetail">
                <text class="detail-label">账户明细</text>
                <uni-icons type="arrowright" size="24rpx" color="#999999" class="arrow-right" />
            </view>
        </view>

        <view class="account-card__body">
            <view class="account-card__col account-card__col--available" @click="onClickAvailable">
                <view class="account-card__col--label">
                    <text>可用余额 (元)</text>
                    <image :src="$global.getImageUrl(eyeIcon)" class="eye" @click.stop="onToggleVisible" />
                </view>
                <view class="account-card__col--value">
                    <text v-if="balanceVisible" class="value-num">{{ formattedAvailable }}</text>
                    <text v-else class="value-num value-num--mask">{{ MASK }}</text>
                    <uni-icons type="arrowright" size="24rpx" color="#999999" class="arrow-right" />
                </view>
            </view>
            <view class="account-card__col account-card__col--frozen" @click="onClickFrozen">
                <view class="account-card__col--label">
                    <text class="label-text--frozen">冻结金额 (元)</text>
                </view>
                <view class="account-card__col--value">
                    <text class="value-num value-num--frozen">{{ formattedFrozen }}</text>
                    <uni-icons type="arrowright" size="24rpx" color="#999999" class="arrow-right" />
                </view>
            </view>
        </view>

        <view class="account-card__ratio" v-if="showRatio">
            <view class="account-card__ratio--segment account-card__ratio--available" :style="{ width: ratioWidth(availablePercent, 'available') }"></view>
            <view class="account-card__ratio--segment account-card__ratio--frozen" :style="{ width: ratioWidth(frozenPercent, 'frozen') }"></view>
        </view>

        <view class="account-card__notice" v-if="notice">
            <view class="account-card__notice--dot"></view>
            <view class="g-single-row account-card__notice--text">{{ notice }}</view>
        </view>
    </view>
</template>

<script>
// utils
import { formatMoney } from '@/common/utils/format.js';

export default {
    name: 'AccountCard',
    props: {
        /**
         * 可用余额
         */
        availableBalance: {
            type: Number,
            default: 0,
        },
        /**
         * 冻结金额
         */
        frozenAmount: {
            type: Number,
            default: 0,
        },
        /**
         * 底部提示文案
         */
        notice: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            MASK: '****',
            // 余额显隐：本组件内状态，跟随眼睛点击
            balanceVisible: false,
            // 比例条动画开关：可用/冻结各自独立，挂载后由 0 增长至目标宽度
            availableReady: false,
            frozenReady: false,
        };
    },
    computed: {
        /**
         * 可用余额千分位格式化
         * @returns {string}
         */
        formattedAvailable() {
            return this.formatMoney(this.availableBalance);
        },
        /**
         * 冻结金额千分位格式化
         * @returns {string}
         */
        formattedFrozen() {
            return this.formatMoney(this.frozenAmount);
        },
        /**
         * 眼睛图标：可见用睁眼图，隐藏用闭眼图（复用 pages_finance 现有图标）
         * @returns {string}
         */
        eyeIcon() {
            return this.balanceVisible ? 'pages_finance/icon-eye-open.png' : 'pages_finance/icon-eye-close.png';
        },
        /**
         * 可用金额占比（按 可用 / 可用+冻结）
         * @returns {string}
         */
        availablePercent() {
            const total = Number(this.availableBalance) + Number(this.frozenAmount);
            if (!total) return '0%';
            return `${((Number(this.availableBalance) / total) * 100).toFixed(2)}%`;
        },
        /**
         * 冻结金额占比
         * @returns {string}
         */
        frozenPercent() {
            const total = Number(this.availableBalance) + Number(this.frozenAmount);
            if (!total) return '0%';
            return `${((Number(this.frozenAmount) / total) * 100).toFixed(2)}%`;
        },
        /**
         * 是否展示比例条：可用 + 冻结 总额大于 0 时才展示
         * @returns {boolean}
         */
        showRatio() {
            return Number(this.availableBalance) + Number(this.frozenAmount) > 0;
        },
    },
    /**
     * 挂载后分别开启可用/冻结比例条动画：先渲染 0 宽度，下一帧再赋目标宽度触发 CSS 过渡。
     * 两段进度条起始时间错开、互不影响；可用条锚定左侧由左往右增长，冻结条锚定右侧由右往左增长。
     * 数据多为接口延后返回，故动画在 showRatio 变 true（比例条实际渲染）后才触发，
     * 保证元素先以 0 宽度渲染、下一帧再赋目标宽度，过渡动画不丢失。
     */
    watch: {
        /**
         * 监听比例条是否可见：可见时先归零、下一帧再触发生长；
         * 不可见（总额为 0）时复位，便于下次重新播放
         */
        showRatio: {
            immediate: true,
            handler(val) {
                if (val) {
                    this.availableReady = false;
                    this.frozenReady = false;
                    // 等待 0 宽度完成绘制后再赋予目标宽度，确保过渡生效
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.availableReady = true;
                            // 冻结条稍晚启动，使两条动画在视觉上相互独立
                            setTimeout(() => {
                                this.frozenReady = true;
                            }, 200);
                        }, 50);
                    });
                } else {
                    this.availableReady = false;
                    this.frozenReady = false;
                }
            },
        },
    },
    methods: {
        /**
         * 比例条分段宽度：对应分段未就绪时返回 0，触发由 0 增长到目标值的独立动画；
         * 为保留中间 12rpx 间隔，就绪后两端各内缩 6rpx（可用条右侧、冻结条左侧各留 6rpx）
         * @param {string} percent 目标百分比，如 '60.00%'
         * @param {'available'|'frozen'} type 分段类型
         * @returns {string}
         */
        ratioWidth(percent, type) {
            const ready = type === 'frozen' ? this.frozenReady : this.availableReady;
            if (!ready || percent === '0%') return '0%';
            return `calc(${percent} - 6rpx)`;
        },
        /**
         * 金额格式化（复用 @/common/utils/format.js 的 formatMoney）
         * @param {number} val 金额
         * @returns {string}
         */
        formatMoney(val) {
            return formatMoney(val);
        },
        /**
         * 点击眼睛：本组件内切换余额显隐
         */
        onToggleVisible() {
            this.balanceVisible = !this.balanceVisible;
        },
        /**
         * 点击账户明细（占位，本组件内处理）
         */
        onClickDetail() {
            // @by oh-my-zerone 占位：账户明细跳转后续补充
            console.log('account detail');
        },
        /**
         * 点击可用余额区域（占位，本组件内处理）
         */
        onClickAvailable() {
            // @by oh-my-zerone 占位：可用余额明细后续补充
            console.log('account available');
        },
        /**
         * 点击冻结金额区域（占位，本组件内处理）
         */
        onClickFrozen() {
            // @by oh-my-zerone 占位：冻结金额明细后续补充
            console.log('account frozen');
        },
    },
};
</script>
<style lang="scss" scoped>
/* 渐变边框 */
%gradual-border {
    position: relative;
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: inherit;
        // 仅保留 上/左/右 描边，下边不描（padding 底部为 0）
        padding: 4rpx 4rpx 0 4rpx;
        background: linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0) 100%);
        // mask 异或实现只显示描边、内部镂空，且兼容 border-radius
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
    }
}

.account-card {
    position: relative;
    margin: 42rpx 0 0;
    padding: 32rpx;
    box-sizing: border-box;
    border-radius: 32rpx 32rpx 0 0;
    backdrop-filter: blur(44rpx);
    background: linear-gradient(179.45deg, rgba(220, 226, 249, 0.4) -1.777%, rgba(243.09, 245.14, 252.96, 0.35) 64.358%, rgba(255, 255, 255, 0) 98.452%);
    @extend %gradual-border;

    > * {
        position: relative;
        z-index: 1;
    }

    &__bg {
        position: absolute !important;
        z-index: -1;
        top: -10%;
        left: 0;
        width: 100%;
        height: 120%;
        opacity: 0.6;
    }

    &__header {
        display: flex;
        align-items: center;
    }
    &__title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
        font-family: 'Douyin Sans';
    }
    &__detail {
        margin-left: auto;
        display: flex;
        align-items: center;
        .detail-label {
            font-size: 24rpx;
            color: #999;
            font-weight: bold;
        }
        .arrow-right {
            margin-left: 8rpx;
            font-weight: bold;
        }
    }

    &__body {
        padding-left: 17rpx;
        margin-top: 36rpx;
        display: flex;
        justify-content: space-between;
        box-sizing: border-box;
    }
    &__col {
        flex: 1;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        // justify-content: space-between;
        // 可用金额靠左、冻结金额靠右
        &--available {
            align-items: flex-start;
        }
        &--frozen {
            align-items: flex-end;
            text-align: right;
        }
        &--label {
            display: flex;
            align-items: center;
            font-size: 24rpx;
            font-weight: bold;
            color: #999;
            .eye {
                margin-left: 12rpx;
                width: 36rpx;
                height: 36rpx;
            }
            .label-text--frozen {
                padding-right: 34rpx;
            }
        }
        &--value {
            margin-top: 16rpx;
            display: flex;
            align-items: center;
            .value-num {
                font-size: 46rpx;
                font-weight: bold;
                color: #1a1a1a;
                font-family: 'Douyin Sans';
            }
            .value-num--frozen {
                color: #737680;
                font-size: 36rpx;
            }
            .value-num--mask {
                font-size: 46rpx;
                line-height: 46rpx;
            }
            .arrow-right {
                margin-left: 12rpx;
                font-weight: bold;
            }
        }
    }

    &__ratio {
        position: relative;
        margin-left: 17rpx;
        margin-top: 24rpx;
        height: 12rpx;
        border-radius: 999rpx;
        background: #eef1f7;
        overflow: hidden;
        &--segment {
            position: absolute;
            top: 0;
            bottom: 0;
            height: 100%;
            border-radius: 999rpx;
            // 增长动画：可用条锚定左侧由左往右，冻结条锚定右侧由右往左
            transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        &--available {
            left: 0;
            background: #3a65ff;
            box-shadow: inset 0 0 10rpx 0 rgba($color: #fff, $alpha: 0.7);
        }
        &--frozen {
            right: 0;
            background: #bccbff;
            box-shadow: inset 0 0 10rpx 0 rgba($color: #fff, $alpha: 0.8);
        }
    }

    &__notice {
        padding-left: 17rpx;
        margin-top: 24rpx;
        display: flex;
        align-items: center;
        &--dot {
            flex: none;
            width: 12rpx;
            height: 12rpx;
            border-radius: 50%;
            background: #4791fc;
            margin-right: 12rpx;
        }
        &--text {
            flex: 1;
            font-size: 24rpx;
            color: #333;
        }
    }
}
</style>
