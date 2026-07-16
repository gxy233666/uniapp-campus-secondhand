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
				<button class="ghost-btn" :disabled="favoriteButtonDisabled" @click="toggleFavorite">{{ favoriteButtonText }}</button>
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
	import { getDefaultProductById } from '@/common/default-products.js'

	const onSale = '\u5728\u552e'
	const sold = '\u5df2\u552e\u51fa'
	const pending = '\u5f85\u786e\u8ba4'
	const pendingOld = '\u5f85\u8054\u7cfb'
	const approved = '\u5df2\u540c\u610f'
	const approvedOld = '\u5df2\u8054\u7cfb'
	const done = '\u5df2\u5b8c\u6210'
	const cancelled = '\u5df2\u53d6\u6d88'
	const rejected = '\u5df2\u62d2\u7edd'

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
				flowSteps: ['\u63d0\u4ea4\u610f\u5411', '\u5356\u5bb6\u786e\u8ba4', '\u67e5\u770b\u8054\u7cfb\u65b9\u5f0f', '\u7ebf\u4e0b\u4ea4\u6613'],
				defaultImage: 'https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/uni@2x.png'
			}
		},
		computed: {
			currentUser() { return getCurrentUser() },
			isLocalDemo() { return this.product && this.product.is_local },
			isSeller() { return this.currentUser && this.product && this.currentUser._id === this.product.seller_id },
			canViewSellerContact() { return this.currentIntent && [approved, done, approvedOld].includes(this.currentIntent.status) },
			currentFlowIndex() {
				if (!this.currentIntent) return -1
				const status = this.displayIntentStatus(this.currentIntent.status)
				if ([pending, rejected, cancelled].includes(status)) return 0
				if (status === approved) return 2
				if (status === done) return 3
				return 0
			},
			currentIntentDesc() {
				if (!this.currentIntent) return ''
				const status = this.displayIntentStatus(this.currentIntent.status)
				const descMap = {
					[pending]: '\u5df2\u63d0\u4ea4\u7533\u8bf7\uff0c\u6b63\u5728\u7b49\u5f85\u5356\u5bb6\u786e\u8ba4\u3002\u5356\u5bb6\u540c\u610f\u524d\u4e0d\u4f1a\u663e\u793a\u8054\u7cfb\u65b9\u5f0f\u3002',
					[approved]: '\u5356\u5bb6\u5df2\u540c\u610f\u8054\u7cfb\uff0c\u73b0\u5728\u53ef\u4ee5\u67e5\u770b\u8054\u7cfb\u65b9\u5f0f\u5e76\u7ebf\u4e0b\u6c9f\u901a\u3002',
					[done]: '\u8fd9\u6761\u4ea4\u6613\u610f\u5411\u5df2\u5b8c\u6210\uff0c\u53ef\u4f5c\u4e3a\u4ea4\u6613\u8bb0\u5f55\u4fdd\u7559\u3002',
					[cancelled]: '\u8fd9\u6761\u4ea4\u6613\u610f\u5411\u5df2\u53d6\u6d88\uff0c\u82e5\u4ecd\u60f3\u8d2d\u4e70\u53ef\u91cd\u65b0\u63d0\u4ea4\u3002',
					[rejected]: '\u5356\u5bb6\u5df2\u62d2\u7edd\u672c\u6b21\u4ea4\u6613\u610f\u5411\uff0c\u53ef\u9009\u62e9\u5176\u4ed6\u5546\u54c1\u3002'
				}
				return descMap[status] || '\u4ea4\u6613\u610f\u5411\u72b6\u6001\u5df2\u66f4\u65b0\u3002'
			},
			favoriteButtonDisabled() { return this.isLocalDemo },
			favoriteButtonText() { return this.isLocalDemo ? '\u9ed8\u8ba4\u5546\u54c1' : (this.favored ? '\u5df2\u6536\u85cf' : '\u6536\u85cf') },
			contactButtonDisabled() { return !this.product || this.product.status !== onSale || this.isSeller || this.isLocalDemo },
			contactButtonText() {
				if (this.isLocalDemo) return '\u9ed8\u8ba4\u5546\u54c1\u4ec5\u5c55\u793a'
				if (this.isSeller) return '\u81ea\u5df1\u53d1\u5e03\u7684\u5546\u54c1'
				if (this.product && this.product.status === sold) return '\u5546\u54c1\u5df2\u552e\u51fa'
				if (this.product && this.product.status !== onSale) return '\u5546\u54c1\u5df2\u4e0b\u67b6'
				if (this.currentIntent) return '\u5df2\u63d0\u4ea4\u610f\u5411'
				return '\u8054\u7cfb\u5356\u5bb6'
			}
		},
		onLoad(options) { this.id = options.id || ''; this.loadDetail() },
		methods: {
			async loadDetail() {
				if (!this.id) { this.errorMessage = '\u7f3a\u5c11\u5546\u54c1ID'; return }
				this.loading = true
				this.errorMessage = ''
				try {
					const localProduct = getDefaultProductById(this.id)
					if (localProduct) {
						this.product = localProduct
						this.intentMessage = `\u4f60\u597d\uff0c\u6211\u5bf9\u300a${this.product.title}\u300b\u611f\u5174\u8da3\uff0c\u60f3\u8fdb\u4e00\u6b65\u4e86\u89e3\u4e00\u4e0b\u3002`
						this.favored = false
						this.currentIntent = null
						return
					}
					const res = await productApi.detail(this.id)
					if (res.code !== 0) throw new Error(res.message || '\u8be6\u60c5\u52a0\u8f7d\u5931\u8d25')
					this.product = res.data
					this.intentMessage = `\u4f60\u597d\uff0c\u6211\u5bf9\u300a${this.product.title}\u300b\u611f\u5174\u8da3\uff0c\u60f3\u8fdb\u4e00\u6b65\u4e86\u89e3\u4e00\u4e0b\u3002`
					await this.loadUserState()
				} catch (error) {
					this.product = null
					this.errorMessage = error.message || '\u8be6\u60c5\u52a0\u8f7d\u5931\u8d25'
					uni.showToast({ title: this.errorMessage, icon: 'none' })
				} finally { this.loading = false }
			},
			async loadUserState() {
				const user = getCurrentUser()
				this.favored = false
				this.currentIntent = null
				if (!user || this.isLocalDemo) return
				const favoriteRes = await favoriteApi.check(user._id, this.id)
				if (favoriteRes.code !== 0) throw new Error(favoriteRes.message || '\u6536\u85cf\u72b6\u6001\u52a0\u8f7d\u5931\u8d25')
				this.favored = !!favoriteRes.data
				if (this.product && this.product.seller_id !== user._id) {
					const intentRes = await intentApi.listBuyer(user._id)
					if (intentRes.code !== 0) throw new Error(intentRes.message || '\u4ea4\u6613\u610f\u5411\u52a0\u8f7d\u5931\u8d25')
					this.currentIntent = (intentRes.data || []).find(item => item.product_id === this.id && ![cancelled, rejected].includes(item.status)) || null
				}
			},
			async toggleFavorite() {
				if (this.isLocalDemo) { uni.showToast({ title: '\u9ed8\u8ba4\u5546\u54c1\u4ec5\u7528\u4e8e\u5c55\u793a', icon: 'none' }); return }
				const user = getCurrentUser()
				if (!user) { uni.navigateTo({ url: '/pages/login/login' }); return }
				try {
					let res
					if (this.favored) { res = await favoriteApi.remove(user._id, this.id); if (res.code !== 0) throw new Error(res.message || '\u53d6\u6d88\u6536\u85cf\u5931\u8d25'); this.favored = false }
					else { res = await favoriteApi.add(user._id, this.id); if (res.code !== 0) throw new Error(res.message || '\u6536\u85cf\u5931\u8d25'); this.favored = true }
					uni.showToast({ title: this.favored ? '\u5df2\u6536\u85cf' : '\u5df2\u53d6\u6d88', icon: 'none' })
				} catch (error) { uni.showToast({ title: error.message || '\u64cd\u4f5c\u5931\u8d25', icon: 'none' }) }
			},
			toggleIntentPanel() {
				const user = getCurrentUser()
				if (!user) { uni.navigateTo({ url: '/pages/login/login' }); return }
				if (this.isLocalDemo) { uni.showToast({ title: '\u9ed8\u8ba4\u5546\u54c1\u4e0d\u8fdb\u5165\u771f\u5b9e\u4ea4\u6613\u6d41\u7a0b', icon: 'none' }); return }
				if (this.product && this.product.status !== onSale) { uni.showToast({ title: this.product.status === sold ? '\u8be5\u5546\u54c1\u5df2\u552e\u51fa' : '\u8be5\u5546\u54c1\u5df2\u4e0b\u67b6', icon: 'none' }); return }
				if (this.isSeller) { uni.showToast({ title: '\u4e0d\u80fd\u8054\u7cfb\u81ea\u5df1\u53d1\u5e03\u7684\u5546\u54c1', icon: 'none' }); return }
				if (this.currentIntent) { uni.showToast({ title: this.currentIntentDesc, icon: 'none' }); return }
				this.showIntentPanel = !this.showIntentPanel
			},
			async submitIntent() {
				const user = getCurrentUser()
				if (!user) { uni.navigateTo({ url: '/pages/login/login' }); return }
				this.submittingIntent = true
				try {
					const res = await intentApi.add({ product_id: this.id, buyer_id: user._id, buyer_name: user.username, buyer_contact: user.phone || user.email || '', message: this.intentMessage })
					if (res.code !== 0) throw new Error(res.message || '\u63d0\u4ea4\u5931\u8d25')
					this.currentIntent = res.data || null
					uni.showModal({ title: '\u610f\u5411\u5df2\u63d0\u4ea4', content: '\u8bf7\u7b49\u5f85\u5356\u5bb6\u540c\u610f\u3002\u5356\u5bb6\u540c\u610f\u540e\uff0c\u4f60\u53ef\u4ee5\u5728\u201c\u6211\u7684-\u6211\u60f3\u4e70\u7684\u201d\u67e5\u770b\u8054\u7cfb\u65b9\u5f0f\u3002', showCancel: false })
					this.showIntentPanel = false
				} catch (error) { uni.showToast({ title: error.message || '\u63d0\u4ea4\u5931\u8d25', icon: 'none' }) }
				finally { this.submittingIntent = false }
			},
			displayIntentStatus(status) { if (status === pendingOld) return pending; if (status === approvedOld) return approved; return status || pending },
			intentStatusClass(item) {
				const status = this.displayIntentStatus(item.status)
				return { pending: status === pending, approved: status === approved, done: status === done, cancelled: status === cancelled, rejected: status === rejected }
			},
			copySellerContact() {
				if (!this.canViewSellerContact || !this.currentIntent.seller_contact) { uni.showToast({ title: '\u6682\u65e0\u8054\u7cfb\u65b9\u5f0f', icon: 'none' }); return }
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

	.intent-status-tag.cancelled,
	.intent-status-tag.rejected {
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