<template>
	<view class="page">
		<view class="card form-card">
			<view class="form-header">
				<text class="header-icon">📦</text>
				<view class="header-text">
					<text class="form-title">发布闲置</text>
					<text class="form-subtitle">让好物找到新主人</text>
				</view>
			</view>

			<view class="school-tip">
				<text class="tip-icon">🎓</text>
				<text>{{ userSchoolText }}</text>
			</view>

			<view class="input-group">
				<text class="input-label">商品标题</text>
				<input class="field" v-model="form.title" placeholder="例如：全新高数教材下册" />
			</view>

			<view class="input-group">
				<text class="input-label">商品描述</text>
				<textarea class="textarea" v-model="form.description" placeholder="描述购买时间、使用情况、交易地点等"></textarea>
			</view>

			<view class="input-group">
				<text class="input-label">价格</text>
				<view class="price-wrapper">
					<text class="price-symbol">¥</text>
					<input class="field price-field" v-model="form.price" type="digit" placeholder="0.00" />
				</view>
			</view>

			<view class="input-group">
				<text class="input-label">商品分类</text>
				<picker :range="categories" @change="onCategoryChange">
					<view class="field picker-field">
						<text :class="{ placeholder: !form.category }">{{ form.category || '请选择分类' }}</text>
						<text class="picker-arrow">?</text>
					</view>
				</picker>
			</view>

			<view class="input-group">
				<text class="input-label">商品成色</text>
				<picker :range="conditions" @change="onConditionChange">
					<view class="field picker-field">
						<text :class="{ placeholder: !form.condition }">{{ form.condition || '请选择成色' }}</text>
						<text class="picker-arrow">?</text>
					</view>
				</picker>
			</view>

			<view class="input-group">
				<text class="input-label">联系方式</text>
				<input class="field" v-model="form.contact" placeholder="手机号或微信号" />
			</view>

			<view class="input-group">
				<text class="input-label">商品图片</text>
				<view class="image-uploader" @click="chooseProductImage">
					<image v-if="imagePreview" class="image-preview" :src="imagePreview" mode="aspectFill"></image>
					<view v-else class="upload-placeholder">
						<text class="upload-icon">+</text>
						<text class="upload-text">{{ imageButtonText }}</text>
					</view>
					<view v-if="uploadingImage" class="upload-mask">{{ uploadMaskText }}</view>
				</view>
				<view class="image-actions">
					<text class="image-tip">选择本地图片后会自动上传到 uniCloud 云存储</text>
					<text v-if="imagePreview" class="remove-image" @click.stop="clearImage">移除</text>
				</view>
			</view>

			<button class="primary-btn submit-btn" :disabled="uploadingImage || submitting" @click="submit">
				<text class="btn-icon">✨</text>
				<text>{{ submitButtonText }}</text>
			</button>
		</view>
	</view>
</template>

<script>
	import { getCurrentUser, productApi } from '@/common/api.js'

	export default {
		data() {
			return {
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
				},
				imagePreview: '',
				uploadingImage: false,
				submitting: false
			}
		},
		computed: {
			currentUser() {
				return getCurrentUser()
			},
			userSchoolText() {
				if (!this.currentUser) return '请先登录账号后发布商品'
				return this.currentUser.school_name ? `${this.currentUser.school_name}` : '当前账号未绑定院校'
			},
			imageButtonText() {
				return this.uploadingImage ? '上传中...' : '选择图片'
			},
			uploadMaskText() {
				return '上传中...'
			},
			submitButtonText() {
				if (this.uploadingImage) return '图片上传中...'
				return this.submitting ? '发布中...' : '立即发布'
			}
		},
		methods: {
			createEmptyForm() {
				return {
					title: '',
					description: '',
					price: '',
					category: '',
					condition: '',
					contact: '',
					image_url: ''
				}
			},
			onCategoryChange(event) {
				this.form.category = this.categories[event.detail.value]
			},
			onConditionChange(event) {
				this.form.condition = this.conditions[event.detail.value]
			},
			getImageExtension(filePath = '') {
				const cleanPath = String(filePath).split('?')[0]
				const matched = cleanPath.match(/\.([a-zA-Z0-9]+)$/)
				return matched ? `.${matched[1].toLowerCase()}` : '.jpg'
			},
			chooseImageAsync() {
				return new Promise((resolve, reject) => {
					uni.chooseImage({
						count: 1,
						sizeType: ['compressed'],
						sourceType: ['album', 'camera'],
						success: resolve,
						fail: reject
					})
				})
			},
			async chooseProductImage() {
				if (this.uploadingImage) return
				try {
					const chooseRes = await this.chooseImageAsync()
					const tempFilePath = chooseRes.tempFilePaths && chooseRes.tempFilePaths[0]
					if (!tempFilePath) return

					this.imagePreview = tempFilePath
					this.uploadingImage = true
					const ext = this.getImageExtension(tempFilePath)
					const cloudPath = `product-images/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
					const uploadRes = await uniCloud.uploadFile({
						filePath: tempFilePath,
						cloudPath
					})
					if (!uploadRes.fileID) throw new Error('图片上传失败')
					this.form.image_url = uploadRes.fileID
					uni.showToast({ title: '图片上传成功', icon: 'success' })
				} catch (error) {
					if (error && error.errMsg && error.errMsg.includes('cancel')) return
					this.form.image_url = ''
					uni.showModal({ title: '图片上传失败', content: error.message || error.errMsg || '请重试', showCancel: false })
				} finally {
					this.uploadingImage = false
				}
			},
			clearImage() {
				this.imagePreview = ''
				this.form.image_url = ''
			},
			validate() {
				if (!this.form.title || !this.form.description || !this.form.price || !this.form.category || !this.form.contact) {
					uni.showToast({ title: '请完善必填信息', icon: 'none' })
					return false
				}
				return true
			},
			resetForm() {
				this.form = this.createEmptyForm()
				this.imagePreview = ''
			},
			async submit() {
				if (this.uploadingImage) {
					uni.showToast({ title: '图片上传中，请稍后', icon: 'none' })
					return
				}
				if (!this.validate()) return
				const user = getCurrentUser()
				if (!user) {
					uni.navigateTo({ url: '/pages/login/login' })
					return
				}
				if (!user.school_id || !user.school_name) {
					uni.showModal({ title: '无法发布', content: '当前账号没有院校信息，请注册新账号或切换到已选择院校的账号。', showCancel: false })
					return
				}
				this.submitting = true
				try {
					const res = await productApi.add({
						...this.form,
						price: Number(this.form.price),
						school_id: user.school_id,
						school_name: user.school_name,
						seller_id: user._id,
						seller_name: user.username
					})
					if (res.code !== 0) throw new Error(res.message || '发布失败')
					uni.showToast({ title: '发布成功', icon: 'success' })
					this.resetForm()
					setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 600)
				} catch (error) {
					uni.showModal({ title: '发布失败', content: error.message || '发布失败', showCancel: false })
				} finally {
					this.submitting = false
				}
			}
		}
	}
</script>

<style>
	.page {
		background: linear-gradient(160deg, #f0f4ff 0%, #e9f0fa 100%);
		min-height: 100vh;
		padding: 32rpx 28rpx;
		box-sizing: border-box;
	}

	.form-card {
		background: #ffffff;
		border-radius: 32rpx;
		padding: 40rpx 32rpx 36rpx;
		box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.06);
	}

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

	.school-tip {
		background: #edf5ff;
		border-radius: 16rpx;
		padding: 18rpx 24rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
		margin-bottom: 32rpx;
		color: #1677ff;
		font-size: 26rpx;
		font-weight: 500;
		border: 1rpx solid rgba(22, 119, 255, 0.15);
	}

	.tip-icon {
		font-size: 28rpx;
	}

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
	}

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

	.image-uploader {
		position: relative;
		width: 100%;
		height: 320rpx;
		border-radius: 24rpx;
		background: #f9fafb;
		border: 2rpx dashed #cbd5e1;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	.image-preview {
		width: 100%;
		height: 100%;
		display: block;
	}

	.upload-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
		color: #64748b;
	}

	.upload-icon {
		width: 72rpx;
		height: 72rpx;
		line-height: 68rpx;
		text-align: center;
		border-radius: 50%;
		background: #edf5ff;
		color: #1677ff;
		font-size: 52rpx;
		font-weight: 300;
	}

	.upload-text {
		font-size: 26rpx;
		font-weight: 600;
	}

	.upload-mask {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(17, 24, 39, 0.52);
		color: #ffffff;
		font-size: 28rpx;
		font-weight: 700;
	}

	.image-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
		margin-top: 12rpx;
	}

	.image-tip {
		flex: 1;
		font-size: 23rpx;
		line-height: 34rpx;
		color: #8a96a8;
	}

	.remove-image {
		flex: 0 0 auto;
		font-size: 24rpx;
		font-weight: 700;
		color: #ef4444;
	}

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
	}

	.submit-btn[disabled] {
		background: #cbd5e1;
		box-shadow: none;
	}

	.submit-btn:active {
		transform: scale(0.97);
		box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.2);
	}

	.btn-icon {
		font-size: 32rpx;
	}
</style>
