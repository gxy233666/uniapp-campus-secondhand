<template>
	<view class="page">
		<view class="card auth-card">
			<!-- 标题区 -->
			<view class="brand-section">
				<text class="brand-icon">🛍️</text>
				<text class="title">校园二手</text>
				<text class="slogan">登录后即可发布交易</text>
			</view>

			<!-- 登录/注册切换 -->
			<view class="tabs">
				<view class="tab" :class="{ active: mode === 'login' }" @click="switchMode('login')">
					登录
				</view>
				<view class="tab" :class="{ active: mode === 'register' }" @click="switchMode('register')">
					注册
				</view>
			</view>

			<!-- 登录表单 -->
			<view v-if="mode === 'login'">
				<!-- 登录方式切换 -->
				<view class="login-type-tabs">
					<view
						class="login-type"
						:class="{ active: loginType === 'phone' }"
						@click="switchLoginType('phone')"
					>
						<text class="type-icon">📱</text> 手机号
					</view>
					<view
						class="login-type"
						:class="{ active: loginType === 'email' }"
						@click="switchLoginType('email')"
					>
						<text class="type-icon">✉️</text> 邮箱
					</view>
				</view>

				<!-- 手机号输入 -->
				<view class="input-wrapper" v-if="loginType === 'phone'">
					<text class="input-icon">📱</text>
					<input
						class="field"
						v-model="loginForm.phone"
						type="number"
						maxlength="11"
						placeholder="请输入手机号"
					/>
				</view>
				<!-- 邮箱输入 -->
				<view class="input-wrapper" v-else>
					<text class="input-icon">✉️</text>
					<input
						class="field"
						v-model="loginForm.email"
						placeholder="请输入邮箱"
					/>
				</view>
				<!-- 密码输入 -->
				<view class="input-wrapper">
					<text class="input-icon">🔒</text>
					<input
						class="field"
						v-model="loginForm.password"
						password
						placeholder="请输入密码"
					/>
				</view>

				<button
					class="primary-btn submit-btn"
					:disabled="loading"
					@click="submitLogin"
				>
					{{ loading ? '登录中...' : '登 录' }}
				</button>
			</view>

			<!-- 注册表单 -->
			<view v-else>
				<view class="input-wrapper">
					<text class="input-icon">👤</text>
					<input
						class="field"
						v-model="registerForm.username"
						placeholder="用户名，2-20 个字符"
					/>
				</view>

				<view class="input-wrapper">
					<text class="input-icon">📱</text>
					<input
						class="field"
						v-model="registerForm.phone"
						type="number"
						maxlength="11"
						placeholder="手机号"
					/>
				</view>

				<view class="input-wrapper">
					<text class="input-icon">✉️</text>
					<input
						class="field"
						v-model="registerForm.email"
						placeholder="邮箱"
					/>
				</view>

				<picker :range="schoolNames" @change="onSchoolChange">
					<view class="input-wrapper picker-input">
						<text class="input-icon">🏫</text>
						<text class="field picker-field">{{ selectedSchool ? selectedSchool.name : '请选择院校' }}</text>
						<text class="picker-arrow">›</text>
					</view>
				</picker>

				<view class="input-wrapper">
					<text class="input-icon">🔒</text>
					<input
						class="field"
						v-model="registerForm.password"
						password
						placeholder="密码，至少 6 位，含字母和数字"
					/>
				</view>

				<view class="input-wrapper">
					<text class="input-icon">🔒</text>
					<input
						class="field"
						v-model="registerForm.confirmPassword"
						password
						placeholder="确认密码"
					/>
				</view>

				<button
					class="primary-btn submit-btn"
					:disabled="loading"
					@click="submitRegister"
				>
					{{ loading ? '注册中...' : '注册并登录' }}
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { schoolApi, setCurrentUser, userApi } from '@/common/api.js'

	const phonePattern = /^1[3-9]\d{9}$/
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

	export default {
		data() {
			return {
				mode: 'login',
				loginType: 'phone',
				loading: false,
				schools: [],
				schoolIndex: -1,
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
		computed: {
			schoolNames() {
				return this.schools.map(item => `${item.name}（${item.province}）`)
			},
			selectedSchool() {
				return this.schoolIndex >= 0 ? this.schools[this.schoolIndex] : null
			}
		},
		onLoad() {
			this.loadSchools()
		},
		methods: {
			async loadSchools() {
				try {
					const res = await schoolApi.list()
					if (res.code !== 0) throw new Error(res.message || '院校加载失败')
					this.schools = res.data || []
				} catch (error) {
					uni.showToast({ title: error.message || '院校加载失败', icon: 'none' })
				}
			},
			switchMode(mode) {
				this.mode = mode
			},
			switchLoginType(type) {
				this.loginType = type
			},
			onSchoolChange(event) {
				this.schoolIndex = Number(event.detail.value)
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
				if (!this.selectedSchool) return '请选择院校'
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
						password: form.password,
						school_id: this.selectedSchool.school_id
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
	/* 页面背景 */
	.page {
		background: linear-gradient(160deg, #f0f4ff 0%, #e9f0fa 100%);
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 48rpx 32rpx;
		box-sizing: border-box;
	}

	/* 卡片 */
	.auth-card {
		width: 100%;
		background: #ffffff;
		border-radius: 40rpx;
		padding: 48rpx 36rpx 44rpx;
		box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.08);
	}

	/* 品牌标识区 */
	.brand-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 40rpx;
	}

	.brand-icon {
		font-size: 64rpx;
		margin-bottom: 12rpx;
	}

	.title {
		font-size: 40rpx;
		font-weight: 800;
		color: #1f2937;
		margin-bottom: 8rpx;
	}

	.slogan {
		font-size: 24rpx;
		color: #6b7280;
	}

	/* 切换标签 */
	.tabs {
		display: flex;
		background: #f3f4f6;
		border-radius: 24rpx;
		padding: 8rpx;
		margin-bottom: 36rpx;
	}

	.tab {
		flex: 1;
		height: 72rpx;
		line-height: 72rpx;
		text-align: center;
		border-radius: 20rpx;
		font-size: 30rpx;
		font-weight: 600;
		color: #6b7280;
		transition: all 0.2s;
	}

	.tab.active {
		background: #ffffff;
		color: #1677ff;
		box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.15);
	}

	/* 登录方式小标签 */
	.login-type-tabs {
		display: flex;
		gap: 16rpx;
		margin-bottom: 28rpx;
	}

	.login-type {
		flex: 1;
		height: 68rpx;
		line-height: 68rpx;
		text-align: center;
		border-radius: 20rpx;
		font-size: 26rpx;
		font-weight: 500;
		background: #f9fafb;
		color: #4b5563;
		border: 1rpx solid #e5e7eb;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
		transition: all 0.2s;
	}

	.login-type.active {
		background: #edf5ff;
		border-color: #1677ff;
		color: #1677ff;
		font-weight: 600;
	}

	.type-icon {
		font-size: 24rpx;
	}

	/* 输入框包装器 */
	.input-wrapper {
		display: flex;
		align-items: center;
		background: #f9fafb;
		border-radius: 20rpx;
		margin-bottom: 22rpx;
		padding: 0 24rpx;
		border: 1rpx solid #f3f4f6;
		transition: border 0.2s;
		position: relative;
	}

	.input-wrapper:focus-within {
		background: #ffffff;
		border-color: #1677ff;
		box-shadow: 0 0 0 4rpx rgba(22, 119, 255, 0.08);
	}

	.input-icon {
		font-size: 32rpx;
		margin-right: 16rpx;
		color: #6b7280;
	}

	.field {
		flex: 1;
		height: 86rpx;
		line-height: 86rpx;
		background: transparent;
		font-size: 28rpx;
		box-sizing: border-box;
	}

	/* picker 选择器样式 */
	.picker-input {
		display: flex;
		align-items: center;
	}

	.picker-field {
		color: #4b5563;
		flex: 1;
		padding-right: 20rpx;
	}

	.picker-arrow {
		font-size: 36rpx;
		color: #cbd5e1;
		font-weight: 300;
	}

	/* 提交按钮 */
	.submit-btn {
		margin-top: 12rpx;
		height: 92rpx;
		line-height: 92rpx;
		background: linear-gradient(135deg, #1677ff, #4096ff);
		color: #ffffff;
		border-radius: 28rpx;
		font-size: 32rpx;
		font-weight: 700;
		border: none;
		box-shadow: 0 8rpx 24rpx rgba(22, 119, 255, 0.3);
		transition: all 0.2s;
	}

	.submit-btn:active {
		transform: scale(0.97);
		box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.2);
	}
</style>