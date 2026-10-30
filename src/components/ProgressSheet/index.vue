<template>
    <view class="progress-sheet-mask" v-if="innerVisible" @click="handleMaskClick" @touchmove.stop.prevent>
        <view class="progress-sheet-container" @click.stop>
            <!-- 顶部渐变背景装饰层 -->
            <view class="progress-sheet-bg"></view>

            <!-- 顶部核心图标和标题 -->
            <view class="progress-sheet-header">
                <view class="header-text-info">
                    <view class="header-title">{{ title }}</view>
                </view>
                <view class="header-image-wrap">
                    <image :src="$global.getImageUrl('common/popUpBg.png')" class="header-img" mode="aspectFit" v-if="animationFinished"></image>
                </view>
            </view>

            <!-- 时间轴步骤条：loading 态三步同时展开且全部转圈，success 态依次完成 -->
            <view class="progress-timeline">
                <view v-for="(step, index) in stepStates" :key="index" :class="['timeline-item', { 'item-visible': step.visible }]">
                    <view class="timeline-left">
                        <view class="timeline-icon-dynamic">
                            <view class="icon-loading" :class="{ 'loading-fade-out': step.transformed }"></view>
                            <view class="icon-checked" :class="{ 'check-fade-in': step.transformed }">
                                <view class="css-check small-check"></view>
                            </view>
                        </view>
                        <view v-if="index < stepStates.length - 1" class="timeline-line-wrap">
                            <view class="timeline-line-inner" :class="{ 'line-grow': step.lineGrowing }"></view>
                        </view>
                    </view>
                    <view class="timeline-right" :style="index === stepStates.length - 1 ? 'padding-bottom: 0' : ''">
                        <view class="timeline-title-row">
                            <text class="timeline-title" :class="{ 'active-title': !step.transformed }">{{ stepTitles[index] }}</text>
                            <text class="timeline-time">{{ currentTime }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 底部提示文字与操作按钮 -->
            <view class="progress-sheet-footer">
                <view class="footer-tip">{{ animationFinished ? '已完成' : '正在处理，请稍候…' }}</view>
                <z1-button type="primary" :disabled="!animationFinished" class="footer-btn" @click="handleConfirm">
                    {{ confirmText }}
                </z1-button>
            </view>
        </view>
    </view>
</template>

<script>
import dayjs from 'dayjs';

/**
 * ProgressSheet 流程进度弹窗
 * 参照 economy-h5 SuccessSheet 实现的时间轴进度弹窗，适用于"同意申请"等
 * 需要展示多步处理进度的通用场景（steps 由调用方传入）。
 *
 * 两种形态：
 *  - loading 态：三步同时展开，全部节点转圈，等待父组件把 status 置为 success
 *  - success 态：依次播放 loading→check 完成动画，全部完成后按钮可点、emit('finish')
 *
 * 错误提示不在本组件内处理：接口失败由请求拦截器（modal: true）弹出 uni.showModal 展示，
 * 父组件收到 err 后直接关闭本弹窗即可。
 */
export default {
    name: 'ProgressSheet',
    props: {
        /**
         * 是否显示弹窗，由父组件控制
         * @type {Boolean}
         */
        visible: {
            type: Boolean,
            default: false,
        },
        /**
         * 弹窗主标题
         * @type {String}
         */
        title: {
            type: String,
            default: '同意申请',
        },
        /**
         * 步骤文案数组，支持字符串或 { title } 对象
         * @type {Array<string|{title: string}>}
         */
        steps: {
            type: Array,
            default: () => [],
        },
        /**
         * 流程状态：'loading' 处理中（全部转圈）；'success' 触发依次完成动画
         * @type {String}
         */
        status: {
            type: String,
            default: 'loading',
        },
        /**
         * 每步完成动画的间隔时间（毫秒）
         * @type {Number}
         */
        stepWaitTime: {
            type: Number,
            default: 400,
        },
        /**
         * 虚线向下生长的动画时间（毫秒）
         * @type {Number}
         */
        lineGrowTime: {
            type: Number,
            default: 400,
        },
        /**
         * 弹窗最短展示时长（毫秒）：从打开到真正隐藏至少展示该时长，
         * 防止接口快速返回（尤其是失败场景）时弹窗一闪而过
         * @type {Number}
         */
        minShowTime: {
            type: Number,
            default: 2000,
        },
        /**
         * 底部确认按钮文案
         * @type {String}
         */
        confirmText: {
            type: String,
            default: '我知道了',
        },
    },
    data() {
        return {
            /**
             * 各步骤的动画运行状态，与 props.steps 一一对应
             * - visible: 节点是否已显示（loading 态下全部立即显示）
             * - transformed: 节点是否已完成（Loading → Check）
             * - lineGrowing: 当前节点到下一节点的连线是否开始生长
             */
            stepStates: [],
            /** 整个完成动画是否播放完毕，控制底部按钮可用状态 */
            animationFinished: false,
            /**
             * 内部真实可见状态：外部 visible 置 false 时，
             * 若未达 minShowTime 则延迟把 innerVisible 置 false
             */
            innerVisible: false,
            /** 弹窗打开（进入 loading 态）的时间戳，用于 minShowTime 兜底 */
            showStartAt: 0,
            /** 延迟关闭的定时器句柄，用于重新打开 / 销毁时清理 */
            closeTimer: null,
            /**
             * 动画运行代号：visible 变化 / 重置时自增，
             * 异步动画循环通过比对代号判断是否已被废弃，避免残留时序污染下一次展示
             */
            runId: 0,
        };
    },
    computed: {
        /**
         * 归一化后的步骤标题列表，兼容字符串 / 对象两种传参
         * @returns {Array<string>}
         */
        stepTitles() {
            return this.steps.map(item => (typeof item === 'string' ? item : item && item.title) || '');
        },
        /** 步骤条右侧展示的当前时间（打开弹窗那一刻） */
        currentTime() {
            return dayjs().format('MM/DD HH:mm');
        },
    },
    watch: {
        /**
         * 监听 visible：打开时初始化 loading 态（全部节点展开转圈），关闭时终止动画并复位
         * @param {Boolean} val - 新的可见状态
         * @returns {void}
         */
        visible(val) {
            if (val) {
                this.clearCloseTimer();
                this.showStartAt = Date.now();
                this.innerVisible = true;
                this.initLoadingState();
            } else {
                this.runId++; // 使仍在运行的动画循环失效
                this.scheduleClose();
            }
        },
        /**
         * 监听 status：父组件置为 'success' 时启动依次完成动画
         * @param {String} val - 新状态
         * @returns {void}
         */
        status(val) {
            if (val === 'success' && this.visible) {
                this.runCompletion();
            }
        },
    },
    beforeDestroy() {
        // 页面销毁时使动画循环失效，避免残留回调操作已销毁实例
        this.runId++;
        this.clearCloseTimer();
    },
    methods: {
        /**
         * 返回一个在指定毫秒后 resolve 的 Promise，用于 async/await 控制动画时序
         * @param {Number} ms - 延迟毫秒数
         * @returns {Promise<void>}
         */
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        /**
         * 清理延迟关闭定时器
         * @returns {void}
         */
        clearCloseTimer() {
            if (this.closeTimer) {
                clearTimeout(this.closeTimer);
                this.closeTimer = null;
            }
        },
        /**
         * 延迟隐藏弹窗：未达最短展示时长 minShowTime 时补齐剩余时间再隐藏，
         * 避免失败场景（接口快速报错）下弹窗一闪而过
         * @returns {void}
         */
        scheduleClose() {
            this.clearCloseTimer();
            const elapsed = Date.now() - this.showStartAt;
            const remain = this.minShowTime - elapsed;
            if (remain <= 0) {
                this.hideSheet();
                return;
            }
            this.closeTimer = setTimeout(() => {
                this.closeTimer = null;
                this.hideSheet();
            }, remain);
        },
        /**
         * 真正隐藏弹窗并通知父组件
         * 父组件可在此挂载"失败后由业务层弹窗展示错误"的逻辑，避免两層弹窗叠加
         * @returns {void}
         */
        hideSheet() {
            this.innerVisible = false;
            this.$emit('hidden');
        },
        /**
         * 初始化 loading 态：全部节点同时展开，loading 圈持续旋转
         * @returns {void}
         */
        initLoadingState() {
            this.runId++; // 使上一次可能仍在运行的动画失效
            this.animationFinished = false;
            this.stepStates = this.stepTitles.map(() => ({
                visible: true,
                transformed: false,
                lineGrowing: false,
            }));
        },
        /**
         * 执行依次完成动画：逐个节点 loading→check，节点间连线生长
         * 播放期间若弹窗被关闭（runId 变化），立即中止
         * @returns {Promise<void>}
         */
        async runCompletion() {
            const currentRunId = this.runId;
            const checkAnimTime = 400; // check 弹入动画时长
            for (let i = 0; i < this.stepStates.length; i++) {
                await this.delay(this.stepWaitTime);
                if (currentRunId !== this.runId) return;
                this.stepStates[i].transformed = true;

                await this.delay(checkAnimTime);
                if (currentRunId !== this.runId) return;

                if (i < this.stepStates.length - 1) {
                    this.stepStates[i].lineGrowing = true;
                    await this.delay(this.lineGrowTime);
                    if (currentRunId !== this.runId) return;
                }
            }

            this.animationFinished = true;
            this.$emit('finish');
        },
        /**
         * 点击遮罩（不关闭，loading 中防误触退出流程）
         * @returns {void}
         */
        handleMaskClick() {},
        /**
         * 点击底部确认按钮：仅在完成动画播放完毕后生效，通知父组件关闭
         * @returns {void}
         */
        handleConfirm() {
            if (!this.animationFinished) return;
            this.$emit('confirm');
            this.$emit('update:visible', false);
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

.progress-sheet-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    animation: fadeInMask 0.3s ease-out forwards;
}

@keyframes fadeInMask {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.progress-sheet-container {
    background: #ffffff;
    border-radius: 32rpx 32rpx 0 0;
    padding: 40rpx 32rpx;
    padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
    transform: translateY(100%);
    animation: slideUpSheet 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    position: relative;
    /* overflow: hidden 移除，允许顶部图片突破边界 */
}

@keyframes slideUpSheet {
    from {
        transform: translateY(100%);
    }

    to {
        transform: translateY(0);
    }
}

.progress-sheet-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300rpx;
    background: linear-gradient(180deg, #d8e4fa 0%, #ffffff 100%);
    z-index: 0;
    pointer-events: none;
    border-radius: 32rpx 32rpx 0 0;
}

.progress-sheet-header {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    position: relative;
    z-index: 1;
    min-height: 120rpx;
}

.header-text-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    z-index: 2;
}

.header-title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 12rpx;
}

.header-image-wrap {
    width: 368rpx;
    height: 308rpx;
    position: absolute;
    right: -70rpx;
    top: -120rpx;
    z-index: 1;
}

.header-img {
    width: 100%;
    height: 100%;
    animation: floatIcon 3s ease-in-out infinite;
}

@keyframes floatIcon {
    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10rpx);
    }
}

.progress-timeline {
    padding-left: 10rpx;
    position: relative;
    z-index: 1;
}

.timeline-item {
    display: flex;
    opacity: 0;
    transform: translateY(20rpx);
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.timeline-item.item-visible {
    opacity: 1;
    transform: translateY(0);
}

.timeline-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 20rpx;
    width: 36rpx;
}

.timeline-line-wrap {
    flex: 1;
    width: 2rpx;
    margin: 8rpx 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

.timeline-line-inner {
    width: 2rpx;
    height: 0;
    border-left: 2rpx dashed #27bf8c;
    transition: height 0.6s linear;
}

.timeline-line-inner.line-grow {
    height: 100%;
}

.timeline-right {
    flex: 1;
    padding-bottom: 40rpx;
}

.timeline-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8rpx;
    margin-top: -4rpx;
}

.timeline-title {
    font-size: 30rpx;
    color: #333;
    font-weight: bold;
    transition: color 0.3s;
}

.timeline-title.active-title {
    color: #27bf8c;
}

.timeline-time {
    font-size: 24rpx;
    color: #999;
}

.timeline-icon-dynamic {
    position: relative;
    width: 36rpx;
    height: 36rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
}

.icon-loading {
    position: absolute;
    width: 32rpx;
    height: 32rpx;
    border-radius: 50%;
    background: conic-gradient(from 0deg, rgba(39, 191, 140, 0) 0%, rgba(39, 191, 140, 1) 100%);
    animation: spinIcon 1s linear infinite;
    transition: all 0.5s ease-out;
}

.icon-loading::after {
    content: '';
    position: absolute;
    top: 4rpx;
    left: 4rpx;
    right: 4rpx;
    bottom: 4rpx;
    background-color: #ffffff;
    border-radius: 50%;
}

@keyframes spinIcon {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.icon-loading.loading-fade-out {
    opacity: 0;
    transform: scale(0.5) rotate(180deg);
}

.icon-checked {
    position: absolute;
    width: 32rpx;
    height: 32rpx;
    background-color: #ffffff;
    border: 2rpx solid #27bf8c;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transform: scale(0.5) rotate(-180deg);
    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-sizing: border-box;
}

.icon-checked.check-fade-in {
    opacity: 1;
    transform: scale(1) rotate(0deg);
}

.css-check {
    display: inline-block;
    width: 6rpx;
    height: 14rpx;
    border-right: 2rpx solid #27bf8c;
    border-bottom: 2rpx solid #27bf8c;
    transform: rotate(45deg);
}

.small-check {
    margin-bottom: 4rpx;
}

.progress-sheet-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20rpx;
    padding-top: 20rpx;
}

.footer-tip {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 16rpx;
}

.footer-btn {
    width: 100%;
}
</style>
