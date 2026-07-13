<template>
	<view class="page">
		<view v-if="loading" class="empty">加载中...</view>
		<view v-else class="card form-card">
			<view class="form-title">编辑商品</view>
			<input class="field" v-model="form.title" placeholder="商品标题" />
			<textarea class="textarea" v-model="form.description" placeholder="商品描述，例如购买时间、使用情况、交易地点"></textarea>
			<input class="field" v-model="form.price" type="digit" placeholder="价格" />
			<picker :range="categories" :value="categoryIndex" @change="onCategoryChange">
				<view class="field picker-field">{{ form.category || '选择分类' }}</view>
			</picker>
			<picker :range="conditions" :value="conditionIndex" @change="onConditionChange">
				<view class="field picker-field">{{ form.condition || '选择成色' }}</view>
			</picker>
			<input class="field" v-model="form.contact" placeholder="联系方式，如手机号或微信" />
			<input class="field" v-model="form.image_url" placeholder="图片地址，可先留空" />
			<button class="primary-btn submit-btn" @click="submit">保存修改</button>
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
	.empty {
		padding: 80rpx 0;
		text-align: center;
		color: #6b7280;
	}

	.form-card {
		padding-bottom: 32rpx;
	}

	.form-title {
		font-size: 36rpx;
		font-weight: 700;
		margin-bottom: 24rpx;
	}

	.field,
	.textarea {
		width: 100%;
		background: #f9fafb;
		border-radius: 10rpx;
		padding: 0 22rpx;
		margin-bottom: 18rpx;
		box-sizing: border-box;
	}

	.field {
		height: 82rpx;
		line-height: 82rpx;
	}

	.textarea {
		height: 180rpx;
		padding-top: 20rpx;
		line-height: 40rpx;
	}

	.picker-field {
		color: #4b5563;
	}

	.submit-btn {
		margin-top: 10rpx;
		height: 86rpx;
		line-height: 86rpx;
	}
</style>
