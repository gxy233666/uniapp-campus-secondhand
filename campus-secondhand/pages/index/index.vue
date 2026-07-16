<template>
	<view class="page">
		<view class="top-panel">
			<view class="brand-row">
				<view>
					<view class="brand-title">{{ ui.title }}</view>
					<view class="brand-subtitle">{{ ui.subtitle }}</view>
				</view>
				<view class="result-pill">{{ products.length }} {{ ui.unit }}</view>
			</view>

			<view class="search-row">
				<view class="search-input-wrapper">
					<text class="search-icon">{{ ui.searchShort }}</text>
					<input
						class="search-input"
						v-model="keyword"
						:placeholder="ui.searchPlaceholder"
						confirm-type="search"
						@confirm="applyFilters"
					/>
				</view>
				<button class="search-btn" :disabled="loadingRemote" @click="loadProducts">{{ loadingRemote ? ui.refreshing : ui.search }}</button>
			</view>

			<picker :range="schoolNames" :value="selectedSchoolIndex" @change="onSchoolChange">
				<view class="school-picker">
					<view>
						<text class="picker-label">{{ ui.school }}</text>
						<text class="picker-value">{{ selectedSchoolName }}</text>
					</view>
					<text class="arrow-icon">?</text>
				</view>
			</picker>
		</view>

		<scroll-view class="category-scroll" scroll-x>
			<view class="category-track">
				<view
					v-for="item in categories"
					:key="item"
					class="category-chip"
					:class="{ active: category === item }"
					@click="selectCategory(item)"
				>
					{{ item }}
				</view>
			</view>
		</scroll-view>

		<view class="section-head">
			<view>
				<view class="section-title">{{ ui.latest }}</view>
				<view class="section-desc">{{ sectionDescription }}</view>
			</view>
			<view v-if="hasFilter" class="clear-filter" @click="clearFilter">{{ ui.clearFilter }}</view>
		</view>

		<view v-if="remoteMessage" class="inline-notice">{{ remoteMessage }}</view>

		<view v-if="products.length === 0" class="empty-state">
			<text class="empty-mark">{{ ui.emptyMark }}</text>
			<text>{{ emptyText }}</text>
		</view>

		<view v-else class="product-list">
			<view v-for="item in products" :key="item._id" class="product-card" @click="goDetail(item)">
				<view class="image-wrap">
					<image class="product-image" :src="item.image_url || defaultImage" mode="aspectFill"></image>
				</view>
				<view class="product-info">
					<view class="product-title">{{ item.title }}</view>
					<view class="product-desc">{{ item.description }}</view>
					<view class="product-tags">
						<text class="tag primary-tag">{{ item.category }}</text>
						<text class="tag">{{ item.condition }}</text>
					</view>
					<view class="card-bottom">
						<view>
							<view class="price">¥{{ item.price }}</view>
							<view class="seller-line">{{ item.school_name }} ? {{ item.seller_name }}</view>
						</view>
						<view class="detail-arrow">{{ ui.detail }}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { productApi } from '@/common/api.js'
import { getDefaultProducts } from '@/common/default-products.js'

const all = '\u5168\u90e8'
const onSale = '\u5728\u552e'

export default {
	data() {
		return {
			ui: {
				title: '\u6821\u56ed\u4e8c\u624b',
				subtitle: '\u9ed8\u8ba4\u5546\u54c1\u548c\u771f\u5b9e\u53d1\u5e03\u5546\u54c1\u4e00\u8d77\u5c55\u793a',
				unit: '\u4ef6',
				searchShort: '\u641c',
				search: '\u641c\u7d22',
				refreshing: '\u5237\u65b0',
				searchPlaceholder: '\u641c\u7d22\u6559\u6750\u3001\u6570\u7801\u3001\u751f\u6d3b\u7528\u54c1',
				school: '\u9662\u6821',
				latest: '\u6700\u65b0\u95f2\u7f6e',
				clearFilter: '\u6e05\u7a7a\u7b5b\u9009',
				emptyMark: '\u7a7a',
				defaultSource: '\u9ed8\u8ba4',
				cloudSource: '\u4e91\u7aef',
				detail: '\u8be6\u60c5'
			},
			keyword: '',
			category: all,
			selectedSchoolIndex: 0,
			remoteProducts: [],
			products: [],
			loadingRemote: false,
			remoteMessage: '',
			defaultImage: '/static/default-products/book-math.svg'
		}
	},
	computed: {
		categories() {
			return [all, '\u6559\u6750\u8d44\u6599', '\u6570\u7801\u7535\u5b50', '\u751f\u6d3b\u7528\u54c1', '\u8fd0\u52a8\u6237\u5916', '\u5176\u4ed6']
		},
		allProducts() {
			return [...this.remoteProducts, ...getDefaultProducts()]
		},
		schoolOptions() {
			const schools = this.allProducts.reduce((result, item) => {
				if (item.school_id && !result.some((school) => school.id === item.school_id)) {
					result.push({ id: item.school_id, name: item.school_name || '\u672a\u6807\u6ce8\u9662\u6821' })
				}
				return result
			}, [])
			return [{ id: '', name: '\u5168\u90e8\u9662\u6821' }, ...schools]
		},
		schoolNames() {
			return this.schoolOptions.map((item) => item.name)
		},
		selectedSchool() {
			return this.schoolOptions[this.selectedSchoolIndex] || this.schoolOptions[0]
		},
		selectedSchoolName() {
			return this.selectedSchool.name
		},
		hasFilter() {
			return Boolean(this.keyword.trim()) || this.category !== all || Boolean(this.selectedSchool.id)
		},
		sectionDescription() {
			const cloudCount = this.remoteProducts.length
			if (this.hasFilter) return '\u5df2\u6309\u5173\u952e\u8bcd\u3001\u5206\u7c7b\u6216\u9662\u6821\u7b5b\u9009\u5f53\u524d\u5c55\u793a\u5546\u54c1'
			return `\u4e91\u7aef\u53d1\u5e03 ${cloudCount} \u4ef6\uff0c\u9ed8\u8ba4\u5c55\u793a ${getDefaultProducts().length} \u4ef6`
		},
		emptyText() {
			return this.hasFilter ? '\u6ca1\u6709\u627e\u5230\u7b26\u5408\u6761\u4ef6\u7684\u5546\u54c1' : '\u6682\u65e0\u5546\u54c1'
		}
	},
	onLoad() {
		this.applyFilters()
	},
	onShow() {
		this.loadProducts()
	},
	methods: {
		normalizeRemoteProduct(item) {
			return {
				...item,
				is_local: false,
				source: 'cloud',
				status: item.status || onSale
			}
		},
		async loadProducts() {
			this.loadingRemote = true
			this.remoteMessage = ''
			try {
				const res = await productApi.list({})
				if (res.code !== 0) throw new Error(res.message || '\u4e91\u7aef\u5546\u54c1\u8bfb\u53d6\u5931\u8d25')
				this.remoteProducts = (res.data || []).map((item) => this.normalizeRemoteProduct(item))
				if (res.message && res.message !== 'ok') this.remoteMessage = res.message
			} catch (error) {
				this.remoteProducts = []
				this.remoteMessage = `\u4e91\u7aef\u5546\u54c1\u6682\u65f6\u8bfb\u53d6\u5931\u8d25\uff0c\u5df2\u5148\u5c55\u793a\u9ed8\u8ba4\u5546\u54c1\uff1a${error.message || '\u672a\u77e5\u9519\u8bef'}`
			} finally {
				this.loadingRemote = false
				this.applyFilters()
			}
		},
		applyFilters() {
			const keyword = this.keyword.trim().toLowerCase()
			const schoolId = this.selectedSchool.id
			this.products = this.allProducts.filter((item) => {
				const matchKeyword = !keyword || `${item.title}${item.description}${item.school_name}${item.category}${item.seller_name}`.toLowerCase().includes(keyword)
				const matchCategory = this.category === all || item.category === this.category
				const matchSchool = !schoolId || item.school_id === schoolId
				return item.status === onSale && matchKeyword && matchCategory && matchSchool
			})
		},
		onSchoolChange(event) {
			this.selectedSchoolIndex = Number(event.detail.value)
			this.applyFilters()
		},
		selectCategory(item) {
			this.category = item
			this.applyFilters()
		},
		clearFilter() {
			this.keyword = ''
			this.category = all
			this.selectedSchoolIndex = 0
			this.applyFilters()
		},
		goDetail(item) {
			uni.navigateTo({ url: `/pages/product-detail/product-detail?id=${item._id}` })
		}
	}
}
</script>

<style>
page { background: #f4f6fb; }
.page { min-height: 100vh; padding: 24rpx 22rpx 44rpx; box-sizing: border-box; color: #182235; }
.top-panel { padding: 28rpx; border-radius: 28rpx; background: linear-gradient(135deg, #ffffff 0%, #eef5ff 100%); box-shadow: 0 18rpx 42rpx rgba(26, 73, 139, 0.08); }
.brand-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 20rpx; margin-bottom: 28rpx; }
.brand-title { font-size: 42rpx; line-height: 54rpx; font-weight: 800; color: #111827; }
.brand-subtitle { margin-top: 8rpx; font-size: 24rpx; line-height: 34rpx; color: #617086; }
.result-pill { flex: 0 0 auto; padding: 10rpx 18rpx; border-radius: 999rpx; background: #1677ff; color: #ffffff; font-size: 24rpx; font-weight: 700; }
.search-row { display: flex; align-items: center; gap: 16rpx; }
.search-input-wrapper { flex: 1; display: flex; align-items: center; min-width: 0; height: 82rpx; padding: 0 22rpx; border-radius: 20rpx; background: #ffffff; box-sizing: border-box; }
.search-icon { margin-right: 12rpx; font-size: 24rpx; font-weight: 700; color: #1677ff; }
.search-input { flex: 1; min-width: 0; font-size: 28rpx; color: #1f2937; }
.search-btn { width: 130rpx; height: 82rpx; line-height: 82rpx; padding: 0; border-radius: 20rpx; background: #1677ff; color: #ffffff; font-size: 28rpx; font-weight: 700; }
.search-btn::after { border: none; }
.school-picker { display: flex; align-items: center; justify-content: space-between; margin-top: 18rpx; padding: 20rpx 22rpx; border-radius: 20rpx; background: #ffffff; box-sizing: border-box; }
.picker-label { margin-right: 16rpx; font-size: 24rpx; font-weight: 700; color: #8a96a8; }
.picker-value { font-size: 28rpx; font-weight: 700; color: #24324a; }
.arrow-icon { font-size: 42rpx; line-height: 42rpx; color: #94a3b8; }
.category-scroll { width: 100%; margin-top: 22rpx; white-space: nowrap; }
.category-track { display: flex; gap: 16rpx; padding: 2rpx 2rpx 8rpx; }
.category-chip { flex: 0 0 auto; padding: 16rpx 26rpx; border-radius: 999rpx; background: #ffffff; color: #56657a; font-size: 26rpx; font-weight: 700; box-shadow: 0 8rpx 20rpx rgba(27, 57, 106, 0.06); }
.category-chip.active { background: #1677ff; color: #ffffff; box-shadow: 0 10rpx 24rpx rgba(22, 119, 255, 0.22); }
.section-head { display: flex; align-items: center; justify-content: space-between; gap: 20rpx; margin: 28rpx 2rpx 18rpx; }
.section-title { font-size: 34rpx; font-weight: 800; color: #111827; }
.section-desc { margin-top: 6rpx; font-size: 24rpx; line-height: 34rpx; color: #748096; }
.clear-filter, .inline-notice { border-radius: 999rpx; font-size: 24rpx; font-weight: 700; }
.clear-filter { flex: 0 0 auto; padding: 12rpx 18rpx; background: #eef5ff; color: #1677ff; }
.inline-notice { margin: 0 0 18rpx; padding: 14rpx 18rpx; background: #fff7ed; color: #c2410c; line-height: 34rpx; }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 360rpx; border-radius: 26rpx; background: #ffffff; color: #7b8798; font-size: 28rpx; }
.empty-mark { margin-bottom: 18rpx; font-size: 52rpx; font-weight: 800; color: #c2cad7; }
.product-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20rpx; }
.product-card { min-width: 0; overflow: hidden; border-radius: 24rpx; background: #ffffff; box-shadow: 0 12rpx 30rpx rgba(28, 54, 95, 0.08); }
.image-wrap { position: relative; }
.product-image { display: block; width: 100%; height: 230rpx; background: #edf2f7; }
.product-info { padding: 18rpx; }
.product-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 29rpx; font-weight: 800; color: #111827; }
.product-desc { display: -webkit-box; overflow: hidden; -webkit-box-orient: vertical; -webkit-line-clamp: 2; min-height: 64rpx; margin-top: 8rpx; font-size: 23rpx; line-height: 32rpx; color: #6b7280; }
.product-tags { display: flex; flex-wrap: wrap; gap: 10rpx; margin-top: 14rpx; }
.tag { padding: 7rpx 12rpx; border-radius: 999rpx; background: #f2f4f7; color: #64748b; font-size: 21rpx; line-height: 28rpx; }
.primary-tag { background: #e9f2ff; color: #1677ff; font-weight: 700; }
.card-bottom { display: flex; align-items: flex-end; justify-content: space-between; gap: 12rpx; margin-top: 18rpx; }
.price { font-size: 34rpx; line-height: 42rpx; font-weight: 900; color: #f04438; }
.seller-line { max-width: 210rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 4rpx; font-size: 21rpx; color: #8a96a8; }
.detail-arrow { flex: 0 0 auto; padding: 9rpx 14rpx; border-radius: 999rpx; background: #f6f8fb; color: #3b4a60; font-size: 22rpx; font-weight: 700; }
</style>
