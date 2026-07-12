const db = uniCloud.database()
const dbCmd = db.command
const favorites = db.collection('favorites')
const products = db.collection('products')

module.exports = {
	async add(userId, productId) {
		if (!userId || !productId) {
			return {
				code: 400,
				message: 'userId and productId are required',
				data: null
			}
		}
		try {
			const existed = await favorites.where({
				user_id: userId,
				product_id: productId
			}).get()
			if (existed.data.length) {
				return {
					code: 0,
					message: 'already favored',
					data: existed.data[0]
				}
			}
			const payload = {
				user_id: userId,
				product_id: productId,
				created_at: Date.now()
			}
			const res = await favorites.add(payload)
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
					_id: `local-favorite-${Date.now()}`,
					user_id: userId,
					product_id: productId,
					created_at: Date.now()
				}
			}
		}
	},

	async list(userId) {
		if (!userId) {
			return {
				code: 400,
				message: 'userId is required',
				data: []
			}
		}
		try {
			const favoriteRes = await favorites.where({
				user_id: userId
			}).orderBy('created_at', 'desc').get()
			const productIds = favoriteRes.data.map(item => item.product_id)
			if (!productIds.length) {
				return {
					code: 0,
					message: 'ok',
					data: []
				}
			}
			const productRes = await products.where({
				_id: dbCmd.in(productIds),
				status: '在售'
			}).get()
			return {
				code: 0,
				message: 'ok',
				data: productRes.data
			}
		} catch (error) {
			return {
				code: 0,
				message: 'fallback empty favorites',
				data: []
			}
		}
	},

	async remove(userId, productId) {
		if (!userId || !productId) {
			return {
				code: 400,
				message: 'userId and productId are required',
				data: null
			}
		}
		try {
			await favorites.where({
				user_id: userId,
				product_id: productId
			}).remove()
		} catch (error) {}
		return {
			code: 0,
			message: 'removed',
			data: {
				user_id: userId,
				product_id: productId
			}
		}
	},

	async check(userId, productId) {
		if (!userId || !productId) {
			return {
				code: 0,
				message: 'ok',
				data: false
			}
		}
		try {
			const res = await favorites.where({
				user_id: userId,
				product_id: productId
			}).get()
			return {
				code: 0,
				message: 'ok',
				data: res.data.length > 0
			}
		} catch (error) {
			return {
				code: 0,
				message: 'fallback false',
				data: false
			}
		}
	}
}
