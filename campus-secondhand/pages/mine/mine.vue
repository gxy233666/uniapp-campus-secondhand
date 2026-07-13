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
		<view v-else-if="errorMessage" class="empty error-text">{{ errorMessage }}</view>
		<view v-else-if="currentList.length === 0" class="empty">{{ emptyText }}</view>
		<view v-else>
			<view
				v-for="item in currentList"
				:key="item._id"
				class="product-card"
				:class="{ 'offline-card': activeTab === 'products' && item.status !== '在售' }"
				@click="goDetail(item._id)"
			>
				<view class="product-main">
					<view class="product-title">{{ item.title }}</view>
					<view class="muted">{{ item.category }} · {{ item.condition }}</view>
					<view class="status-line">
						<text class="price">￥{{ item.price }}</text>
						<text v-if="activeTab === 'products'" class="status-tag" :class="{ offline: item.status !== '在售' }">{{ item.status }}</text>
					</view>
				</view>
				<view v-if="activeTab === 'products'" class="action-buttons">
					<button class="action-btn edit-btn" @click.stop="editProduct(item._id)">编辑</button>
					<button v-if="item.status === '在售'" class="action-btn status-btn" @click.stop="offlineProduct(item._id)">下架</button>
					<button class="action-btn delete-btn" @click.stop="deleteProduct(item._id)">删除</button>
				</view>
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
				loading: false,
				errorMessage: ''
			}
		},
		computed: {
			currentList() {
				return this.activeTab === 'products' ? this.myProducts : this.favorites
			},
			emptyText() {
				return this.activeTab === 'products' ? '暂无发布商品' : '暂无收藏商品'
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
				this.errorMessage = ''
				if (!this.user) return
				this.loading = true
				try {
					if (this.activeTab === 'products') {
						const res = await productApi.myList(this.user._id)
						if (res.code !== 0) throw new Error(res.message || '我的发布加载失败')
						this.myProducts = res.data || []
					} else {
						const res = await favoriteApi.list(this.user._id)
						if (res.code !== 0) throw new Error(res.message || '我的收藏加载失败')
						this.favorites = res.data || []
					}
				} catch (error) {
					this.errorMessage = error.message || '数据加载失败'
					uni.showToast({ title: this.errorMessage, icon: 'none' })
				} finally {
					this.loading = false
				}
			},
			goDetail(id) {
				uni.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` })
			},
			editProduct(id) {
				uni.navigateTo({ url: `/pages/product-edit/product-edit?id=${id}` })
			},
			async offlineProduct(id) {
				try {
					const res = await productApi.remove(id, this.user._id)
					if (res.code !== 0) throw new Error(res.message || '下架失败')
					uni.showToast({ title: '已下架', icon: 'none' })
					this.loadData()
				} catch (error) {
					uni.showToast({ title: error.message || '下架失败', icon: 'none' })
				}
			},
			deleteProduct(id) {
				uni.showModal({
					title: '确认删除',
					content: '删除后该商品将不再展示，是否继续？',
					success: async (res) => {
						if (!res.confirm) return
						try {
							const result = await productApi.deleteProduct(id, this.user._id)
							if (result.code !== 0) throw new Error(result.message || '删除失败')
							uni.showToast({ title: '已删除', icon: 'none' })
							this.loadData()
						} catch (error) {
							uni.showToast({ title: error.message || '删除失败', icon: 'none' })
						}
					}
				})
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

	.error-text {
		color: #ef4444;
	}

	.product-card {
		display: flex;
		flex-direction: column;
		gap: 18rpx;
		background: #ffffff;
		border-radius: 12rpx;
		padding: 22rpx;
		margin-bottom: 18rpx;
	}

	.product-card.offline-card {
		background: #f3f4f6;
		border: 1rpx solid #e5e7eb;
	}

	.product-main {
		min-width: 0;
		width: 100%;
	}

	.product-title {
		font-size: 30rpx;
		font-weight: 700;
		margin-bottom: 8rpx;
	}

	.offline-card .product-title,
	.offline-card .muted {
		color: #6b7280;
	}

	.status-line {
		display: flex;
		align-items: center;
		gap: 14rpx;
		margin-top: 8rpx;
	}

	.price {
		color: #ef4444;
		font-weight: 700;
	}

	.offline-card .price {
		color: #9ca3af;
	}

	.status-tag {
		padding: 4rpx 10rpx;
		border-radius: 8rpx;
		font-size: 22rpx;
		color: #1677ff;
		background: #edf5ff;
	}

	.status-tag.offline {
		color: #6b7280;
		background: #e5e7eb;
	}

	.action-buttons {
		display: flex;
		align-items: center;
		gap: 12rpx;
		width: 100%;
	}

	.action-btn {
		flex: 1;
		height: 60rpx;
		line-height: 60rpx;
		font-size: 24rpx;
		border-radius: 8rpx;
		padding: 0;
	}

	.edit-btn {
		color: #1677ff;
		background: #edf5ff;
	}

	.status-btn {
		color: #047857;
		background: #ecfdf5;
	}

	.delete-btn {
		color: #ef4444;
		background: #fff1f2;
	}
</style>