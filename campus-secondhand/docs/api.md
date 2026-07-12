# API 文档

本项目后端使用 uniCloud 云对象实现。前端通过 `uniCloud.importObject()` 调用云对象方法。

## user 云对象

### user.list()

获取模拟用户列表。首次调用时会自动初始化 3 个演示用户。

返回：

```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "_id": "demo-user-1",
      "username": "张三",
      "phone": "13800000001"
    }
  ]
}
```

### user.login(userId)

模拟登录指定用户。

参数：

```json
"demo-user-1"
```

## product 云对象

### product.list(params)

获取在售商品列表，支持关键词和分类筛选。首次调用时会自动初始化 3 条演示商品。

参数：

```json
{
  "keyword": "教材",
  "category": "教材资料"
}
```

### product.detail(id)

获取商品详情。

参数：

```json
"商品_id"
```

### product.add(data)

发布商品。

参数：

```json
{
  "title": "二手台灯",
  "description": "宿舍台灯，亮度正常",
  "price": 25,
  "category": "生活用品",
  "condition": "九成新",
  "image_url": "",
  "seller_id": "demo-user-1",
  "seller_name": "张三",
  "contact": "13800000001"
}
```

### product.update(id, data)

编辑商品。只有发布者本人可以编辑。

### product.remove(id, userId)

下架商品。只有发布者本人可以下架。

### product.myList(userId)

获取某个用户发布的商品。

## favorite 云对象

### favorite.add(userId, productId)

收藏商品。

### favorite.list(userId)

获取某个用户收藏的商品列表。

### favorite.remove(userId, productId)

取消收藏。

### favorite.check(userId, productId)

检查当前用户是否已收藏某商品。

## 数据库集合

| 集合 | 作用 |
| --- | --- |
| users | 存储模拟用户 |
| products | 存储二手商品 |
| favorites | 存储用户收藏关系 |
