import {
    useGetPlat,
    useCanIUseJsBridge,
    useJsBridge,
    useJsBridgeAsync,
    useToLoginView,
    usePlusNavigateBack,
    onAuthorization,
    onLoginStatus,
    isLogin,
    getLocationPlus,
} from './uni-plus-funtion';

// utils（高频纯函数挂载到 uni.$z1，沿用项目既有约定）
import { getImageUrl } from '@/common/utils/imageUrl';
import { formatNumber, fixNum, arr2Obj, text2Array } from '@/common/utils/format';
import throttle from '@/common/utils/throttle';
import { debounce } from '@/common/utils/debounce';

/**
 * uni-plus扩展集合
 * @import 所有uni-plus扩展方法命名采用use开头以区分uni与uniplus  useXXXXXX
 */
export default [
    {
        name: 'useGetPlat',
        get: useGetPlat,
    },
    {
        name: 'useCanIUseJsBridge',
        get: useCanIUseJsBridge,
    },
    {
        name: 'useJsBridge',
        get: useJsBridge,
    },
    {
        name: 'useJsBridgeAsync',
        get: useJsBridgeAsync,
    },
    {
        name: 'useToLoginView',
        get: useToLoginView,
    },
    {
        name: 'usePlusNavigateBack',
        get: usePlusNavigateBack,
    },
    {
        name: 'onAuthorization',
        get: onAuthorization,
    },
    {
        name: 'onLoginStatus',
        get: onLoginStatus,
    },
    {
        name: 'isLogin',
        get: isLogin,
    },
    {
        name: 'getLocationPlus',
        get: getLocationPlus,
    },
    {
        name: '$z1',
        get: {
            showLoading: uni.showLoading,
            closeLoading: uni.hideLoading,
            // 高频纯函数（挂载后可在任意上下文通过 uni.$z1.xxx 调用）
            getImageUrl,
            formatNumber,
            fixNum,
            arr2Obj,
            text2Array,
            throttle,
            debounce,
        },
    },
    // #ifdef MP-WEIXIN

    // #endif
];
