<template>
	<view class="page">
		<view class="card seed-card">
			<view class="title">导入演示商品</view>
			<view class="hint">用于开发和答辩演示。默认商品只会导入一次，重复点击会自动跳过。</view>
			<view class="status-box">
				<view class="status-label">当前演示商品数量</view>
				<view class="status-value">{{ statusText }}</view>
			</view>
			<button class="primary-btn action-btn" :disabled="loading" @click="seedProducts">{{ loading ? '导入中...' : '导入默认商品数据' }}</button>
			<button class="ghost-btn action-btn" :disabled="loading" @click="loadStatus">刷新状态</button>
		</view>
	</view>
</template>

<script>
	import { seedApi } from '@/common/api.js'

	export default {
		data() {
			return {
				loading: false,
				seedTotal: null,
				message: ''
			}
		},
		computed: {
			statusText() {
				if (this.seedTotal === null) return '未读取'
				return `${this.seedTotal} 条`
			}
		},
		onLoad() {
			this.loadStatus()
		},
		methods: {
			async loadStatus() {
				try {
					const res = await seedApi.status()
					if (res.code !== 0) throw new Error(res.message || '状态读取失败')
					this.seedTotal = res.data.total
				} catch (error) {
					uni.showToast({ title: error.message || '状态读取失败', icon: 'none' })
				}
			},
			async seedProducts() {
				this.loading = true
				try {
					const res = await seedApi.seedProducts()
					if (res.code !== 0) throw new Error(res.message || '导入失败')
					this.seedTotal = (res.data.skipped || 0) + (res.data.inserted || 0)
					uni.showModal({
						title: '导入完成',
						content: `${res.message}\n新增：${res.data.inserted} 条，已存在：${res.data.skipped} 条`,
						showCancel: false
					})
				} catch (error) {
					uni.showModal({ title: '导入失败', content: error.message || '导入失败', showCancel: false })
				} finally {
					this.loading = false
					this.loadStatus()
				}
			}
		}
	}
</script>

<style>
	.seed-card {
		padding-bottom: 32rpx;
	}

	.title {
		font-size: 38rpx;
		font-weight: 700;
		margin-bottom: 12rpx;
	}

	.hint {
		color: #6b7280;
		line-height: 42rpx;
		margin-bottom: 24rpx;
	}

	.status-box {
		background: #f9fafb;
		border-radius: 10rpx;
		padding: 24rpx;
		margin-bottom: 22rpx;
	}

	.status-label {
		color: #6b7280;
		font-size: 26rpx;
		margin-bottom: 8rpx;
	}

	.status-value {
		font-size: 42rpx;
		font-weight: 700;
		color: #111827;
	}

	.action-btn {
		height: 84rpx;
		line-height: 84rpx;
		margin-top: 16rpx;
		border-radius: 10rpx;
	}

	.ghost-btn {
		background: #ffffff;
		color: #1677ff;
		border: 1rpx solid #bfdbfe;
	}
</style>