# 校园二手交易平台

本仓库为《AI 辅助编程与工程化实训》课程项目，项目主题是“校园二手交易平台”。

## 仓库结构

```text
uniapp-campus-secondhand/
├─ README.md                 # 仓库总览与提交说明
├─ docs/                     # 课程交付文档
│  ├─ api.md                 # API 文档
│  ├─ prompt_log.md          # AI Prompt 日志
│  ├─ code_review.md         # AI Code Review 报告
│  └─ screenshots/           # 截图材料
└─ campus-secondhand/         # HBuilderX / uni-app 项目源码
```

## 项目源码

源码目录：[`campus-secondhand/`](campus-secondhand/)

该目录包含 uni-app 前端页面、uniCloud 云对象、数据库 schema、静态资源和项目内部文档。

## 线上访问地址

H5 线上访问地址：

[https://static-mp-28953f24-c8d9-4b4d-9b27-291085bf401a.next.bspapp.com/](https://static-mp-28953f24-c8d9-4b4d-9b27-291085bf401a.next.bspapp.com/)

## 课程交付文档

- [API 文档](docs/api.md)
- [AI Prompt 日志](docs/prompt_log.md)
- [AI Code Review 报告](docs/code_review.md)
- [AI Code Review 截图](docs/screenshots/code_review_report.png)

## 技术栈

- 开发工具：HBuilderX
- 前端框架：uni-app、Vue 2
- 后端服务：uniCloud 云对象
- 数据库：uniCloud 云数据库
- 文件存储：uniCloud 云存储
- 代码管理：Git、GitHub

## 核心功能

- 注册登录，支持手机号或邮箱登录
- 注册时选择院校
- 首页商品浏览、搜索、分类筛选、院校筛选
- 商品发布、图片上传、编辑、下架、删除、标记已售出
- 商品收藏和我的收藏
- 交易意向提交、卖家审核、联系方式保护
- 默认商品和云端真实商品同时展示

## 运行说明

1. 使用 HBuilderX 打开 `campus-secondhand/` 目录。
2. 确认项目已关联 uniCloud 阿里云服务空间。
3. 上传 `uniCloud-aliyun/database` 下的数据库 schema。
4. 上传 `uniCloud-aliyun/cloudfunctions` 下的云对象。
5. 运行到浏览器或发行 H5。

## 注意事项

本项目用于课程实训演示，未接入真实支付。交易流程采用“买家提交交易意向，卖家同意后展示联系方式，双方线下交易”的模式。