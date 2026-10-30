#### 应用市场中点击应用跳转 webview 页面，嵌入 h5 页面

1. 配置协同上的"路由地址"为："/pages_common/appWebview/index
2. 配置"点击事件类型"为：h5 原生视图
3. 配置"点击事件数据"中配置 json 对象：必需配置"webviewUrl"，这个是跳转的 h5 页面地址。需要带的额外的参数，可以在里面配置，会和 ur 一起带过去
4. childRoute: 独立微端的，子路由

例子：

```jason
{
    "webviewUrl":"http://192.168.60.155:8091/#/pages/newCarManager/index",
}
```

```jason
{
    "webviewUrl":"<#micro-source-h5>/consignManage/1.0.0/#/",
    childRoute:'view/add'
}
```
