/**
 * @file 在线 PDF 转图片数组（H5 端）
 * @description 仅在 H5 端可用，小程序端因 canvas 数据无法回传 DataURL 而降级返回空数组。
 * @version 1.1.0
 *
 * 依赖：`pdfjs-dist@2.16.x`
 *   选用 2.16.x 而非 3.x/4.x，是因为 2.x 同时提供 legacy CJS bundle，
 *   与 Vue CLI 4.5 (Webpack 4) 兼容性最佳，无需额外 Babel 转译配置。
 *
 * Worker 加载策略：
 *   - 默认从 jsdelivr CDN 加载 worker，避免项目无 worker-loader 引发打包问题。
 *   - 内网/私域环境可在组件 props 中通过 workerSrc 覆盖为本地 public 路径。
 *   - 当 workerSrc 为空字符串时，pdf.js 会自动 fallback 到 fake worker（主线程渲染）。
 */

let _pdfjs = null;

/**
 * 懒加载 pdfjs-dist 主库（H5 端按需 require）。
 *
 * 重要：require 包裹在 `#ifdef H5` 条件编译块内。
 *   - uniapp 编译非 H5 平台时，这段代码会被完全剔除，不会出现在产物中，
 *     也就避免了把 pdfjs-dist 打进小程序 / App 包。
 *   - H5 端仍按原方式走 webpack 静态 require，便于分包与缓存。
 */
function loadPdfjs() {
    if (_pdfjs) return _pdfjs;
    // #ifdef H5
    // eslint-disable-next-line global-require
    _pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
    // #endif

    return _pdfjs;
}

/**
 * 默认 worker 地址。指向与 package.json 中安装版本相同的 CDN release。
 * 用户可通过 pdfToImages 选项 workerSrc 覆盖此值。
 */
const DEFAULT_WORKER_SRC = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.105/legacy/build/pdf.worker.min.js';

/**
 * 将在线 PDF 按页渲染为图片数组（base64 dataURL）。
 *
 * @typedef {Object} PdfToImagesOptions
 * @property {string} url                - 在线 PDF 地址（需服务端允许 CORS）
 * @property {number} [scale=1.5]        - 渲染缩放倍率（建议 1.2 ~ 2）
 * @property {number} [pageNum]          - 最多渲染前 N 页（默认 0 全部）
 * @property {number} [quality=0.85]     - 输出 JPEG 压缩质量（0~1）
 * @property {string} [workerSrc]        - 自定义 worker 地址，覆盖默认 CDN；传 '' 关闭 worker
 * @property {(current:number,total:number)=>void} [onProgress] - 进度回调
 *
 * @param {PdfToImagesOptions} options
 * @returns {Promise<string[]>} base64 dataURL 列表，元素顺序与 PDF 页码一致
 */
export async function pdfToImages({ url, scale = 1.5, pageNum, quality = 0.85, workerSrc, onProgress } = {}) {
    if (!url || typeof url !== 'string') {
        throw new Error('[pdfToImages] url 不能为空');
    }

    // #ifdef MP-WEIXIN
    console.warn('[pdfToImages] 微信小程序端不支持在内存中渲染 PDF，请改用 H5 或预生成图片');
    return [];
    // #endif

    // #ifdef H5
    const pdfjs = loadPdfjs();

    // 配置 worker，workerSrc 显式传 '' 关闭 worker（fake worker）
    const resolvedWorker = workerSrc === undefined ? DEFAULT_WORKER_SRC : workerSrc;
    if (pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = resolvedWorker || '';
    }

    const loadingTask = pdfjs.getDocument({
        url,
        withCredentials: false,
    });
    const pdf = await loadingTask.promise;
    const total = pdf.numPages;
    const limit = Math.min(pageNum && pageNum > 0 ? pageNum : total, total);

    // 并发渲染所有页：每页独立任务，结果按页码索引回填 images，
    // 保持返回顺序与 PDF 页码一致。收益：多页 PDF 渲染时间从 N×T 降到 ≈T
    // （实际加速受 pdf.js worker 并发上限限制）。
    const images = new Array(limit);
    let rendered = 0;
    const tasks = [];
    for (let i = 1; i <= limit; i++) {
        const pageIdx = i - 1;
        tasks.push(
            (async () => {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = Math.floor(viewport.width);
                canvas.height = Math.floor(viewport.height);
                // 白底，避免 PDF 透明背景造成渲染异常
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, canvas.width, canvas.height);

                await page.render({ canvasContext: context, viewport }).promise;

                images[pageIdx] = canvas.toDataURL('image/jpeg', quality);

                // 单页渲染完成后及时清理，释放 worker 内存，并发场景下尤为重要
                try {
                    await page.cleanup();
                } catch (e) {
                    // ignore：cleanup 失败不影响后续流程
                }

                rendered++;
                if (typeof onProgress === 'function') {
                    try {
                        onProgress(rendered, total);
                    } catch (e) {
                        console.warn('[pdfToImages] onProgress 回调异常:', e);
                    }
                }
            })(),
        );
    }
    await Promise.all(tasks);

    try {
        await pdf.cleanup();
        await pdf.destroy();
    } catch (e) {
        // 忽略销毁异常
    }

    return images;
    // #endif
}

export default pdfToImages;
