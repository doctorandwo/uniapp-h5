/**
 * @by oh-my-zerone
 * @description 通用中间件责任链 runner。请求 / 响应共用同一套执行模型，
 * 不耦合任何业务逻辑，中间件通过 meta 注入共享上下文（errCodeMsg / hooks 等）。
 */

/**
 * 运行请求中间件责任链。
 * 中间件契约：(config, meta) => config | falsy；返回 falsy 表示中断链路。
 * @param {object} config 请求配置
 * @param {Array<Function>} middlewares 请求中间件数组
 * @param {object} meta 注入的共享上下文（errCodeMsg / hooks 等）
 * @returns {Promise<{passed: boolean, config: object}>}
 */
async function runRequestChain(config, middlewares = [], meta = {}) {
    let current = config;
    for (const fn of middlewares) {
        const next = (await fn(current, meta)) ?? current;
        if (!next) return { passed: false, config: current };
        current = next;
    }
    return { passed: true, config: current };
}

/**
 * 运行响应中间件责任链。
 * 中间件契约：(res, callback, meta) => boolean；返回 false 表示拦截（不通过）。
 * callback(newRes) 用于改写最终响应体。
 * @param {object} res 响应体
 * @param {Array<Function>} middlewares 响应中间件数组
 * @param {object} meta 注入的共享上下文
 * @returns {Promise<{passed: boolean, res: object}>}
 */
async function runResponseChain(res, middlewares = [], meta = {}) {
    let current = res;
    for (const fn of middlewares) {
        let passed = true;
        const callback = newRes => {
            current = newRes;
        };
        passed = await fn(current, callback, meta);
        if (!passed) return { passed: false, res: current };
    }
    return { passed: true, res: current };
}

export { runRequestChain, runResponseChain };
