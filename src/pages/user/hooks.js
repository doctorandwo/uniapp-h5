/**
 * @by oh-my-zerone
 * 个人中心 - 数据 hook（账户 + 便捷菜单统一注入）
 * 参照 home/hooks.js 范式：useXxx 在 script 顶层以模块级单例方式调用，
 * 返回 { state, fetchXxx }，组件内用 computed 桥接 state 供模板绑定。
 */
import Vue from 'vue';
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';

// services
import { getInfoCompanyWallet, getWaybillSettlementStatistical, getMyStatistics } from './services.js';

// utils
import { formatMoney } from '@/common/utils/format.js';

// 便捷菜单元信息：key/label/icon/数量单位由静态配置维护，数量值来自 getMyStatistics
const QUICK_MENU_META = [
    { key: 'address', label: '地址簿', icon: 'pages/user/quickmenu-address.png', unit: '个地址' },
    { key: 'favorite', label: '收藏运力', icon: 'pages/user/quickmenu-transport.png', unit: '个收藏' },
    { key: 'contract', label: '合同管理', icon: 'pages/user/quickmenu-agreement.png', unit: '份待签' },
    { key: 'claim', label: '理赔申诉', icon: 'pages/user/quickmenu-appeal.png', unit: '项处理中' },
];

// 菜单 key 与统计接口返回字段的映射
const QUICK_MENU_COUNT_KEY_MAP = {
    address: 'addressCount',
    favorite: 'favoriteCapacityCount',
    contract: 'contractCount',
    claim: 'claimComplaintCount',
};

const useUserCenter = () => {
    // 统一响应式 state：账户 + 便捷菜单共用一个 observable
    const state = Vue.observable({
        // 账户：可用余额 / 冻结金额 / 待支付提示
        account: {
            availableBalance: 0,
            frozenAmount: 0,
            notice: '',
        },
        // 便捷菜单：默认 0 值兜底（接口异常/未返回时避免空白）
        quickMenu: {
            list: QUICK_MENU_META.map(m => ({
                key: m.key,
                label: m.label,
                icon: m.icon,
                subLabel: `0 ${m.unit}`,
            })),
        },
    });

    /**
     * 获取企业钱包信息 + 待支付提示
     * 钱包：可用余额 = 账户总额(amount) - 冻结金额(freezeAmount)
     * 提示：调用运单结算统计接口，生成「有 a 笔费用待支付 b 元」
     * 两个接口彼此独立，任一异常时降级处理，不阻断页面其余功能
     * @param {object} params 请求参数
     * @param {string} [params.shipperCode] 货主编码（shipmentInfo.code）
     * @param {string} [params.orgCode] 企业编码（shipmentInfo.companyCode）
     * @returns {Promise<void>}
     */
    const fetchAccountInfo = async (params = {}) => {
        // @by oh-my-zerone
        const [walletErr, walletRes] = await useRequest(getInfoCompanyWallet);
        const walletData = walletErr ? {} : walletRes?.data || {};
        const amount = Number(walletData.amount) || 0;
        const freezeAmount = Number(walletData.freezeAmount) || 0;

        // 待支付提示：有 a 笔费用待支付 b 元（a=运单数量，b=货主实付运费）
        const [statErr, statRes] = await useRequest(getWaybillSettlementStatistical, {
            shipperCode: params.shipperCode,
            orgCode: params.orgCode,
        });
        let notice = '';
        if (!statErr) {
            const statData = statRes?.data || {};
            const count = Number(statData.waybillCount) || 0;
            const payAmount = Number(statData.shipperRealPay) || 0;
            if (count > 0) {
                notice = `有${count}笔费用待支付${formatMoney(payAmount)}元`;
            }
        }

        state.account = {
            availableBalance: amount - freezeAmount,
            frozenAmount: freezeAmount,
            notice,
        };
    };

    /**
     * 获取便捷菜单数量：调用货主我的页统计接口，将返回数量映射到各菜单项的 subLabel
     * 接口异常时保留初始 0 值，不阻断页面其余功能
     * @returns {Promise<void>}
     */
    const fetchQuickMenu = async () => {
        // @by oh-my-zerone
        const [err, res] = await useRequest(getMyStatistics);
        if (err) return;
        const stat = res?.data || {};
        state.quickMenu.list = QUICK_MENU_META.map(m => ({
            key: m.key,
            label: m.label,
            icon: m.icon,
            subLabel: `${Number(stat[QUICK_MENU_COUNT_KEY_MAP[m.key]]) || 0} ${m.unit}`,
        }));
    };

    return { state, fetchAccountInfo, fetchQuickMenu };
};

export { useUserCenter };
