<template>
	<view class="page">
		<view class="search-row">
			<input class="search-input" v-model="keyword" placeholder="搜索教材、数码、生活用品" confirm-type="search" @confirm="loadProducts" />
			<button class="search-btn" @click="loadProducts">搜索</button>
		</view>

		<picker :range="schoolNames" @change="onSchoolChange">
			<view class="school-picker">{{ selectedSchoolName }}</view>
		</picker>

		<scroll-view class="category-scroll" scroll-x>
			<view
				v-for="item in categories"
				:key="item"
				class="category-chip"
				:class="{ active: category === item }"
				@click="selectCategory(item)"
			>{{ item }}</view>
		</scroll-view>

		<view class="section-head">
			<view class="section-title">最新闲置</view>
			<view v-if="hasFilter" class="clear-filter" @click="clearFilter">清空筛选</view>
		</view>

		<view v-if="loading" class="empty">加载中...</view>
		<view v-else-if="errorMessage" class="empty error-text">{{ errorMessage }}</view>
		<view v-else-if="products.length === 0" class="empty">{{ emptyText }}</view>

		<view v-else class="product-list">
			<view v-for="item in products" :key="item._id" class="product-card" @click="goDetail(item._id)">
				<image class="product-image" :src="item.image_url || defaultImage" mode="aspectFill"></image>
				<view class="product-info">
					<view class="product-title">{{ item.title }}</view>
					<view class="product-desc">{{ item.description }}</view>
					<view class="product-meta">
						<text class="price">￥{{ item.price }}</text>
						<text class="tag">{{ item.category }}</text>
					</view>
					<view class="seller">{{ item.school_name || '未标注院校' }} · {{ item.seller_name }} · {{ item.condition }}</view>
				</view>
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
	.search-row {
		display: flex;
		gap: 16rpx;
		margin-bottom: 18rpx;
	}

	.search-input {
		flex: 1;
		height: 76rpx;
		padding: 0 24rpx;
		background: #ffffff;
		border-radius: 10rpx;
		box-sizing: border-box;
	}

	.search-btn {
		width: 140rpx;
		height: 76rpx;
		line-height: 76rpx;
		background: #1677ff;
		color: #ffffff;
		border-radius: 10rpx;
		font-size: 28rpx;
	}

	.school-picker {
		height: 76rpx;
		line-height: 76rpx;
		padding: 0 24rpx;
		margin-bottom: 18rpx;
		background: #ffffff;
		border-radius: 10rpx;
		color: #111827;
		box-sizing: border-box;
	}

	.category-scroll {
		white-space: nowrap;
		margin-bottom: 28rpx;
	}

	.category-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 64rpx;
		padding: 0 24rpx;
		margin-right: 16rpx;
		border-radius: 999rpx;
		background: #ffffff;
		color: #4b5563;
	}

	.category-chip.active {
		background: #e8f2ff;
		color: #1677ff;
		font-weight: 600;
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.section-title {
		font-size: 34rpx;
		font-weight: 700;
	}

	.clear-filter {
		color: #1677ff;
		font-size: 26rpx;
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
		gap: 20rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		background: #ffffff;
		border-radius: 12rpx;
	}

	.product-image {
		width: 180rpx;
		height: 180rpx;
		border-radius: 10rpx;
		background: #eef2f7;
		flex-shrink: 0;
	}

	.product-info {
		min-width: 0;
		flex: 1;
	}

	.product-title {
		font-size: 32rpx;
		font-weight: 700;
		margin-bottom: 10rpx;
	}

	.product-desc {
		color: #6b7280;
		font-size: 26rpx;
		line-height: 38rpx;
		height: 76rpx;
		overflow: hidden;
	}

	.product-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 14rpx 0;
	}

	.price {
		color: #ef4444;
		font-size: 34rpx;
		font-weight: 700;
	}

	.tag {
		color: #1677ff;
		background: #edf5ff;
		border-radius: 8rpx;
		padding: 6rpx 12rpx;
		font-size: 24rpx;
	}

	.seller {
		color: #9ca3af;
		font-size: 24rpx;
	}
</style>