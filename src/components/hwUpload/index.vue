<template>
    <view class="hw-upload-container">
        <view v-if="type === 'image'" class="upload-images">
            <view v-if="list.length > 0 && showFileList" class="img-list">
                <view v-for="(item, index) in list" :key="`${item}-${index}`" class="img-item" @click="previewImage(index)">
                    <image :src="item" mode="aspectFit" class="imgIcon" />
                    <image v-if="!disabled" :src="$global.getImageUrl('nativeUpload/removeIcon.png')" class="remove-icon" mode="scaleToFill" @click.stop="removeImage(index)" />
                </view>
            </view>
            <view v-if="list.length < count && !disabled" @click="handleUpload">
                <slot>
                    <image :src="$global.getImageUrl('nativeUpload/uploadImg.png')" mode="scaleToFill" class="imgIcon" />
                </slot>
            </view>
        </view>
    </view>
</template>

<script>
/**
 * 微信小程序图片上传组件（uploadToHW）
 * @by oh-my-zerone 2026-06-22
 */
import { chooseAndUploadImagesToHw } from '@/common/upload/obs';

export default {
    name: 'HwUpload',
    props: {
        value: {
            type: Array,
            default: () => [],
        },
        type: {
            type: String,
            default: 'image',
        },
        count: {
            type: Number,
            default: 9,
        },
        fileType: {
            type: String,
            default: '',
        },
        showFileList: {
            type: Boolean,
            default: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        maxSize: {
            type: Number,
            default: 5 * 1024 * 1024,
        },
    },
    computed: {
        list() {
            return this.value || [];
        },
    },
    methods: {
        emitChange(newList) {
            this.$emit('input', newList);
            this.$emit('change', newList);
        },
        async handleUpload() {
            if (this.disabled || this.type !== 'image') return;
            if (this.list.length >= this.count) return;

            const remain = this.count - this.list.length;
            try {
                const paths = await chooseAndUploadImagesToHw({
                    count: remain,
                    fileType: this.fileType,
                    maxSize: this.maxSize,
                });
                if (paths.length > 0) {
                    this.emitChange([...this.list, ...paths]);
                }
            } catch (e) {
                console.error('[hwUpload] upload fail', e);
            }
        },
        previewImage(index) {
            if (this.type !== 'image') return;
            uni.previewImage({
                urls: this.list,
                current: index,
            });
        },
        removeImage(index) {
            const newList = [...this.list];
            newList.splice(index, 1);
            this.emitChange(newList);
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

.upload-images {
    display: flex;
    flex-wrap: wrap;
    @include flex-gap(20rpx);
}

.imgIcon {
    width: 152rpx;
    height: 152rpx;
    border-radius: 8rpx;
    overflow: hidden;
}

.img-list {
    display: flex;
    flex-wrap: wrap;
    @include flex-gap(20rpx);
}

.img-item {
    position: relative;
    border-radius: 8rpx;
    display: inline-block;
}

.remove-icon {
    position: absolute;
    top: -16rpx;
    right: -16rpx;
    width: 32rpx;
    height: 32rpx;
    z-index: 10;
}
</style>
