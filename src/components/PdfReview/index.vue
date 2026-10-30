<template>
    <view class="pdf-review">
        <!-- 加载中 -->
        <view v-if="loading" class="pdf-review__status">
            <view class="pdf-review__spinner" />
            <view class="pdf-review__status-text">{{ progressText }}</view>
        </view>

        <!-- 加载失败 -->
        <view v-else-if="error" class="pdf-review__status">
            <view class="pdf-review__status-icon">!</view>
            <view class="pdf-review__status-text">{{ error }}</view>
            <view class="pdf-review__retry" @click="retry">重新加载</view>
        </view>

        <!-- 无数据 -->
        <view v-else-if="!images.length" class="pdf-review__status">
            <view class="pdf-review__status-text">暂无内容</view>
        </view>

        <!-- 按 PDF 页面样式展示 -->
        <view v-else :class="['pdf-review__pages', mode === 'full' ? 'pdf-review__pages--full' : '']">
            <view v-for="(src, idx) in images" :key="idx" :class="['pdf-review__page', mode === 'full' ? 'pdf-review__page--full' : '']" :style="{ width: pageWidth }">
                <image :src="src" class="pdf-review__image" mode="widthFix" @error="onImageError(idx)" @load="onImageLoad(idx)" @click="onPreviewImage(idx)" />
                <view v-if="showPageNo" :class="['pdf-review__page-no', `pdf-review__page-no--${pageNoMode}`]">
                    {{ pageNoMode === 'inline' || pageNoMode === 'plain' ? `${idx + 1} / ${images.length}` : `第 ${idx + 1} / ${images.length} 页` }}
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import pdfToImages from './pdfToImages.js';

/**
 * PdfReview - PDF / 图片列表预览组件
 *
 * 两种渲染来源：
 *   1. 传入 imageList（图片 URL / base64 dataURL 数组），跳过 PDF 解析直接展示；
 *   2. 传入 url（PDF 在线地址，需服务端允许 CORS），内部走 pdfjs-dist 解析（H5 端）。
 *
 * 当 imageList 非空时优先使用，url 不再生效。
 *
 * Props:
 *   url        {string}     PDF 在线地址（需服务端允许 CORS）；imageList 非空时此字段被忽略
 *   imageList  {string[]}   外部传入的图片地址数组（base64 dataURL 或 http URL），
 *                           长度 > 0 时优先于 url 使用
 *   mode       {string}     展示模式：
 *                             - 'card'（默认）：卡片样式，页面之间有间距/阴影/圆角
 *                             - 'full'       ：占满容器宽度，页面之间无缝衔接
 *   scale      {number}     渲染缩放倍率，默认 1.5（越大越清晰）
 *   pageNum    {number}     仅渲染前 N 页，默认 0 全部
 *   maxWidth   {number}     每页最大展示宽度（按 750 设计稿的 rpx 值），默认 690
 *                           （注：mode='full' 时此字段不生效，宽度强制 100% 铺满容器）
 *   showPageNo {boolean}    是否显示页码，默认 true
 *   pageNoMode {string}     页码样式模式：
 *                             - 'bar'（默认）：独立页脚条样式（位于图片下方）
 *                             - 'inline'    ：图片右下角半透明浮层水印
 *                             - 'plain'     ：图片底部居中的内嵌文字（无背景、无边框），
 *                                           模拟 PDF 内置页脚的视觉
 *   workerSrc  {string}     自定义 pdf.js worker 地址，传 '' 关闭 worker（H5 端有效）
 *   previewable{boolean}    是否启用点击图片预览，默认 true（关闭后点击不触发预览与 @preview）
 *
 * Events:
 *   @loaded       - 内容就绪时触发（images）=> void
 *                    （imageList 直接生效或 PDF 解析完成均会触发）
 *   @fail         - 加载失败时触发（err）=> void
 *   @imageLoad    - 单张图片渲染成功（{ page }）=> void
 *   @imageError   - 单张图片渲染失败（{ page }）=> void
 *   @preview      - 用户点击图片请求预览时触发（{ urls, current, index, handled }）=> void
 *                    默认组件内部会调用 uni.previewImage({ urls, current })；
 *                    若父组件希望自行处理预览（如使用第三方预览组件），
 *                    在事件回调中将 payload.handled = true 可阻止默认调用。
 *
 * Usage:
 *   <PdfReview :url="pdfUrl" :scale="1.5" @loaded="onLoaded" @fail="onFail" />
 *
 *   <!-- 外部图片列表优先使用 + 占满容器无缝展示 -->
 *   <PdfReview :imageList="images" mode="full" />
 */
export default {
    name: 'PdfReview',
    props: {
        url: {
            type: String,
            default: '',
        },
        // 外部图片组：传入时优先于 url，跳过 PDF 解析
        imageList: {
            type: Array,
            default: () => [],
        },
        mode: {
            type: String,
            default: 'card',
            validator: val => ['card', 'full'].includes(val),
        },
        scale: {
            type: Number,
            default: 1.5,
        },
        pageNum: {
            type: Number,
            default: 0,
        },
        maxWidth: {
            type: Number,
            default: 690,
        },
        showPageNo: {
            type: Boolean,
            default: true,
        },
        // 页码样式：'bar'（默认，独立页脚条）/ 'inline'（图片右下水印浮层）/ 'plain'（居中无背景）
        pageNoMode: {
            type: String,
            default: 'bar',
            validator: val => ['bar', 'inline', 'plain'].includes(val),
        },
        workerSrc: {
            type: String,
            default: undefined,
        },
        previewable: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            images: [],
            loading: false,
            error: '',
            current: 0,
            total: 0,
        };
    },
    computed: {
        pageWidth() {
            // full 模式强制 100% 铺满容器；其他模式按 maxWidth (rpx) 控制
            return this.mode === 'full' ? '100%' : `${this.maxWidth}rpx`;
        },
        progressText() {
            if (!this.total) return '正在加载 PDF...';
            return `已加载 ${this.current}/${this.total} 页`;
        },
    },
    watch: {
        url: {
            immediate: true,
            handler() {
                this.refreshContent();
            },
        },
        imageList: {
            immediate: true,
            handler() {
                this.refreshContent();
            },
        },
    },
    beforeDestroy() {
        // 主动清理 base64 引用，触发 GC
        this.images = [];
    },
    methods: {
        /**
         * 重置组件展示状态。
         * 用于切换 url / imageList 时清掉旧错误与旧进度条。
         */
        resetState() {
            this.images = [];
            this.error = '';
            this.current = 0;
            this.total = 0;
            this.loading = false;
        },

        /**
         * 把进度统计与数组长度对齐（已加载 N / 总 N）。
         * @param {string[]} arr
         */
        syncProgress(arr) {
            const n = arr.length;
            this.current = n;
            this.total = n;
        },

        /**
         * 内容刷新入口。
         * 优先使用外部 imageList；否则在提供 url 时走 PDF 解析；都没有则清空状态。
         */
        refreshContent() {
            const external = Array.isArray(this.imageList) ? this.imageList : [];
            this.resetState();

            if (external.length) {
                // imageList 非空：直接展示，优先于 url
                this.applyImages(external);
                return;
            }
            if (this.url) {
                this.loadPdf();
            }
        },

        /**
         * 将给定图片列表写入 data.images 并统一进度/loading 状态。
         * @param {string[]} list
         */
        applyImages(list) {
            const arr = Array.isArray(list) ? list : [];
            this.images = arr;
            this.syncProgress(arr);
            this.loading = false;
            this.error = '';
            this.$emit('loaded', arr);
        },

        async loadPdf() {
            if (!this.url) return;
            this.resetState();
            this.loading = true;

            try {
                const images = await pdfToImages({
                    url: this.url,
                    scale: this.scale,
                    pageNum: this.pageNum || undefined,
                    workerSrc: this.workerSrc,
                    onProgress: (c, t) => {
                        this.current = c;
                        this.total = t;
                    },
                });
                console.log('images', images);
                // 小程序端会拿到空数组
                const list = Array.isArray(images) ? images : [];
                this.applyImages(list);
            } catch (err) {
                console.error('[PdfReview] 加载失败:', err);
                this.error = (err && err.message) || 'PDF 加载失败，请检查地址或网络';
                this.loading = false;
                this.$emit('fail', err);
            }
        },

        retry() {
            // 重试时也走统一入口，保证 imageList 优先逻辑一致
            this.refreshContent();
        },

        onImageError(idx) {
            console.warn('[PdfReview] 第', idx + 1, '页图片渲染失败');
            this.$emit('imageError', { page: idx + 1 });
        },

        onImageLoad(idx) {
            this.$emit('imageLoad', { page: idx + 1 });
        },

        /**
         * 点击图片请求预览。
         * - previewable=false 时直接返回；
         * - 默认行为：emit @preview 后调用 uni.previewImage({ urls, current })；
         * - 父组件若希望自行处理，可在 @preview 回调中设置 payload.handled=true 阻止默认调用。
         *
         * @param {number} idx 用户点击的图片在 images 中的索引
         */
        onPreviewImage(idx) {
            if (!this.previewable) return;
            const urls = Array.isArray(this.images) ? this.images.slice() : [];
            const current = urls[idx];
            if (!current) return;
            const payload = { urls, current, index: idx, handled: false };
            this.$emit('preview', payload);
            if (payload.handled) return;
            try {
                uni.previewImage({ urls, current });
            } catch (e) {
                // 部分平台对 base64 dataURL 预览支持有限，失败时降级控制台提示
                console.warn('[PdfReview] uni.previewImage 调用失败：', e);
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.pdf-review {
    width: 100%;
    min-height: 100%;
    background: #f5f5f5;
    box-sizing: border-box;

    &__status {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 120rpx 40rpx;
    }

    &__status-icon {
        width: 80rpx;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        border-radius: 50%;
        background: #fdecec;
        color: #e54d42;
        font-size: 48rpx;
        font-weight: bold;
    }

    &__status-text {
        margin-top: 24rpx;
        font-size: 26rpx;
        color: #999;
        text-align: center;
        line-height: 40rpx;
    }

    &__spinner {
        width: 56rpx;
        height: 56rpx;
        border: 4rpx solid #e5e5e5;
        border-top-color: #3478f6;
        border-radius: 50%;
        animation: pdf-spin 0.8s linear infinite;
    }

    &__retry {
        margin-top: 40rpx;
        padding: 16rpx 60rpx;
        font-size: 28rpx;
        color: #3478f6;
        border: 1rpx solid #3478f6;
        border-radius: 40rpx;
    }

    // 默认卡片样式：容器带 padding，每个页面带阴影 / 圆角 / 间距
    &__pages {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24rpx 30rpx 60rpx;
        box-sizing: border-box;

        // full 模式：占满容器，移除外边距
        &--full {
            padding: 0;
        }
    }

    &__page {
        // 作为内嵌水印（--inline）的定位基准
        position: relative;
        background: #fff;
        box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
        border-radius: 8rpx;
        overflow: hidden;
        margin-bottom: 24rpx;

        &:last-child {
            margin-bottom: 0;
        }

        // full 模式：图片之间无缝衔接，去除阴影/圆角/间距
        &--full {
            background: transparent;
            box-shadow: none;
            border-radius: 0;
            margin-bottom: 0;
            overflow: visible;
        }
    }

    &__image {
        display: block;
        width: 100%;
        background: #fff;
    }

    &__page-no {
        height: 50rpx;
        line-height: 50rpx;
        text-align: center;
        font-size: 22rpx;
        color: #999;
        background: #fafafa;
        border-top: 1rpx solid #f0f0f0;

        // inline 模式：图片右下角的半透明水印浮层
        &--inline {
            position: absolute;
            right: 16rpx;
            bottom: 16rpx;
            height: auto;
            line-height: 36rpx;
            padding: 0 16rpx;
            border-radius: 20rpx;
            border: none;
            background: rgba(0, 0, 0, 0.5);
            color: #fff;
            font-size: 22rpx;
        }

        // plain 模式：图片底部居中的内嵌文字（无背景），模拟 PDF 内置页脚
        &--plain {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 16rpx;
            height: auto;
            line-height: 36rpx;
            text-align: center;
            background: transparent;
            border: none;
            color: #999;
            font-size: 24rpx;
        }
    }
}

@keyframes pdf-spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
