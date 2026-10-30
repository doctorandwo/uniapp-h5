import Vue from 'vue';
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { ApiGetSourceList } from '@/pages/home/services.js';
import { getDicts } from '@/api/common';

const useList = () => {
    const state = Vue.observable({
        // 当前任务列表
        curTaskList: [],
    });
    const fetchCurTaskList = async queryPage => {
        const payload = {
            ...queryPage,

            executionStatusList: ['EXECUTING'],
        };
        const [err, res] = await useRequest(ApiGetSourceList, payload);
        if (err) return;
        // 过滤出运输中的任务
        state.curTaskList = res.rows || [];
        return res;
    };

    return { state, fetchCurTaskList };
};

/**
 * @desc 将字典列表转换为 code -> label 的映射对象
 * @by oh-my-zerone 2026-10-22
 * @param {Array} list 字典列表，元素可能含 { dictValue, dictLabel } 或 { code, name }
 * @returns {Object} 以字符串 code 为键、label 为值的映射对象
 */
function buildDictMap(list) {
    const map = {};
    (list || []).forEach(item => {
        const key = String(item.dictValue !== undefined ? item.dictValue : item.code ?? '');
        if (key) map[key] = item.dictLabel || item.name || '';
    });
    return map;
}

let dictPromise = null;

/**
 * 车长/车型字典映射 hook：加载 vehicleLength、vehicleClassification 字典并构建 code->label 映射。
 * 模块级 dictPromise 缓存请求，避免重复拉取；组件通过 state.lengthMap / state.typeMap 响应式消费。
 * @by oh-my-zerone 2026-10-22
 * @returns {{ state: Object, loadVehicleDict: Function }}
 *   state.lengthMap: 车长编码 -> 车长名称
 *   state.typeMap: 车型编码 -> 车型名称
 *   state.loaded: 是否已加载完成
 */
const useVehicleDict = () => {
    const state = Vue.observable({
        lengthMap: {},
        typeMap: {},
        loaded: false,
    });

    const loadVehicleDict = async () => {
        if (dictPromise) {
            const maps = await dictPromise;
            state.lengthMap = maps.lengthMap;
            state.typeMap = maps.typeMap;
            state.loaded = true;
            return maps;
        }
        const rowsOf = res => {
            const rows = res?.data?.rows || res?.data;
            return Array.isArray(rows) ? rows : [];
        };
        dictPromise = Promise.all([
            getDicts('vehicleLength'),
            getDicts('vehicleClassification'),
        ])
            .then(([lengthRes, typeRes]) => ({
                lengthMap: buildDictMap(rowsOf(lengthRes)),
                typeMap: buildDictMap(rowsOf(typeRes)),
            }))
            .catch(err => {
                // 字典加载失败时清空缓存，允许下次重试，并向下兼容（返回空映射）
                dictPromise = null;
                console.error('[useVehicleDict] 字典加载失败', err);
                return { lengthMap: {}, typeMap: {} };
            });
        const maps = await dictPromise;
        state.lengthMap = maps.lengthMap;
        state.typeMap = maps.typeMap;
        state.loaded = true;
        return maps;
    };

    return { state, loadVehicleDict };
};

export { useList, useVehicleDict };

