const productObject = uniCloud.importObject('product')
const favoriteObject = uniCloud.importObject('favorite')
const userObject = uniCloud.importObject('user')

export function getCurrentUser() {
	return uni.getStorageSync('currentUser') || null
}

export function setCurrentUser(user) {
	uni.setStorageSync('currentUser', user)
}

export function clearCurrentUser() {
	uni.removeStorageSync('currentUser')
}

export const userApi = {
	list() {
		return userObject.list()
	},
	login(userId) {
		return userObject.login(userId)
	},
	register(data) {
		return userObject.register(data)
	},
	loginByPassword(account, password) {
		return userObject.loginByPassword(account, password)
	}
}

export const productApi = {
	list(params = {}) {
		return productObject.list(params)
	},
	detail(id) {
		return productObject.detail(id)
	},
	add(data) {
		return productObject.add(data)
	},
	update(id, data) {
		return productObject.update(id, data)
	},
	remove(id, userId) {
		return productObject.remove(id, userId)
	},
	deleteProduct(id, userId) {
		return productObject.deleteProduct(id, userId)
	},
	myList(userId) {
		return productObject.myList(userId)
	}
}

export const favoriteApi = {
	add(userId, productId) {
		return favoriteObject.add(userId, productId)
	},
	list(userId) {
		return favoriteObject.list(userId)
	},
	remove(userId, productId) {
		return favoriteObject.remove(userId, productId)
	},
	check(userId, productId) {
		return favoriteObject.check(userId, productId)
	}
}