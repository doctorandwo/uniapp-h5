# 框架

## 结构
main.js 
-->
boostrap.js 加载静态的一些配置。异步操作不在里面做。
-->
createApp.js 请求数据后挂载实例
-->
app.$mount() 


## tabbar
使用自定义的tabbar。便于定制化

## 页面分布
pages中，仅放tabbar的页面。tabbar的页面用PageFrame组件和vuex中的tabbar.js来实现

其他页面放到分包中。

核心是:为了后期更好的兼容小程序端
# uniapp-h5
