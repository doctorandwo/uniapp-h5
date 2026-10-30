<template>
    <view class="native-upload-container">
        <!-- 图片上传类型 -->
        <view class="upload-images" v-if="type === 'image'">
            <view class="img-list" v-if="list.length > 0 && showFileList">
                <!-- draggable 关闭时不绑定拖拽相关事件，避免 catchtouchmove 拦截页面滚动 -->
                <template v-if="!draggable || disabled">
                    <view v-for="(item, index) in list" :key="item" class="img-item" @click="previewImage(index)">
                        <image :src="item" mode="scaleToFill" class="imgIcon" />
                        <image :src="$global.getImageUrl('nativeUpload/removeIcon.png')" v-if="!disabled" class="remove-icon" mode="scaleToFill" @click.stop="removeImage(index)" />
                    </view>
                </template>
                <!-- draggable 开启时才绑定拖拽事件，catchtouchmove 只在此区域生效 -->
                <template v-else>
                    <view
                        v-for="(item, index) in list"
                        :key="item"
                        class="img-item"
                        :class="{ 'is-dragging': dragIndex === index }"
                        @longpress="onLongPress($event, index)"
                        @touchmove.stop.prevent="onTouchMove"
                        @touchend="onTouchEnd"
                        @touchcancel="onTouchEnd"
                    >
                        <image :src="item" mode="scaleToFill" class="imgIcon" @click="onImageClick(index)" />
                        <image :src="$global.getImageUrl('nativeUpload/removeIcon.png')" class="remove-icon" mode="scaleToFill" @click.stop="removeImage(index)" />
                    </view>
                </template>
            </view>
            <view v-if="list.length < count && !disabled" @click="handleUpload">
                <slot>
                    <image :src="$global.getImageUrl('nativeUpload/uploadImg.png')" mode="scaleToFill" class="imgIcon" />
                </slot>
            </view>
        </view>

        <!-- 视频上传类型 -->
        <view class="upload-images" v-else-if="type === 'video'">
            <view class="img-list" v-if="list.length > 0 && showFileList">
                <view v-for="(item, index) in list" :key="index" class="img-item">
                    <image :src="$global.getImageUrl('nativeUpload/videoIcon.png')" mode="scaleToFill" class="imgIcon" />
                    <image :src="$global.getImageUrl('nativeUpload/removeIcon.png')" v-if="!disabled" class="remove-icon" mode="scaleToFill" @click.stop="removeImage(index)" />
                </view>
            </view>
            <image
                v-if="list.length < count && !disabled"
                :src="$global.getImageUrl('nativeUpload/videoUploadIcon.png')"
                mode="scaleToFill"
                class="imgIcon"
                @click="handleUpload"
            />
        </view>

        <!-- 附件上传类型 -->
        <view class="upload-files" v-else-if="type === 'file'">
            <view class="file-list" v-if="list.length > 0 && showFileList">
                <view class="file-item" v-for="(item, index) in list" :key="index">
                    <image :src="$global.getImageUrl('nativeUpload/attachmentIcon.png')" mode="scaleToFill" class="file-icon" />
                    <text class="file-name">{{ getFileName(item) }}</text>
                    <text class="file-remove" @click.stop="removeImage(index)" v-if="!disabled">删除</text>
                </view>
            </view>
            <view class="add-attachment-btn" @click="handleUpload" v-if="list.length < count && !disabled">
                <view class="add-icon-circle">
                    <image :src="$global.getImageUrl('nativeUpload/plus.png')" mode="scaleToFill" class="add-icon" />
                </view>
                <text class="attachment-text">附件</text>
            </view>
        </view>
    </view>
</template>

<script>
/**
 * @by oh-my-zerone 2026-06-10
 * @update 2026-07-31 新增图片上传的 OBS 通道（useObsUpload=true 时启用）：
 *   - 默认行为：JS Bridge 调起原生选择器（actionSheet 区分拍照/相册）
 *   - 新通道：uni.chooseImage + 工具箱 useUpload 上传到华为 OBS（与 HwUpload 同款）
 */
import { chooseAndUploadImagesToHw } from '@/common/upload/obs';

export default {
    name: 'NativeUpload',
    props: {
        // 双向绑定的文件列表，数组格式（URL）
        value: {
            type: Array,
            default: () => [],
        },
        // 上传类型：'image' 或 'file' 或 'video'
        type: {
            type: String,
            default: 'image',
        },
        // 最大上传数量
        count: {
            type: Number,
            default: 9,
        },
        // 支持的文件类型后缀，如 ".jpg,.png"
        fileType: {
            type: String,
            default: '',
        },
        // 文件 MIME 类型过滤，仅附件上传(type='file')的原生 chooseFile 使用
        fileMimeType: {
            type: String,
            default: '*/*',
        },
        showFileList: {
            type: Boolean,
            default: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        // 是否支持长按拖拽排序（仅针对 type="image" 有效）
        draggable: {
            type: Boolean,
            default: false,
        },
        // 是否走 OBS 上传通道（与 HwUpload 同款能力：uni.chooseImage + 工具箱 useUpload）
        // true：先选图后上传到华为 OBS，返回服务端 path 列表
        // false（默认）：JS Bridge 调起原生选择器，保留 actionSheet 区分拍照/相册
        useObsUpload: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            dragIndex: -1,
            itemRects: [],
            // 拖拽结束后屏蔽一次 click，防止误触发预览
            preventNextClick: false,
        };
    },
    computed: {
        list() {
            return this.value || [];
        },
    },
    methods: {
        /**
         * 长按触发拖拽排序
         */
        onLongPress(e, index) {
            if (!this.draggable || this.disabled) return;
            this.dragIndex = index;
            this.preventNextClick = false;
            // #ifdef MP-WEIXIN || APP-PLUS
            uni.vibrateShort();
            // #endif
            this.refreshItemRects();
        },
        /**
         * 重新查询并更新所有图片格子的位置信息
         */
        refreshItemRects() {
            const query = uni.createSelectorQuery().in(this);
            query
                .selectAll('.img-item')
                .boundingClientRect(rects => {
                    if (rects && rects.length > 0) {
                        this.itemRects = rects;
                    }
                })
                .exec();
        },
        /**
         * 拖拽移动
         */
        onTouchMove(e) {
            if (!this.draggable || this.disabled || this.dragIndex === -1) return;

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;

            if (!this.itemRects || this.itemRects.length === 0) return;

            let targetIndex = -1;
            for (let i = 0; i < this.itemRects.length; i++) {
                const rect = this.itemRects[i];
                if (currentX >= rect.left && currentX <= rect.right && currentY >= rect.top && currentY <= rect.bottom) {
                    targetIndex = i;
                    break;
                }
            }

            if (targetIndex !== -1 && targetIndex !== this.dragIndex) {
                const newList = [...this.list];
                const item = newList.splice(this.dragIndex, 1)[0];
                newList.splice(targetIndex, 0, item);

                this.dragIndex = targetIndex;
                this.$emit('input', newList);
                this.$emit('change', newList);

                // 排序后 DOM 位置变化，下一帧重新快照
                this.$nextTick(() => {
                    this.refreshItemRects();
                });
            }
        },
        /**
         * 结束拖拽
         */
        onTouchEnd() {
            if (!this.draggable || this.disabled) return;
            if (this.dragIndex !== -1) {
                // 标记本次 touchend 来自拖拽，屏蔽紧跟的 click 事件
                this.preventNextClick = true;
            }
            this.dragIndex = -1;
            this.itemRects = [];
        },
        /**
         * 图片点击（拖拽结束后屏蔽一次，防止误触发预览）
         * @param {Number} index
         */
        onImageClick(index) {
            if (this.preventNextClick) {
                this.preventNextClick = false;
                return;
            }
            this.previewImage(index);
        },

        /**
         * 触发上传
         * - image + useObsUpload=true：走 OBS 通道（与 HwUpload 同款：uni.chooseImage + useUpload）
         * - image + useObsUpload=false（默认）：JS Bridge 调起原生选择器
         * - video / file：JS Bridge
         */
        async handleUpload() {
            if (this.disabled) return;
            if (this.list.length >= this.count) return;
            const remain = this.count - this.list.length;

            if (this.type === 'image') {
                if (this.useObsUpload) {
                    // 通道 1：OBS 通道（与 HwUpload 同款能力，返回服务端 path）
                    await this.handleImageUploadByObs(remain);
                } else {
                    // 通道 2（默认）：JS Bridge 调起原生选择器（actionSheet 区分拍照/相册）
                    uni.showActionSheet({
                        itemList: ['拍照', '从相册选择'],
                        success: async res => {
                            const sourceType = res.tapIndex === 0 ? 'camera' : 'openGallery';
                            await this.invokeBridge('chooseImage', remain, sourceType);
                        },
                    });
                }
            } else if (this.type === 'video') {
                // 视频上传使用 chooseVideo
                await this.invokeBridge('chooseVideo', remain, '');
            } else {
                // 附件上传使用 chooseFile (具体名称取决于原生桥接支持的方法)
                await this.invokeBridge('chooseFile', remain, '', this.fileMimeType);
            }
        },

        /**
         * 图片类型上传（OBS 通道）：与 HwUpload 同款能力
         * 走 uni.chooseImage 选图后，通过工具箱 useUpload 上传到华为 OBS，
         * 返回的是服务端 path 列表（可直接作为 image src 使用）
         * @param {Number} remain 剩余可上传数量
         */
        async handleImageUploadByObs(remain) {
            try {
                const paths = await chooseAndUploadImagesToHw({
                    count: remain,
                    fileType: this.fileType,
                    maxSize: 5 * 1024 * 1024,
                });
                if (paths.length > 0) {
                    const newList = [...this.list, ...paths];
                    this.$emit('input', newList);
                    this.$emit('change', newList);
                }
            } catch (e) {
                console.error('[nativeUpload] obs upload fail', e);
            }
        },

        /**
         * 调用原生桥接方法
         * @param {String} bridgeName - 桥接方法名
         * @param {Number} count - 数量
         * @param {String} sourceType - 来源类型
         * @param {String} mimeType - 文件 MIME 类型
         */
        async invokeBridge(bridgeName, count, sourceType, mimeType) {
            try {
                const params = { count };
                if (sourceType) {
                    params.sourceType = sourceType;
                }
                if (mimeType) {
                    params.type = mimeType;
                }

                // 假设统一个 JS Bridge 方法
                const res = await uni.useJsBridgeAsync(bridgeName, params);
                let urls = res.urls || res.tempFilePaths || [];
                if (typeof res === 'string') urls = [res];
                if (Array.isArray(res)) urls = res;

                if (!Array.isArray(urls)) {
                    if (typeof urls === 'string') urls = [urls];
                    else urls = [];
                }

                // 1. 类型限制判断
                let validUrls = [];
                if (this.fileType) {
                    const allowedTypes = this.fileType
                        .toLowerCase()
                        .split(',')
                        .filter(item => item.trim());
                    validUrls = urls.filter(url => {
                        let ext = '';
                        const lastDot = url.lastIndexOf('.');
                        if (lastDot > -1) {
                            ext = url.substring(lastDot).toLowerCase();
                        }
                        if (ext.indexOf('?') > -1) {
                            ext = ext.split('?')[0];
                        }
                        return allowedTypes.includes(ext) || allowedTypes.some(t => ext.endsWith(t) || t.endsWith(ext));
                    });

                    if (validUrls.length < urls.length) {
                        uni.showToast({ title: '部分文件格式不支持，已过滤', icon: 'none' });
                    }
                } else {
                    validUrls = urls;
                }

                // 2. 长度限制判断
                const remain = this.count - this.list.length;
                if (validUrls.length > remain) {
                    validUrls = validUrls.slice(0, remain);
                }

                // 3. 走赋值逻辑
                if (validUrls.length > 0) {
                    const newList = [...this.list, ...validUrls];
                    this.$emit('input', newList);
                    this.$emit('change', newList);
                }
            } catch (e) {
                console.error('[economy-h5-trace] upload fail', e);
            }
        },

        /**
         * 预览图片
         * @param {Number} index - 当前预览的图片索引
         */
        previewImage(index) {
            if (this.type === 'image') {
                uni.previewImage({
                    urls: this.list,
                    current: index,
                });
            }
        },

        /**
         * 删除图片或文件
         * @param {Number} index - 索引
         */
        removeImage(index) {
            const newList = [...this.list];
            newList.splice(index, 1);
            this.$emit('input', newList);
            this.$emit('change', newList);
        },

        /**
         * 从 url 中提取文件名
         * @param {String} url
         */
        getFileName(url) {
            if (!url) return '附件';
            let lastSlash = url.lastIndexOf('/');
            if (lastSlash > -1) {
                let name = url.substring(lastSlash + 1);
                if (name.indexOf('?') > -1) {
                    name = name.split('?')[0];
                }
                return name;
            }
            return '附件';
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';
/* 图片上传样式 */
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
    transition: transform 0.2s, opacity 0.2s;
}

.is-dragging {
    opacity: 0.8;
    transform: scale(1.05);
    z-index: 100;
}

.remove-icon {
    position: absolute;
    top: -16rpx;
    right: -16rpx;
    width: 32rpx;
    height: 32rpx;
    z-index: 10;
}

/* 附件上传样式 */
.upload-files {
    display: flex;
    flex-direction: column;
    @include flex-gap(16rpx, column);
}

.file-list {
    display: flex;
    flex-direction: column;
    @include flex-gap(12rpx, column);
}

.file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f7f8fc;
    padding: 16rpx 24rpx;
    border-radius: 8rpx;

    .file-name {
        font-size: 28rpx;
        color: #333;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .file-icon {
        width: 40rpx;
        height: 40rpx;
        margin-right: 10rpx;
    }
    .file-remove {
        font-size: 26rpx;
        color: #ff5a5a;
        margin-left: 20rpx;
    }
}

.add-attachment-btn {
    display: inline-flex;
    align-items: center;
    background-color: #fff;
    padding: 10rpx 0;
    border-radius: 8rpx;

    .add-icon-circle {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12rpx;

        .add-icon {
            width: 32rpx;
            height: 32rpx;
        }
    }

    .attachment-text {
        font-size: 28rpx;
        color: #3a65ff;
        font-weight: 500;
    }
}
</style>
