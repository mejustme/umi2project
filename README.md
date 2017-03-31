# umi2project

## 一键，构建一次迭代的完整工程

### 自动化内容
- 构建所有模块、子模块UI、模块通用UI
- 构建模块完整的README.md
- 构建模块路由配置config.js
- 构建模块暴露插入节点、注册模块
- 构建所有模块时序图文档design.md
- 构建所有模块设计图、时序图的命名
- 构建UMI图  // todo

### 优势
- 节省半天时间
- 避免路由配置过程中可能产生的错误-让各个模块都跑起来
- 规范迭代工程

### 你需要做什么

1、 安装

```
npm install umi2project -g
```

2、 创建一份配置文件 config.json

```
{
  "author": "hzchenqinhui@corp.netease.com",  // 作者
  "components": ["ux-a","ux-b","ux-c"],   // 模块通用UI
  "umi":{
    "#/m/column/list": ["ux-1","ux-2"],   // 模块UMI + 模块里的UI
    "#/m/column/create": ["ux-3","ux-4"],
    "#/m/column/manage/edit": ["ux-5","ux-6"],
    "#/m/column/manage/topbar": [],
    "#/m/column/manage/topbar/info/": ["ux-7"],
    "#/m/column/manage/topbar/list/": ["ux-8"],
    "#/m/column/manage/topbar/draft/": ["ux-9","ux-10","ux-11"],
    "#/m/column/admin/list/": [],
    "#/m/column/admin/preview/": [],
    "#/m/column/admin/unverify/column/": ["ux-12"],
    "#/m/column/admin/verify/column/": ["ux-13","ux-14"]
  }
}
```

3、 一键构建

```
umi2project
```

5、 替换图片

- 迭代负责人： 复制design/umi.md中文本到下面地址，截取UMI模块设计，命名umi.png 到arch/design/目录
[网易教育内部](http://cppl.front.com/#/sequence) 或者
[其他](http://knsv.github.io/mermaid/live_editor/)
- 迭代负责人： 添加模块功能图f-xx-xx.png 到arch/目录
- 其他开发人员： 参考时序图demo, 设计模块时序图后，添加具体模块时序图xx-xx.png 到arch/design/目录



### tips:
- 如果需要在已有模块中新增模块或者UI，仍然可以运行umi2project来快速实现，不会覆盖所有已经存在的文件,`除了：README.md && config.js`

### 效果图
#### 如上配置,得到的工程：[传送门](https://g.hz.netease.com/hzchenqinhui/module-column/tree/master)

--------
![Alt text](http://edu-image.nosdn.127.net/44DBE02A54A7F3B224BE51A8592623CF.png?imageView&thumbnail=600x0)
![Alt text](http://edu-image.nosdn.127.net/0CD8810C5AA0002764B2DAD376273B16.png?imageView&thumbnail=750x0)
--------
![Alt text](http://edu-image.nosdn.127.net/E9DE3E5EA3E2BCEF2EEE930A9088632A.png?imageView&thumbnail=200x0)
![Alt text](http://edu-image.nosdn.127.net/7FFF4113C0D42566BD9F1739CF90ACA5.png?imageView&thumbnail=500x0)