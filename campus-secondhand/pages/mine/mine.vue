<template>
	<view class="page">
		<view class="card profile-card">
			<view class="avatar-placeholder">
				<text class="avatar-text">{{ avatarText }}</text>
			</view>
			<view class="profile-info">
				<view class="username">{{ user ? user.username : '未登录' }}</view>
				<view class="muted">{{ user ? userContactText : '请先登录账号' }}</view>
				<view v-if="user && user.school_name" class="school-badge">{{ user.school_name }}</view>
			</view>
			<view class="profile-actions">
				<button class="switch-btn" @click="goLogin">{{ user ? '切换' : '登录' }}</button>
				<button v-if="user" class="logout-btn" @click="logout">退出</button>
			</view>
		</view>

		<scroll-view class="tabs-scroll" scroll-x>
			<view class="tabs">
				<view class="tab" :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">我的发布</view>
				<view class="tab" :class="{ active: activeTab === 'favorites' }" @click="activeTab = 'favorites'">我的收藏</view>
				<view class="tab" :class="{ active: activeTab === 'buyerIntents' }" @click="activeTab = 'buyerIntents'">我想买的</view>
				<view class="tab" :class="{ active: activeTab === 'sellerIntents' }" @click="activeTab = 'sellerIntents'">收到意向</view>
			</view>
		</scroll-view>

		<view v-if="isIntentTab" class="intent-guide">
			<view class="guide-title">{{ intentGuideTitle }}</view>
			<view class="guide-flow">
				<text>提交意向</text>
				<text>卖家同意</text>
				<text>查看联系方式</text>
				<text>线下交易</text>
			</view>
		</view>

		<view v-if="loading" class="empty loading-state">
			<view class="loading-spinner"></view>
			<text>加载中...</text>
		</view>
		<view v-else-if="errorMessage" class="empty error-state">
			<text class="empty-icon">!</text>
			<text class="error-text">{{ errorMessage }}</text>
		</view>
		<view v-else-if="currentList.length === 0" class="empty empty-state">
			<text class="empty-icon">空</text>
			<text>{{ emptyText }}</text>
		</view>

		<view v-else class="list-container">
			<view
				v-for="item in currentList"
				:key="item._id"
				class="product-card"
				:class="{ 'offline-card': activeTab === 'products' && item.status !== '在售' }"
				@click="goItemDetail(item)"
			>
				<image class="product-image" :src="itemImage(item)" mode="aspectFill"></image>
				<view class="product-main">
					<view class="product-title-row">
						<view class="product-title">{{ itemTitle(item) }}</view>
						<text v-if="isIntentTab" class="status-tag" :class="intentStatusClass(item)">{{ displayIntentStatus(item.status) }}</text>
					</view>
					<view class="product-meta">{{ itemMeta(item) }}</view>
					<view class="status-line">
						<text class="price">¥{{ itemPrice(item) }}</text>
						<text v-if="activeTab === 'products'" class="status-tag" :class="{ offline: item.status !== '在售' }">{{ item.status }}</text>
					</view>
					<view v-if="isIntentTab" class="intent-summary">
						<view class="intent-summary-title">{{ intentStageTitle(item) }}</view>
						<view class="intent-message">留言：{{ item.message }}</view>
						<view class="contact-hint">{{ intentContactHint(item) }}</view>
					</view>
				</view>

				<view v-if="activeTab === 'products'" class="action-buttons">
					<button class="action-btn edit-btn" @click.stop="editProduct(item._id)">编辑</button>
					<button v-if="item.status === '在售'" class="action-btn status-btn" @click.stop="offlineProduct(item._id)">下架</button>
					<button class="action-btn delete-btn" @click.stop="deleteProduct(item._id)">删除</button>
				</view>

				<view v-if="isIntentTab" class="action-buttons">
					<button class="action-btn copy-btn" @click.stop="copyIntentContact(item)">{{ copyButtonText(item) }}</button>
					<button v-if="canApproveIntent(item)" class="action-btn status-btn important-btn" @click.stop="updateIntentStatus(item, '已同意')">同意联系</button>
					<button v-if="canCompleteIntent(item)" class="action-btn edit-btn" @click.stop="updateIntentStatus(item, '已完成')">完成</button>
					<button v-if="canCancelIntent(item)" class="action-btn delete-btn" @click.stop="updateIntentStatus(item, '已取消')">取消</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { clearCurrentUser, favoriteApi, getCurrentUser, intentApi, productApi } from '@/common/api.js'

	export default {
		data() {
			return {
				user: null,
				activeTab: 'products',
				myProducts: [],
				favorites: [],
				buyerIntents: [],
				sellerIntents: [],
				loading: false,
				errorMessage: '',
				defaultImage: 'https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/uni@2x.png'
			}
		},
		computed: {
			avatarText() {
				return this.user && this.user.username ? this.user.username.slice(0, 1) : '我'
			},
			userContactText() {
				if (!this.user) return ''
				return this.user.phone || this.user.email || '暂无联系方式'
			},
			isIntentTab() {
				return this.activeTab === 'buyerIntents' || this.activeTab === 'sellerIntents'
			},
			intentGuideTitle() {
				return this.activeTab === 'buyerIntents' ? '我的购买进度' : '买家申请处理'
			},
			currentList() {
				if (this.activeTab === 'products') return this.myProducts
				if (this.activeTab === 'favorites') return this.favorites
				if (this.activeTab === 'buyerIntents') return this.buyerIntents
				return this.sellerIntents
			},
			emptyText() {
				if (!this.user) return '登录后查看数据'
				const textMap = {
					products: '暂无发布商品',
					favorites: '暂无收藏商品',
					buyerIntents: '暂无购买意向',
					sellerIntents: '暂无收到意向'
				}
				return textMap[this.activeTab]
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
						this.buyerIntents = []
						this.sellerIntents = []
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
					this.buyerIntents = []
					this.sellerIntents = []
					return
				}
				this.loading = true
				try {
					let res
					if (this.activeTab === 'products') {
						res = await productApi.myList(this.user._id)
						if (res.code !== 0) {
							if (this.isResourceExhausted(res.message)) {
								this.myProducts = []
								uni.showToast({ title: '我的发布暂时读取失败，请稍后重试', icon: 'none' })
								return
							}
							throw new Error(res.message || '我的发布加载失败')
						}
						this.myProducts = res.data || []
					} else if (this.activeTab === 'favorites') {
						res = await favoriteApi.list(this.user._id)
						if (res.code !== 0) throw new Error(res.message || '我的收藏加载失败')
						this.favorites = res.data || []
					} else if (this.activeTab === 'buyerIntents') {
						res = await intentApi.listBuyer(this.user._id)
						if (res.code !== 0) {
							if (this.isResourceExhausted(res.message)) {
								this.buyerIntents = []
								uni.showToast({ title: '我想买的暂时读取失败，请稍后重试', icon: 'none' })
								return
							}
							throw new Error(res.message || '我想买的加载失败')
						}
						this.buyerIntents = res.data || []
					} else {
						res = await intentApi.listSeller(this.user._id)
						if (res.code !== 0) {
							if (this.isResourceExhausted(res.message)) {
								this.sellerIntents = []
								uni.showToast({ title: '收到意向暂时读取失败，请稍后重试', icon: 'none' })
								return
							}
							throw new Error(res.message || '收到意向加载失败')
						}
						this.sellerIntents = res.data || []
					}
				} catch (error) {
					this.errorMessage = error.message || '数据加载失败'
					uni.showToast({ title: this.errorMessage, icon: 'none' })
				} finally {
					this.loading = false
				}
			},
			itemTitle(item) {
				return this.isIntentTab ? item.product_title : item.title
			},
			itemPrice(item) {
				return this.isIntentTab ? item.product_price : item.price
			},
			itemImage(item) {
				return (this.isIntentTab ? item.product_image : item.image_url) || this.defaultImage
			},
			itemMeta(item) {
				if (this.activeTab === 'buyerIntents') return `${item.product_school_name || '未标注院校'} / 卖家：${item.seller_name}`
				if (this.activeTab === 'sellerIntents') return `${item.product_school_name || '未标注院校'} / 买家：${item.buyer_name}`
				return `${item.school_name || '未标注院校'} / ${item.category} / ${item.condition}`
			},
			goItemDetail(item) {
				const id = this.isIntentTab ? item.product_id : item._id
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
			},
			isResourceExhausted(message = '') {
				return String(message).includes('resource exhausted') || String(message).includes('资源')
			},
			displayIntentStatus(status) {
				if (status === '待联系') return '待确认'
				if (status === '已联系') return '已同意'
				return status || '待确认'
			},
			isApprovedIntent(item) {
				return ['已同意', '已完成', '已联系'].includes(item.status)
			},
			isPendingIntent(item) {
				return ['待确认', '待联系'].includes(item.status)
			},
			isFinalIntent(item) {
				return ['已完成', '已取消'].includes(item.status)
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
			intentStageTitle(item) {
				const status = this.displayIntentStatus(item.status)
				if (this.activeTab === 'sellerIntents' && status === '待确认') return '等待你处理：同意后买家才能看到联系方式'
				const titleMap = {
					'待确认': '等待卖家同意，联系方式暂不可见',
					'已同意': '卖家已同意，可以开始线下沟通',
					'已完成': '交易意向已完成',
					'已取消': '交易意向已取消'
				}
				return titleMap[status] || '交易意向状态已更新'
			},
			intentContactHint(item) {
				if (this.activeTab === 'buyerIntents') {
					if (!this.isApprovedIntent(item)) return '卖家联系方式：等待卖家同意后可见'
					return `卖家联系方式：${item.seller_contact || '暂无'}`
				}
				return `买家联系方式：${item.buyer_contact || '暂无'}`
			},
			copyButtonText(item) {
				if (this.activeTab === 'buyerIntents' && !this.isApprovedIntent(item)) return '待同意后可复制'
				return this.activeTab === 'buyerIntents' ? '复制卖家联系方式' : '复制买家联系方式'
			},
			copyIntentContact(item) {
				if (this.activeTab === 'buyerIntents' && !this.isApprovedIntent(item)) {
					uni.showToast({ title: '卖家同意后可查看联系方式', icon: 'none' })
					return
				}
				const contact = this.activeTab === 'buyerIntents' ? item.seller_contact : item.buyer_contact
				if (!contact) {
					uni.showToast({ title: '暂无联系方式', icon: 'none' })
					return
				}
				uni.setClipboardData({ data: contact })
			},
			canApproveIntent(item) {
				return this.activeTab === 'sellerIntents' && this.isPendingIntent(item)
			},
			canCompleteIntent(item) {
				return this.isApprovedIntent(item) && !this.isFinalIntent(item)
			},
			canCancelIntent(item) {
				return !this.isFinalIntent(item)
			},
			async updateIntentStatus(item, status) {
				try {
					const res = await intentApi.updateStatus(item._id, this.user._id, status)
					if (res.code !== 0) throw new Error(res.message || '更新失败')
					uni.showToast({ title: '已更新', icon: 'none' })
					this.loadData()
				} catch (error) {
					uni.showToast({ title: error.message || '更新失败', icon: 'none' })
				}
			}
		}
	}
</script>

<style>
	.page {
		background: linear-gradient(160deg, #f5f7fa 0%, #e9edf5 100%);
		min-height: 100vh;
		padding: 32rpx 28rpx;
		box-sizing: border-box;
	}

	.card,
	.profile-card,
	.product-card,
	.intent-guide {
		background: #ffffff;
		box-shadow: 0 8rpx 28rpx rgba(0, 0, 0, 0.04);
	}

	.profile-card {
		display: flex;
		align-items: center;
		gap: 24rpx;
		padding: 32rpx 28rpx;
		margin-bottom: 28rpx;
		border-radius: 28rpx;
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

	.avatar-text {
		font-size: 42rpx;
		font-weight: 800;
		color: #1677ff;
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
	}

	.switch-btn {
		color: #1677ff;
		background: #edf5ff;
	}

	.logout-btn {
		color: #ef4444;
		background: #fff1f2;
	}

	.tabs-scroll {
		white-space: nowrap;
		margin-bottom: 24rpx;
	}

	.tabs {
		display: inline-flex;
		background: #ffffff;
		border-radius: 22rpx;
		padding: 8rpx;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
	}

	.tab {
		min-width: 150rpx;
		text-align: center;
		height: 72rpx;
		line-height: 72rpx;
		border-radius: 18rpx;
		font-size: 26rpx;
		color: #6b7280;
		font-weight: 500;
		padding: 0 16rpx;
	}

	.tab.active {
		background: linear-gradient(135deg, #1677ff, #4096ff);
		color: #ffffff;
		font-weight: 700;
		box-shadow: 0 4rpx 12rpx rgba(22,119,255,0.25);
	}

	.intent-guide {
		border-radius: 24rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
	}

	.guide-title {
		font-size: 28rpx;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 16rpx;
	}

	.guide-flow {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 8rpx;
	}

	.guide-flow text {
		font-size: 22rpx;
		color: #1677ff;
		background: #edf5ff;
		border-radius: 12rpx;
		padding: 10rpx 6rpx;
		text-align: center;
	}

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
		font-size: 48rpx;
		font-weight: 700;
		color: #9ca3af;
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

	.list-container {
		margin-top: 8rpx;
	}

	.product-card {
		display: flex;
		flex-wrap: wrap;
		border-radius: 24rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		gap: 20rpx;
		align-items: center;
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

	.product-title-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 8rpx;
	}

	.product-title {
		flex: 1;
		font-size: 30rpx;
		font-weight: 700;
		color: #1f2937;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.offline-card .product-title {
		color: #6b7280;
	}

	.product-meta,
	.intent-message,
	.contact-hint {
		font-size: 24rpx;
		color: #9ca3af;
		margin-bottom: 10rpx;
		line-height: 36rpx;
	}

	.intent-summary {
		margin-top: 12rpx;
		background: #f9fafb;
		border-radius: 16rpx;
		padding: 14rpx 16rpx;
	}

	.intent-summary-title {
		font-size: 25rpx;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 8rpx;
		line-height: 36rpx;
	}

	.intent-message {
		color: #4b5563;
		white-space: normal;
	}

	.contact-hint {
		color: #6b7280;
		margin-bottom: 0;
	}

	.status-line {
		display: flex;
		align-items: center;
		gap: 14rpx;
		margin-bottom: 8rpx;
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
		white-space: nowrap;
	}

	.status-tag.offline,
	.status-tag.cancelled {
		color: #6b7280;
		background: #e5e7eb;
	}

	.status-tag.pending {
		color: #b45309;
		background: #fffbeb;
	}

	.status-tag.approved {
		color: #047857;
		background: #ecfdf5;
	}

	.status-tag.done {
		color: #1677ff;
		background: #edf5ff;
	}

	.action-buttons {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		gap: 14rpx;
		margin-top: 8rpx;
		flex-wrap: wrap;
	}

	.action-btn {
		height: 58rpx;
		line-height: 58rpx;
		font-size: 24rpx;
		border-radius: 16rpx;
		padding: 0 20rpx;
		background: #f3f4f6;
		color: #4b5563;
		font-weight: 500;
	}

	.edit-btn {
		background: #edf5ff;
		color: #1677ff;
	}

	.status-btn {
		background: #ecfdf5;
		color: #047857;
	}

	.important-btn {
		background: #1677ff;
		color: #ffffff;
	}

	.delete-btn {
		background: #fff1f2;
		color: #ef4444;
	}

	.copy-btn {
		background: #f3f4f6;
		color: #4b5563;
	}
</style>