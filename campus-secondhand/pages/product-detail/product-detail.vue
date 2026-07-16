<template>
	<view class="page">
		<view v-if="loading" class="empty loading-state">
			<view class="loading-spinner"></view>
			<text>商品加载中...</text>
		</view>

		<view v-else-if="errorMessage" class="empty error-state">
			<text class="empty-icon">!</text>
			<text class="error-text">{{ errorMessage }}</text>
		</view>

		<view v-else-if="product" class="content">
			<view class="hero-image-wrapper">
				<image class="hero-image" :src="product.image_url || defaultImage" mode="aspectFill"></image>
				<view class="status-badge" :class="{ offline: product.status !== '在售' }">{{ product.status }}</view>
			</view>

			<view class="card detail-card">
				<view class="title">{{ product.title }}</view>
				<view class="price">¥{{ product.price }}</view>
				<view class="meta">
					<view class="meta-item">{{ product.school_name || '未标注院校' }}</view>
					<view class="meta-item">{{ product.category }}</view>
					<view class="meta-item">{{ product.condition }}</view>
				</view>

				<view class="divider"></view>

				<view class="section">
					<text class="label">商品描述</text>
					<text class="description">{{ product.description || '卖家暂未填写详细描述' }}</text>
				</view>

				<view class="section">
					<text class="label">卖家信息</text>
					<view class="seller">
						<text class="seller-name">{{ product.seller_name }}</text>
						<text class="seller-contact protected">联系方式：提交购买意向并经卖家同意后可见</text>
					</view>
				</view>
			</view>

			<view class="card flow-card">
				<view class="flow-head">
					<text class="flow-title">交易流程</text>
					<text class="flow-note">平台申请，线下交易</text>
				</view>
				<view class="flow-steps">
					<view v-for="(step, index) in flowSteps" :key="step" class="flow-step" :class="{ active: index <= currentFlowIndex }">
						<view class="step-dot">{{ index + 1 }}</view>
						<text class="step-text">{{ step }}</text>
					</view>
				</view>
			</view>

			<view v-if="currentIntent" class="card intent-status-card">
				<view class="intent-status-head">
					<text class="intent-status-title">我的交易意向</text>
					<text class="intent-status-tag" :class="intentStatusClass(currentIntent)">{{ displayIntentStatus(currentIntent.status) }}</text>
				</view>
				<text class="intent-status-desc">{{ currentIntentDesc }}</text>
				<view v-if="canViewSellerContact" class="contact-box">
					<text class="contact-label">卖家联系方式</text>
					<text class="contact-value">{{ currentIntent.seller_contact || '暂无' }}</text>
					<button class="small-copy-btn" @click="copySellerContact">复制</button>
				</view>
			</view>

			<view class="action-row">
				<button class="ghost-btn" @click="toggleFavorite">{{ favored ? '已收藏' : '收藏' }}</button>
				<button class="primary-btn contact-btn" :disabled="contactButtonDisabled" @click="toggleIntentPanel">{{ contactButtonText }}</button>
			</view>

			<view v-if="showIntentPanel" class="card intent-card">
				<view class="intent-title">提交购买意向</view>
				<view class="intent-tip">卖家同意后，你可以在“我的-我想买的”中查看并复制卖家联系方式。</view>
				<textarea class="intent-textarea" v-model="intentMessage" maxlength="300" placeholder="给卖家留言，例如：你好，这件商品还在吗？"></textarea>
				<button class="submit-intent-btn" :disabled="submittingIntent" @click="submitIntent">{{ submittingIntent ? '提交中...' : '提交意向' }}</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { favoriteApi, getCurrentUser, intentApi, productApi } from '@/common/api.js'

	export default {
		data() {
			return {
				id: '',
				product: null,
				favored: false,
				currentIntent: null,
				loading: false,
				errorMessage: '',
				showIntentPanel: false,
				intentMessage: '',
				submittingIntent: false,
				flowSteps: ['提交意向', '卖家同意', '查看联系方式', '线下交易'],
				defaultImage: 'https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/uni@2x.png'
			}
		},
		computed: {
			currentUser() {
				return getCurrentUser()
			},
			isSeller() {
				return this.currentUser && this.product && this.currentUser._id === this.product.seller_id
			},
			canViewSellerContact() {
				return this.currentIntent && ['已同意', '已完成', '已联系'].includes(this.currentIntent.status)
			},
			currentFlowIndex() {
				if (!this.currentIntent) return -1
				const status = this.displayIntentStatus(this.currentIntent.status)
				if (status === '待确认') return 0
				if (status === '已同意') return 2
				if (status === '已完成') return 3
				return 0
			},
			currentIntentDesc() {
				if (!this.currentIntent) return ''
				const status = this.displayIntentStatus(this.currentIntent.status)
				const descMap = {
					'待确认': '已提交申请，正在等待卖家同意。卖家同意前不会显示联系方式。',
					'已同意': '卖家已同意联系，现在可以查看联系方式并线下沟通。',
					'已完成': '这条交易意向已完成，可作为交易记录保留。',
					'已取消': '这条交易意向已取消，若仍想购买可重新提交。'
				}
				return descMap[status] || '交易意向状态已更新。'
			},
			contactButtonDisabled() {
				return !this.product || this.product.status !== '在售' || this.isSeller
			},
			contactButtonText() {
				if (this.isSeller) return '自己发布的商品'
				if (this.product && this.product.status !== '在售') return '商品已下架'
				if (this.currentIntent) return '已提交意向'
				return '联系卖家'
			}
		},
		onLoad(options) {
			this.id = options.id || ''
			this.loadDetail()
		},
		methods: {
			async loadDetail() {
				if (!this.id) {
					this.errorMessage = '缺少商品ID'
					return
				}
				this.loading = true
				this.errorMessage = ''
				try {
					const res = await productApi.detail(this.id)
					if (res.code !== 0) throw new Error(res.message || '详情加载失败')
					this.product = res.data
					this.intentMessage = `你好，我对《${this.product.title}》感兴趣，想进一步了解一下。`
					await this.loadUserState()
				} catch (error) {
					this.product = null
					this.errorMessage = error.message || '详情加载失败'
					uni.showToast({ title: this.errorMessage, icon: 'none' })
				} finally {
					this.loading = false
				}
			},
			async loadUserState() {
				const user = getCurrentUser()
				this.favored = false
				this.currentIntent = null
				if (!user) return

				const favoriteRes = await favoriteApi.check(user._id, this.id)
				if (favoriteRes.code !== 0) throw new Error(favoriteRes.message || '收藏状态加载失败')
				this.favored = !!favoriteRes.data

				if (this.product && this.product.seller_id !== user._id) {
					const intentRes = await intentApi.listBuyer(user._id)
					if (intentRes.code !== 0) throw new Error(intentRes.message || '交易意向加载失败')
					this.currentIntent = (intentRes.data || []).find(item => item.product_id === this.id && item.status !== '已取消') || null
				}
			},
			async toggleFavorite() {
				const user = getCurrentUser()
				if (!user) {
					uni.navigateTo({ url: '/pages/login/login' })
					return
				}
				try {
					let res
					if (this.favored) {
						res = await favoriteApi.remove(user._id, this.id)
						if (res.code !== 0) throw new Error(res.message || '取消收藏失败')
						this.favored = false
					} else {
						res = await favoriteApi.add(user._id, this.id)
						if (res.code !== 0) throw new Error(res.message || '收藏失败')
						this.favored = true
					}
					uni.showToast({ title: this.favored ? '已收藏' : '已取消', icon: 'none' })
				} catch (error) {
					uni.showToast({ title: error.message || '操作失败', icon: 'none' })
				}
			},
			toggleIntentPanel() {
				const user = getCurrentUser()
				if (!user) {
					uni.navigateTo({ url: '/pages/login/login' })
					return
				}
				if (this.product && this.product.status !== '在售') {
					uni.showToast({ title: '该商品已下架', icon: 'none' })
					return
				}
				if (this.isSeller) {
					uni.showToast({ title: '不能联系自己发布的商品', icon: 'none' })
					return
				}
				if (this.currentIntent) {
					uni.showToast({ title: this.currentIntentDesc, icon: 'none' })
					return
				}
				this.showIntentPanel = !this.showIntentPanel
			},
			async submitIntent() {
				const user = getCurrentUser()
				if (!user) {
					uni.navigateTo({ url: '/pages/login/login' })
					return
				}
				this.submittingIntent = true
				try {
					const res = await intentApi.add({
						product_id: this.id,
						buyer_id: user._id,
						buyer_name: user.username,
						buyer_contact: user.phone || user.email || '',
						message: this.intentMessage
					})
					if (res.code !== 0) throw new Error(res.message || '提交失败')
					this.currentIntent = res.data || null
					uni.showModal({
						title: '意向已提交',
						content: '请等待卖家同意。卖家同意后，你可以在“我的-我想买的”查看联系方式。',
						showCancel: false
					})
					this.showIntentPanel = false
				} catch (error) {
					uni.showToast({ title: error.message || '提交失败', icon: 'none' })
				} finally {
					this.submittingIntent = false
				}
			},
			displayIntentStatus(status) {
				if (status === '待联系') return '待确认'
				if (status === '已联系') return '已同意'
				return status || '待确认'
			},
			intentStatusClass(item) {
				const status = this.displayIntentStatus(item.status)
				return {
					pending: status === '待确认',
					approved: status === '已同意',
					done: status === '已完成',
					cancelled: status === '已取消'
				}
			},
			copySellerContact() {
				if (!this.canViewSellerContact || !this.currentIntent.seller_contact) {
					uni.showToast({ title: '暂无联系方式', icon: 'none' })
					return
				}
				uni.setClipboardData({ data: this.currentIntent.seller_contact })
			}
		}
	}
</script>

<style>
	.page {
		background: linear-gradient(160deg, #f5f7fa 0%, #e9edf5 100%);
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	.empty {
		padding: 200rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #6b7280;
		font-size: 28rpx;
		gap: 20rpx;
	}

	.empty-icon {
		font-size: 80rpx;
		opacity: 0.8;
	}

	.error-text {
		color: #ef4444;
	}

	.loading-spinner {
		width: 48rpx;
		height: 48rpx;
		border: 4rpx solid #e5e7eb;
		border-top-color: #1677ff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.hero-image-wrapper {
		position: relative;
		width: 100%;
		height: 480rpx;
	}

	.hero-image {
		width: 100%;
		height: 100%;
		background: #eef2f7;
		border-radius: 0 0 32rpx 32rpx;
	}

	.status-badge {
		position: absolute;
		top: 24rpx;
		right: 24rpx;
		background: rgba(22, 119, 255, 0.9);
		color: #ffffff;
		font-size: 24rpx;
		font-weight: 600;
		padding: 6rpx 20rpx;
		border-radius: 20rpx;
	}

	.status-badge.offline {
		background: rgba(107, 114, 128, 0.85);
	}

	.content {
		margin-top: -30rpx;
		position: relative;
		z-index: 2;
		padding: 0 28rpx;
	}

	.detail-card,
	.flow-card,
	.intent-status-card,
	.intent-card {
		background: #ffffff;
		border-radius: 32rpx;
		padding: 36rpx 28rpx;
		box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.06);
	}

	.flow-card,
	.intent-status-card,
	.intent-card {
		margin-top: 24rpx;
	}

	.title {
		font-size: 40rpx;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 16rpx;
		line-height: 1.3;
	}

	.price {
		color: #f43f5e;
		font-size: 48rpx;
		font-weight: 800;
		margin-bottom: 24rpx;
	}

	.meta {
		display: flex;
		gap: 14rpx;
		flex-wrap: wrap;
		margin-bottom: 10rpx;
	}

	.meta-item {
		background: #f3f4f6;
		border-radius: 16rpx;
		padding: 10rpx 20rpx;
		font-size: 24rpx;
		color: #374151;
	}

	.divider {
		height: 1rpx;
		background: #f3f4f6;
		margin: 28rpx 0;
	}

	.section {
		margin-bottom: 28rpx;
	}

	.section:last-child {
		margin-bottom: 0;
	}

	.label {
		font-size: 30rpx;
		font-weight: 700;
		color: #1f2937;
		display: block;
		margin-bottom: 16rpx;
	}

	.description {
		color: #4b5563;
		font-size: 28rpx;
		line-height: 44rpx;
		display: block;
	}

	.seller {
		display: flex;
		flex-direction: column;
		background: #f9fafb;
		border-radius: 20rpx;
		padding: 20rpx 24rpx;
	}

	.seller-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #1f2937;
		margin-bottom: 8rpx;
	}

	.seller-contact {
		font-size: 26rpx;
		color: #1677ff;
	}

	.seller-contact.protected {
		color: #6b7280;
	}

	.flow-head,
	.intent-status-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
		margin-bottom: 24rpx;
	}

	.flow-title,
	.intent-status-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #1f2937;
	}

	.flow-note {
		font-size: 24rpx;
		color: #6b7280;
	}

	.flow-steps {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10rpx;
	}

	.flow-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10rpx;
		color: #9ca3af;
		font-size: 22rpx;
		text-align: center;
	}

	.step-dot {
		width: 44rpx;
		height: 44rpx;
		line-height: 44rpx;
		border-radius: 50%;
		background: #e5e7eb;
		color: #6b7280;
		font-size: 22rpx;
		font-weight: 700;
	}

	.flow-step.active {
		color: #1677ff;
		font-weight: 600;
	}

	.flow-step.active .step-dot {
		background: #1677ff;
		color: #ffffff;
	}

	.intent-status-tag {
		font-size: 24rpx;
		font-weight: 700;
		padding: 8rpx 18rpx;
		border-radius: 16rpx;
		color: #1677ff;
		background: #edf5ff;
	}

	.intent-status-tag.pending {
		color: #b45309;
		background: #fffbeb;
	}

	.intent-status-tag.approved {
		color: #047857;
		background: #ecfdf5;
	}

	.intent-status-tag.done {
		color: #1677ff;
		background: #edf5ff;
	}

	.intent-status-tag.cancelled {
		color: #6b7280;
		background: #e5e7eb;
	}

	.intent-status-desc {
		display: block;
		font-size: 26rpx;
		color: #4b5563;
		line-height: 40rpx;
	}

	.contact-box {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 8rpx 16rpx;
		align-items: center;
		margin-top: 20rpx;
		padding: 18rpx 20rpx;
		background: #f9fafb;
		border-radius: 18rpx;
	}

	.contact-label {
		font-size: 24rpx;
		color: #6b7280;
		grid-column: 1 / 2;
	}

	.contact-value {
		font-size: 28rpx;
		font-weight: 700;
		color: #1f2937;
		grid-column: 1 / 2;
	}

	.small-copy-btn {
		grid-column: 2 / 3;
		grid-row: 1 / 3;
		width: 120rpx;
		height: 64rpx;
		line-height: 64rpx;
		border-radius: 18rpx;
		font-size: 24rpx;
		background: #edf5ff;
		color: #1677ff;
	}

	.action-row {
		display: flex;
		gap: 20rpx;
		margin-top: 32rpx;
		padding: 0 28rpx;
	}

	.ghost-btn,
	.contact-btn {
		flex: 1;
		height: 90rpx;
		line-height: 90rpx;
		font-size: 30rpx;
		border-radius: 24rpx;
		font-weight: 600;
		border: none;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
	}

	.ghost-btn {
		background: #ffffff;
		color: #1677ff;
		border: 2rpx solid #bfdbfe;
	}

	.contact-btn {
		background: linear-gradient(135deg, #1677ff, #4096ff);
		color: #ffffff;
		box-shadow: 0 8rpx 24rpx rgba(22, 119, 255, 0.25);
	}

	.contact-btn[disabled] {
		background: #d1d5db;
		color: #ffffff;
	}

	.intent-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 10rpx;
	}

	.intent-tip {
		font-size: 26rpx;
		color: #6b7280;
		line-height: 40rpx;
		margin-bottom: 18rpx;
	}

	.intent-textarea {
		width: 100%;
		height: 160rpx;
		background: #f9fafb;
		border-radius: 18rpx;
		padding: 20rpx;
		box-sizing: border-box;
		font-size: 28rpx;
		line-height: 42rpx;
		margin-bottom: 18rpx;
	}

	.submit-intent-btn {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 18rpx;
		font-size: 28rpx;
		font-weight: 600;
		background: #1677ff;
		color: #ffffff;
	}
</style>