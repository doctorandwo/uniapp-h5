<template>
    <Z1Empty :url="url" :imageType="imageType" :imageSize="imageSize" :title="title" :content="content" :direction="direction">
        <template #content>
            <slot name="content">
                <view class="content-text">
                    {{ content }}
                </view>
            </slot>
        </template>
    </Z1Empty>
</template>

<script>
import Z1Empty from 'zjz1-h5-ui/packages/z1-empty/z1-empty.vue';
export default {
    name: 'Empty',
    components: {
        Z1Empty,
    },
    props: {
        url: {
            type: String,
            default: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/17423639160210019bf.png',
            // default: 'https://css-backup-1579076150310.obs.cn-south-1.myhuaweicloud.com/image_directory/1671020502309eacac9.png',
        },
        imageType: {
            type: String,
            default: 'normal',
        },
        imageSize: {
            type: String,
            default: 'normal',
        },
        title: {
            type: String,
        },
        content: {
            type: String,
            default: '暂无数据~',
        },
        direction: {
            type: String,
            default: 'vertical',
            validator: value => {
                const validValues = ['vertical', 'horizontal'];
                if (validValues.includes(value)) {
                    return true;
                }
                throw new Error(`${value} is not a valid direction. Valid values are ${validValues.join(', ')}`);
            },
        },
    },
    methods: {
        hasSlot(slotName) {
            return !!(this.$slots[slotName] || this.$scopedSlots[slotName]);
        },
    },
};
</script>
<style lang="scss" scoped>
.content-text {
    margin-top: 12rpx;
    font-family: PingFang SC, PingFang SC;
    font-weight: 400;
    font-size: 24rpx;
    color: #999999;
}
</style>
