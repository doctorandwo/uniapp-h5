<template>
    <z1-modal :show="visible" title="作废确认" @close="handleClose" @confirm="handleConfirm">
        <view slot="content" style="text-align: left">
            <text>请输入作废原因：</text>
            <z1-textarea v-model="reason" placeholder="请输入原因" />
        </view>
    </z1-modal>
</template>

<script>
import Z1Modal from 'zjz1-h5-ui/packages/z1-modal/z1-modal.vue';
import Z1Textarea from 'zjz1-h5-ui/packages/z1-textarea/z1-textarea.vue';
import useRequest from '@zerone/toolbox/packages/hooks/useRequest';
import { ApiInvalidWayBill } from '@/pages/waybill/services.js';

export default {
    name: 'CancelModal',
    components: { Z1Modal, Z1Textarea },
    props: {
        visible: {
            type: Boolean,
            default: false,
        },
        // 运单号
        wayBillCode: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            reason: '',
        };
    },
    watch: {
        visible(val) {
            if (val) {
                this.reason = '';
            }
        },
    },
    methods: {
        handleClose() {
            this.$emit('update:visible', false);
            this.$emit('close');
        },
        async handleConfirm() {
            const [err] = await useRequest(ApiInvalidWayBill, {
                wayBillInCode: this.wayBillCode,
                cancelReason: this.reason,
            });
            if (err) {
                uni.showToast({ title: '作废失败', icon: 'none' });
                return;
            }
            uni.showToast({ title: '已作废', icon: 'success' });
            this.$emit('update:visible', false);
            this.$emit('success');
        },
    },
};
</script>
