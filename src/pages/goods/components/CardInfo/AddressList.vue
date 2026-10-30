<template>
    <view class="address-list">
        <view class="address-row from">
            <view class="icon-circle" />
            <view class="address-content g-single-row">
                <span class="row-text">{{ load }} </span>
                <!-- <span class="row-desc" v-if="loadAddr.formattedAddress">{{ loadAddr.formattedAddress }}</span> -->
            </view>
        </view>
        <view class="address-row to">
            <view class="icon-circle" />
            <view class="address-content g-single-row">
                <span class="row-text">{{ unload }} </span>
                <!-- <span class="row-desc" v-if="unloadAddr.formattedAddress">{{ unloadAddr.formattedAddress }}</span> -->
            </view>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        info: {
            type: Object,
            default: () => { },
        },
    },
    data() {
        return {};
    },
    computed: {
        /**
         * 装货地址：文档 redisOrderInfoListVoList[].redisAddressList[0]
         * 注：文档 redisAddressList 为「装货卸货地址信息列表」，此处约定 [0]=装货、[1]=卸货
         * @returns {object}
         */
        loadAddr() {
            if (this.info.redisAddressList.length > 0) {
                // 装货地址
                const temp = this.info.redisAddressList.find(e => e.addressType === '1');
                return temp || {};
            }
            return {}
        },
        unloadAddr() {
            if (this.info.redisAddressList.length > 0) {
                // 卸货地址
                const temp = this.info.redisAddressList.find(e => e.addressType === '2');
                return temp || {};
            }
            return {}
        },
        /** 装货：城市・街道 */
        load() {
            const { detail, addressAlias = '', addressName = '', country = '', province = '', city = '', district = '', street = '' } = this.loadAddr;
            let lastAdd = ''
            let firstAdd = ''
            const arr = [province, city, district].filter(Boolean)
            if (arr.length > 1) {
                lastAdd = arr[arr.length - 1] || ''
            } else {
                firstAdd = arr[0] || ''
            }
            const secondStr = [lastAdd, addressAlias].filter(Boolean).join('・');
            return firstAdd ? `${firstAdd} ${secondStr}` : secondStr;
        },
        /** 卸货：城市・街道；后端未返回卸货地址时用 -- 占位 */
        unload() {
            const { detail, addressAlias = '', addressName = '', country = '', province = '', city = '', district = '', street = '' } = this.unloadAddr;
            let lastAdd = ''
            let firstAdd = ''
            const arr = [province, city, district].filter(Boolean)
            if (arr.length > 1) {
                lastAdd = arr[arr.length - 1] || ''
            } else {
                firstAdd = arr[0] || ''
            }
            const secondStr = [lastAdd, addressAlias].filter(Boolean).join('・');
            return firstAdd ? `${firstAdd} ${secondStr}` : secondStr;
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';

/* 设计稿 194:7198：圆点 9、行间距 8、图标与文案间距 12；竖线连接两圆点 */
$circle-width: 9rpx;
$row-height: 36rpx;

%circle {
    $w: $circle-width;
    width: $w;
    height: $w;
    border-radius: 50%;
}

.address-list {
    position: relative;
    display: flex;
    flex-direction: column;
    @include flex-gap(8rpx, column);

    /* 装货/卸货圆点之间的竖线（居中于 9rpx 圆点） */
    &::before {
        content: '';
        position: absolute;
        left: 3.5rpx;
        top: 22.5rpx;
        bottom: 22.5rpx;
        width: 2rpx;
        background-color: #dbdbdb;
    }

    .address-row {
        display: flex;
        align-items: center;
        min-height: $row-height;

        .icon-circle {
            @extend %circle;
            position: relative;
            z-index: 1;
            flex-shrink: 0;
            margin-right: 12rpx;
        }

        .address-content {
            flex: 1;
            min-width: 0;

            .row-text {
                font-weight: bold;
                font-size: 28rpx;
                line-height: $row-height;
                color: #333333;
            }

            .row-desc {
                margin-left: 12rpx;
                font-size: 24rpx;
                color: #c9c9c9;
            }
        }
    }

    .from {
        .icon-circle {
            background-color: #3a65ff;
        }
    }

    .to {
        .icon-circle {
            background-color: #21bd88;
        }
    }
}
</style>
