<template>
    <view class="details-item progress-card">
        <view class="details-item-title">运输进度</view>
        <view class="progress-step" v-for="(step, index) in displaySteps" :key="index">
            <!-- @by oh-my-zerone 2026-10-22 小程序 :class 绑定不支持模板字符串，改用字符串拼接 -->
            <view class="progress-step__tag" :class="'progress-step__tag--' + step.viewStatus">{{ step.statusText }}</view>
            <view class="progress-step__main">
                <view class="progress-step__title">{{ step.title }}</view>
                <view
                    class="progress-step__line"
                    :class="{ 'progress-step__line--highlight': line.highlight }"
                    v-for="(line, lineIndex) in step.lines"
                    :key="lineIndex"
                >
                    <view v-if="line.text">{{ line.text }}</view>
                    <!-- <view v-if="line.content" >{{ line.content }}</view> -->
                    
                </view>
            </view>
            <view class="progress-step__extra">{{ step.extra }}</view>
        </view>
    </view>
</template>

<script>
/**
 * @by oh-my-zerone 2026-10-19
 * 运单运输进度。时间线节点与回填规则对齐货主端轨迹页 timeLineList。
 */
// hooks
import dayjs from 'dayjs';

// services
import { ApiGetWaybillTrace } from '@/pages/waybill/services.js';

/** 固定节点，status 与轨迹接口节点对齐 */
const TIME_LINE_TEMPLATE = [
    { statusName: '创建运单', status: 0 },
    { statusName: '接单', status: 1 },
    { statusName: '装货', status: 2 },
    { statusName: '卸货', status: 3 },
    { statusName: '核算', status: 5 },
    { statusName: '打款', status: 7 },
    { statusName: '开票', status: 9 },
];

const VIEW_STATUS_TEXT = {
    done: '已完成',
    doing: '进行中',
    pending: '待开始',
};

function createEmptyTimeLine() {
    return TIME_LINE_TEMPLATE.map(step => ({
        statusName: step.statusName,
        status: step.status,
        content: step.content,
        operName: '',
        createTime: '',
    }));
}

/**
 * 仅回填「状态不超过当前运单」的节点；开票节点 status=9 始终参与匹配。
 * @param {Array} traceList
 * @param {number|string} waybillStatus
 */
function fillTimeLine(traceList, waybillStatus) {
    const currentStatus = Number(waybillStatus) || 0;
    const list = (Array.isArray(traceList) ? traceList : []).filter(item => {
        const status = Number(item.status);
        return status <= currentStatus || status === 9;
    });
    return TIME_LINE_TEMPLATE.map(step => {
        const hit = list.find(item => Number(item.status) === step.status);
        return {
            statusName: step.statusName,
            status: step.status,
            // @by oh-my-zerone 2026-10-27 节点文案取轨迹命中项，不要读模板上不存在的 step.content
            content: hit && hit.content ? hit.content : '',
            operName: hit && hit.operName ? hit.operName : '',
            createTime: hit && hit.createTime ? hit.createTime : '',
        };
    });
}

function formatTraceTime(value) {
    if (!value) return '--';
    const date = dayjs(value);
    if (!date.isValid()) return '--';
    return date.format('MM-DD HH:mm');
}

export default {
    name: 'TransportProgress',
    props: {
        waybillCode: {
            type: String,
            default: '',
        },
        waybillStatus: {
            type: [Number, String],
            default: 0,
        },
    },
    data() {
        return {
            timeLineList: createEmptyTimeLine(),
        };
    },
    computed: {
        traceQuery() {
            return `${this.waybillCode}|${this.waybillStatus}`;
        },
        displaySteps() {
            const doingIndex = this.timeLineList.findIndex(step => !step.createTime);
            return this.timeLineList.map((step, index) => {
                let viewStatus = 'pending';
                if (step.createTime) {
                    viewStatus = 'done';
                } else if (index === doingIndex) {
                    viewStatus = 'doing';
                }
                // @by oh-my-zerone 2026-10-27 同一节点同时保留轨迹 content 与 operName(text)
                const lines =
                    step.content || step.operName
                        ? [
                              {
                                  content: step.content || '',
                                  text: step.operName || '',
                                  highlight: viewStatus === 'doing',
                              },
                          ]
                        : [];
                return {
                    title: step.statusName,
                    content: step.content,
                    viewStatus,
                    statusText: VIEW_STATUS_TEXT[viewStatus],
                    extra: formatTraceTime(step.createTime),
                    lines,
                };
            });
        },
    },
    watch: {
        traceQuery: {
            immediate: true,
            handler() {
                this.loadTrace();
            },
        },
    },
    methods: {
        async loadTrace() {
            const code = this.waybillCode;
            if (!code) {
                this.timeLineList = createEmptyTimeLine();
                return;
            }
            try {
                const res = await ApiGetWaybillTrace(code);
                console.log('ApiGetWaybillTrace',res);
                const list = res && res.data ? res.data : [];
                this.timeLineList = fillTimeLine(list, this.waybillStatus);
            } catch (error) {
                this.timeLineList = createEmptyTimeLine();
            }
        },
    },
};
</script>

<style lang="scss" scoped>
.details-item {
    padding: 28rpx 32rpx;
    background: #fff;
    border-radius: 20rpx;
    margin: 20rpx 0;
}

.details-item-title {
    height: 52rpx;
    font-family: PingFang SC, PingFang SC;
    font-weight: bold;
    font-size: 32rpx;
    color: #333333;
}

.progress-card {
    padding-bottom: 8rpx;
}

.progress-step {
    display: flex;
    align-items: flex-start;
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f2f2f2;

    &:last-child {
        border-bottom: none;
    }

    &__tag {
        flex-shrink: 0;
        margin-top: 4rpx;
        padding: 0 12rpx;
        height: 36rpx;
        line-height: 36rpx;
        border-radius: 8rpx;
        font-size: 22rpx;

        &--done {
            color: #26b899;
            background: rgba(38, 184, 153, 0.12);
        }

        &--doing {
            color: #3a65ff;
            background: rgba(58, 101, 255, 0.12);
        }

        &--pending {
            color: #999999;
            background: #f3f3f3;
        }
    }

    &__main {
        flex: 1;
        min-width: 0;
        margin: 0 16rpx;
    }

    &__title {
        font-size: 28rpx;
        font-weight: bold;
        color: #333333;
        line-height: 40rpx;
    }

    &__line {
        margin-top: 6rpx;
        font-size: 24rpx;
        color: #999999;
        line-height: 36rpx;

        &--highlight {
            color: #26b899;
        }
    }

    &__extra {
        flex-shrink: 0;
        margin-top: 4rpx;
        font-size: 24rpx;
        color: #999999;
        line-height: 36rpx;
    }
}
</style>
