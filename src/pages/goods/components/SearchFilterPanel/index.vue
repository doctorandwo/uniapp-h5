<template>
    <view class="search-filter-panel">
        <view class="search-filter-panel__bar">
            <view v-for="item in filterConfig" :key="item.key" class="search-filter-panel__item" @click="togglePanel(item.key)">
                <view class="search-filter-panel__label g-single-row" :class="{ 'is-active': isItemActive(item.key) }">
                    {{ getDisplayLabel(item) }}
                </view>
                <view class="search-filter-panel__triangle" :class="{ 'is-active': isItemActive(item.key), 'is-open': activeKey === item.key }" />
            </view>
        </view>

        <template v-if="activeKey">
            <view class="search-filter-panel__panel">
                <view class="search-filter-panel__content">
                    <template v-if="activeConfig.type === 'multi'">
                        <view class="search-filter-panel__section-title">
                            {{ activeConfig.title }}
                            <span v-if="activeConfig.smallTitle">{{ activeConfig.smallTitle }}</span>
                        </view>
                        <view class="search-filter-panel__option-grid">
                            <view
                                v-for="option in activeConfig.options"
                                :key="option.value"
                                class="search-filter-panel__option"
                                :class="{ 'is-selected': isMultiSelected(option.value) }"
                                @click="toggleMulti(option.value)"
                            >
                                {{ option.label }}
                            </view>
                        </view>
                    </template>

                    <template v-else-if="activeConfig.type === 'group'">
                        <view v-for="group in activeConfig.groups" :key="group.key" class="search-filter-panel__group">
                            <view class="search-filter-panel__section-title">{{ group.title }}</view>
                            <view class="search-filter-panel__option-grid">
                                <view
                                    v-for="option in group.options"
                                    :key="option.value"
                                    class="search-filter-panel__option"
                                    :class="{ 'is-selected': draft.time[group.key] === option.value }"
                                    @click="selectGroupOption(group.key, option.value)"
                                >
                                    {{ option.label }}
                                </view>
                            </view>
                        </view>
                    </template>

                    <!-- @by oh-my-zerone single 分支按 activeConfig.key 取草稿值，兼容「货源状态」单选与「发布方式」 -->
                    <template v-else-if="activeConfig.type === 'single'">
                        <view class="search-filter-panel__section-title">{{ activeConfig.title }}</view>
                        <view class="search-filter-panel__option-grid">
                            <view
                                v-for="option in activeConfig.options"
                                :key="option.value"
                                class="search-filter-panel__option"
                                :class="{ 'is-selected': draft[activeConfig.key] === option.value }"
                                @click="selectSingle(activeConfig.key, option.value)"
                            >
                                {{ option.label }}
                            </view>
                        </view>
                    </template>
                </view>

                <view class="search-filter-panel__footer">
                    <view class="search-filter-panel__btn search-filter-panel__btn--ghost" @click="clearCurrentDraft">清空筛选</view>
                    <view class="search-filter-panel__btn search-filter-panel__btn--primary" @click="applyCurrentDraft">查看结果</view>
                </view>
            </view>
            <view v-if="activeKey && maskTop !== null" class="search-filter-panel__mask" :style="{ top: maskTop + 'px' }" @click="closePanel" />
        </template>
    </view>
</template>

<script>
// const
import { FILTER_CONFIG, createDefaultFilterValue } from './constants.js';

/**
 * @by oh-my-zerone
 */
export default {
    name: 'SearchFilterPanel',
    data() {
        return {
            filterConfig: FILTER_CONFIG,
            activeKey: null,
            maskTop: null,
            applied: createDefaultFilterValue(),
            draft: createDefaultFilterValue(),
        };
    },
    computed: {
        activeConfig() {
            return this.filterConfig.find(item => item.key === this.activeKey) || {};
        },
    },
    watch: {
        activeKey(val) {
            if (!val) {
                this.maskTop = null;
                return;
            }
            this.$nextTick(this.updateMaskTop);
        },
    },
    methods: {
        updateMaskTop() {
            if (!this.activeKey) return;
            this.$nextTick(() => {
                uni.createSelectorQuery()
                    .in(this)
                    .select('.search-filter-panel__panel')
                    .boundingClientRect(rect => {
                        if (rect && this.activeKey) {
                            this.maskTop = rect.bottom;
                        }
                    })
                    .exec();
            });
        },
        togglePanel(key) {
            if (this.activeKey === key) {
                this.closePanel();
                return;
            }
            if (this.activeKey) {
                this.resetDraftByKey(this.activeKey);
            }
            this.activeKey = key;
            this.syncDraftFromApplied(key);
        },
        closePanel() {
            if (!this.activeKey) return;
            this.resetDraftByKey(this.activeKey);
            this.activeKey = null;
            this.maskTop = null;
        },
        syncDraftFromApplied(key) {
            if (key === 'all') {
                this.draft.all = this.applied.all;
                return;
            }
            if (key === 'time') {
                this.draft.time = { ...this.applied.time };
                return;
            }
            if (key === 'smart') {
                this.draft.smart = this.applied.smart;
            }
        },
        resetDraftByKey(key) {
            if (key === 'all') {
                this.draft.all = this.applied.all;
                return;
            }
            if (key === 'time') {
                this.draft.time = { ...this.applied.time };
                return;
            }
            if (key === 'smart') {
                this.draft.smart = this.applied.smart;
            }
        },
        isItemActive(key) {
            if (this.activeKey === key) return true;
            else return false;
            // return this.hasAppliedValue(key);
        },
        hasAppliedValue(key) {
            if (key === 'all') return this.applied.all !== '';
            if (key === 'time') return !!(this.applied.time.loadStart || this.applied.time.unloadEnd);
            if (key === 'smart') return this.applied.smart !== '';
            return false;
        },
        getDisplayLabel(item) {
            const key = 'draft';
            if (item.key === 'all') {
                if (this[key].all === '') return item.label;
                const option = item.options.find(opt => opt.value === this[key].all);
                return this.truncateLabel(option?.label || item.label);
            }
            if (item.key === 'time') {
                const { loadStart, unloadEnd } = this[key].time;
                const labels = [];
                if (loadStart) {
                    const option = item.groups[0].options.find(opt => opt.value === loadStart);
                    if (option) labels.push(option.label);
                }
                if (unloadEnd) {
                    const option = item.groups[1].options.find(opt => opt.value === unloadEnd);
                    if (option) labels.push(option.label);
                }
                if (!labels.length) return item.label;
                return this.truncateLabel(labels.join('、'));
            }
            if (item.key === 'smart') {
                if (this[key].smart === '') return item.label;
                const option = item.options.find(opt => opt.value === this[key].smart);
                return this.truncateLabel(option?.label || item.label);
            }
            return item.label;
        },
        truncateLabel(text) {
            const maxLen = 7;
            if (text.length <= maxLen) return text;
            return `${text.slice(0, maxLen)}…`;
        },
        isMultiSelected(value) {
            return this.draft.all.includes(value);
        },
        toggleMulti(value) {
            const index = this.draft.all.indexOf(value);
            if (index >= 0) {
                this.draft.all.splice(index, 1);
                return;
            }
            this.draft.all.push(value);
        },
        selectGroupOption(groupKey, value) {
            this.draft.time[groupKey] = this.draft.time[groupKey] === value ? '' : value;
        },
        selectSingle(key, value) {
            this.draft[key] = this.draft[key] === value ? '' : value;
        },
        clearCurrentDraft() {
            if (this.activeKey === 'all') {
                this.draft.all = '';
                return;
            }
            if (this.activeKey === 'time') {
                this.draft.time = { loadStart: '', unloadEnd: '' };
                return;
            }
            if (this.activeKey === 'smart') {
                this.draft.smart = '';
            }
        },
        applyCurrentDraft() {
            if (this.activeKey === 'all') {
                this.applied.all = this.draft.all;
            } else if (this.activeKey === 'time') {
                this.applied.time = { ...this.draft.time };
            } else if (this.activeKey === 'smart') {
                this.applied.smart = this.draft.smart;
            }
            this.$emit('change', {
                all: this.applied.all,
                time: { ...this.applied.time },
                smart: this.applied.smart,
            });
            this.activeKey = null;
        },
    },
};
</script>

<style lang="scss" scoped>
@import '@/common/css/compatible.scss';
@import '@/common/css/icon.scss';

$primary: #3a65ff;
$bar-bg: #f8f9fb;

.search-filter-panel {
    position: relative;
    z-index: 20;

    &__bar {
        // background-color: $bar-bg;
        background: linear-gradient(180deg, #f8f9fb 0%, rgba(238, 240, 245, 0.82) 100%);
        border-radius: 24rpx 24rpx 0 0;
        height: 82rpx;
        display: flex;
        padding: 0 16rpx;
        box-sizing: border-box;
    }

    &__item {
        width: 33.33%;
        padding: 0 16rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        @include flex-gap(6rpx);
        font-size: 26rpx;
        font-weight: bold;
        box-sizing: border-box;
    }

    &__label {
        color: #333;

        &.is-active {
            color: $primary;
        }
    }

    &__triangle {
        $w: 18rpx;
        $h: 11rpx;
        flex-shrink: 0;
        width: $w;
        height: $h;
        @include triangle(#333);
        transform: rotate(0deg);
        transition: transform 0.3s ease;

        &.is-active {
            background-color: $primary;
        }

        &.is-open {
            transform: rotate(180deg);
        }
    }

    &__mask {
        position: fixed;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 100;
    }

    &__panel {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        z-index: 102;
        background-color: #fff;
        border-radius: 0 0 24rpx 24rpx;
        padding: 32rpx;
        box-sizing: border-box;
    }

    &__content {
        max-height: 60vh;
        overflow-y: auto;
    }

    &__group + &__group {
        margin-top: 32rpx;
    }

    &__section-title {
        margin-bottom: 17rpx;
        font-weight: bold;
        font-size: 28rpx;
        color: #333;
        line-height: 40rpx;
        > span {
            font-weight: 400;
            font-size: 24rpx;
            color: #999999;
            margin-left: 4rpx;
        }
    }

    &__option-grid {
        display: flex;
        flex-wrap: wrap;
        margin: -10rpx;

        &--half {
            .search-filter-panel__option {
                width: calc(50% - 20rpx);
            }
        }
    }

    &__option {
        width: calc(33.33% - 20rpx);
        margin: 10rpx;
        height: 70rpx;
        padding: 0 10rpx;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f0f1f3;
        border-radius: 6rpx;
        border: 2rpx solid #f0f1f3;
        font-size: 24rpx;
        color: #000;
        text-align: center;
        line-height: 66rpx;

        &.is-selected {
            color: $primary;
            background-color: #e1e7fc;
            border-color: $primary;
            font-weight: bold;
        }
    }

    &__footer {
        margin-top: 50rpx;
        display: flex;
        @include flex-gap(30rpx);
    }

    &__btn {
        flex: 1;
        height: 80rpx;
        border-radius: 10rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        font-weight: bold;

        &--ghost {
            background-color: #f0f1f3;
            color: #333;
        }

        &--primary {
            background-color: $primary;
            color: #fff;
        }
    }
}
</style>
