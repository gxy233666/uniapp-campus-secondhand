<script>
	export default {
		onLaunch() {
			const currentUser = uni.getStorageSync('currentUser')
			if (!currentUser) {
				uni.setStorageSync('currentUser', {
					_id: 'demo-user-1',
					username: '张三',
					phone: '13800000001'
				})
			}
		}
	}
</script>

<style>
	page {
		background: #f5f7fa;
		color: #1f2937;
		font-size: 28rpx;
	}

	.page {
		min-height: 100vh;
		padding: 24rpx;
		box-sizing: border-box;
	}

	.card {
		background: #ffffff;
		border-radius: 12rpx;
		padding: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
	}

	.primary-btn {
		background: #1677ff;
		color: #ffffff;
		border-radius: 10rpx;
		font-size: 30rpx;
	}

	.muted {
		color: #6b7280;
	}
</style>
