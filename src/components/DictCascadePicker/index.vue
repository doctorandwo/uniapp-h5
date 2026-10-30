<template>
    <uni-popup type="bottom" ref="popup" background-color="#fff" border-radius="32rpx 32rpx 0 0" @maskClick="close">
        <view class="dict-cascade-picker">
            <view class="picker-header">
                <text class="picker-title">{{ title }}</text>
                <image class="picker-close" :src="iconClose" mode="aspectFit" @click="close" />
            </view>
            <view class="picker-body ly-flex">
                <z1-picker-panel class="picker-column" :value="[bigValue]" :options="bigOptions" :optionsProps="pickerProps" @change="onBigChange" />
                <z1-picker-panel class="picker-column" :value="[subValue]" :options="subOptions" :optionsProps="pickerProps" @change="onSubChange" />
            </view>
            <view class="picker-footer">
                <z1-button type="default" width="32%" @click="close">取消</z1-button>
                <view style="width: 32rpx"></view>
                <z1-button type="primary" width="63%" @click="onConfirm">确认</z1-button>
            </view>
        </view>
    </uni-popup>
</template>

<script>
/**
 * 字典级联选择器
 * 基于 z1-picker-panel，左列大类、右列小类；底部取消 / 确认与 z1-select 对齐
 */
import Z1Button from 'zjz1-h5-ui/packages/z1-button/z1-button.vue';
const ICON_CLOSE = require('zjz1-h5-ui/static/base/icon_close.png');

export default {
    name: 'DictCascadePicker',
    components: { Z1Button },
    props: {
        /** 当前选中值（小类 dictValue） */
        value: [String, Number],
        /** 树形选项数组 */
        options: { type: Array, default: () => [] },
        /** 控制弹窗显隐 */
        visible: {
            type: Boolean,
            default: false,
        },
        /** 弹窗标题 */
        title: { type: String, default: '请选择' },
        /** 字段映射配置 */
        optionsProps: {
            type: Object,
            default: () => ({
                label: 'dictLabel',
                value: 'dictValue',
                children: 'children',
            }),
        },
    },
    data() {
        return {
            /** 关闭图标（与 z1-select 同一资源） */
            iconClose: ICON_CLOSE,
            /** 当前选中的大类值 */
            bigValue: '',
            /** 当前选中的小类值 */
            subValue: '',
        };
    },
    computed: {
        pickerProps() {
            const { label, value } = this.optionsProps;
            return { label, value };
        },
        bigOptions() {
            return this.options || [];
        },
        subOptions() {
            const { value, children } = this.optionsProps;
            const big = this.bigOptions.find(item => item[value] === this.bigValue);
            return big ? big[children] || [] : [];
        },
    },
    watch: {
        visible(val) {
            if (val) {
                this.open();
            } else {
                this.close();
            }
        },
    },
    methods: {
        open() {
            this.initValues();
            this.$nextTick(() => {
                this.$refs.popup && this.$refs.popup.open();
            });
        },
        close() {
            this.$emit('update:visible', false);
            this.$nextTick(() => {
                this.$refs.popup && this.$refs.popup.close();
            });
        },
        /**
         * 初始化大类/小类选中值
         * 有已选值则回填，否则默认选第一项
         */
        initValues() {
            const { value, children } = this.optionsProps;
            let selectedBig = null;
            let selectedSub = null;

            for (const big of this.bigOptions) {
                const subs = big[children] || [];
                const sub = subs.find(item => item[value] === this.value);
                if (sub) {
                    selectedBig = big;
                    selectedSub = sub;
                    break;
                }
            }

            if (selectedBig && selectedSub) {
                this.bigValue = selectedBig[value];
                this.subValue = selectedSub[value];
            } else if (this.bigOptions.length) {
                this.bigValue = this.bigOptions[0][value];
                const subs = this.bigOptions[0][children] || [];
                this.subValue = subs.length ? subs[0][value] : '';
            } else {
                this.bigValue = '';
                this.subValue = '';
            }
        },
        /**
         * 大类列滚动变化
         * @param {Array} val - picker-panel 返回的 [value] 数组
         */
        onBigChange([val]) {
            this.bigValue = val;
            const { value, children } = this.optionsProps;
            const big = this.bigOptions.find(item => item[value] === val);
            const subs = big ? big[children] || [] : [];
            this.subValue = subs.length ? subs[0][value] : '';
        },
        /**
         * 小类列滚动变化
         * @param {Array} val - picker-panel 返回的 [value] 数组
         */
        onSubChange([val]) {
            this.subValue = val;
        },
        /**
         * 点击确认：向父组件 emit 选中结果并关闭弹窗
         */
        onConfirm() {
            const { value, label } = this.optionsProps;
            const big = this.bigOptions.find(item => item[value] === this.bigValue);
            const sub = this.subOptions.find(item => item[value] === this.subValue);

            this.$emit('input', this.subValue);
            this.$emit('change', {
                value: this.subValue,
                label: sub ? sub[label] : '',
                bigCategory: big,
                subCategory: sub,
            });
            this.close();
        },
    },
};
</script>

<style lang="scss" scoped>
.dict-cascade-picker {
    background: #ffffff;
    border-radius: 32rpx 32rpx 0 0;
    padding-bottom: env(safe-area-inset-bottom);

    /* 与 z1-select 头部一致：80rpx 高、标题居中、右侧关闭图标 */
    .picker-header {
        position: relative;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        font-size: 32rpx;
        font-weight: bold;
        color: #333333;
    }

    .picker-title {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        text-align: center;
    }

    .picker-close {
        width: 28rpx;
        height: 28rpx;
        position: absolute;
        right: 34rpx;
        top: 26rpx;
    }

    .picker-body {
        height: 400rpx;
    }

    /*
     * 列文字字号：组件库默认 36rpx，比页面字段名称（32rpx）明显偏大，
     * 这里降到 30rpx，与页面数值字号一致
     * @by oh-my-zerone 2026-10-28
     */
    ::v-deep .z1-picker-panel-column__options-item {
        font-size: 30rpx;
    }

    /*
     * 去掉组件库选中项的 1.2 倍放大（picker-panel-column 内置 is-active { transform: scale(1.2) }）
     * @by oh-my-zerone 2026-10-28 选中项被额外放大后视觉字号明显偏大
     */
    ::v-deep .z1-picker-panel-column__options-item.is-active {
        transform: none;
        font-size: 30rpx;
    }

    .picker-column {
        flex: 1;
    }

    /* 与 z1-select 底部按钮区一致：白底、顶部细线、取消 32% / 确认 63% */
    .picker-footer {
        display: flex;
        align-items: center;
        width: 100%;
        background: #ffffff;
        padding: 20rpx 35rpx 32rpx 35rpx;
        box-sizing: border-box;
        border-top: 1rpx solid #ebebeb;
    }
}
</style>
