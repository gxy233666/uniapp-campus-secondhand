<template>
	<view class="page">
		<view class="card auth-card">
			<view class="title">账号登录</view>
			<view class="hint">登录后可以发布商品、管理我的发布和收藏记录。</view>

			<view class="tabs">
				<view class="tab" :class="{ active: mode === 'login' }" @click="switchMode('login')">登录</view>
				<view class="tab" :class="{ active: mode === 'register' }" @click="switchMode('register')">注册</view>
			</view>

			<view v-if="mode === 'login'">
				<view class="login-type-tabs">
					<view class="login-type" :class="{ active: loginType === 'phone' }" @click="switchLoginType('phone')">手机号登录</view>
					<view class="login-type" :class="{ active: loginType === 'email' }" @click="switchLoginType('email')">邮箱登录</view>
				</view>
				<input v-if="loginType === 'phone'" class="field" v-model="loginForm.phone" type="number" maxlength="11" placeholder="请输入手机号" />
				<input v-else class="field" v-model="loginForm.email" placeholder="请输入邮箱" />
				<input class="field" v-model="loginForm.password" password placeholder="请输入密码" />
				<button class="primary-btn submit-btn" :disabled="loading" @click="submitLogin">{{ loading ? '登录中...' : '登录' }}</button>
			</view>

			<view v-else>
				<input class="field" v-model="registerForm.username" placeholder="用户名，2-20 个字符" />
				<input class="field" v-model="registerForm.phone" type="number" maxlength="11" placeholder="手机号" />
				<input class="field" v-model="registerForm.email" placeholder="邮箱" />
				<input class="field" v-model="registerForm.password" password placeholder="密码，至少 6 位且包含字母和数字" />
				<input class="field" v-model="registerForm.confirmPassword" password placeholder="确认密码" />
				<button class="primary-btn submit-btn" :disabled="loading" @click="submitRegister">{{ loading ? '注册中...' : '注册并登录' }}</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { setCurrentUser, userApi } from '@/common/api.js'

	const phonePattern = /^1[3-9]\d{9}$/
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

	export default {
		data() {
			return {
				mode: 'login',
				loginType: 'phone',
				loading: false,
				loginForm: {
					phone: '',
					email: '',
					password: ''
				},
				registerForm: {
					username: '',
					phone: '',
					email: '',
					password: '',
					confirmPassword: ''
				}
			}
		},
		methods: {
			switchMode(mode) {
				this.mode = mode
			},
			switchLoginType(type) {
				this.loginType = type
			},
			showMessage(message) {
				uni.showToast({ title: message, icon: 'none' })
			},
			validatePassword(password) {
				return password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password)
			},
			getLoginAccount() {
				return this.loginType === 'phone' ? this.loginForm.phone.trim() : this.loginForm.email.trim()
			},
			validateLogin() {
				const account = this.getLoginAccount()
				if (!account) return this.loginType === 'phone' ? '请输入手机号' : '请输入邮箱'
				if (this.loginType === 'phone' && !phonePattern.test(account)) return '手机号格式不正确'
				if (this.loginType === 'email' && !emailPattern.test(account)) return '邮箱格式不正确'
				if (!this.loginForm.password) return '请输入密码'
				return ''
			},
			validateRegister() {
				const form = this.registerForm
				const username = form.username.trim()
				const phone = form.phone.trim()
				const email = form.email.trim()
				if (username.length < 2 || username.length > 20) return '用户名需为 2-20 个字符'
				if (!phonePattern.test(phone)) return '手机号格式不正确'
				if (!emailPattern.test(email)) return '邮箱格式不正确'
				if (!this.validatePassword(form.password)) return '密码至少 6 位，且需包含字母和数字'
				if (form.password !== form.confirmPassword) return '两次输入的密码不一致'
				return ''
			},
			async submitLogin() {
				const error = this.validateLogin()
				if (error) {
					this.showMessage(error)
					return
				}
				this.loading = true
				try {
					const res = await userApi.loginByPassword(this.getLoginAccount(), this.loginForm.password)
					if (res.code !== 0) throw new Error(res.message || '登录失败')
					setCurrentUser(res.data)
					uni.showToast({ title: '登录成功', icon: 'success' })
					setTimeout(() => uni.switchTab({ url: '/pages/mine/mine' }), 500)
				} catch (error) {
					this.showMessage(error.message || '登录失败')
				} finally {
					this.loading = false
				}
			},
			async submitRegister() {
				const error = this.validateRegister()
				if (error) {
					this.showMessage(error)
					return
				}
				this.loading = true
				try {
					const form = this.registerForm
					const res = await userApi.register({
						username: form.username.trim(),
						phone: form.phone.trim(),
						email: form.email.trim(),
						password: form.password
					})
					if (res.code !== 0) throw new Error(res.message || '注册失败')
					setCurrentUser(res.data)
					uni.showToast({ title: '注册成功', icon: 'success' })
					setTimeout(() => uni.switchTab({ url: '/pages/mine/mine' }), 500)
				} catch (error) {
					this.showMessage(error.message || '注册失败')
				} finally {
					this.loading = false
				}
			}
		}
	}
</script>

<style>
	.auth-card {
		padding-bottom: 34rpx;
	}

	.title {
		font-size: 38rpx;
		font-weight: 700;
		margin-bottom: 12rpx;
	}

	.hint {
		color: #6b7280;
		line-height: 42rpx;
		margin-bottom: 26rpx;
	}

	.tabs {
		display: flex;
		background: #f3f4f6;
		border-radius: 12rpx;
		padding: 8rpx;
		margin-bottom: 24rpx;
	}

	.tab {
		flex: 1;
		height: 68rpx;
		line-height: 68rpx;
		text-align: center;
		border-radius: 8rpx;
		color: #6b7280;
	}

	.tab.active {
		background: #1677ff;
		color: #ffffff;
		font-weight: 700;
	}

	.login-type-tabs {
		display: flex;
		gap: 12rpx;
		margin-bottom: 18rpx;
	}

	.login-type {
		flex: 1;
		height: 64rpx;
		line-height: 64rpx;
		text-align: center;
		border-radius: 10rpx;
		color: #4b5563;
		background: #f9fafb;
		border: 1rpx solid #e5e7eb;
	}

	.login-type.active {
		color: #1677ff;
		background: #edf5ff;
		border-color: #1677ff;
		font-weight: 700;
	}

	.field {
		width: 100%;
		height: 82rpx;
		line-height: 82rpx;
		background: #f9fafb;
		border-radius: 10rpx;
		padding: 0 22rpx;
		margin-bottom: 18rpx;
		box-sizing: border-box;
	}

	.submit-btn {
		margin-top: 8rpx;
		height: 86rpx;
		line-height: 86rpx;
	}
</style>