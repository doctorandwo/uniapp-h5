<!--
 * @by oh-my-zerone
 * 地图选点页面（从 funuo/owner/src/pages_quoteCreate/mapPicker 迁移，现置于 chooseLocation/ 下）
 * 复用现有 @/components/MapPicker 组件；常用地址保存与类型映射复用同目录 commonAddressHelper.js。
 -->
<template>
    <MapPicker
        :type="type"
        :longitude="longitude"
        :latitude="latitude"
        :initialAlias="initialAlias"
        :echo="echo"
        :with-contact="withContact"
        :pick-only="pickOnly"
        @confirm="onConfirm"
    />
</template>

<script>
// components
import MapPicker from '@/components/MapPicker/index.vue';

// modules
import { ensureCommonAddress, POINT_TYPE_TO_ADDRESS_TYPE } from '../commonAddressHelper.js';

// platform（跨端 Modal 兼容层）
import { showModal } from '@/common/platform/modal.js';

export default {
    name: 'MapPickerPage',
    components: { MapPicker },
    data() {
        return {
            type: 'start',
            longitude: '',
            latitude: '',
            initialAlias: '',
            returnDelta: 1,
            // 上游已选地址回显数据（含坐标/名称/详情/别名/省市区码）
            echo: null,
            // @by oh-my-zerone 2026-10-16 与上游 chooseLocation 保持一致：是否采集地址联系人 / 联系电话
            withContact: false,
            // @by oh-my-zerone 2026-10-19 仅选点模式：确认后不写常用地址，由下游表单页统一提交
            pickOnly: false,
        };
    },
    onLoad(options) {
        this.type = options?.type || 'start';
        this.longitude = options?.x || options?.longitude || '';
        this.latitude = options?.y || options?.latitude || '';
        this.initialAlias = decodeURIComponent(options?.initialAlias || '');
        this.returnDelta = Number(options?.returnDelta || 1);
        this.echo = this.parseEcho(options?.selected);
        // 兼容 query 字符串与布尔两种传参
        this.withContact = options?.withContact === '1' || options?.withContact === 'true' || options?.withContact === true;
        // @by oh-my-zerone 2026-10-19 仅选点模式（地址簿表单回填），默认关闭，既有调用方行为不变
        this.pickOnly = options?.pickOnly === '1' || options?.pickOnly === 'true' || options?.pickOnly === true;
    },
    methods: {
        /**
         * 解析上游已选地址，归一化为地图选点回显对象。
         * @by oh-my-zerone 2026-10-20 追加联系人 / 联系电话，供别名弹窗回显
         * @param {string} [raw] encodeURIComponent 后的 JSON 字符串
         * @returns {Object|null} 回显对象（缺坐标则无效）
         */
        parseEcho(raw) {
            if (!raw) return null;
            let str = raw;
            try {
                if (str.indexOf('%') !== -1) str = decodeURIComponent(str);
                const p = JSON.parse(str);
                if (!p || p.longitude == null || p.latitude == null) return null;
                return {
                    longitude: Number(p.longitude),
                    latitude: Number(p.latitude),
                    name: p.addressName || '',
                    address: p.detail || '',
                    alias: p.alias || '',
                    // 上游已采集的联系人 / 联系电话（常用地址项与选点回传均用这两个字段名）
                    contact: p.contact || '',
                    contactPhone: p.contactPhone || '',
                    provinceCode: p.provinceCode,
                    cityCode: p.cityCode,
                    districtCode: p.districtCode,
                    province: p.province || '',
                    city: p.city || '',
                    district: p.district || '',
                };
            } catch (e) {
                console.warn('parseEcho failed', e);
                return null;
            }
        },
        /**
         * 地图确认回调：有别名则保存常用地址，再通过 eventChannel 回传选择结果并退出。
         * @param {Object} res { type, alias, poi, location:{x,y} }
         */
        async onConfirm(res) {
            const { alias, poi, type, saveToCommon } = res || {};
            // 仅勾选"保存到常用地址"时才调用保存接口；仅选点模式跳过保存
            if (!this.pickOnly && saveToCommon && alias) {
                try {
                    await ensureCommonAddress(alias, poi, POINT_TYPE_TO_ADDRESS_TYPE[type]);
                } catch (error) {
                    console.error('saveCommonAddress error', error);
                    // 保存失败用 modal 提示，并按 B 方案阻断回传、停留重试
                    showModal({
                        title: '常用地址保存失败',
                        content: error || '保存失败，请重试',
                        showCancel: false,
                        confirmText: '我知道了',
                    });
                    return;
                }
            }
            const eventChannel = this.getOpenerEventChannel();
            eventChannel.emit('success', res);
            uni.navigateBack({ delta: this.returnDelta });
        },
    },
};
</script>
