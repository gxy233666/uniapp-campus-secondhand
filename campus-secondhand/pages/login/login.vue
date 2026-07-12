<template>
	<view class="page">
		<view class="card">
			<view class="title">选择模拟用户</view>
			<view class="hint">课程项目暂不做真实认证，用模拟用户演示不同账号的发布和收藏记录。</view>
			<view v-for="item in users" :key="item._id" class="user-row" @click="login(item)">
				<view>
					<view class="username">{{ item.username }}</view>
					<view class="muted">{{ item.phone }}</view>
				</view>
				<text class="select-text">使用</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { setCurrentUser, userApi } from '@/common/api.js'

	export default {
		data() {
			return {
				users: []
			}
		},
		onLoad() {
			this.loadUsers()
		},
		methods: {
			async loadUsers() {
				try {
					const res = await userApi.list()
					this.users = res.data || []
				} catch (error) {
					uni.showToast({ title: '用户加载失败', icon: 'none' })
				}
			},
			async login(user) {
				try {
					const res = await userApi.login(user._id)
					setCurrentUser(res.data || user)
					uni.showToast({ title: '切换成功', icon: 'success' })
					setTimeout(() => uni.switchTab({ url: '/pages/mine/mine' }), 500)
				} catch (error) {
					uni.showToast({ title: '切换失败', icon: 'none' })
				}
			}
		}
	}
</script>

<style>
	.title {
		font-size: 38rpx;
		font-weight: 700;
		margin-bottom: 12rpx;
	}

	.hint {
		color: #6b7280;
		line-height: 42rpx;
		margin-bottom: 26rpx;
	}

	.user-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 22rpx 0;
		border-top: 1rpx solid #edf0f5;
	}

	.username {
		font-size: 32rpx;
		font-weight: 700;
		margin-bottom: 8rpx;
	}

	.select-text {
		color: #1677ff;
		font-weight: 700;
	}
</style>
