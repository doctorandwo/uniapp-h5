<template>
    <PageFrame
        title="个人中心"
        bg="#EEF0F5"
        :refresherTriggered="triggered"
        :wxPolyfillHeight="0"
        @refresherrefresh="onRefresh"
        :refresherEnabled="isLogin"
        withTabbarBg
        showTabbar
    >
        <template #headerBg>
            <image :src="$global.getImageUrl('pages/user/bg-top.png')" class="bg-top" />
        </template>
        <view class="info">
            <UserInfoCard :is-login="isLogin" :avatar="userInfo.avatar" :nick-name="userInfo.nickName || userInfo.userName" :is-auth="isAuth" :enterprise="enterpriseName" />
        </view>

        <AccountCard :available-balance="account.availableBalance" :frozen-amount="account.frozenAmount" :notice="account.notice" />

        <InvoiceCard
            v-if="isLogin"
            :invoice-amount="invoice.invoiceAmount"
            :pending-count="invoice.pendingCount"
            :processing-count="invoice.processingCount"
            :available-count="invoice.availableCount"
        />

        <QuickMenu :list="quickMenuList" />

        <MenuList :list="menuList" />
        <view class="bottom-spacer"></view>
    </PageFrame>
</template>

<script>
// components
import PageFrame from '@/pages/components/PageFrame/index.vue';
import UserInfoCard from './components/UserInfoCard.vue';
import AccountCard from './components/AccountCard.vue';
import InvoiceCard from './components/InvoiceCard.vue';
import QuickMenu from './components/QuickMenu.vue';
import MenuList from './components/MenuList.vue';

// hooks
import { mapGetters } from 'vuex';
import { useUserCenter } from './hooks.js';
const { state: userCenterState, fetchAccountInfo: fetchAccountData, fetchQuickMenu: fetchQuickMenuData } = useUserCenter();

export default {
    components: {
        PageFrame,
        UserInfoCard,
        AccountCard,
        InvoiceCard,
        QuickMenu,
        MenuList,
        /* , AuthTypeModal */
    },
    data() {
        return {
            isLogin: false,
            triggered: false,
            // 我的发票 - 静态演示数据（真实接口后续补充）
            invoice: {
                invoiceAmount: 7660,
                pendingCount: 9,
                processingCount: 1,
                availableCount: 10,
            },
        };
    },
    computed: {
        ...mapGetters(['userInfo', 'isAuth', 'shipmentInfo']),
        /**
         * 企业名称：取自货主信息中的公司名称，未认证时为空
         * @returns {string}
         */
        enterpriseName() {
            return this.shipmentInfo?.companyName || '';
        },
        /**
         * 账户数据：桥接 useUserCenter 的模块级 observable state，供模板绑定
         * 模板中仍按 account.availableBalance / frozenAmount / notice 访问，无需改动
         * @returns {{availableBalance:number, frozenAmount:number, notice:string}}
         */
        account() {
            // @by oh-my-zerone
            return userCenterState.account;
        },
        /**
         * 便捷菜单列表：桥接 useUserCenter 的模块级 observable state，供模板绑定
         * 模板中仍按 quickMenuList 访问，无需改动
         * @returns {Array<{key:string,label:string,subLabel:string,icon:string}>}
         */
        quickMenuList() {
            // @by oh-my-zerone
            return userCenterState.quickMenu.list;
        },
        /**
         * 菜单行：我的钱包已移除，新增企业资料/平台规则/意见反馈（路径由 MenuList 组件内处理）
         * @returns {Array}
         */
        menuList() {
            return [
                { key: 'auth', label: '认证信息', icon: 'pages/user/menulist-auth.png', isAuth: this.isAuth },
                { key: 'enterprise', label: '企业资料', icon: 'pages/user/menulist-company.png' },
                { key: 'rules', label: '平台规则', icon: 'pages/user/menulist-rule.png' },
                { key: 'contact', label: '联系客服', icon: 'pages/user/menulist-contact.png' },
                { key: 'feedback', label: '意见反馈', icon: 'pages/user/menulist-feedback.png' },
                { key: 'setting', label: '设置', icon: 'pages/user/menulist-setting.png' },
            ];
        },
    },
    async onShow() {
        // 将 tabbar 选中态对齐为当前页面路由：覆盖服务号通知直达、返回等非点击 tabbar 的进入场景
        this.$store.dispatch('SyncTabbar');
        this.isLogin = uni.isLogin();
        if (!this.isLogin) return;
        await this.$store.dispatch('GetInfo');
        // 账户 + 便捷菜单并行请求，互不阻塞
        await Promise.all([this.fetchAccountInfo(), this.fetchQuickMenu()]);

        console.log('userInfo', this.isAuth, this.userInfo);
    },
    methods: {
        async onRefresh() {
            if (!this.isLogin) return;
            this.triggered = true;
            await this.$store.dispatch('GetInfo');
            // 账户 + 便捷菜单并行请求，互不阻塞
            await Promise.all([this.fetchAccountInfo(), this.fetchQuickMenu()]);
            this.triggered = false;
        },
        /**
         * 拉取账户数据（企业钱包 + 待支付提示），数据由 useUserCenter hook 注入
         * 参数取自 shipmentInfo：shipperCode=code，orgCode=companyCode
         */
        async fetchAccountInfo() {
            // @by oh-my-zerone
            await fetchAccountData({
                shipperCode: this.shipmentInfo?.code,
                orgCode: this.shipmentInfo?.companyCode,
            });
        },
        /**
         * 拉取便捷菜单数量，数据由 useUserCenter hook 注入
         */
        async fetchQuickMenu() {
            // @by oh-my-zerone
            await fetchQuickMenuData();
        },
    },
};
</script>
<style lang="scss" scoped>
.bg-top {
    width: 100%;
}
.info {
    padding: 0 32rpx;
    margin-top: 17rpx;
}
.bottom-spacer {
    height: 220rpx;
    background-color: #fff;
}
</style>
