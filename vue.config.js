'use strict';

const path = require('path');
function resolve(dir) {
    return path.join(__dirname, '.', dir);
}

module.exports = {
    productionSourceMap: false,
    transpileDependencies: ['zjz1-h5-ui'],
    // webpack-dev-server 相关配置
    devServer: {
        host: '0.0.0.0',
        port: 8886,
        proxy: {
            [process.env.VUE_APP_BASE_API]: {
                target: process.env.VUE_APP_BASE_HOST,
                changeOrigin: true,
                pathRewrite: {
                    ['^' + process.env.VUE_APP_BASE_API]: '',
                },
            },
        },
        disableHostCheck: true,
    },
    configureWebpack: {
        plugins: [],
        resolve: {
            alias: {
                '@': resolve('src'),
            },
            // 自动解析文件扩展名
            extensions: ['.js', '.vue', '.json', '.jsx', '.ts', '.tsx'],
        },
    },
    chainWebpack: config => {
        config.module
            .rule('compile')
            .test(/\.js$/)
            .include.add(resolve('src'))
            .add(resolve('test'))
            .add(resolve('static'))
            .add(resolve('node_modules/webpack-dev-server/client'))
            .add(resolve('node_modules'))
            .end()
            .use('babel')
            .loader('babel-loader')
            .options({
                presets: [
                    [
                        '@babel/preset-env',
                        {
                            modules: false,
                        },
                    ],
                ],
            });
    },
};
