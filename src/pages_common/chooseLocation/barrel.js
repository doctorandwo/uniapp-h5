/**
 * @by oh-my-zerone
 * chooseLocation 统一出口（桶文件）：收敛页面所需的工具 / 服务引入。
 * 页面仅从此处 import，避免散落多处相对/绝对路径。
 */
export { calcDistanceM } from '@/common/utils/geo.js';
export { default as throttle } from '@/common/utils/throttle.js';
export { debounce } from '@/common/utils/debounce.js';
export { webSearchNearby, webGetAddress } from '@/common/platform/amap.js';
export { ApiGetCommonAddressList } from './service.js';
export {
    saveCommonAddress,
    ensureCommonAddress,
    parseCommonAddress,
    parsePoiToAddress,
    buildPendingPoi,
    POINT_TYPE_TO_ADDRESS_TYPE,
} from './commonAddressHelper.js';
