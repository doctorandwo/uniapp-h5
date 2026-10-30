<template>
    <view :class="['tab-box']" :style="{ 'justify-content': justify }">
        <view
            v-for="(tab, ti) in tabs"
            :key="tab[valueKey]"
            :style="{
                '--color': color,
                'font-size': current === tab[valueKey] ? activeFontSize : fontSize,
                'font-weight': bold ? 'bold' : 'normal',
                'min-width': minWidth,
                'margin-right': ti == tabs.length - 1 ? '0' : gap,
            }"
            :class="['tab-item', { active: current === tab[valueKey] }]"
            @click="change(tab)"
        >
            <view class="tab-item_content">
                {{ tab[labelKey] }}<text v-if="tab.count !== undefined && tab.count !== null && tab.count !== ''" class="tab-item_count">({{ tab.count }})</text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        value: {
            type: [Number, String],
        },
        tabs: {
            type: Array,
            default() {
                return [];
            },
        },
        labelKey: {
            type: String,
            default: 'label',
        },
        valueKey: {
            type: String,
            default: 'value',
        },
        /**
         * @type {'space-between'|'space-around'|'center'}
         */
        justify: {
            type: String,
            default: 'space-between',
        },
        color: {
            type: String,
            default: '#999',
        },
        bold: {
            type: Boolean,
            default: false,
        },
        fontSize: {
            type: String,
            default: '28rpx',
        },
        activeFontSize: {
            type: String,
            default: '28rpx',
        },
        minWidth: {
            type: String,
            default: '200rpx',
        },
        gap: {
            type: String,
            default: '0',
        },
    },
    data() {
        return {
            lastCurrent: void 0,
        };
    },
    computed: {
        current: {
            get() {
                return this.value ?? this.tabs[0][this.valueKey];
            },
            set(val) {
                this.$emit('input', val);
            },
        },
    },
    methods: {
        change(tab) {
            const val = tab[this.valueKey];
            if (this.lastCurrent === val) return;
            this.current = val;
            this.lastCurrent = val;
            this.$emit('change', val);
        },
    },
};
</script>

<style lang="scss" scoped>
.tab-box {
    overflow-x: auto;
    display: flex;

    .tab-item {
        display: flex;
        flex-direction: column;
        color: var(--color);

        &::after {
            content: '';
            transition: width 0.3s ease-in-out;
            width: 0;
        }

        &_content {
            line-height: 53rpx;
            text-align: center;
            white-space: nowrap;
        }
        /* 数量徽标：与标签文字同字号同颜色，仅包裹括号 */
        &_count {
            color: inherit;
        }
        &.active {
            color: #333;
            font-weight: bold;

            &::after {
                content: '';
                width: 40rpx;
                height: 4rpx;
                background-color: #3a65ff;
                align-self: center;
                border-radius: 45rpx;
            }
        }
    }
}
</style>
