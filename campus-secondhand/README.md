# 校园二手交易平台

本项目是《AI 辅助编程与工程化实训》课程作品，使用 HBuilderX、uni-app 和 uniCloud 开发，面向校园闲置物品交易场景。

## 项目简介

校园二手交易平台用于帮助学生发布、浏览、收藏和管理校园闲置商品。平台不直接接入真实支付，而是采用“买家提交交易意向、卖家审核、审核通过后展示联系方式、双方线下交易”的流程，降低卖家联系方式被公开展示带来的骚扰风险，也更符合校园二手交易的实际场景。

项目首页同时展示本地默认商品和云数据库中的真实商品。用户登录后可以发布商品、上传商品图片、编辑商品、下架商品、删除商品、标记已售出，并可以按院校和商品分类进行筛选。

## 技术栈

- 开发工具：HBuilderX
- 前端框架：uni-app、Vue 2
- 后端服务：uniCloud 云对象
- 数据库：uniCloud 云数据库
- 文件存储：uniCloud 云存储
- 代码管理：Git、GitHub

## 功能清单

- 用户注册与登录
  - 注册信息包含用户名、手机号、邮箱、密码、院校
  - 支持手机号或邮箱登录
  - 手机号、邮箱、密码格式校验
  - 退出登录
- 院校选择与筛选
  - 注册时只能从内置院校列表选择，不能随意填写
  - 首页支持院校筛选
  - 首页支持商品分类筛选
  - 院校筛选和分类筛选可以叠加使用
- 商品浏览
  - 首页展示默认商品和用户真实发布商品
  - 支持关键词搜索
  - 支持商品详情页
  - 支持空状态、加载状态、错误提示
- 商品发布与管理
  - 登录后发布商品
  - 发布商品时自动绑定当前用户院校
  - 支持本地选择图片并上传到 uniCloud 云存储
  - 我的发布列表
  - 编辑商品
  - 下架商品
  - 删除商品
  - 标记已售出
- 收藏功能
  - 收藏商品
  - 取消收藏
  - 我的收藏列表
- 交易意向功能
  - 买家提交购买意向
  - 卖家查看收到的意向
  - 卖家同意或拒绝交易申请
  - 卖家同意前，买家不能看到卖家联系方式
  - 支持待确认、已同意、已拒绝、已完成、已取消等状态展示

## 项目结构

```text
campus-secondhand/
├─ pages/                       # uni-app 前端页面
│  ├─ index/                    # 首页
│  ├─ product-detail/           # 商品详情
│  ├─ publish/                  # 发布商品
│  ├─ product-edit/             # 编辑商品
│  ├─ mine/                     # 我的页面
│  └─ login/                    # 登录注册
├─ common/
│  ├─ api.js                    # 云对象调用封装
│  └─ default-products.js       # 本地默认商品数据
├─ static/                      # 静态资源
├─ uniCloud-aliyun/
│  ├─ cloudfunctions/           # uniCloud 云对象
│  │  ├─ user/
│  │  ├─ product/
│  │  ├─ favorite/
│  │  ├─ intent/
│  │  └─ school/
│  └─ database/                 # 云数据库 schema
├─ docs/
│  ├─ api.md                    # API 文档
│  ├─ prompt_log.md             # AI 提示词记录
│  └─ code_review.md            # AI Code Review 报告
└─ README.md
```

## 运行方式

1. 使用 HBuilderX 打开 `campus-secondhand` 项目目录。
2. 登录 DCloud 账号，并确认项目已关联 uniCloud 服务空间。
3. 在 `uniCloud-aliyun/database` 中上传数据库 schema。
4. 在 uniCloud 控制台确认已创建以下集合：
   - `users`
   - `products`
   - `favorites`
   - `intents`
   - `schools`
5. 右键 `uniCloud-aliyun/cloudfunctions` 下的云对象目录，上传并部署云对象。
6. 在 HBuilderX 中运行到浏览器，或发行 H5 后访问线上地址。

## uniCloud 配置

本项目当前使用 uniCloud 阿里云服务空间。需要配置和部署的内容包括：

- 云对象：
  - `user`：用户注册、登录、用户列表
  - `product`：商品列表、详情、发布、编辑、下架、删除、已售出、我的发布
  - `favorite`：收藏、取消收藏、收藏列表、收藏状态检查
  - `intent`：交易意向提交、买家意向列表、卖家收到意向、状态更新
  - `school`：院校列表
- 数据库集合：
  - `users`
  - `products`
  - `favorites`
  - `intents`
  - `schools`
- 云存储：
  - 发布商品时上传用户选择的本地图片
  - 图片地址保存到商品数据的 `image_url` 字段

如果新建服务空间后出现 `InternalError` 或 `DB read action failed, resource exhausted`，需要先在 uniCloud 控制台确认数据库资源已初始化，并手动创建集合后再重试。

## 部署地址

- GitHub 仓库：[gxy233666/uniapp-campus-secondhand](https://github.com/gxy233666/uniapp-campus-secondhand)
- H5 线上访问地址：https://static-mp-28953f24-c8d9-4b4d-9b27-291085bf401a.next.bspapp.com/

> 提交课程作业前，需要将 H5 发行后的线上访问地址补充到这里。如果后端暂时无法稳定部署，建议同时准备本地运行演示视频。

## 演示账号

本项目支持在注册页直接创建演示账号。建议验收前准备两个账号，用于演示“不同用户有不同的发布、收藏和交易意向数据”。

示例演示账号：

| 角色 | 用户名 | 手机号 | 邮箱 | 密码 | 院校 |
| --- | --- | --- | --- | --- | --- |
| 买家 | 测试买家 | 13800000011 | buyer@example.com | abc123 | 闽南科技学院 |
| 卖家 | 测试卖家 | 13800000012 | seller@example.com | abc123 | 闽南科技学院 |

说明：以上账号需要在当前 uniCloud 服务空间中注册后才能登录。如果数据库已清空，需要重新注册。

## 注意事项

- 本项目用于课程实训演示，未接入真实在线支付。
- 平台交易逻辑为买卖双方提交和审核交易意向后线下交易。
- 当前用户身份主要存储在前端本地缓存中，适合课程演示；如果要正式公开使用，建议接入 `uni-id` 或其他服务端登录态校验。
- 发布商品图片依赖 uniCloud 云存储。H5 发行后需要重点检查上传后的图片是否能正常展示。
- 默认商品为前端本地数据，真实用户发布的商品会写入 uniCloud 云数据库。

## API 文档

详见 [docs/api.md](docs/api.md)。
