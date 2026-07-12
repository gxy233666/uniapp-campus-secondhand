<template>
	<view class="page">
		<view v-if="!product" class="empty">商品加载中...</view>
		<view v-else>
			<image class="hero-image" :src="product.image_url || defaultImage" mode="aspectFill"></image>
			<view class="card detail-card">
				<view class="title">{{ product.title }}</view>
				<view class="price">￥{{ product.price }}</view>
				<view class="meta">
					<text>{{ product.category }}</text>
					<text>{{ product.condition }}</text>
					<text>{{ product.status }}</text>
				</view>
				<view class="label">商品描述</view>
				<view class="description">{{ product.description }}</view>
				<view class="label">卖家信息</view>
				<view class="seller">{{ product.seller_name }} · {{ product.contact }}</view>
			</view>
			<view class="action-row">
				<button class="ghost-btn" @click="toggleFavorite">{{ favored ? '取消收藏' : '收藏商品' }}</button>
				<button class="primary-btn contact-btn" @click="copyContact">复制联系方式</button>
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
				defaultImage: 'https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/uni@2x.png'
			}
		},
		onLoad(options) {
			this.id = options.id
			this.loadDetail()
		},
		methods: {
			async loadDetail() {
				try {
					const res = await productApi.detail(this.id)
					this.product = res.data
					const user = getCurrentUser()
					if (user) {
						const favoriteRes = await favoriteApi.check(user._id, this.id)
						this.favored = !!favoriteRes.data
					}
				} catch (error) {
					uni.showToast({ title: '详情加载失败', icon: 'none' })
				}
			},
			async toggleFavorite() {
				const user = getCurrentUser()
				if (!user) {
					uni.navigateTo({ url: '/pages/login/login' })
					return
				}
				try {
					if (this.favored) {
						await favoriteApi.remove(user._id, this.id)
						this.favored = false
					} else {
						await favoriteApi.add(user._id, this.id)
						this.favored = true
					}
					uni.showToast({ title: this.favored ? '已收藏' : '已取消', icon: 'none' })
				} catch (error) {
					uni.showToast({ title: '操作失败', icon: 'none' })
				}
			},
			copyContact() {
				uni.setClipboardData({ data: this.product.contact || '' })
			}
		}
	}
</script>

<style>
	.empty {
		padding-top: 120rpx;
		text-align: center;
		color: #6b7280;
	}

	.hero-image {
		width: 100%;
		height: 420rpx;
		border-radius: 12rpx;
		background: #eef2f7;
	}

	.detail-card {
		margin-top: 20rpx;
	}

	.title {
		font-size: 40rpx;
		font-weight: 700;
		margin-bottom: 16rpx;
	}

	.price {
		color: #ef4444;
		font-size: 44rpx;
		font-weight: 700;
		margin-bottom: 18rpx;
	}

	.meta {
		display: flex;
		gap: 16rpx;
		flex-wrap: wrap;
		color: #1677ff;
		margin-bottom: 28rpx;
	}

	.label {
		font-size: 30rpx;
		font-weight: 700;
		margin: 26rpx 0 12rpx;
	}

	.description,
	.seller {
		color: #4b5563;
		line-height: 44rpx;
	}

	.action-row {
		display: flex;
		gap: 20rpx;
		margin-top: 24rpx;
	}

	.ghost-btn,
	.contact-btn {
		flex: 1;
		height: 84rpx;
		line-height: 84rpx;
		font-size: 30rpx;
		border-radius: 10rpx;
	}

	.ghost-btn {
		background: #ffffff;
		color: #1677ff;
		border: 1rpx solid #bfdbfe;
	}
</style>
