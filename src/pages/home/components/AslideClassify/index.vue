<template>
    <uni-popup ref="popup" type="right" background-color="#fff" @maskClick="maskClick" @change="onChange">
        <view style="width: 610rpx; height: 100vh">
            <ClassifyContent :list="list" :labelKey="labelKey" :valueKey="valueKey" :value="value" ref="classifyContent" @input="onClassifyInput" @change="onClassifyChange" />
        </view>
    </uni-popup>
</template>

<script>
import ClassifyContent from './ClassifyContent.vue';
export default {
    components: { ClassifyContent },
    props: {
        visible: {
            type: Boolean,
            default: () => false,
        },
        list: {
            type: Array,
            default: () => [],
        },
        labelKey: {
            type: String,
            default: 'label',
        },
        valueKey: {
            type: String,
            default: 'value',
        },
        value: {
            type: [String, Number],
            default: '',
        },
    },
    computed: {
        _visible: {
            get() {
                return this.visible;
            },
            set(val) {
                this.$emit('update:visible', val);
            },
        },
    },
    watch: {
        _visible(val) {
            val && this.$refs.popup.open();
        },
    },
    data() {
        return {};
    },
    methods: {
        maskClick() {
            this._visible = false;
        },
        onClassifyInput(val) {
            this.$emit('input', val);
        },
        onClassifyChange(...args) {
            this.$emit('change', ...args);
        },
        onChange({ show }) {
            if (show) this.$emit('open');
            else this.$emit('close');
        },
    },
};
</script>

<style lang="scss" scoped></style>
