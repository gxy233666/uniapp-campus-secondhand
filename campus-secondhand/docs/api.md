# API 文档

本项目后端使用 uniCloud 云对象实现，前端通过 `uniCloud.importObject()` 调用云对象方法。前端统一封装文件为 `common/api.js`。

通用返回格式：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

`code` 为 `0` 表示成功，非 `0` 表示失败。部分接口在云数据库临时不可用时会返回空数组或备用数据，避免页面直接崩溃。

## user

用户云对象，文件位置：`uniCloud-aliyun/cloudfunctions/user/index.obj.js`。

### user.list()

获取用户列表。主要用于演示账号和用户切换场景。

请求参数：无。

返回示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "_id": "demo-user-1",
      "username": "张三",
      "phone": "13800000001",
      "email": "zhangsan@example.com",
      "school_id": "fj_minnan_science_technology_university",
      "school_name": "闽南科技学院"
    }
  ]
}
```

### user.login(userId)

根据用户 ID 获取用户信息。主要用于早期模拟登录和切换用户。

请求参数：

```json
"demo-user-1"
```

### user.register(data)

注册新用户。

请求参数：

```json
{
  "username": "测试用户",
  "phone": "13800000011",
  "email": "test@example.com",
  "password": "abc123",
  "school_id": "fj_minnan_science_technology_university"
}
```

校验规则：

- 用户名长度为 2-20 个字符
- 手机号必须符合中国大陆手机号格式
- 邮箱必须符合基础邮箱格式
- 密码至少 6 位，并且包含字母和数字
- 院校必须来自内置院校列表

### user.loginByPassword(account, password)

使用手机号或邮箱加密码登录。

请求参数：

```json
{
  "account": "13800000011",
  "password": "abc123"
}
```

说明：前端封装调用形式为 `userApi.loginByPassword(account, password)`。

## product

商品云对象，文件位置：`uniCloud-aliyun/cloudfunctions/product/index.obj.js`。

商品状态：

| 状态 | 含义 |
| --- | --- |
| 在售 | 首页可展示，买家可以提交交易意向 |
| 已下架 | 不在首页展示，卖家可在我的发布中查看 |
| 已售出 | 不作为可购买商品展示，用于标记交易完成 |
| 已删除 | 软删除，不再展示 |

### product.list(params)

获取首页商品列表，支持关键词、分类和院校筛选。

请求参数：

```json
{
  "keyword": "教材",
  "category": "教材资料",
  "school_id": "fj_minnan_science_technology_university"
}
```

返回说明：

- 只返回状态为“在售”的云端真实商品
- 首页会在前端合并本地默认商品和该接口返回的真实商品

### product.detail(id)

获取商品详情。

请求参数：

```json
"商品_id"
```

### product.add(data)

发布商品。

请求参数：

```json
{
  "title": "二手台灯",
  "description": "宿舍闲置台灯，亮度正常",
  "price": 25,
  "category": "生活用品",
  "condition": "九成新",
  "image_url": "cloud://xxx",
  "school_id": "fj_minnan_science_technology_university",
  "school_name": "闽南科技学院",
  "seller_id": "用户_id",
  "seller_name": "测试卖家",
  "contact": "13800000012"
}
```

说明：

- `school_id` 和 `school_name` 由当前登录用户自动带入
- `image_url` 可以为空，也可以是上传到 uniCloud 云存储后的文件地址
- 新发布商品默认状态为“在售”

### product.update(id, data)

编辑商品。只有商品发布者可以编辑。

请求参数：

```json
{
  "id": "商品_id",
  "data": {
    "title": "二手台灯",
    "description": "描述修改后内容",
    "price": 20,
    "category": "生活用品",
    "condition": "八成新",
    "image_url": "cloud://xxx",
    "contact": "13800000012",
    "seller_id": "用户_id"
  }
}
```

说明：前端封装调用形式为 `productApi.update(id, data)`。

### product.remove(id, userId)

下架商品。只有商品发布者可以操作。

请求参数：

```json
{
  "id": "商品_id",
  "userId": "用户_id"
}
```

说明：该接口会将商品状态更新为“已下架”，不是物理删除。

### product.markSold(id, userId)

标记商品已售出。只有商品发布者可以操作。

请求参数：

```json
{
  "id": "商品_id",
  "userId": "用户_id"
}
```

### product.deleteProduct(id, userId)

删除商品。只有商品发布者可以操作。

请求参数：

```json
{
  "id": "商品_id",
  "userId": "用户_id"
}
```

说明：该接口采用软删除，会将商品状态更新为“已删除”。

### product.myList(userId)

获取当前用户发布过的商品。

请求参数：

```json
"用户_id"
```

返回说明：

- 返回当前用户发布的商品
- 不返回状态为“已删除”的商品
- 在售、已售出、已下架商品会按状态和更新时间排序

### product.health()

检测 `products` 集合读写情况。主要用于调试云数据库是否可用。

请求参数：无。

## favorite

收藏云对象，文件位置：`uniCloud-aliyun/cloudfunctions/favorite/index.obj.js`。

### favorite.add(userId, productId)

收藏商品。

请求参数：

```json
{
  "userId": "用户_id",
  "productId": "商品_id"
}
```

重复收藏同一商品时，会返回已有收藏记录，不会重复创建。

### favorite.list(userId)

获取当前用户收藏的商品列表。

请求参数：

```json
"用户_id"
```

返回说明：只返回仍处于“在售”状态的商品。

### favorite.remove(userId, productId)

取消收藏。

请求参数：

```json
{
  "userId": "用户_id",
  "productId": "商品_id"
}
```

### favorite.check(userId, productId)

检查当前用户是否已收藏某商品。

请求参数：

```json
{
  "userId": "用户_id",
  "productId": "商品_id"
}
```

返回示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": true
}
```

## intent

交易意向云对象，文件位置：`uniCloud-aliyun/cloudfunctions/intent/index.obj.js`。

交易意向状态：

| 状态 | 含义 |
| --- | --- |
| 待确认 | 买家已提交意向，等待卖家处理 |
| 已同意 | 卖家同意交易，买家可以查看卖家联系方式 |
| 已拒绝 | 卖家拒绝交易 |
| 已完成 | 交易完成，同时商品可标记为已售出 |
| 已取消 | 买家取消交易意向 |

### intent.add(data)

买家提交购买意向。

请求参数：

```json
{
  "product_id": "商品_id",
  "buyer_id": "买家用户_id",
  "buyer_name": "测试买家",
  "buyer_contact": "13800000011",
  "message": "你好，我对这件商品感兴趣。"
}
```

说明：

- 买家不能对自己发布的商品提交交易意向
- 商品必须处于“在售”状态
- 同一买家对同一商品不能重复提交未结束的交易意向
- 卖家同意前，返回给买家的数据会隐藏卖家联系方式

### intent.listBuyer(userId)

获取当前买家提交过的交易意向。

请求参数：

```json
"买家用户_id"
```

返回说明：

- 卖家未同意前，`seller_contact` 为空
- 卖家同意或交易完成后，买家可以看到卖家联系方式

### intent.listSeller(userId)

获取当前卖家收到的交易意向。

请求参数：

```json
"卖家用户_id"
```

### intent.updateStatus(id, userId, status)

更新交易意向状态。

请求参数：

```json
{
  "id": "交易意向_id",
  "userId": "当前用户_id",
  "status": "已同意"
}
```

权限说明：

- 卖家可以更新为“已同意”“已拒绝”“已完成”
- 买家可以更新为“已取消”
- 已完成、已取消、已拒绝等结束状态不能继续修改
- 更新为“已完成”时，会同步将对应商品标记为“已售出”

## school

院校云对象，文件位置：`uniCloud-aliyun/cloudfunctions/school/index.obj.js`。

### school.list()

获取院校列表。

请求参数：无。

返回示例：

```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "school_id": "fj_minnan_science_technology_university",
      "name": "闽南科技学院",
      "province": "福建省",
      "city": "泉州市",
      "level": "本科"
    }
  ]
}
```

说明：

- 如果 `schools` 集合为空，云对象会尝试初始化内置院校数据
- 如果云数据库临时不可用，会返回内置院校数据作为备用
- 当前院校列表以福建省常见高校为主，额外包含沈阳农业大学、清华大学、北京大学

## upload

图片上传使用 uniCloud 云存储，不是单独的云对象接口。

前端位置：`pages/publish/publish.vue`。

调用流程：

1. 用户点击“选择图片”
2. 前端调用 `uni.chooseImage()` 选择本地图片
3. 前端调用 `uniCloud.uploadFile()` 上传到云存储
4. 上传成功后，将返回的 `fileID` 保存到商品表的 `image_url` 字段
5. 首页、详情页、我的发布页面读取 `image_url` 展示商品图片

示例代码逻辑：

```js
const uploadRes = await uniCloud.uploadFile({
  filePath,
  cloudPath: `product-images/${Date.now()}-${fileName}`
})

form.image_url = uploadRes.fileID
```

注意事项：

- H5 发行后需要验证云存储图片是否能正常显示
- 如果前端无法直接显示 `fileID`，可以通过 `uniCloud.getTempFileURL()` 转换为临时访问地址后再展示

## 数据库集合

| 集合 | 作用 |
| --- | --- |
| users | 用户信息、手机号、邮箱、密码哈希、所属院校 |
| products | 商品信息、价格、分类、图片、卖家、状态 |
| favorites | 用户收藏关系 |
| intents | 交易意向、买家卖家信息、交易状态 |
| schools | 院校列表 |
