export default {
    default: () => {
        return [
            {
                pagePath: '/pages/home/index',
                iconPath: 'tabbar/home_a.png',
                selectedIconPath: 'tabbar/home_b.png',
                text: '首页',
                isStartPage: true,
                isNeedLogin: false,
            },
            {
                pagePath: '/pages/goods/index',
                iconPath: 'tabbar/goods_a.png',
                selectedIconPath: 'tabbar/goods_b.png',
                text: '货源',
                isNeedLogin: false,
                $event: {
                    refresh: 'pages/goods/index:refresh',
                },
            },
            {
                // @by oh-my-zerone 2026-10-09 中间凸起 AI 中心入口
                pagePath: '/pages/ai/index',
                iconPath: 'tabbar/center.png',
                selectedIconPath: 'tabbar/center.png',
                text: 'AI',
                isCenter: true,
                isNeedLogin: false,
            },
            {
                pagePath: '/pages/waybill/index',
                iconPath: 'tabbar/waybill_a.png',
                selectedIconPath: 'tabbar/waybill_b.png',
                text: '运单',
                isNeedLogin: false,
                $event: {
                    refresh: 'pages/waybill/index:refresh',
                },
            },
            {
                pagePath: '/pages/user/index',
                iconPath: 'tabbar/mine_a.png',
                selectedIconPath: 'tabbar/mine_b.png',
                text: '我的',
                isNeedLogin: false,
            },
        ];
    },
};

export const startPage = '/pages/home/index';
