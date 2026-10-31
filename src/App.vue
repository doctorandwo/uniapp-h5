<script>
// #ifdef H5
import PageAnimation from '@/components/PageAnimation';
// #endif
// #ifdef MP-WEIXIN
import { useAppUpdate } from '@/common/hooks/useAppUpdate';
// #endif
export default {
    // #ifdef H5
    mixins: [PageAnimation], // 页面切换过渡动画
    // #endif
    onLaunch: function () {
        // 微信获取状态栏高度和底部安全距离
        uni.getSystemInfo({
            success: async res => {
                if (res) {
                    // #ifdef H5
                    try {
                        res.statusBarHeight = Number(await uni.useJsBridge('getStatusBarHeight'));
                        console.log('原生给的==statusBarHeight', res);
                    } catch (error) {
                        res.statusBarHeight = 30;
                    }
                    document.documentElement.style.setProperty('--status-bar-height-custom', (res.statusBarHeight || 0) + 'px'); // 设置自定义 CSS 变量
                    // #endif
                    uni.setStorageSync('statusBarHeight', res.statusBarHeight);
                    this.$store.dispatch('SetSystemInfo', res);
                }
            },
        });
        this.init();
    },
    created() {
        console.log('项目启动，当前页面栈==', getCurrentPages());
        console.log('VUE_APP_IS_LOCAL==', process.env.VUE_APP_IS_LOCAL);
    },
    methods: {
        init() {
            // #ifdef H5
            this.initH5();
            // #endif
            // #ifdef MP-WEIXIN
            this.initWX();
            // #endif
        },
        /**
         * H5 端初始化 tabbar 选中态
         *
         * 以「当前页面路由」对齐选中态，而不是读取 storage 中上次点击的记忆值：
         * 旧实现会用记忆值 dispatch('SwitchTabbar')，而该 action 内部会执行 uni.switchTab，
         * 导致从服务号通知直达某个 tabbar 页时被强制跳回首页，且 URL 上的 query 参数丢失。
         * SyncTabbar 只同步状态、不产生任何页面跳转。
         */
        initH5() {
            if (this.$store.getters.isLogin) {
                uni.useJsBridge('showFloatingTip'); // 登录态，显示悬浮提示
            }
            this.$store.dispatch('SyncTabbar', this.$route.path);
        },
        /**
         * 微信小程序端初始化 tabbar 选中态
         *
         * 不再按环境跳过（旧实现在非 production 下直接 return，导致开发版/体验版图标全不亮），
         * 也不再写死首页。小程序 onLaunch 阶段页面栈可能尚未就绪，此时 SyncTabbar 会安全跳过，
         * 真正的对齐由各 tabbar 页面的 onShow 兜底。
         */
        initWX() {
            this.$store.dispatch('SyncTabbar');
            this.checkAppUpdate();
        },
        /**
         * 检测小程序新版本（仅 MP-WEIXIN 端生效）
         *
         * 放在 initWX 而非 onLaunch 通用分支：H5 走现有发布体系，不需要包更新检测。
         * hook 内部已做幂等（模块级 running / dialogShown），重复调用只会跑一条检测链路。
         *
         * @returns {void}
         */
        checkAppUpdate() {
            // #ifdef MP-WEIXIN
            const { checkUpdate } = useAppUpdate();
            checkUpdate();
            // #endif
        },
    },
};
</script>

<style lang="scss">
/* 每个页面公共css */
@import '@/common/css/font.scss';
@import '@/common/css/flex.scss';
@import '@/common/css/index.scss';
@import '@/common/css/tabbar.scss';
@import '@/common/css/custom.scss';
</style>
