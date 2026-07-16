<template>
	<view class="page">
		<!-- 搜索栏 -->
		<view class="search-row">
			<view class="search-input-wrapper">
				<text class="search-icon">🔍</text>
				<input
					class="search-input"
					v-model="keyword"
					placeholder="搜索教材、数码、生活用品"
					confirm-type="search"
					@confirm="loadProducts"
				/>
			</view>
			<button class="search-btn" @click="loadProducts">搜索</button>
		</view>

		<!-- 院校选择 -->
		<picker :range="schoolNames" @change="onSchoolChange">
			<view class="school-picker">
				<text>{{ selectedSchoolName }}</text>
				<text class="arrow-icon">▼</text>
			</view>
		</picker>

		<!-- 分类滚动 -->
		<scroll-view class="category-scroll" scroll-x>
			<view
				v-for="item in categories"
				:key="item"
				class="category-chip"
				:class="{ active: category === item }"
				@click="selectCategory(item)"
			>
				<text v-if="category === item" class="chip-icon">✦</text>
				{{ item }}
			</view>
		</scroll-view>

		<!-- 列表标题栏 -->
		<view class="section-head">
			<view class="section-title">
				<text class="title-dot">●</text> 最新闲置
			</view>
			<view v-if="hasFilter" class="clear-filter" @click="clearFilter">
				<text class="clear-icon">✕</text> 清空筛选
			</view>
		</view>

		<!-- 加载/错误/空状态 -->
		<view v-if="loading" class="empty loading-state">
			<view class="loading-spinner"></view>
			<text>正在加载中...</text>
		</view>
		<view v-else-if="errorMessage" class="empty error-state">
			<text class="icon-large">⚠️</text>
			<text class="error-text">{{ errorMessage }}</text>
		</view>
		<view v-else-if="products.length === 0" class="empty empty-state">
			<text class="icon-large">📭</text>
			<text>{{ emptyText }}</text>
		</view>

		<!-- 商品列表 -->
		<view v-else class="product-list">
			<view v-for="item in products" :key="item._id" class="product-card" @click="goDetail(item._id)">
				<image
					class="product-image"
					:src="item.image_url || defaultImage"
					mode="aspectFill"
				></image>
				<view class="product-info">
					<view class="product-title">{{ item.title }}</view>
					<view class="product-desc">{{ item.description }}</view>
					<view class="product-meta">
						<text class="price">¥{{ item.price }}</text>
						<text class="tag">{{ item.category }}</text>
					</view>
					<view class="seller">
						<text class="school-icon">🏫</text>
						{{ item.school_name || '未标注院校' }} · {{ item.seller_name }} · {{ item.condition }}
					</view>
				</view>
				<view class="card-arrow">›</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { productApi, schoolApi } from '@/common/api.js'

	export default {
		data() {
			return {
				keyword: '',
				category: '全部',
				categories: ['全部', '教材资料', '数码电子', '生活用品', '运动户外', '其他'],
				schools: [],
				schoolIndex: 0,
				products: [],
				loading: false,
				errorMessage: '',
				defaultImage: 'https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/uni@2x.png'
			}
		},
		computed: {
			schoolNames() {
				return ['全部院校', ...this.schools.map(item => item.name)]
			},
			selectedSchool() {
				return this.schoolIndex > 0 ? this.schools[this.schoolIndex - 1] : null
			},
			selectedSchoolName() {
				return this.selectedSchool ? this.selectedSchool.name : '全部院校'
			},
			hasFilter() {
				return !!this.keyword.trim() || this.category !== '全部' || this.schoolIndex > 0
			},
			emptyText() {
				return this.hasFilter ? '没有找到符合条件的商品' : '暂无商品，去发布第一件闲置吧'
			}
		},
		onLoad() {
			this.loadSchools()
		},
		onShow() {
			this.loadProducts()
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
			async loadProducts() {
				this.loading = true
				this.errorMessage = ''
				try {
					const res = await productApi.list({
						keyword: this.keyword.trim(),
						category: this.category === '全部' ? '' : this.category,
						school_id: this.selectedSchool ? this.selectedSchool.school_id : ''
					})
					if (res.code !== 0) throw new Error(res.message || '商品加载失败')
					this.products = res.data || []
				} catch (error) {
					this.products = []
					this.errorMessage = error.message || '商品加载失败'
					uni.showToast({ title: this.errorMessage, icon: 'none' })
				} finally {
					this.loading = false
				}
			},
			onSchoolChange(event) {
				this.schoolIndex = Number(event.detail.value)
				this.loadProducts()
			},
			selectCategory(item) {
				if (this.category === item) return
				this.category = item
				this.loadProducts()
			},
			clearFilter() {
				this.keyword = ''
				this.category = '全部'
				this.schoolIndex = 0
				this.loadProducts()
			},
			goDetail(id) {
				uni.navigateTo({ url: `/pages/product-detail/product-detail?id=${id}` })
			}
		}
	}
</script>

<style>
	/* 全局页面背景与间距 */
	.page {
		padding: 24rpx;
		background: linear-gradient(135deg, #f5f7fa 0%, #e9edf5 100%);
		min-height: 100vh;
	}

	/* 搜索行 */
	.search-row {
		display: flex;
		gap: 16rpx;
		margin-bottom: 24rpx;
	}

	.search-input-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		background: #ffffff;
		border-radius: 40rpx;
		padding: 0 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
	}

	.search-icon {
		font-size: 28rpx;
		margin-right: 12rpx;
		color: #9ca3af;
	}

	.search-input {
		flex: 1;
		height: 76rpx;
		background: transparent;
		box-sizing: border-box;
		font-size: 28rpx;
	}

	.search-btn {
		width: 140rpx;
		height: 76rpx;
		line-height: 76rpx;
		background: linear-gradient(135deg, #1677ff, #4096ff);
		color: #ffffff;
		border-radius: 40rpx;
		font-size: 28rpx;
		font-weight: 600;
		border: none;
		box-shadow: 0 4rpx 12rpx rgba(22,119,255,0.25);
		transition: transform 0.1s;
	}

	.search-btn:active {
		transform: scale(0.96);
	}

	/* 院校选择器 */
	.school-picker {
		height: 76rpx;
		line-height: 76rpx;
		padding: 0 24rpx;
		margin-bottom: 24rpx;
		background: #ffffff;
		border-radius: 40rpx;
		color: #111827;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.04);
	}

	.arrow-icon {
		font-size: 24rpx;
		color: #6b7280;
		margin-left: 8rpx;
	}

	/* 分类滚动 */
	.category-scroll {
		white-space: nowrap;
		margin-bottom: 32rpx;
	}

	.category-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 64rpx;
		padding: 0 28rpx;
		margin-right: 16rpx;
		border-radius: 32rpx;
		background: #ffffff;
		color: #4b5563;
		font-size: 26rpx;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.03);
		transition: all 0.2s;
	}

	.category-chip.active {
		background: linear-gradient(135deg, #e8f2ff, #d4e8ff);
		color: #1677ff;
		font-weight: 600;
		box-shadow: 0 4rpx 12rpx rgba(22,119,255,0.15);
		transform: translateY(-2rpx);
	}

	.chip-icon {
		margin-right: 6rpx;
		font-size: 22rpx;
		color: #1677ff;
	}

	/* 列表标题栏 */
	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}

	.section-title {
		font-size: 34rpx;
		font-weight: 700;
		color: #111827;
		display: flex;
		align-items: center;
	}

	.title-dot {
		color: #1677ff;
		margin-right: 10rpx;
		font-size: 28rpx;
	}

	.clear-filter {
		color: #1677ff;
		font-size: 26rpx;
		background: rgba(22,119,255,0.08);
		padding: 8rpx 18rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
	}

	.clear-icon {
		margin-right: 4rpx;
		font-size: 22rpx;
	}

	/* 空状态统一 */
	.empty {
		padding: 120rpx 0;
		text-align: center;
		color: #6b7280;
		font-size: 28rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
	}

	.icon-large {
		font-size: 64rpx;
		opacity: 0.7;
	}

	.error-text {
		color: #ef4444;
	}

	/* 加载动画 */
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

	/* 商品列表 */
	.product-list {
		margin-top: 8rpx;
	}

	.product-card {
		display: flex;
		gap: 20rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		background: #ffffff;
		border-radius: 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.04);
		transition: all 0.2s;
		position: relative;
	}

	.product-card:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.06);
	}

	.product-image {
		width: 180rpx;
		height: 180rpx;
		border-radius: 16rpx;
		background: #eef2f7;
		flex-shrink: 0;
		box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
	}

	.product-info {
		min-width: 0;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.product-title {
		font-size: 30rpx;
		font-weight: 700;
		margin-bottom: 6rpx;
		color: #1f2937;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 1;
		overflow: hidden;
	}

	.product-desc {
		color: #6b7280;
		font-size: 24rpx;
		line-height: 34rpx;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		margin-bottom: 8rpx;
		flex: 1;
	}

	.product-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 6rpx;
	}

	.price {
		color: #f43f5e;
		font-size: 34rpx;
		font-weight: 700;
	}

	.tag {
		color: #1677ff;
		background: #edf5ff;
		border-radius: 8rpx;
		padding: 4rpx 14rpx;
		font-size: 22rpx;
		font-weight: 500;
	}

	.seller {
		color: #9ca3af;
		font-size: 22rpx;
		display: flex;
		align-items: center;
	}

	.school-icon {
		font-size: 20rpx;
		margin-right: 4rpx;
	}

	.card-arrow {
		font-size: 36rpx;
		color: #cbd5e1;
		position: absolute;
		right: 20rpx;
		top: 50%;
		transform: translateY(-50%);
	}
</style>