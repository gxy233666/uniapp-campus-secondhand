const db = uniCloud.database()
const intents = db.collection('intents')
const products = db.collection('products')

const allowedStatuses = ['待确认', '已同意', '已完成', '已取消']
const sellerContactVisibleStatuses = ['已同意', '已完成', '已联系']

function ok(data, message = 'ok') {
	return { code: 0, message, data }
}

function fail(message, code = 500) {
	return { code, message, data: null }
}

function normalizeError(error) {
	return error && error.message ? error.message : String(error)
}

function sanitizeMessage(message) {
	const value = String(message || '').trim()
	return value || '你好，我对这件商品感兴趣，想进一步了解一下。'
}

async function getProduct(productId) {
	const res = await products.doc(productId).get()
	return res.data[0] || null
}

function buildIntentPayload(product, data) {
	const now = Date.now()
	return {
		product_id: product._id,
		product_title: product.title,
		product_price: Number(product.price) || 0,
		product_image: product.image_url || '',
		product_school_id: product.school_id || '',
		product_school_name: product.school_name || '',
		seller_id: product.seller_id,
		seller_name: product.seller_name,
		seller_contact: product.contact || '',
		buyer_id: data.buyer_id,
		buyer_name: data.buyer_name,
		buyer_contact: data.buyer_contact || '',
		message: sanitizeMessage(data.message),
		status: '待确认',
		created_at: now,
		updated_at: now
	}
}

function sortByCreatedAtDesc(list) {
	return (list || []).sort((left, right) => (right.created_at || 0) - (left.created_at || 0))
}

function hideSellerContactForBuyer(intent) {
	const result = { ...intent }
	if (!sellerContactVisibleStatuses.includes(result.status)) {
		result.seller_contact = ''
	}
	return result
}

function isActiveIntent(intent) {
	return intent && intent.status !== '已取消'
}

module.exports = {
	async add(data = {}) {
		if (!data.product_id || !data.buyer_id || !data.buyer_name) {
			return fail('product_id, buyer_id and buyer_name are required', 400)
		}
		try {
			const product = await getProduct(data.product_id)
			if (!product || product.status !== '在售') return fail('商品不存在或已下架', 404)
			if (product.seller_id === data.buyer_id) return fail('不能对自己发布的商品提交购买意向', 400)

			const existed = await intents.where({
				product_id: data.product_id,
				buyer_id: data.buyer_id
			}).limit(20).get()
			const activeIntent = (existed.data || []).find(item => isActiveIntent(item))
			if (activeIntent) return ok(hideSellerContactForBuyer(activeIntent), '你已经提交过购买意向')

			const payload = buildIntentPayload(product, data)
			const res = await intents.add(payload)
			return ok(hideSellerContactForBuyer({ _id: res.id, ...payload }), '购买意向已提交，等待卖家同意')
		} catch (error) {
			return fail(`购买意向提交失败：${normalizeError(error)}`)
		}
	},

	async listBuyer(userId) {
		if (!userId) return fail('userId is required', 400)
		try {
			const res = await intents.where({ buyer_id: userId }).limit(100).get()
			const list = sortByCreatedAtDesc(res.data).map(item => hideSellerContactForBuyer(item))
			return ok(list)
		} catch (error) {
			return ok([], `我想买的读取使用备用数据：${normalizeError(error)}`)
		}
	},

	async listSeller(userId) {
		if (!userId) return fail('userId is required', 400)
		try {
			const res = await intents.where({ seller_id: userId }).limit(100).get()
			return ok(sortByCreatedAtDesc(res.data))
		} catch (error) {
			return ok([], `收到意向读取使用备用数据：${normalizeError(error)}`)
		}
	},

	async updateStatus(id, userId, status) {
		if (!id || !userId || !status) return fail('id, userId and status are required', 400)
		if (!allowedStatuses.includes(status)) return fail('status is invalid', 400)
		try {
			const current = await intents.doc(id).get()
			const intent = current.data[0]
			if (!intent) return fail('intent not found', 404)

			const isBuyer = intent.buyer_id === userId
			const isSeller = intent.seller_id === userId
			if (!isBuyer && !isSeller) return fail('no permission', 403)
			if (status === '已同意' && !isSeller) return fail('only seller can approve contact', 403)

			await intents.doc(id).update({ status, updated_at: Date.now() })
			return ok({ _id: id, status }, 'updated')
		} catch (error) {
			return fail(`意向状态更新失败：${normalizeError(error)}`)
		}
	}
}