<script>
import './index.css';
export default {
    // #ifdef H5
    onLaunch: function () {
        this.show();
        this.$router.beforeEach((to, from, next) => {
            this.hide(to, next);
        });

        this.$router.afterEach(() => {
            setTimeout(this.show, 50);
        });
    },
    methods: {
        /**
         * 判断目标页面是否需要转场动画
         *
         * 仅首页不参与转场（首页为应用落地页，转场会打断首屏观感）；
         * 其余页面（含 货源 / 运单 / 我的 三个 tabbar 页）均保留转场动画。
         *
         * @param {string} path 目标页面路径
         * @returns {boolean} true 表示需要转场动画
         */
        needAnimation(path) {
            return path !== '/pages/home/index';
        },
        hide(to, callback) {
            const classList = document.querySelector('uni-page').classList;
            if (this.needAnimation(to.path)) {
                classList.add('animation-before', 'animation-leave');
                classList.remove('animation-show');
                setTimeout(() => {
                    classList.remove('animation-before', 'animation-leave');
                    callback && callback();
                }, 300);
            } else {
                callback && callback();
            }
        },
        show() {
            const classList = document.querySelector('uni-page').classList;
            if (this.needAnimation(this.$route.path)) {
                classList.add('animation-before');
                setTimeout(() => {
                    classList.add('animation-enter', 'animation-after');
                    classList.add('animation-show');
                    setTimeout(() => {
                        classList.remove('animation-before', 'animation-after', 'animation-enter');
                    }, 300);
                }, 20);
            } else {
                classList.add('animation-show');
            }
        },
    },
    // #endif
};
</script>
