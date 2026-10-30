<template>
    <view class="c-input" :style="{ background: background }">
        <z1-input
            v-model="_value"
            :placeholder="placeholder"
            placeholderStyle="color: #999;font-size: 26rpx;"
            shape="circle"
            :prefixIcon="$global.getImageUrl(prefixIconUrl)"
            :prefixIconStyle="{ marginRight: '6rpx', width: '38rpx', height: '38rpx' }"
            border="none"
            style="width: 100%"
            @confirm="handleSearch"
            @keyup.enter="handleSearch"
        />
    </view>
</template>

<script>
export default {
    props: {
        value: {
            type: String,
            default: '',
        },
        placeholder: {
            type: String,
            default: '请输入',
        },
        prefixIconUrl: {
            type: String,
            default: 'pages/waybill/icon-search.png',
        },
        background: {
            type: String,
            default: () => 'rgba(255,255,255,0.68)',
        },
    },
    data() {
        return {};
    },
    computed: {
        _value: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('input', val);
            },
        },
    },
    methods: {
        handleSearch() {
            this.$emit('search', this._value);
        },
    },
};
</script>

<style lang="scss" scoped>
.c-input {
    border-radius: 44rpx;
    box-shadow: 0px 0px 12rpx 1rpx rgba(235, 238, 242, 0.54);
    height: 64rpx;
    padding: 14rpx 28rpx;
    display: flex;
    align-items: center;
}
</style>
