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
		created_at: Date.now() - 300000
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
		created_at: Date.now() - 200000
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
		created_at: Date.now() - 100000
	}
]

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
			return {
				code: 0,
				message: 'ok',
				data: filterProducts(res.data, params)
			}
		} catch (error) {
			return {
				code: 0,
				message: 'fallback demo products',
				data: filterProducts(demoProducts, params)
			}
		}
	},

	async detail(id) {
		if (!id) {
			return {
				code: 400,
				message: 'id is required',
				data: null
			}
		}
		try {
			const res = await products.doc(id).get()
			return {
				code: res.data.length ? 0 : 404,
				message: res.data.length ? 'ok' : 'product not found',
				data: res.data[0] || null
			}
		} catch (error) {
			const product = demoProducts.find(item => item._id === id)
			return {
				code: product ? 0 : 404,
				message: product ? 'fallback demo product' : 'product not found',
				data: product || null
			}
		}
	},

	async add(data = {}) {
		const requiredFields = ['title', 'description', 'price', 'category', 'seller_id', 'seller_name', 'contact']
		const missing = requiredFields.find(field => data[field] === undefined || data[field] === '')
		if (missing) {
			return {
				code: 400,
				message: `${missing} is required`,
				data: null
			}
		}
		const payload = {
			title: String(data.title).trim(),
			description: String(data.description).trim(),
			price: Number(data.price),
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
			return {
				code: 0,
				message: 'created',
				data: {
					_id: res.id,
					...payload
				}
			}
		} catch (error) {
			return {
				code: 0,
				message: 'created in fallback mode',
				data: {
					_id: `local-${Date.now()}`,
					...payload
				}
			}
		}
	},

	async update(id, data = {}) {
		if (!id || !data.seller_id) {
			return {
				code: 400,
				message: 'id and seller_id are required',
				data: null
			}
		}
		try {
			const current = await products.doc(id).get()
			const product = current.data[0]
			if (!product || product.seller_id !== data.seller_id) {
				return {
					code: 403,
					message: 'only seller can update this product',
					data: null
				}
			}
			const allowFields = ['title', 'description', 'price', 'category', 'condition', 'image_url', 'contact', 'status']
			const payload = {}
			allowFields.forEach(field => {
				if (data[field] !== undefined) payload[field] = data[field]
			})
			payload.updated_at = Date.now()
			await products.doc(id).update(payload)
			return {
				code: 0,
				message: 'updated',
				data: {
					_id: id,
					...payload
				}
			}
		} catch (error) {
			return {
				code: 503,
				message: 'database is not ready',
				data: null
			}
		}
	},

	async remove(id, userId) {
		if (!id || !userId) {
			return {
				code: 400,
				message: 'id and userId are required',
				data: null
			}
		}
		try {
			const current = await products.doc(id).get()
			const product = current.data[0]
			if (!product || product.seller_id !== userId) {
				return {
					code: 403,
					message: 'only seller can remove this product',
					data: null
				}
			}
			await products.doc(id).update({
				status: '已下架',
				updated_at: Date.now()
			})
			return {
				code: 0,
				message: 'removed',
				data: {
					_id: id
				}
			}
		} catch (error) {
			return {
				code: 503,
				message: 'database is not ready',
				data: null
			}
		}
	},

	async myList(userId) {
		if (!userId) {
			return {
				code: 400,
				message: 'userId is required',
				data: []
			}
		}
		try {
			const res = await products.where({
				seller_id: userId,
				status: dbCmd.neq('已删除')
			}).orderBy('created_at', 'desc').get()
			return {
				code: 0,
				message: 'ok',
				data: res.data
			}
		} catch (error) {
			return {
				code: 0,
				message: 'fallback demo products',
				data: demoProducts.filter(item => item.seller_id === userId)
			}
		}
	}
}
