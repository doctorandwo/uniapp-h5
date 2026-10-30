<template>
    <view class="banner">
        <swiper class="banner-swiper" circular :indicator-dots="false" :autoplay="autoplay" :interval="5000" :disable-touch="disableTouch" @change="onSwiperChange">
            <swiper-item class="banner-swiper-item" v-for="(item, index) in list" :key="index" @click.native="$emit('choose', item)">
                <view class="banner-swiper-item-image">
                    <image :src="item.image" style="width: 100%; height: 100%" mode="aspectFill" />
                </view>
            </swiper-item>
        </swiper>

        <!-- 使用自定义指示器组件 -->
        <view class="indicator-box" v-if="visibleIndicator">
            <CustomIndicator :current="currentIndex" :total="list.length" />
        </view>
    </view>
</template>

<script>
import CustomIndicator from './CustomIndicator.vue';
export default {
    components: {
        CustomIndicator,
    },
    data() {
        return {
            disableTouch: false,

            autoplay: false,

            currentIndex: 0,
        };
    },
    computed: {
        visibleIndicator() {
            return this.list?.length > 1;
        },
        list() {
            const ls = [
                {
                    image: this.$global.getImageUrl('pages/home/banner-ad-1.png'),
                },
            ];
            return ls;
        },
    },
    methods: {
        onSwiperChange(e) {
            this.currentIndex = e.detail.current; // 更新当前索引
            this.$emit('change', e);
        },
    },
};
</script>

<style lang="scss" scoped>
.banner {
    position: relative;

    &-swiper {
        position: relative;
        height: 120rpx;
        &-item {
            // background-color: red;
            &-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }
    }

    .indicator-box {
        position: absolute;
        bottom: 15rpx;
        left: 0;
        right: 0;
        z-index: 10;
    }
}
</style>
