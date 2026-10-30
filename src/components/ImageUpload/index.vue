<template>
    <view class="image-upload-wrapper">
        <!--
            多端条件编译：
            - 微信小程序端：使用 HwUpload（基于 chooseAndUploadImagesToHw 上传到华为 OBS）
            - H5 嵌入 APP 端：使用 NativeUpload（基于 JS Bridge 调用原生相册/相机）
        -->
        <!--
            注意：uniapp 编译到微信小程序时，v-bind="$attrs" 在不同基础库版本下行为不一致，
            存在解析失败或属性丢失的风险。因此小程序端只做显式 props 绑定，依赖 props 显式声明来覆盖场景。
        -->
        <!-- #ifdef MP-WEIXIN -->
        <HwUpload
            :value="value"
            :type="type"
            :count="count"
            :file-type="fileType"
            :show-file-list="showFileList"
            :disabled="disabled"
            :max-size="maxSize"
            @input="$emit('input', $event)"
            @change="$emit('change', $event)"
        >
            <!-- 自定义上传触发器（仅小程序端生效，H5 端组件未声明 slot 故自动忽略） -->
            <slot>
                <image :src="$global.getImageUrl('nativeUpload/uploadImg.png')" mode="scaleToFill" class="imgIcon" />
            </slot>
        </HwUpload>
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <!--
            H5 端为 Vue.js 标准 webview 运行时，v-bind="$attrs" 完全受支持，
            配合 inheritAttrs: false，可把未在 props 中声明的属性透传到 NativeUpload，
            保留对未覆盖属性的弹性扩展能力。
        -->
        <NativeUpload
            v-bind="$attrs"
            :value="value"
            :type="type"
            :count="count"
            :file-type="fileType"
            :file-mime-type="fileMimeType"
            :show-file-list="showFileList"
            :disabled="disabled"
            :draggable="draggable"
            :useObsUpload="useObsUpload"
            @input="$emit('input', $event)"
            @change="$emit('change', $event)"
        >
            <slot>
                <image :src="$global.getImageUrl('nativeUpload/uploadImg.png')" mode="scaleToFill" class="imgIcon" />
            </slot>
        </NativeUpload>
        <!-- #endif -->
    </view>
</template>

<script>
/**
 * 图片上传组件 - 多端兼容适配层
 *
 * 通过 uniapp 条件编译，在不同端引用不同的上传组件：
 *   - 微信小程序：HwUpload  （华为 OBS 上传）
 *   - H5 嵌入 APP：NativeUpload （JS Bridge 调用原生）
 *
 * 对调用方屏蔽平台差异，提供统一的 props / events / slot API。
 *
 * @by oh-my-zerone 2026-07-31
 */

// #ifdef MP-WEIXIN
import HwUpload from '@/components/hwUpload/index.vue';
// #endif
// #ifdef H5
import NativeUpload from '@/components/nativeUpload/index.vue';
// #endif

export default {
    name: 'ImageUpload',
    /**
     * 关闭默认的 attrs 透传：
     * - H5 端：避免未知属性被挂到外层 <view> 上；模板里通过 v-bind="$attrs" 主动下发给 NativeUpload。
     * - 微信小程序端：v-bind="$attrs" 在不同基础库版本下行为不一致（可能解析失败或属性丢失），
     *   故模板中未在小程序分支使用 v-bind="$attrs"，这里关闭 inheritAttrs 只是让未知属性静默丢弃，
     *   不污染外层 <view>，避免触发小程序告警。
     */
    inheritAttrs: false,
    components: {
        // #ifdef MP-WEIXIN
        HwUpload,
        // #endif
        // #ifdef H5
        NativeUpload,
        // #endif
    },
    props: {
        /**
         * 双向绑定的文件 URL 列表（v-model）
         * @type {Array<string>}
         */
        value: {
            type: Array,
            default: () => [],
        },
        /**
         * 上传类型
         * 可选值：'image' 图片 | 'video' 视频 | 'file' 附件
         * 注：H5 端三种均支持；小程序端仅 image 完整生效
         */
        type: {
            type: String,
            default: 'image',
        },
        /**
         * 最多上传数量
         */
        count: {
            type: Number,
            default: 9,
        },
        /**
         * 允许的文件后缀过滤，多个以英文逗号分隔，如 ".jpg,.jpeg,.png"
         */
        fileType: {
            type: String,
            default: '',
        },
        /**
         * 附件（type='file'）的 MIME 过滤，仅 H5 端 chooseFile 透传生效
         * 常用值：'image/*'、'application/pdf' 等合法 MIME 字符串
         * 默认值见下方 default：通配所有类型（星号 + 斜杠 + 星号）
         */
        fileMimeType: {
            type: String,
            default: '*/*',
        },
        /**
         * 是否展示已上传文件列表
         */
        showFileList: {
            type: Boolean,
            default: true,
        },
        /**
         * 是否禁用上传/删除
         */
        disabled: {
            type: Boolean,
            default: false,
        },
        /**
         * 单张文件大小上限（字节），仅小程序端生效
         * 默认 5MB
         */
        maxSize: {
            type: Number,
            default: 5 * 1024 * 1024,
        },
        /**
         * 是否支持长按拖拽排序，仅 H5 端且 type='image' 时生效
         */
        draggable: {
            type: Boolean,
            default: false,
        },
        /**
         * 是否走 OBS 上传通道，仅 H5 端且 type='image' 时生效
         * true：先 uni.chooseImage 选图，再上传到华为 OBS，返回服务端 path（与 HwUpload 同款）
         * false（默认）：H5 端走 JS Bridge 调起原生选择器；微信小程序端此 prop 无意义
         */
        useObsUpload: {
            type: Boolean,
            default: false,
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

/*
 * 透传容器：不做任何布局约束，
 * 由内部子组件（HwUpload / NativeUpload）根据自身设计自行管理间距。
 */
.image-upload-wrapper {
    display: block;
}
.imgIcon {
    width: 152rpx;
    height: 152rpx;
    border-radius: 8rpx;
    overflow: hidden;
}
</style>
