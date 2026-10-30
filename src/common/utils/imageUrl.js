export const getImageUrl = path => {
    if (!path) return '';
    if (path.indexOf('http') !== -1) return path;
    if (process.env.NODE_ENV != 'production') {
        return require(`@/images/${path}`); // 本地环境，返回require路径的图片
    }
    const domain = 'https://zjz1-store.obs.cn-north-4.myhuaweicloud.com/static/chydk_owner/';
    return domain + path;
};
