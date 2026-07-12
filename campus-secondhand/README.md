# 校园二手交易平台

本项目是 AI 辅助编程与工程化实训作品，基于 HBuilderX、uni-app 和 uniCloud 开发。

## 项目介绍

校园二手交易平台面向校园闲置物品交易场景，支持学生浏览商品、查看详情、发布闲置、收藏商品、查看我的发布和我的收藏。项目采用模拟登录方式演示不同用户的数据隔离，不接入真实支付、聊天和身份认证。

## 技术栈

- 前端：HBuilderX、uni-app、Vue 2
- 后端：uniCloud 云对象
- 数据库：uniCloud 云数据库
- 代码管理：GitHub

## 当前功能

- 商品列表与分类筛选
- 商品详情
- 发布商品
- 模拟登录 / 切换用户
- 我的发布
- 我的收藏
- 收藏 / 取消收藏

## 项目结构

```text
campus-secondhand/
├─ pages/                    # 前端页面
├─ common/api.js             # 云对象调用封装
├─ uniCloud-aliyun/
│  ├─ cloudfunctions/        # 云对象
│  └─ database/              # 数据库 schema
├─ docs/
│  ├─ api.md
│  ├─ prompt_log.md
│  └─ code_review.md
└─ README.md
```

## 运行方式

1. 使用 HBuilderX 打开本项目。
2. 确认项目已关联阿里云 uniCloud 服务空间。
3. 上传 `uniCloud-aliyun/cloudfunctions` 下的云对象。
4. 上传 `uniCloud-aliyun/database` 下的数据库 schema。
5. 运行到浏览器或发布为 H5。

## API 文档

详见 [docs/api.md](docs/api.md)。
