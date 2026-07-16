<template>
	<view class="page">
		<!-- 用户信息卡片 -->
		<view class="card profile-card">
			<view class="avatar-placeholder">
				<text class="avatar-emoji">👤</text>
			</view>
			<view class="profile-info">
				<view class="username">{{ user ? user.username : '未登录' }}</view>
				<view class="muted">{{ user ? user.phone : '请先登录账号' }}</view>
				<view v-if="user && user.school_name" class="school-badge">
					<text class="school-icon">🎓</text>
					{{ user.school_name }}
				</view>
			</view>
			<view class="profile-actions">
				<button class="switch-btn" @click="goLogin">{{ user ? '切换' : '登录' }}</button>
				<button v-if="user" class="logout-btn" @click="logout">退出</button>
			</view>
		</view>

		<!-- 标签切换 -->
		<view class="tabs">
			<view class="tab" :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">
				我的发布
			</view>
			<view class="tab" :class="{ active: activeTab === 'favorites' }" @click="activeTab = 'favorites'">
				我的收藏
			</view>
		</view>

		<!-- 加载/错误/空状态 -->
		<view v-if="loading" class="empty loading-state">
			<view class="loading-spinner"></view>
			<text>加载中...</text>
		</view>
		<view v-else-if="errorMessage" class="empty error-state">
			<text class="empty-icon">⚠️</text>
			<text class="error-text">{{ errorMessage }}</text>
		</view>
		<view v-else-if="currentList.length === 0" class="empty empty-state">
			<text class="empty-icon">📭</text>
			<text>{{ emptyText }}</text>
		</view>

		<!-- 商品/收藏列表 -->
		<view v-else class="list-container">
			<view
				v-for="item in currentList"
				:key="item._id"
				class="product-card"
				:class="{ 'offline-card': activeTab === 'products' && item.status !== '在售' }"
				@click="goDetail(item._id)"
			>
				<image
					class="product-image"
					:src="item.image_url || defaultImage"
					mode="aspectFill"
				></image>
				<view class="product-main">
					<view class="product-title">{{ item.title }}</view>
					<view class="product-meta">
						{{ item.school_name || '未标注院校' }} · {{ item.category }} · {{ item.condition }}
					</view>
					<view class="status-line">
						<text class="price">¥{{ item.price }}</text>
						<text v-if="activeTab === 'products'" class="status-tag" :class="{ offline: item.status !== '在售' }">
							{{ item.status }}
						</text>
					</view>
				</view>
				<!-- 操作按钮组 -->
				<view v-if="activeTab === 'products'" class="action-buttons">
					<button class="action-btn edit-btn" @click.stop="editProduct(item._id)">
						<text class="btn-icon">✎</text> 编辑
					</button>
					<button v-if="item.status === '在售'" class="action-btn status-btn" @click.stop="offlineProduct(item._id)">
						<text class="btn-icon">↓</text> 下架
					</button>
					<button class="action-btn delete-btn" @click.stop="deleteProduct(item._id)">
						<text class="btn-icon">✕</text> 删除
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { clearCurrentUser, favoriteApi, getCurrentUser, productApi } from '@/common/api.js'

	export default {
		data() {
			return {
				user: null,
				activeTab: 'products',
				myProducts: [],
				favorites: [],
				loading: false,
				errorMessage: '',
				defaultImage: 'https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/uni@2x.png'
			}
		},
		computed: {
			currentList() {
				return this.activeTab === 'products' ? this.myProducts : this.favorites
			},
			emptyText() {
				if (!this.user) return '登录后查看数据'
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
			logout() {
				uni.showModal({
					title: '退出登录',
					content: '退出后将清空当前账号状态，是否继续？',
					success: (res) => {
						if (!res.confirm) return
						clearCurrentUser()
						this.user = null
						this.myProducts = []
						this.favorites = []
						this.errorMessage = ''
						this.activeTab = 'products'
						uni.showToast({ title: '已退出登录', icon: 'none' })
					}
				})
			},
			async loadData() {
				this.errorMessage = ''
				if (!this.user) {
					this.myProducts = []
					this.favorites = []
					return
				}
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
	/* 页面背景 */
	.page {
		background: linear-gradient(160deg, #f5f7fa 0%, #e9edf5 100%);
		min-height: 100vh;
		padding: 32rpx 28rpx;
		box-sizing: border-box;
	}

	/* 用户卡片 */
	.profile-card {
		display: flex;
		align-items: center;
		gap: 24rpx;
		padding: 32rpx 28rpx;
		margin-bottom: 28rpx;
		background: #ffffff;
		border-radius: 28rpx;
		box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.04);
	}

	.avatar-placeholder {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #e8f0fe, #d0e2ff);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.avatar-emoji {
		font-size: 48rpx;
	}

	.profile-info {
		flex: 1;
		min-width: 0;
	}

	.username {
		font-size: 36rpx;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 6rpx;
	}

	.muted {
		font-size: 26rpx;
		color: #6b7280;
		margin-bottom: 10rpx;
	}

	.school-badge {
		display: inline-flex;
		align-items: center;
		background: #edf5ff;
		color: #1677ff;
		padding: 6rpx 16rpx;
		border-radius: 14rpx;
		font-size: 24rpx;
		font-weight: 500;
		gap: 6rpx;
	}

	.school-icon {
		font-size: 22rpx;
	}

	.profile-actions {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
		flex-shrink: 0;
	}

	.switch-btn,
	.logout-btn {
		width: 130rpx;
		height: 60rpx;
		line-height: 60rpx;
		font-size: 24rpx;
		border-radius: 20rpx;
		padding: 0;
		text-align: center;
		font-weight: 500;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
	}

	.switch-btn {
		color: #1677ff;
		background: #edf5ff;
	}

	.logout-btn {
		color: #ef4444;
		background: #fff1f2;
	}

	/* 标签切换 */
	.tabs {
		display: flex;
		background: #ffffff;
		border-radius: 22rpx;
		padding: 8rpx;
		margin-bottom: 28rpx;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
	}

	.tab {
		flex: 1;
		text-align: center;
		height: 72rpx;
		line-height: 72rpx;
		border-radius: 18rpx;
		font-size: 28rpx;
		color: #6b7280;
		transition: all 0.2s;
		font-weight: 500;
	}

	.tab.active {
		background: linear-gradient(135deg, #1677ff, #4096ff);
		color: #ffffff;
		font-weight: 700;
		box-shadow: 0 4rpx 12rpx rgba(22,119,255,0.25);
	}

	/* 空状态/加载/错误 */
	.empty {
		padding: 120rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #6b7280;
		font-size: 28rpx;
		gap: 16rpx;
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
		margin-bottom: 12rpx;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* 商品卡片 */
	.list-container {
		margin-top: 8rpx;
	}

	.product-card {
		display: flex;
		flex-wrap: wrap;
		background: #ffffff;
		border-radius: 24rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
		transition: all 0.2s;
		gap: 20rpx;
		align-items: center;
	}

	.product-card:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
	}

	.product-card.offline-card {
		background: #f9fafb;
		border: 1rpx solid #e5e7eb;
		opacity: 0.85;
	}

	.product-image {
		width: 140rpx;
		height: 140rpx;
		border-radius: 16rpx;
		background: #eef2f7;
		flex-shrink: 0;
	}

	.product-main {
		flex: 1;
		min-width: 0;
	}

	.product-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 8rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.offline-card .product-title {
		color: #6b7280;
	}

	.product-meta {
		font-size: 24rpx;
		color: #9ca3af;
		margin-bottom: 10rpx;
	}

	.status-line {
		display: flex;
		align-items: center;
		gap: 14rpx;
	}

	.price {
		color: #f43f5e;
		font-size: 32rpx;
		font-weight: 700;
	}

	.offline-card .price {
		color: #9ca3af;
	}

	.status-tag {
		font-size: 22rpx;
		padding: 4rpx 14rpx;
		border-radius: 10rpx;
		color: #1677ff;
		background: #edf5ff;
	}

	.status-tag.offline {
		color: #6b7280;
		background: #e5e7eb;
	}

	/* 操作按钮组 */
	.action-buttons {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		gap: 14rpx;
		margin-top: 8rpx;
	}

	.action-btn {
		height: 58rpx;
		line-height: 58rpx;
		font-size: 24rpx;
		border-radius: 16rpx;
		padding: 0 20rpx;
		display: flex;
		align-items: center;
		gap: 6rpx;
		background: #f3f4f6;
		color: #4b5563;
		font-weight: 500;
		box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.04);
	}

	.btn-icon {
		font-size: 22rpx;
	}

	.edit-btn {
		background: #edf5ff;
		color: #1677ff;
	}

	.status-btn {
		background: #ecfdf5;
		color: #047857;
	}

	.delete-btn {
		background: #fff1f2;
		color: #ef4444;
	}
</style>