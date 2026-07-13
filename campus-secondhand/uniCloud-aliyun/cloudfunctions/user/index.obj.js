const crypto = require('crypto')
const db = uniCloud.database()
const users = db.collection('users')

const demoUsers = [
	{
		_id: 'demo-user-1',
		username: '张三',
		phone: '13800000001',
		email: 'zhangsan@example.com',
		avatar: '',
		created_at: Date.now()
	},
	{
		_id: 'demo-user-2',
		username: '李四',
		phone: '13800000002',
		email: 'lisi@example.com',
		avatar: '',
		created_at: Date.now()
	},
	{
		_id: 'demo-user-3',
		username: '王五',
		phone: '13800000003',
		email: 'wangwu@example.com',
		avatar: '',
		created_at: Date.now()
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

function isValidPhone(phone) {
	return /^1[3-9]\d{9}$/.test(String(phone || '').trim())
}

function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

function isValidPassword(password) {
	const value = String(password || '')
	return value.length >= 6 && /[A-Za-z]/.test(value) && /\d/.test(value)
}

function validateRegisterData(data = {}) {
	const username = String(data.username || '').trim()
	const phone = String(data.phone || '').trim()
	const email = String(data.email || '').trim().toLowerCase()
	const password = String(data.password || '')
	if (username.length < 2 || username.length > 20) return '用户名需为 2-20 个字符'
	if (!isValidPhone(phone)) return '手机号格式不正确'
	if (!isValidEmail(email)) return '邮箱格式不正确'
	if (!isValidPassword(password)) return '密码至少 6 位，且需包含字母和数字'
	return ''
}

function hashPassword(password, salt) {
	return crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex')
}

function createPasswordRecord(password) {
	const salt = crypto.randomBytes(16).toString('hex')
	return {
		password_salt: salt,
		password_hash: hashPassword(password, salt)
	}
}

function sanitizeUser(user) {
	if (!user) return null
	const result = { ...user }
	delete result.password
	delete result.password_hash
	delete result.password_salt
	return result
}

function sanitizeUsers(list) {
	return list.map(item => sanitizeUser(item))
}

async function ensureDemoUsers() {
	try {
		const countRes = await users.count()
		if (countRes.total > 0) return
	} catch (error) {
		// Fresh uniCloud spaces may not have the collection initialized yet.
	}
	for (const item of demoUsers) {
		await users.add(item)
	}
}

async function findByPhone(phone) {
	const res = await users.where({ phone }).limit(1).get()
	return res.data[0] || null
}

async function findByEmail(email) {
	const res = await users.where({ email }).limit(1).get()
	return res.data[0] || null
}

async function findByAccount(account) {
	const value = String(account || '').trim().toLowerCase()
	if (!value) return null
	if (isValidPhone(value)) return findByPhone(value)
	return findByEmail(value)
}

module.exports = {
	async list() {
		try {
			await ensureDemoUsers()
			const res = await users.orderBy('created_at', 'asc').get()
			return ok(sanitizeUsers(res.data))
		} catch (error) {
			return ok(sanitizeUsers(demoUsers), `fallback demo users: ${normalizeError(error)}`)
		}
	},

	async login(userId) {
		if (!userId) return fail('userId is required', 400)
		try {
			await ensureDemoUsers()
			const res = await users.doc(userId).get()
			return res.data.length ? ok(sanitizeUser(res.data[0])) : fail('user not found', 404)
		} catch (error) {
			const user = demoUsers.find(item => item._id === userId)
			return user ? ok(sanitizeUser(user), 'fallback demo user') : fail('user not found', 404)
		}
	},

	async register(data = {}) {
		const validationError = validateRegisterData(data)
		if (validationError) return fail(validationError, 400)
		const username = String(data.username).trim()
		const phone = String(data.phone).trim()
		const email = String(data.email).trim().toLowerCase()
		try {
			const existedPhone = await findByPhone(phone)
			if (existedPhone) return fail('该手机号已注册', 409)
			const existedEmail = await findByEmail(email)
			if (existedEmail) return fail('该邮箱已注册', 409)
			const now = Date.now()
			const passwordRecord = createPasswordRecord(data.password)
			const payload = {
				username,
				phone,
				email,
				avatar: '',
				...passwordRecord,
				created_at: now,
				updated_at: now
			}
			const res = await users.add(payload)
			return ok(sanitizeUser({ _id: res.id, ...payload }), 'registered')
		} catch (error) {
			return fail(`注册失败：${normalizeError(error)}`)
		}
	},

	async loginByPassword(account, password) {
		if (!account || !password) return fail('账号和密码不能为空', 400)
		try {
			const user = await findByAccount(account)
			if (!user || !user.password_hash || !user.password_salt) return fail('账号或密码错误', 401)
			const currentHash = hashPassword(password, user.password_salt)
			if (currentHash !== user.password_hash) return fail('账号或密码错误', 401)
			return ok(sanitizeUser(user), 'login success')
		} catch (error) {
			return fail(`登录失败：${normalizeError(error)}`)
		}
	}
}