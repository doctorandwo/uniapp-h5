<template>
    <web-view :src="url" />
</template>

<script>
/**
 * 外部链接 webview（直渲完整 URL，不附加内部参数）
 * @by oh-my-zerone 2026-09-02
 */
export default {
    data() {
        return {
            url: '',
        };
    },
    onLoad(options) {
        this.url = decodeURIComponent(options.url || '');
    },
};
</script>

<style lang="scss" scoped></style>
