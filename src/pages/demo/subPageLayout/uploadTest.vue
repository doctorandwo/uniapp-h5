<!--
    上传方法测试页
    验证 useUpload（基于 @zerone/toolbox Uploader 的 OBS 上传）与
    chooseAndUploadImagesToHw / resolveUploadImageDisplayUrl 的可用性与体积优化效果。
    注意：本页位于主包 pages 下，可用于验证改造后 Uploader 不再静态进入主包。
    @by oh-my-zerone
-->
<template>
    <view class="page">
        <view class="card">
            <view class="card__title">1. 选择并上传图片到华为 OBS</view>
            <button class="btn" hover-class="btn--hover" @click="handleUpload">选择图片并上传</button>
            <view v-if="rawPaths.length" class="result">
                <view class="result__label">服务端返回 path（点击解析并预览）：</view>
                <view
                    v-for="(p, i) in rawPaths"
                    :key="i"
                    class="result__item"
                    hover-class="result__item--hover"
                    @click="handlePreview(p)"
                >{{ p }}</view>
            </view>
        </view>

        <view class="card">
            <view class="card__title">2. 批量解析展示地址并预览</view>
            <button class="btn" hover-class="btn--hover" :disabled="!rawPaths.length" @click="handleResolveAll">解析全部 path 为展示 URL</button>
            <view v-if="displayUrls.length" class="gallery">
                <image
                    v-for="(url, i) in displayUrls"
                    :key="i"
                    :src="url"
                    class="gallery__img"
                    mode="aspectFill"
                    @click="handlePreviewUrl(url)"
                />
            </view>
        </view>

        <view class="card">
            <view class="card__title">3. 单 path 实时解析</view>
            <input
                class="input"
                v-model="inputPath"
                placeholder="粘贴 path 或 http(s) URL"
                placeholder-class="input__placeholder"
            />
            <button class="btn" hover-class="btn--hover" @click="handleResolveOne">解析</button>
            <view v-if="singleUrl" class="result">
                <view class="result__item" hover-class="result__item--hover" @click="handlePreviewUrl(singleUrl)">{{ singleUrl }}</view>
            </view>
        </view>
    </view>
</template>

<script>
// services
import { chooseAndUploadImagesToHw } from '@/common/upload/obs';
import { resolveUploadImageDisplayUrl, resolveUploadImageDisplayUrls } from '@/common/upload/resolve';

export default {
    name: 'UploadMethodTest',
    data() {
        return {
            /** 上传后服务端返回的 path 列表 */
            rawPaths: [],
            /** 解析后的可展示 URL 列表 */
            displayUrls: [],
            /** 单 path 输入框 */
            inputPath: '',
            /** 单 path 解析结果 */
            singleUrl: '',
        };
    },
    methods: {
        /**
         * 选择图片并串行上传到华为 OBS，记录服务端返回的 path 列表
         * @returns {Promise<void>}
         */
        async handleUpload() {
            try {
                uni.showLoading({ title: '上传中...' });
                // 直接调用业务首选上传方法（内部走 useUpload 懒加载 Uploader）
                const paths = await chooseAndUploadImagesToHw({ count: 3 });
                this.rawPaths = paths;
                uni.showToast({ title: `上传成功 ${paths.length} 张`, icon: 'none' });
            } catch (e) {
                uni.showToast({ title: '上传失败', icon: 'none' });
                console.error('[uploadTest] chooseAndUploadImagesToHw fail', e);
            } finally {
                uni.hideLoading();
            }
        },
        /**
         * 批量解析 path 为可展示 URL
         * @returns {Promise<void>}
         */
        async handleResolveAll() {
            try {
                this.displayUrls = await resolveUploadImageDisplayUrls(this.rawPaths);
            } catch (e) {
                console.error('[uploadTest] resolveUploadImageDisplayUrls fail', e);
            }
        },
        /**
         * 单 path 实时解析
         * @returns {Promise<void>}
         */
        async handleResolveOne() {
            const value = this.inputPath.trim();
            if (!value) return;
            try {
                this.singleUrl = await resolveUploadImageDisplayUrl(value);
            } catch (e) {
                console.error('[uploadTest] resolveUploadImageDisplayUrl fail', e);
            }
        },
        /**
         * 先解析 path 再预览
         * @param {string} path 服务端 path 或 URL
         * @returns {Promise<void>}
         */
        async handlePreview(path) {
            const url = await resolveUploadImageDisplayUrl(path);
            this.handlePreviewUrl(url);
        },
        /**
         * 用 uni.previewImage 预览图片
         * @param {string} url 可展示的图片 URL
         */
        handlePreviewUrl(url) {
            if (!url) {
                uni.showToast({ title: '地址为空', icon: 'none' });
                return;
            }
            uni.previewImage({ urls: [url], current: url });
        },
    },
};
</script>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    padding: 24rpx;
    background-color: #f5f6fa;
    box-sizing: border-box;
}

.card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;

    &__title {
        font-size: 30rpx;
        font-weight: bold;
        color: #1a1a1a;
        margin-bottom: 20rpx;
    }
}

.btn {
    margin-top: 8rpx;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 30rpx;
    color: #ffffff;
    background-color: #3a65ff;
    border-radius: 12rpx;

    &--hover {
        background-color: #2c4fcc;
    }

    &[disabled] {
        background-color: #c8cdda;
    }
}

.input {
    margin: 16rpx 0;
    height: 80rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #1a1a1a;
    background-color: #f5f6fa;
    border-radius: 12rpx;

    &__placeholder {
        color: #999999;
    }
}

.result {
    margin-top: 16rpx;

    &__label {
        font-size: 26rpx;
        color: #666666;
        margin-bottom: 8rpx;
    }

    &__item {
        font-size: 24rpx;
        color: #3a65ff;
        word-break: break-all;
        padding: 12rpx;
        background-color: #f2f5ff;
        border-radius: 8rpx;
        margin-bottom: 8rpx;

        &--hover {
            background-color: #e3eaff;
        }
    }
}

.gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-top: 16rpx;

    &__img {
        width: 160rpx;
        height: 160rpx;
        border-radius: 8rpx;
        background-color: #f5f6fa;
    }
}
</style>
