/**
 * @by oh-my-zerone 2026-10-09
 * @description 默认上传核心。
 *   由原 src/common/hooks/useUpload.js 收敛至统一上传目录。
 *   基于 @zerone/toolbox 的 Uploader 实现华为 OBS 上传，作为全项目默认上传方法。
 *   对外契约：run(file) → 成功 resolve(服务端返回数据) / 失败 reject(Error)。
 */
import store from '@/store';
import Uploader from '@zerone/toolbox/src/uploader';
import Vue from 'vue';
import bootstrapConfig from '@/bootstrap.config.js';

/** OBS 对象存储路径前缀（业务固定目录 /chydk/） */
const OBJECT_KEY_PREFIX = '/chydk/';

/** Uploader 基础配置：业务桶与上传模式 */
const BASE_UPLOAD_CONFIG = {
    bucketCode: 'gc', // 业务桶编码
    mode: 'obs',
    server: '',
};

/**
 * @description 上传核心的可观察状态（全项目共享单例）
 */
const state = Vue.observable({
    uploader: null,
    objectKeyPrefix: OBJECT_KEY_PREFIX,
    baseUrl: bootstrapConfig.config.request.baseUrl,
});

const useUpload = (customConfig = {}) => {
    /**
     * 懒初始化 Uploader（仅首次调用时创建，避免 import 时产生副作用）
     */
    const initUploader = () => {
        if (!state.uploader) {
            state.uploader = new Uploader({
                baseUrl: state.baseUrl,
                headers: store.getters.headerInfo,
                ...BASE_UPLOAD_CONFIG,
                ...customConfig,
            });
        }
    };

    /**
     * 执行一次文件上传
     * @param {Object} file 跨端转换后的自定义文件对象（含 content / name / type）
     * @param {Object} [options] 透传给 Uploader 的额外参数（可覆盖 objectKey / fileType / url 等）
     * @returns {Promise<any>} 成功时 resolve 服务端返回数据；失败时 reject(Error)
     */
    const run = async (file, options = {}) => {
        if (!state.uploader) {
            initUploader();
        }
        const uploadOptions = {
            objectKey: `${state.objectKeyPrefix}${Date.now()}-${file.name}`,
            fileType: file.type,
            ...options,
        };
        const res = await state.uploader.run(file.content, uploadOptions);
        if (!res || !res.ok) {
            throw new Error(res?.message || '上传失败');
        }
        return res.data;
    };

    return {
        state,
        run,
    };
};

export default useUpload;
