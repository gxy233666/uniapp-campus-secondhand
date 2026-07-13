<template>
	<view class="page">
		<view class="card profile-card">
			<view>
				<view class="username">{{ user ? user.username : '未登录' }}</view>
				<view class="muted">{{ user ? user.phone : '请选择模拟用户' }}</view>
			</view>
			<button class="switch-btn" @click="goLogin">切换用户</button>
		</view>

		<view class="tabs">
			<view class="tab" :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">我的发布</view>
			<view class="tab" :class="{ active: activeTab === 'favorites' }" @click="activeTab = 'favorites'">我的收藏</view>
		</view>

		<view v-if="loading" class="empty">加载中...</view>
		<view v-else-if="currentList.length === 0" class="empty">暂无数据</view>
		<view v-else>
			<view v-for="item in currentList" :key="item._id" class="product-card" @click="goDetail(item._id)">
				<view class="product-main">
					<view class="product-title">{{ item.title }}</view>
					<view class="muted">{{ item.category }} · {{ item.condition }}</view>
					<view class="price">￥{{ item.price }}</view>
				</view>
				<button v-if="activeTab === 'products'" class="remove-btn" @click.stop="removeProduct(item._id)">下架</button>
			</view>
		</view>
	</view>
</template>

<script>
	import { favoriteApi, getCurrentUser, productApi } from '@/common/api.js'

	export default {
		data() {
			return {
				user: null,
				activeTab: 'products',
				myProducts: [],
				favorites: [],
				loading: false
			}
		},
		computed: {
			currentList() {
				return this.activeTab === 'products' ? this.myProducts : this.favorites
			}
		},
		watch: {
			activeTab() {
				this.loadData()
			}
		},
		onShow() {
			this.user = getCurrentUser()
			this.loadData()
		},
		methods: {
			goLogin() {
				uni.navigateTo({ url: '/pages/login/login' })
			},
			async loadData() {
				if (!this.user) return
				this.loading = true
				try {
					if (this.activeTab === 'products') {
						const res = await productApi.myList(this.user._id)
						if (res.code !== 0) {
							throw new Error(res.message || '我的发布加载失败')
						}
						this.myProducts = res.data || []
					} else {
						const res = await favoriteApi.list(this.user._id)
						if (res.code !== 0) {
							throw new Error(res.message || '我的收藏加载失败')
						}
						this.favorites = res.data || []
					}
				} catch (error) {
					uni.showToast({ title: error.message || '数据加载失败', icon: 'none' })
				} finally {
					this.loading = false
				}
			},
			goDetail(id) {
				uni.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` })
			},
			async removeProduct(id) {
				try {
					const res = await productApi.remove(id, this.user._id)
					if (res.code !== 0) {
						throw new Error(res.message || '下架失败')
					}
					uni.showToast({ title: '已下架', icon: 'none' })
					this.loadData()
				} catch (error) {
					uni.showToast({ title: error.message || '下架失败', icon: 'none' })
				}
			}
		}
	}
</script>

<style>
	.profile-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 22rpx;
	}

	.username {
		font-size: 36rpx;
		font-weight: 700;
		margin-bottom: 8rpx;
	}

	.switch-btn {
		width: 180rpx;
		height: 68rpx;
		line-height: 68rpx;
		font-size: 26rpx;
		color: #1677ff;
		background: #edf5ff;
		border-radius: 10rpx;
	}

	.tabs {
		display: flex;
		background: #ffffff;
		border-radius: 12rpx;
		padding: 8rpx;
		margin-bottom: 20rpx;
	}

	.tab {
		flex: 1;
		text-align: center;
		height: 68rpx;
		line-height: 68rpx;
		border-radius: 8rpx;
		color: #6b7280;
	}

	.tab.active {
		background: #1677ff;
		color: #ffffff;
		font-weight: 700;
	}

	.empty {
		padding: 80rpx 0;
		text-align: center;
		color: #6b7280;
	}

	.product-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #ffffff;
		border-radius: 12rpx;
		padding: 22rpx;
		margin-bottom: 18rpx;
	}

	.product-main {
		min-width: 0;
		flex: 1;
	}

	.product-title {
		font-size: 30rpx;
		font-weight: 700;
		margin-bottom: 8rpx;
	}

	.price {
		color: #ef4444;
		font-weight: 700;
		margin-top: 8rpx;
	}

	.remove-btn {
		width: 120rpx;
		height: 64rpx;
		line-height: 64rpx;
		font-size: 24rpx;
		color: #ef4444;
		background: #fff1f2;
		border-radius: 8rpx;
	}
</style>
