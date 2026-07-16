<template>
	<view class="page">
		<!-- 加载状态 -->
		<view v-if="loading" class="empty loading-state">
			<view class="loading-spinner"></view>
			<text>商品加载中...</text>
		</view>

		<!-- 编辑表单 -->
		<view v-else class="card form-card">
			<!-- 顶部标题 -->
			<view class="form-header">
				<text class="header-icon">✏️</text>
				<view class="header-text">
					<text class="form-title">编辑商品</text>
					<text class="form-subtitle">修改信息后保存</text>
				</view>
			</view>

			<!-- 商品标题 -->
			<view class="input-group">
				<text class="input-label">商品标题</text>
				<input class="field" v-model="form.title" placeholder="例如：全新高数教材下册" />
			</view>

			<!-- 描述 -->
			<view class="input-group">
				<text class="input-label">商品描述</text>
				<textarea class="textarea" v-model="form.description" placeholder="描述购买时间、使用情况、交易地点等"></textarea>
			</view>

			<!-- 价格 -->
			<view class="input-group">
				<text class="input-label">价格</text>
				<view class="price-wrapper">
					<text class="price-symbol">¥</text>
					<input class="field price-field" v-model="form.price" type="digit" placeholder="0.00" />
				</view>
			</view>

			<!-- 分类选择 -->
			<view class="input-group">
				<text class="input-label">商品分类</text>
				<picker :range="categories" :value="categoryIndex" @change="onCategoryChange">
					<view class="field picker-field">
						<text :class="{ placeholder: !form.category }">{{ form.category || '请选择分类' }}</text>
						<text class="picker-arrow">›</text>
					</view>
				</picker>
			</view>

			<!-- 成色选择 -->
			<view class="input-group">
				<text class="input-label">商品成色</text>
				<picker :range="conditions" :value="conditionIndex" @change="onConditionChange">
					<view class="field picker-field">
						<text :class="{ placeholder: !form.condition }">{{ form.condition || '请选择成色' }}</text>
						<text class="picker-arrow">›</text>
					</view>
				</picker>
			</view>

			<!-- 联系方式 -->
			<view class="input-group">
				<text class="input-label">联系方式</text>
				<input class="field" v-model="form.contact" placeholder="手机号或微信号" />
			</view>

			<!-- 图片地址 -->
			<view class="input-group">
				<text class="input-label">图片链接</text>
				<input class="field" v-model="form.image_url" placeholder="可先留空，后续补充图片地址" />
			</view>

			<!-- 提交按钮 -->
			<button class="primary-btn submit-btn" @click="submit">
				<text class="btn-icon">💾</text>
				<text>保存修改</text>
			</button>
		</view>
	</view>
</template>

<script>
	import { getCurrentUser, productApi } from '@/common/api.js'

	export default {
		data() {
			return {
				id: '',
				loading: false,
				categories: ['教材资料', '数码电子', '生活用品', '运动户外', '其他'],
				conditions: ['全新', '九成新', '八成新', '正常使用', '有明显使用痕迹'],
				form: {
					title: '',
					description: '',
					price: '',
					category: '',
					condition: '',
					contact: '',
					image_url: ''
				}
			}
		},
		computed: {
			categoryIndex() {
				const index = this.categories.indexOf(this.form.category)
				return index >= 0 ? index : 0
			},
			conditionIndex() {
				const index = this.conditions.indexOf(this.form.condition)
				return index >= 0 ? index : 0
			}
		},
		onLoad(options) {
			this.id = options.id || ''
			this.loadProduct()
		},
		methods: {
			onCategoryChange(event) {
				this.form.category = this.categories[event.detail.value]
			},
			onConditionChange(event) {
				this.form.condition = this.conditions[event.detail.value]
			},
			validate() {
				if (!this.form.title || !this.form.description || !this.form.price || !this.form.category || !this.form.contact) {
					uni.showToast({ title: '请完善必填信息', icon: 'none' })
					return false
				}
				return true
			},
			async loadProduct() {
				if (!this.id) {
					uni.showToast({ title: '缺少商品ID', icon: 'none' })
					return
				}
				this.loading = true
				try {
					const res = await productApi.detail(this.id)
					if (res.code !== 0) throw new Error(res.message || '商品加载失败')
					const product = res.data
					const user = getCurrentUser()
					if (!user || product.seller_id !== user._id) {
						throw new Error('只能编辑自己发布的商品')
					}
					this.form = {
						title: product.title || '',
						description: product.description || '',
						price: String(product.price || ''),
						category: product.category || '',
						condition: product.condition || '',
						contact: product.contact || '',
						image_url: product.image_url || ''
					}
				} catch (error) {
					uni.showModal({ title: '加载失败', content: error.message || '商品加载失败', showCancel: false })
				} finally {
					this.loading = false
				}
			},
			async submit() {
				if (!this.validate()) return
				const user = getCurrentUser()
				if (!user) {
					uni.navigateTo({ url: '/pages/login/login' })
					return
				}
				try {
					const res = await productApi.update(this.id, {
						...this.form,
						price: Number(this.form.price),
						seller_id: user._id
					})
					if (res.code !== 0) throw new Error(res.message || '保存失败')
					uni.showToast({ title: '保存成功', icon: 'success' })
					setTimeout(() => uni.navigateBack(), 600)
				} catch (error) {
					uni.showModal({ title: '保存失败', content: error.message || '保存失败', showCancel: false })
				}
			}
		}
	}
</script>

<style>
	/* 页面背景 */
	.page {
		background: linear-gradient(160deg, #f0f4ff 0%, #e9f0fa 100%);
		min-height: 100vh;
		padding: 32rpx 28rpx;
		box-sizing: border-box;
	}

	/* 加载状态 */
	.empty {
		padding: 200rpx 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #6b7280;
		font-size: 28rpx;
		gap: 20rpx;
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

	/* 卡片样式 */
	.form-card {
		background: #ffffff;
		border-radius: 32rpx;
		padding: 40rpx 32rpx 36rpx;
		box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.06);
	}

	/* 顶部标题区域 */
	.form-header {
		display: flex;
		align-items: center;
		margin-bottom: 36rpx;
		gap: 20rpx;
	}

	.header-icon {
		font-size: 52rpx;
		background: #f0f4ff;
		width: 80rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 24rpx;
	}

	.header-text {
		display: flex;
		flex-direction: column;
	}

	.form-title {
		font-size: 38rpx;
		font-weight: 700;
		color: #1f2937;
		line-height: 1.2;
	}

	.form-subtitle {
		font-size: 24rpx;
		color: #6b7280;
		margin-top: 4rpx;
	}

	/* 输入组 */
	.input-group {
		margin-bottom: 28rpx;
	}

	.input-label {
		font-size: 26rpx;
		font-weight: 600;
		color: #374151;
		margin-bottom: 12rpx;
		display: block;
	}

	/* 通用输入框样式 */
	.field {
		width: 100%;
		height: 86rpx;
		line-height: 86rpx;
		background: #f9fafb;
		border-radius: 20rpx;
		padding: 0 24rpx;
		box-sizing: border-box;
		font-size: 28rpx;
		border: 1rpx solid #f3f4f6;
		transition: all 0.2s;
	}

	.field:focus {
		background: #ffffff;
		border-color: #1677ff;
		box-shadow: 0 0 0 4rpx rgba(22, 119, 255, 0.08);
	}

	/* 文本域 */
	.textarea {
		width: 100%;
		height: 180rpx;
		background: #f9fafb;
		border-radius: 20rpx;
		padding: 20rpx 24rpx;
		box-sizing: border-box;
		font-size: 28rpx;
		line-height: 40rpx;
		border: 1rpx solid #f3f4f6;
	}

	.textarea:focus {
		background: #ffffff;
		border-color: #1677ff;
	}

	/* 价格输入特殊样式 */
	.price-wrapper {
		display: flex;
		align-items: center;
		background: #f9fafb;
		border-radius: 20rpx;
		border: 1rpx solid #f3f4f6;
		padding-left: 24rpx;
	}

	.price-symbol {
		font-size: 32rpx;
		font-weight: 600;
		color: #f43f5e;
		margin-right: 8rpx;
	}

	.price-field {
		border: none;
		background: transparent;
		flex: 1;
		height: 86rpx;
		padding-left: 0;
	}

	/* picker 显示字段 */
	.picker-field {
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: #111827;
	}

	.placeholder {
		color: #9ca3af;
	}

	.picker-arrow {
		font-size: 32rpx;
		color: #cbd5e1;
		font-weight: 300;
	}

	/* 提交按钮 */
	.submit-btn {
		margin-top: 20rpx;
		height: 92rpx;
		line-height: 92rpx;
		background: linear-gradient(135deg, #1677ff, #4096ff);
		color: #ffffff;
		border-radius: 24rpx;
		font-size: 32rpx;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		border: none;
		box-shadow: 0 8rpx 24rpx rgba(22, 119, 255, 0.3);
		transition: all 0.2s;
	}

	.submit-btn:active {
		transform: scale(0.97);
		box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.2);
	}

	.btn-icon {
		font-size: 32rpx;
	}
</style>