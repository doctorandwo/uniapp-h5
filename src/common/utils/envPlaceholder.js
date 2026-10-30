/**
 * @by oh-my-zerone 2026-09-30
 * @description 环境占位符工具（整份保留：EP 被 webview 页面实际引用）。
 */

function isStringObject(str) {
    if (typeof str === 'object') return true;
    return false;
}
function replacePlaceholders(inputString, map) {
    if (!inputString) return;
    console.log(
        '转换结果',
        inputString.replace(/<#[^>]+>/g, match => map[match] || match),
    );
    return inputString.replace(/<#[^>]+>/g, match => map[match] || match);
}

const EP = {
    '<#micro-source-h5>': 'http://112.111.4.73:57080/micro-source-h5',
};

const useEnvPlaceholder = () => {
    const ep = { ...EP };

    const changePath = (url, map) => {
        const epMap = map || ep;
        if (isStringObject(epMap)) {
            return replacePlaceholders(url, epMap);
        }
        return url;
    };
    const getPath = (placeholder, map) => {
        const epMap = map || ep;
        if (placeholder) {
            return epMap[placeholder];
        }
    };

    return { getPath, changePath, ep };
};

export default useEnvPlaceholder;
export { EP };
