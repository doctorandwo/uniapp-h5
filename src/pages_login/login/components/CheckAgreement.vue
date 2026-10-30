<template>
    <view class="check-agreement">
        <view class="checkbox-wrap" style="transform: translateY(0.3em)">
            <z1-checkbox :checked="checked" @change="e => (checked = e)" />
        </view>
        <view class="agreement-text" @click="checked = !checked">
            <text>选中即代表您已同意</text>
            <text class="text-blue" @click.stop="viewAgreement('user')">《{{ agreement.user.label }}》</text>
            <text>及</text>
            <text class="text-blue" @click.stop="viewAgreement('privacy')">《{{ agreement.privacy.label }}》</text>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        appName: String,
        value: Boolean,
    },
    data() {
        return {};
    },
    computed: {
        agreement() {
            return {
                user: { label: `${this.appName || ''}用户服务协议` },
                privacy: { label: `${this.appName || ''}隐私政策` },
            };
        },
        checked: {
            get() {
                return this.value;
            },
            set(value) {
                this.$emit('input', value);
            },
        },
    },
    methods: {
        viewAgreement(type) {
            const map = {
                user: 'userService',
                privacy: 'privacy',
            };
            const path = map[type];
            if (!path) return;
            // uni.navigateTo({ url: `/pages_login/agreement/agreement?type=${path}` });
            uni.navigateTo({ url: `/pages_login/agreement/${path}` });
        },
    },
};
</script>

<style lang="scss" scoped>
.check-agreement {
    display: flex;
    align-items: center;
    font-size: 28rpx;

    .checkbox-wrap {
        align-self: flex-start;
        flex-shrink: 0;
    }
    .text-blue {
        color: #3a65ff;
    }
    .agreement-text {
        line-height: 1.7em;
        letter-spacing: 0.3rpx;
    }
}
</style>
