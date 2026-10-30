<template>
    <Z1Header class="header-wrap" :title="title" :has-back="hasBack" :backgroundColor="headBackground" :dark="dark" :showCachet="false">
        <slot />
        <div slot="extra" class="flex align-center" style="min-width: max-content">
            <slot name="extra"></slot>
        </div>
    </Z1Header>
</template>

<script>
import Z1Header from '@/components/Header/z1Header.vue';
export default {
    components: {
        Z1Header,
    },
    props: {
        title: String,
        headBackground: String,
        // 是否带返回箭头
        hasBack: Boolean,
        dark: Boolean,
    },
    data() {
        return {
            isJsBridge: false,
        };
    },
    async mounted() {
        this.isJsBridge = await uni.useCanIUseJsBridge();
    },
    methods: {},
};
</script>

<style lang="scss" scoped>
::v-deep .extra {
    justify-content: unset !important;
}
.header-wrap {
    .title-wrap {
        width: calc(100vw - 226upx);

        &.hideCachet {
            width: calc(100vw - 64upx);
        }
    }
}
</style>
