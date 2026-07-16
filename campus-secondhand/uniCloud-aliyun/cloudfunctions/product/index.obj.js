const db = uniCloud.database()
const products = db.collection('products')

const allowedCategories = ['教材资料', '数码电子', '生活用品', '运动户外', '其他']
const allowedConditions = ['全新', '九成新', '八成新', '正常使用', '有明显使用痕迹']
const allowedStatuses = ['在售', '已下架', '已售出', '已删除']

function ok(data, message = 'ok') {
	return { code: 0, message, data }
}

function fail(message, code = 500) {
	return { code, message, data: null }
}

function normalizeError(error) {
	return error && error.message ? error.message : String(error)
}

function friendlyDbMessage(error) {
	return `云数据库暂时繁忙：${normalizeError(error)}`
}

function sortByCreatedAtDesc(list) {
	return (list || []).sort((left, right) => (right.created_at || 0) - (left.created_at || 0))
}

function filterProducts(list, params = {}) {
	const keyword = (params.keyword || '').trim().toLowerCase()
	const category = (params.category || '').trim()
	const schoolId = (params.school_id || '').trim()
	return (list || []).filter(item => {
		const matchedStatus = item.status === '在售'
		const matchedCategory = !category || item.category === category
		const matchedSchool = !schoolId || item.school_id === schoolId
		const matchedKeyword = !keyword ||
			String(item.title || '').toLowerCase().includes(keyword) ||
			String(item.description || '').toLowerCase().includes(keyword) ||
			String(item.seller_name || '').toLowerCase().includes(keyword) ||
			String(item.school_name || '').toLowerCase().includes(keyword)
		return matchedStatus && matchedCategory && matchedSchool && matchedKeyword
	})
}

function sortMyProducts(list) {
	const statusPriority = {
		'在售': 0,
		'已售出': 1,
		'已下架': 2
	}
	return (list || []).sort((left, right) => {
		const leftPriority = statusPriority[left.status] === undefined ? 2 : statusPriority[left.status]
		const rightPriority = statusPriority[right.status] === undefined ? 2 : statusPriority[right.status]
		if (leftPriority !== rightPriority) return leftPriority - rightPriority
		return (right.updated_at || right.created_at || 0) - (left.updated_at || left.created_at || 0)
	})
}

function validateProductData(data, partial = false) {
	const requiredFields = ['title', 'description', 'price', 'category', 'seller_id', 'seller_name', 'contact']
	if (!partial) {
		const missing = requiredFields.find(field => data[field] === undefined || data[field] === '')
		if (missing) return `${missing} is required`
		if (!data.school_id || !data.school_name) return 'school is required'
	}
	if (data.price !== undefined) {
		const price = Number(data.price)
		if (Number.isNaN(price) || price < 0) return 'price is invalid'
	}
	if (data.category !== undefined && !allowedCategories.includes(data.category)) return 'category is invalid'
	if (data.condition !== undefined && !allowedConditions.includes(data.condition)) return 'condition is invalid'
	if (data.status !== undefined && !allowedStatuses.includes(data.status)) return 'status is invalid'
	return ''
}

function buildCreatePayload(data) {
	const now = Date.now()
	return {
		title: String(data.title).trim(),
		description: String(data.description).trim(),
		price: Number(data.price),
		category: data.category,
		condition: data.condition || '正常使用',
		image_url: data.image_url || '',
		school_id: data.school_id,
		school_name: data.school_name,
		seller_id: data.seller_id,
		seller_name: data.seller_name,
		contact: data.contact,
		status: '在售',
		created_at: data.created_at || now,
		updated_at: now
	}
}

function buildUpdatePayload(data) {
	const allowFields = ['title', 'description', 'price', 'category', 'condition', 'image_url', 'contact', 'status']
	const payload = {}
	allowFields.forEach(field => {
		if (data[field] !== undefined) payload[field] = field === 'price' ? Number(data[field]) : data[field]
	})
	payload.updated_at = Date.now()
	return payload
}

async function getSellerProduct(id, sellerId) {
	const current = await products.doc(id).get()
	const product = current.data[0]
	if (!product || product.seller_id !== sellerId) return null
	return product
}

module.exports = {
	async list(params = {}) {
		try {
			const res = await products.limit(100).get()
			return ok(filterProducts(sortByCreatedAtDesc(res.data), params))
		} catch (error) {
			return ok([], `商品读取暂时使用空列表：${friendlyDbMessage(error)}`)
		}
	},

	async detail(id) {
		if (!id) return fail('id is required', 400)
		try {
			const res = await products.doc(id).get()
			if (!res.data.length || res.data[0].status === '已删除') return fail('product not found', 404)
			return ok(res.data[0])
		} catch (error) {
			return fail(`商品详情读取失败：${friendlyDbMessage(error)}`)
		}
	},

	async add(data = {}) {
		const validationError = validateProductData(data)
		if (validationError) return fail(validationError, 400)
		const payload = buildCreatePayload(data)
		try {
			const res = await products.add(payload)
			return ok({ _id: res.id, ...payload }, 'created')
		} catch (error) {
			return fail(`商品保存失败：${friendlyDbMessage(error)}`)
		}
	},

	async update(id, data = {}) {
		if (!id || !data.seller_id) return fail('id and seller_id are required', 400)
		const validationError = validateProductData(data, true)
		if (validationError) return fail(validationError, 400)
		try {
			const product = await getSellerProduct(id, data.seller_id)
			if (!product) return fail('only seller can update this product', 403)
			const payload = buildUpdatePayload(data)
			await products.doc(id).update(payload)
			return ok({ _id: id, ...payload }, 'updated')
		} catch (error) {
			return fail(`商品更新失败：${friendlyDbMessage(error)}`)
		}
	},

	async remove(id, userId) {
		if (!id || !userId) return fail('id and userId are required', 400)
		try {
			const product = await getSellerProduct(id, userId)
			if (!product) return fail('only seller can remove this product', 403)
			await products.doc(id).update({ status: '已下架', updated_at: Date.now() })
			return ok({ _id: id }, 'removed')
		} catch (error) {
			return fail(`商品下架失败：${friendlyDbMessage(error)}`)
		}
	},

	async markSold(id, userId) {
		if (!id || !userId) return fail('id and userId are required', 400)
		try {
			const product = await getSellerProduct(id, userId)
			if (!product) return fail('only seller can mark this product sold', 403)
			await products.doc(id).update({ status: '已售出', updated_at: Date.now() })
			return ok({ _id: id }, 'sold')
		} catch (error) {
			return fail(`商品标记售出失败：${friendlyDbMessage(error)}`)
		}
	},

	async deleteProduct(id, userId) {
		if (!id || !userId) return fail('id and userId are required', 400)
		try {
			const product = await getSellerProduct(id, userId)
			if (!product) return fail('only seller can delete this product', 403)
			await products.doc(id).update({ status: '已删除', updated_at: Date.now() })
			return ok({ _id: id }, 'deleted')
		} catch (error) {
			return fail(`商品删除失败：${friendlyDbMessage(error)}`)
		}
	},

	async myList(userId) {
		if (!userId) return fail('userId is required', 400)
		try {
			const res = await products.where({ seller_id: userId }).limit(100).get()
			const list = (res.data || []).filter(item => item.status !== '已删除')
			return ok(sortMyProducts(list))
		} catch (error) {
			return ok([], `我的发布读取暂时使用空列表：${friendlyDbMessage(error)}`)
		}
	},

	async health() {
		const result = { get: null, add: null }
		try {
			result.get = await products.limit(1).get()
		} catch (error) {
			result.get = normalizeError(error)
		}
		try {
			const payload = buildCreatePayload({
				title: '数据库连通性测试',
				description: '这条记录用于测试 products 集合是否可写，可手动删除。',
				price: 0,
				category: '其他',
				condition: '正常使用',
				school_id: 'system',
				school_name: '系统测试',
				seller_id: 'system',
				seller_name: '系统测试',
				contact: 'none',
				image_url: ''
			})
			payload.status = '已删除'
			result.add = await products.add(payload)
		} catch (error) {
			result.add = normalizeError(error)
		}
		return ok(result)
	}
}