/* 将对象转换为查询字符串 */
function obj2QueryString(query = {}) {
    return Object.keys(query)
        .reduce((acc, key) => {
            if (query[key]) acc.push(`${key}=${query[key]}`);
            return acc;
        }, [])
        .join('&');
}

export { obj2QueryString };
