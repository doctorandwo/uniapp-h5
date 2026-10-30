// 全局变量
import { getImageUrl } from '@/common/utils/imageUrl';
import { hasPermit } from '@/common/hooks/usePermit';
import { formatNumber } from '@/common/utils/format.js';
import { bridge } from '@/common/platform/bridge';

// 全局方法挂载
export default {
    siteId: 1,
    getImageUrl,
    hasPermit,
    formatNumber,
    bridge,
};
