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

			<view class="action-row">
				<button class="ghost-btn" @click="toggleFavorite">{{ favored ? '已收藏' : '收藏' }}</button>
				<button class="primary-btn contact-btn" :disabled="product.status !== '在售'" @click="toggleIntentPanel">联系卖家</button>
			</view>

			<view v-if="showIntentPanel" class="card intent-card">
				<view class="intent-title">提交购买意向</view>
				<view class="intent-tip">卖家同意后，你可以在“我的-我想买的”中查看并复制卖家联系方式，再进行线下沟通和交易。</view>
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
				loading: false,
				errorMessage: '',
				showIntentPanel: false,
				intentMessage: '',
				submittingIntent: false,
				defaultImage: 'https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/uni@2x.png'
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
					const user = getCurrentUser()
					if (user) {
						const favoriteRes = await favoriteApi.check(user._id, this.id)
						if (favoriteRes.code !== 0) throw new Error(favoriteRes.message || '收藏状态加载失败')
						this.favored = !!favoriteRes.data
					}
				} catch (error) {
					this.product = null
					this.errorMessage = error.message || '详情加载失败'
					uni.showToast({ title: this.errorMessage, icon: 'none' })
				} finally {
					this.loading = false
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
				if (this.product && this.product.seller_id === user._id) {
					uni.showToast({ title: '不能联系自己发布的商品', icon: 'none' })
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
	.intent-card {
		background: #ffffff;
		border-radius: 32rpx;
		padding: 36rpx 28rpx;
		box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.06);
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

	.intent-card {
		margin-top: 24rpx;
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