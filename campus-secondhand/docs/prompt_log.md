# Prompt 日志

> 说明：本文件整理项目开发过程中的关键 AI 辅助编程记录。每条记录包含用户提示词、AI 原始输出摘要、对应功能/文件和最终采用情况，便于老师检查 AI 工具在项目中的实际作用。

## Prompt 1：确定项目选题和技术路线

时间：2026-07-12

对应功能/文件：项目选题、技术路线、整体开发计划

我的提示词：

```text
我决定做校园二手交易平台项目，现在结合我们先前的对话以及文档内老师的要求，现在来详细总结下面需要做的方向，比如我应该先做什么准备，以及我做这个项目各个部分的大概顺序。
```

AI 原始输出摘要：

```text
建议选择“校园二手交易平台”作为课程项目，技术路线采用 HBuilderX + uni-app + uniCloud。项目应先完成页面结构、云对象接口和数据库 schema，再逐步实现商品发布、首页读取、我的发布、收藏、编辑、下架、搜索筛选等功能。最后补充 README、API 文档、prompt_log、code_review、演示视频和个人总结。
```

最终采用情况：已采用。该建议确定了项目方向和分阶段开发顺序。

## Prompt 2：初始化项目页面结构、云对象接口和数据库 schema

时间：2026-07-12

对应功能/文件：`pages/`、`common/api.js`、`uniCloud-aliyun/cloudfunctions/`、`uniCloud-aliyun/database/`

我的提示词：

```text
现在帮我初始化校园二手交易平台的页面结构、云对象接口和数据库 schema。
```

AI 原始输出摘要：

```text
初始化 uni-app 页面结构，包括首页、商品详情、发布、我的等页面；封装 common/api.js 统一调用云对象；创建 user、product、favorite 云对象；创建 users、products、favorites 数据库 schema，为后续真实数据读写做准备。
```

最终采用情况：已采用。形成了项目最初的前后端基础结构。

## Prompt 3：修通商品发布和真实商品读取闭环

时间：2026-07-13

对应功能/文件：`pages/publish/publish.vue`、`pages/index/index.vue`、`pages/mine/mine.vue`、`uniCloud-aliyun/cloudfunctions/product/index.obj.js`

我的提示词：

```text
现在开始进行：第一阶段：核心功能闭环
1. 修通云数据库 schema 和集合
2. 商品发布写入数据库
3. 首页读取真实商品数据
4. 我的发布展示当前用户商品
```

AI 原始输出摘要：

```text
完善 product 云对象的 add、list、myList 等方法；发布页提交表单后写入 products 集合；首页从云数据库读取真实商品；我的页面根据当前用户读取发布记录。针对 uniCloud 数据库初始化失败和 InternalError，建议先手动创建集合并上传 schema。
```

最终采用情况：已采用。实现了商品发布、首页读取、我的发布的数据闭环。

## Prompt 4：补充商品编辑、下架、删除、搜索和状态展示

时间：2026-07-13

对应功能/文件：`pages/product-edit/product-edit.vue`、`pages/mine/mine.vue`、`pages/index/index.vue`、`uniCloud-aliyun/cloudfunctions/product/index.obj.js`

我的提示词：

```text
现在开始完成第二阶段的功能：商品编辑、商品下架 / 删除、搜索和分类筛选稳定、空状态、加载状态、错误提示。
```

AI 原始输出摘要：

```text
新增商品编辑页面，完善 product.update、product.remove、product.deleteProduct；我的发布中增加编辑、下架、删除按钮；已下架商品使用灰色卡片区分并沉底展示；首页搜索和分类筛选做稳定处理，同时补充空状态、加载状态和错误提示。
```

最终采用情况：已采用。商品管理功能更加完整，页面反馈也更清楚。

## Prompt 5：实现注册登录和院校选择

时间：2026-07-13

对应功能/文件：`pages/login/login.vue`、`common/api.js`、`uniCloud-aliyun/cloudfunctions/user/index.obj.js`、`uniCloud-aliyun/cloudfunctions/school/index.obj.js`

我的提示词：

```text
现在先做登录注册功能（要关联后端），我确认可以后，进行一次提交。之后再做院校选择这一部分。
```

AI 原始输出摘要：

```text
新增登录注册页面；注册时填写用户名、手机号、邮箱、密码，并进行格式校验；登录支持手机号或邮箱加密码；后端 user 云对象实现 register 和 loginByPassword。随后新增 school 云对象，提供福建省内常见高校以及沈阳农业大学、清华大学、北京大学，注册页只能从列表选择院校。
```

最终采用情况：已采用。项目从模拟登录升级为简单注册登录，并实现院校绑定。

## Prompt 6：导入默认商品并优化首页 UI

时间：2026-07-16

对应功能/文件：`common/default-products.js`、`static/default-products/`、`pages/index/index.vue`

我的提示词：

```text
那真实商品图片最后完善 UI 的阶段再完成，现在帮我开始导入商品信息。
```

AI 原始输出摘要：

```text
考虑到 uniCloud 数据库偶发 resource exhausted，改为在前端维护一批本地默认商品，避免默认演示数据依赖后端。默认商品包含教材资料、数码电子、生活用品、运动户外等类型，并配套简单的本地商品图片资源，首页可以直接展示。
```

最终采用情况：已采用。首页在没有云端商品时也能展示完整演示数据。

## Prompt 7：设计交易意向和联系方式保护流程

时间：2026-07-16

对应功能/文件：`pages/product-detail/product-detail.vue`、`pages/mine/mine.vue`、`uniCloud-aliyun/cloudfunctions/intent/index.obj.js`

我的提示词：

```text
买家提交购买意向后，需要得到卖家的同意，之后才能看到电话、邮箱等联系方式，这样会不会好一点，可以避免卖家的联系方式在人人都可以看到的商品页中。
```

AI 原始输出摘要：

```text
建议采用“购买意向”流程：买家在商品详情页提交意向；卖家在个人主页查看收到的意向；卖家同意后，买家才能看到联系方式。这样比公开联系方式更合理，也比接入真实支付更适合课程项目和校园线下交易场景。
```

最终采用情况：已采用。项目增加了更完整的交易业务流程。

## Prompt 8：完善交易意向状态展示和流程说明

时间：2026-07-16

对应功能/文件：`pages/product-detail/product-detail.vue`、`pages/mine/mine.vue`

我的提示词：

```text
现在开始完成：1.完善交易意向状态展示；2.增加交易流程说明，但不要做成大段文字。
```

AI 原始输出摘要：

```text
在商品详情页展示“我的交易意向”状态卡片，在个人主页展示“我想买的”和“收到意向”状态；用短标签展示待确认、卖家同意、查看联系方式、线下交易等流程节点，避免大段说明文字影响界面。
```

最终采用情况：已采用。交易流程在页面上更清楚，适合演示给老师看。

## Prompt 9：首页合并默认商品和真实商品，新增已售出状态

时间：2026-07-17

对应功能/文件：`pages/index/index.vue`、`pages/mine/mine.vue`、`uniCloud-aliyun/cloudfunctions/product/index.obj.js`

我的提示词：

```text
现在进行一下：首页同时展示“默认商品 + 用户真实发布商品”；商品详情页统一；交易意向状态更清楚；用户发布商品后的操作闭环补一个“已售出”状态。
```

AI 原始输出摘要：

```text
首页加载时合并本地默认商品和云端真实商品；默认商品也能进入统一详情页；我的发布中增加“标记已售出”；后端 product 云对象新增 markSold，并在交易意向完成时同步商品状态。
```

最终采用情况：已采用。商品展示和交易闭环更加完整。

## Prompt 10：新增发布商品本地图片上传

时间：2026-07-17

对应功能/文件：`pages/publish/publish.vue`、`uniCloud 云存储`、`products.image_url`

我的提示词：

```text
现在开始做本地上传图片功能，我要方案 B。
```

AI 原始输出摘要：

```text
发布页增加本地选择图片按钮，使用 uni.chooseImage 选择图片，再通过 uniCloud.uploadFile 上传到云存储。上传成功后保存 fileID 到商品 image_url 字段，商品列表和详情页读取该字段展示图片。
```

最终采用情况：已采用。用户发布商品时可以上传本地图片，图片保存在后端云存储。

## Prompt 11：进行 Code Review 并给出优化建议

时间：2026-07-17

对应功能/文件：全项目 review，重点包括 `README.md`、`docs/api.md`、`pages/`、`uniCloud-aliyun/`

我的提示词：

```text
现在你回顾一下老师的需求文件，我要做最后善后工作，我需要你进行一次 Code Review，然后给我一份优化建议报告。
```

AI 原始输出摘要：

```text
Code Review 认为项目功能已经比较完整，但最终交付风险主要集中在文档和公开部署。重点问题包括 README/API 文档滞后、prompt_log 和 code_review 为空、后端信任前端 userId 存在安全风险、schema 权限偏开放、H5 云存储图片需要验证。建议优先补 README、API 文档、Prompt 记录、Code Review 报告、部署地址、演示视频和个人总结。
```

最终采用情况：已采用。根据该建议开始补齐课程提交材料。

## Prompt 12：补充 README 和 API 文档

时间：2026-07-17

对应功能/文件：`README.md`、`docs/api.md`

我的提示词：

```text
现在帮我完成：1.更新 README.md：项目简介、技术栈、功能清单、运行方式、uniCloud 配置、部署地址、演示账号、注意事项。2.更新 docs/api.md：按 user/product/favorite/intent/school/upload 分类写接口说明。
```

AI 原始输出摘要：

```text
重写 README，补充项目简介、技术栈、功能清单、运行方式、uniCloud 配置、部署地址占位、演示账号和注意事项。重写 docs/api.md，按 user、product、favorite、intent、school、upload 分类整理接口参数、状态说明、权限说明和数据库集合说明。
```

最终采用情况：已采用。README 和 API 文档已更新为当前项目状态。
