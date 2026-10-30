<template>
    <!-- 头部背景图片占位，使用插槽插入img图片即可 -->
    <div class="header-bg">
        <slot></slot>
    </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.header-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 0;

    > image {
        width: 100%;
        object-fit: cover;
    }
}
</style>
