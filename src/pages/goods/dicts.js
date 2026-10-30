import Vue from 'vue';
import { listByDict } from '@/api/common';
import { useRequest } from '@zerone/toolbox/packages/hooks';

const useDicts = () => {
    const dicts = Vue.observable({
        priceModels: [],
        priceModelMap: {},
    });
    const fetchPriceModels = async () => {
        const [err, res] = await useRequest(listByDict, { dictType: 'price_model' });
        if (err) {
            dicts.priceModels = [];
            return;
        }
        dicts.priceModels = res.data || [];
        dicts.priceModelMap = res.data.reduce((prev, cur) => {
            prev[cur.dictValue] = cur.dictLabel;
            return prev;
        }, {});
    };
    return { dicts, fetchPriceModels };
};
export { useDicts };
