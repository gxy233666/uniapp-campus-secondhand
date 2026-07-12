const db = uniCloud.database()
const users = db.collection('users')

const demoUsers = [
	{
		_id: 'demo-user-1',
		username: '张三',
		phone: '13800000001',
		avatar: '',
		created_at: Date.now()
	},
	{
		_id: 'demo-user-2',
		username: '李四',
		phone: '13800000002',
		avatar: '',
		created_at: Date.now()
	},
	{
		_id: 'demo-user-3',
		username: '王五',
		phone: '13800000003',
		avatar: '',
		created_at: Date.now()
	}
]

async function ensureDemoUsers() {
	const countRes = await users.count()
	if (countRes.total > 0) return
	for (const item of demoUsers) {
		await users.add(item)
	}
}

module.exports = {
	async list() {
		try {
			await ensureDemoUsers()
			const res = await users.orderBy('created_at', 'asc').get()
			return {
				code: 0,
				message: 'ok',
				data: res.data
			}
		} catch (error) {
			return {
				code: 0,
				message: 'fallback demo users',
				data: demoUsers
			}
		}
	},

	async login(userId) {
		if (!userId) {
			return {
				code: 400,
				message: 'userId is required',
				data: null
			}
		}
		try {
			await ensureDemoUsers()
			const res = await users.doc(userId).get()
			return {
				code: res.data.length ? 0 : 404,
				message: res.data.length ? 'ok' : 'user not found',
				data: res.data[0] || null
			}
		} catch (error) {
			const user = demoUsers.find(item => item._id === userId)
			return {
				code: user ? 0 : 404,
				message: user ? 'fallback demo user' : 'user not found',
				data: user || null
			}
		}
	}
}
