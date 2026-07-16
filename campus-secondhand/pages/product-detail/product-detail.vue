<template>
	<view class="page">
		<!-- 加载状态 -->
		<view v-if="loading" class="empty loading-state">
			<view class="loading-spinner"></view>
			<text>商品加载中...</text>
		</view>

		<!-- 错误状态 -->
		<view v-else-if="errorMessage" class="empty error-state">
			<text class="empty-icon">⚠️</text>
			<text class="error-text">{{ errorMessage }}</text>
		</view>

		<!-- 商品详情 -->
		<view v-else-if="product" class="content">
			<!-- 商品图片 -->
			<view class="hero-image-wrapper">
				<image
					class="hero-image"
					:src="product.image_url || defaultImage"
					mode="aspectFill"
				></image>
				<!-- 状态标签浮于图片上 -->
				<view class="status-badge" :class="{ offline: product.status !== '在售' }">
					{{ product.status }}
				</view>
			</view>

			<!-- 商品基本信息卡片 -->
			<view class="card detail-card">
				<view class="title">{{ product.title }}</view>
				<view class="price">¥{{ product.price }}</view>
				<view class="meta">
					<view class="meta-item">
						<text class="meta-icon">🏫</text>
						{{ product.school_name || '未标注院校' }}
					</view>
					<view class="meta-item">
						<text class="meta-icon">📦</text>
						{{ product.category }}
					</view>
					<view class="meta-item">
						<text class="meta-icon">✨</text>
						{{ product.condition }}
					</view>
				</view>

				<!-- 分隔线 -->
				<view class="divider"></view>

				<!-- 商品描述 -->
				<view class="section">
					<text class="label">📋 商品描述</text>
					<text class="description">{{ product.description }}</text>
				</view>

				<!-- 卖家信息 -->
				<view class="section">
					<text class="label">👤 卖家信息</text>
					<view class="seller">
						<text class="seller-name">{{ product.seller_name }}</text>
						<text class="seller-contact">{{ product.contact }}</text>
					</view>
				</view>
			</view>

			<!-- 底部操作按钮 -->
			<view class="action-row">
				<button class="ghost-btn" @click="toggleFavorite">
					<text class="btn-icon">{{ favored ? '❤️' : '🤍' }}</text>
					{{ favored ? '已收藏' : '收藏' }}
				</button>
				<button class="primary-btn contact-btn" @click="copyContact">
					<text class="btn-icon">📞</text>
					联系卖家
				</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { favoriteApi, getCurrentUser, productApi } from '@/common/api.js'

	export default {
		data() {
			return {
				id: '',
				product: null,
				favored: false,
				loading: false,
				errorMessage: '',
				defaultImage: 'https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/uni@2x.png'
			}
		},
		onLoad(options) {
			this.id = options.id
			this.loadDetail()
		},
		methods: {
			async loadDetail() {
				this.loading = true
				this.errorMessage = ''
				try {
					const res = await productApi.detail(this.id)
					if (res.code !== 0) throw new Error(res.message || '详情加载失败')
					this.product = res.data
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
			copyContact() {
				uni.setClipboardData({ data: this.product.contact || '' })
			}
		}
	}
</script>

<style>
	/* 全局页面背景 */
	.page {
		background: linear-gradient(160deg, #f5f7fa 0%, #e9edf5 100%);
		min-height: 100vh;
		padding-bottom: 40rpx;
	}

	/* 空状态/加载/错误 */
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

	/* 商品图片区域 */
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
		backdrop-filter: blur(8rpx);
	}

	.status-badge.offline {
		background: rgba(107, 114, 128, 0.85);
	}

	/* 详情卡片 */
	.content {
		margin-top: -30rpx;
		position: relative;
		z-index: 2;
		padding: 0 28rpx;
	}

	.detail-card {
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

	/* 元信息标签 */
	.meta {
		display: flex;
		gap: 14rpx;
		flex-wrap: wrap;
		margin-bottom: 10rpx;
	}

	.meta-item {
		display: flex;
		align-items: center;
		background: #f3f4f6;
		border-radius: 16rpx;
		padding: 10rpx 20rpx;
		font-size: 24rpx;
		color: #374151;
		gap: 6rpx;
	}

	.meta-icon {
		font-size: 22rpx;
	}

	/* 分隔线 */
	.divider {
		height: 1rpx;
		background: #f3f4f6;
		margin: 28rpx 0;
	}

	/* 描述与卖家信息分区 */
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

	/* 底部操作按钮 */
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
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
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

	.ghost-btn:active,
	.contact-btn:active {
		transform: scale(0.97);
		opacity: 0.9;
	}

	.btn-icon {
		font-size: 28rpx;
	}
</style>