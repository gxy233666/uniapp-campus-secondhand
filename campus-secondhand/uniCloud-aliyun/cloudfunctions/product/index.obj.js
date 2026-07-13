const db = uniCloud.database()
const dbCmd = db.command
const products = db.collection('products')

const demoProducts = [
	{
		_id: 'demo-product-1',
		title: '高等数学教材第七版',
		description: '教材保存较好，少量笔记，适合期末复习和补课使用。',
		price: 28,
		category: '教材资料',
		condition: '八成新',
		image_url: '',
		seller_id: 'demo-user-1',
		seller_name: '张三',
		contact: '13800000001',
		status: '在售',
		created_at: Date.now() - 300000,
		updated_at: Date.now() - 300000
	},
	{
		_id: 'demo-product-2',
		title: '罗技无线鼠标',
		description: '宿舍闲置无线鼠标，功能正常，带接收器。',
		price: 45,
		category: '数码电子',
		condition: '正常使用',
		image_url: '',
		seller_id: 'demo-user-2',
		seller_name: '李四',
		contact: '13800000002',
		status: '在售',
		created_at: Date.now() - 200000,
		updated_at: Date.now() - 200000
	},
	{
		_id: 'demo-product-3',
		title: '寝室折叠收纳箱',
		description: '搬宿舍多出来的收纳箱，容量大，适合衣物整理。',
		price: 18,
		category: '生活用品',
		condition: '九成新',
		image_url: '',
		seller_id: 'demo-user-3',
		seller_name: '王五',
		contact: '13800000003',
		status: '在售',
		created_at: Date.now() - 100000,
		updated_at: Date.now() - 100000
	}
]

function ok(data, message = 'ok') {
	return { code: 0, message, data }
}

function fail(message, code = 500) {
	return { code, message, data: null }
}

function normalizeError(error) {
	return error && error.message ? error.message : String(error)
}

function databaseSetupMessage(error) {
	return `数据库集合 products 不可用，请先在 uniCloud 控制台手动创建 products 集合后重试。原始错误：${normalizeError(error)}`
}

async function ensureDemoProducts() {
	const countRes = await products.count()
	if (countRes.total > 0) return
	for (const item of demoProducts) {
		const payload = { ...item }
		delete payload._id
		await products.add(payload)
	}
}

function filterProducts(list, params = {}) {
	const keyword = (params.keyword || '').trim().toLowerCase()
	const category = (params.category || '').trim()
	return list.filter(item => {
		const matchedStatus = item.status === '在售'
		const matchedCategory = !category || item.category === category
		const matchedKeyword = !keyword ||
			String(item.title || '').toLowerCase().includes(keyword) ||
			String(item.description || '').toLowerCase().includes(keyword)
		return matchedStatus && matchedCategory && matchedKeyword
	})
}

module.exports = {
	async list(params = {}) {
		try {
			await ensureDemoProducts()
			const res = await products.orderBy('created_at', 'desc').get()
			return ok(filterProducts(res.data, params))
		} catch (error) {
			return ok(filterProducts(demoProducts, params), `使用演示商品数据：${databaseSetupMessage(error)}`)
		}
	},

	async detail(id) {
		if (!id) return fail('id is required', 400)
		try {
			const res = await products.doc(id).get()
			if (!res.data.length) return fail('product not found', 404)
			return ok(res.data[0])
		} catch (error) {
			const demo = demoProducts.find(item => item._id === id)
			if (demo) return ok(demo, `使用演示商品详情：${databaseSetupMessage(error)}`)
			return fail(`商品详情读取失败：${databaseSetupMessage(error)}`)
		}
	},

	async add(data = {}) {
		const requiredFields = ['title', 'description', 'price', 'category', 'seller_id', 'seller_name', 'contact']
		const missing = requiredFields.find(field => data[field] === undefined || data[field] === '')
		if (missing) return fail(`${missing} is required`, 400)

		const price = Number(data.price)
		if (Number.isNaN(price) || price < 0) return fail('price is invalid', 400)

		const payload = {
			title: String(data.title).trim(),
			description: String(data.description).trim(),
			price,
			category: data.category,
			condition: data.condition || '正常使用',
			image_url: data.image_url || '',
			seller_id: data.seller_id,
			seller_name: data.seller_name,
			contact: data.contact,
			status: '在售',
			created_at: Date.now(),
			updated_at: Date.now()
		}

		try {
			const res = await products.add(payload)
			return ok({ _id: res.id, ...payload }, 'created')
		} catch (error) {
			return fail(`商品保存失败：${databaseSetupMessage(error)}`)
		}
	},

	async update(id, data = {}) {
		if (!id || !data.seller_id) return fail('id and seller_id are required', 400)
		try {
			const current = await products.doc(id).get()
			const product = current.data[0]
			if (!product || product.seller_id !== data.seller_id) {
				return fail('only seller can update this product', 403)
			}
			const allowFields = ['title', 'description', 'price', 'category', 'condition', 'image_url', 'contact', 'status']
			const payload = {}
			allowFields.forEach(field => {
				if (data[field] !== undefined) payload[field] = data[field]
			})
			payload.updated_at = Date.now()
			await products.doc(id).update(payload)
			return ok({ _id: id, ...payload }, 'updated')
		} catch (error) {
			return fail(`商品更新失败：${databaseSetupMessage(error)}`)
		}
	},

	async remove(id, userId) {
		if (!id || !userId) return fail('id and userId are required', 400)
		try {
			const current = await products.doc(id).get()
			const product = current.data[0]
			if (!product || product.seller_id !== userId) {
				return fail('only seller can remove this product', 403)
			}
			await products.doc(id).update({
				status: '已下架',
				updated_at: Date.now()
			})
			return ok({ _id: id }, 'removed')
		} catch (error) {
			return fail(`商品下架失败：${databaseSetupMessage(error)}`)
		}
	},

	async myList(userId) {
		if (!userId) return fail('userId is required', 400)
		try {
			const res = await products.where({
				seller_id: userId,
				status: dbCmd.neq('已删除')
			}).orderBy('created_at', 'desc').get()
			return ok(res.data)
		} catch (error) {
			return fail(`我的发布读取失败：${databaseSetupMessage(error)}`)
		}
	},

	async health() {
		const result = {
			count: null,
			add: null,
			get: null
		}
		try {
			result.count = await products.count()
		} catch (error) {
			result.count = normalizeError(error)
		}
		try {
			const payload = {
				title: '数据库连通性测试',
				description: '这条记录用于测试 products 集合是否可写，可手动删除。',
				price: 0,
				category: '其他',
				condition: '正常使用',
				image_url: '',
				seller_id: 'system',
				seller_name: '系统测试',
				contact: 'none',
				status: '已删除',
				created_at: Date.now(),
				updated_at: Date.now()
			}
			result.add = await products.add(payload)
		} catch (error) {
			result.add = normalizeError(error)
		}
		try {
			result.get = await products.limit(1).get()
		} catch (error) {
			result.get = normalizeError(error)
		}
		return ok(result)
	}
}
