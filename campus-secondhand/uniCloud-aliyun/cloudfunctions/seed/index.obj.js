const db = uniCloud.database()
const products = db.collection('products')

const seedBatch = 'campus-secondhand-demo-products-v1'

const categoryImages = {
	'教材资料': '',
	'数码电子': '',
	'生活用品': '',
	'运动户外': '',
	'其他': ''
}

const seedProducts = [
	{ title: '高等数学同济第七版', description: '大一高数教材，少量笔记，重点章节已经标注，适合复习和补课。', price: 26, category: '教材资料', condition: '八成新', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_id: 'seed-user-mnkj-1', seller_name: '陈同学', contact: '13859010001' },
	{ title: '英语四级真题资料包', description: '近年四级真题和听力材料，纸质资料保存完整，适合备考。', price: 18, category: '教材资料', condition: '九成新', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_id: 'seed-user-mnkj-2', seller_name: '林同学', contact: '13859010002' },
	{ title: 'Java 程序设计教材', description: '计算机课程教材，配套实验内容还在，适合入门练习。', price: 32, category: '教材资料', condition: '八成新', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_id: 'seed-user-mnkj-3', seller_name: '黄同学', contact: '13859010003' },
	{ title: '罗技无线鼠标', description: '宿舍闲置鼠标，点击和滚轮正常，带 USB 接收器。', price: 45, category: '数码电子', condition: '正常使用', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_id: 'seed-user-mnkj-4', seller_name: '吴同学', contact: '13859010004' },
	{ title: '小米蓝牙耳机', description: '通勤和自习用过一段时间，续航正常，外壳轻微使用痕迹。', price: 58, category: '数码电子', condition: '正常使用', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_id: 'seed-user-mnkj-5', seller_name: '郑同学', contact: '13859010005' },
	{ title: '宿舍折叠收纳箱', description: '搬宿舍多出来的收纳箱，容量大，可放衣服和杂物。', price: 20, category: '生活用品', condition: '九成新', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_id: 'seed-user-mnkj-6', seller_name: '许同学', contact: '13859010006' },
	{ title: '床边小台灯', description: '亮度可调，适合宿舍夜间学习，电源线正常。', price: 25, category: '生活用品', condition: '八成新', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_id: 'seed-user-mnkj-7', seller_name: '周同学', contact: '13859010007' },
	{ title: '羽毛球拍一支', description: '入门级羽毛球拍，线还比较紧，适合体育课或日常运动。', price: 35, category: '运动户外', condition: '正常使用', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_id: 'seed-user-mnkj-8', seller_name: '叶同学', contact: '13859010008' },
	{ title: '考研政治资料', description: '考研政治基础资料和刷题本，部分页面有标注。', price: 30, category: '教材资料', condition: '八成新', school_id: 'fj_xiamen_university', school_name: '厦门大学', seller_id: 'seed-user-xmu-1', seller_name: '苏同学', contact: '13859210001' },
	{ title: 'iPad 保护壳', description: '适配 10.2 寸 iPad，边角保护完整，颜色偏深灰。', price: 22, category: '数码电子', condition: '九成新', school_id: 'fj_xiamen_university', school_name: '厦门大学', seller_id: 'seed-user-xmu-2', seller_name: '高同学', contact: '13859210002' },
	{ title: '宿舍置物架', description: '桌面置物架，适合放书和小物件，安装简单。', price: 28, category: '生活用品', condition: '正常使用', school_id: 'fj_xiamen_university', school_name: '厦门大学', seller_id: 'seed-user-xmu-3', seller_name: '邱同学', contact: '13859210003' },
	{ title: '篮球一个', description: '室外篮球，气密性正常，适合日常训练。', price: 40, category: '运动户外', condition: '正常使用', school_id: 'fj_xiamen_university', school_name: '厦门大学', seller_id: 'seed-user-xmu-4', seller_name: '赖同学', contact: '13859210004' },
	{ title: '线性代数教材', description: '线代教材和习题册一起出，适合期末复习。', price: 24, category: '教材资料', condition: '八成新', school_id: 'fj_fuzhou_university', school_name: '福州大学', seller_id: 'seed-user-fzu-1', seller_name: '郭同学', contact: '13859110001' },
	{ title: '机械键盘 87 键', description: '青轴机械键盘，按键正常，适合宿舍电脑使用。', price: 80, category: '数码电子', condition: '正常使用', school_id: 'fj_fuzhou_university', school_name: '福州大学', seller_id: 'seed-user-fzu-2', seller_name: '曾同学', contact: '13859110002' },
	{ title: '热水壶', description: '宿舍用热水壶，烧水正常，毕业出闲置。', price: 30, category: '生活用品', condition: '八成新', school_id: 'fj_fuzhou_university', school_name: '福州大学', seller_id: 'seed-user-fzu-3', seller_name: '卢同学', contact: '13859110003' },
	{ title: '瑜伽垫', description: '宿舍健身用瑜伽垫，厚度适中，边角完好。', price: 26, category: '运动户外', condition: '九成新', school_id: 'fj_fuzhou_university', school_name: '福州大学', seller_id: 'seed-user-fzu-4', seller_name: '唐同学', contact: '13859110004' },
	{ title: '教育心理学教材', description: '师范类课程教材，笔记较少，适合课程学习。', price: 21, category: '教材资料', condition: '八成新', school_id: 'fj_fujian_normal_university', school_name: '福建师范大学', seller_id: 'seed-user-fjnu-1', seller_name: '宋同学', contact: '13859120001' },
	{ title: '便携充电宝', description: '一万毫安充电宝，接口正常，可日常备用。', price: 39, category: '数码电子', condition: '正常使用', school_id: 'fj_fujian_normal_university', school_name: '福建师范大学', seller_id: 'seed-user-fjnu-2', seller_name: '姜同学', contact: '13859120002' },
	{ title: '床帘支架', description: '宿舍床帘支架，配件完整，适合上铺或下铺。', price: 25, category: '生活用品', condition: '八成新', school_id: 'fj_fujian_normal_university', school_name: '福建师范大学', seller_id: 'seed-user-fjnu-3', seller_name: '罗同学', contact: '13859120003' },
	{ title: '乒乓球拍套装', description: '两支球拍加几个球，适合体育课和课后娱乐。', price: 32, category: '运动户外', condition: '正常使用', school_id: 'fj_fujian_normal_university', school_name: '福建师范大学', seller_id: 'seed-user-fjnu-4', seller_name: '施同学', contact: '13859120004' },
	{ title: '植物学实验指导', description: '农学相关实验指导书，内容完整，适合课程预习。', price: 20, category: '教材资料', condition: '九成新', school_id: 'ln_shenyang_agricultural_university', school_name: '沈阳农业大学', seller_id: 'seed-user-synau-1', seller_name: '赵同学', contact: '13802410001' },
	{ title: '无线网卡', description: 'USB 无线网卡，适合台式机或旧电脑使用。', price: 35, category: '数码电子', condition: '正常使用', school_id: 'ln_shenyang_agricultural_university', school_name: '沈阳农业大学', seller_id: 'seed-user-synau-2', seller_name: '孙同学', contact: '13802410002' },
	{ title: '保温饭盒', description: '两层保温饭盒，清洗干净，适合带饭使用。', price: 24, category: '生活用品', condition: '八成新', school_id: 'ln_shenyang_agricultural_university', school_name: '沈阳农业大学', seller_id: 'seed-user-synau-3', seller_name: '冯同学', contact: '13802410003' },
	{ title: '算法导论中文版', description: '经典算法教材，书比较厚，适合计算机方向学习。', price: 65, category: '教材资料', condition: '八成新', school_id: 'bj_tsinghua_university', school_name: '清华大学', seller_id: 'seed-user-thu-1', seller_name: '韩同学', contact: '13801010001' },
	{ title: 'Type-C 扩展坞', description: '支持 HDMI 和 USB 接口，适合笔记本外接屏幕。', price: 90, category: '数码电子', condition: '九成新', school_id: 'bj_tsinghua_university', school_name: '清华大学', seller_id: 'seed-user-thu-2', seller_name: '曹同学', contact: '13801010002' },
	{ title: '桌面显示器支架', description: '可调高度显示器支架，桌面收纳更整洁。', price: 42, category: '生活用品', condition: '正常使用', school_id: 'bj_tsinghua_university', school_name: '清华大学', seller_id: 'seed-user-thu-3', seller_name: '潘同学', contact: '13801010003' },
	{ title: '经济学原理教材', description: '经济学入门教材，书页干净，适合通识课程。', price: 38, category: '教材资料', condition: '九成新', school_id: 'bj_peking_university', school_name: '北京大学', seller_id: 'seed-user-pku-1', seller_name: '何同学', contact: '13801020001' },
	{ title: '索尼有线耳机', description: '有线耳机音质正常，接口无接触不良。', price: 35, category: '数码电子', condition: '正常使用', school_id: 'bj_peking_university', school_name: '北京大学', seller_id: 'seed-user-pku-2', seller_name: '袁同学', contact: '13801020002' },
	{ title: '自行车车筐', description: '前置车筐，适合校园自行车，螺丝配件齐全。', price: 18, category: '运动户外', condition: '八成新', school_id: 'bj_peking_university', school_name: '北京大学', seller_id: 'seed-user-pku-3', seller_name: '马同学', contact: '13801020003' },
	{ title: '闽南文化概论资料', description: '地方文化课程资料，整理了课堂重点和复习提纲。', price: 16, category: '教材资料', condition: '九成新', school_id: 'fj_quanzhou_normal_university', school_name: '泉州师范学院', seller_id: 'seed-user-qznu-1', seller_name: '谢同学', contact: '13859510001' },
	{ title: '桌面小风扇', description: 'USB 小风扇，风力正常，适合宿舍桌面使用。', price: 19, category: '生活用品', condition: '正常使用', school_id: 'fj_quanzhou_normal_university', school_name: '泉州师范学院', seller_id: 'seed-user-qznu-2', seller_name: '钟同学', contact: '13859510002' },
	{ title: '考公行测资料', description: '行测基础资料和部分刷题笔记，适合入门备考。', price: 28, category: '其他', condition: '八成新', school_id: 'fj_jimei_university', school_name: '集美大学', seller_id: 'seed-user-jmu-1', seller_name: '方同学', contact: '13859220001' },
	{ title: '宿舍床上书桌', description: '可折叠床上书桌，桌面平整，适合临时学习。', price: 33, category: '生活用品', condition: '八成新', school_id: 'fj_jimei_university', school_name: '集美大学', seller_id: 'seed-user-jmu-2', seller_name: '魏同学', contact: '13859220002' }
]

function ok(data, message = 'ok') {
	return { code: 0, message, data }
}

function fail(message, code = 500) {
	return { code, message, data: null }
}

function normalizeError(error) {
	return error && error.message ? error.message : String(error)
}

function buildPayload(item, index) {
	const now = Date.now()
	const createdAt = now - (seedProducts.length - index) * 60000
	return {
		...item,
		image_url: item.image_url || categoryImages[item.category] || '',
		status: '在售',
		seed_batch: seedBatch,
		created_at: createdAt,
		updated_at: createdAt
	}
}

module.exports = {
	async seedProducts() {
		try {
			const existed = await products.where({ seed_batch: seedBatch }).count()
			if (existed.total > 0) {
				return ok({ inserted: 0, skipped: existed.total, seed_batch: seedBatch }, '演示商品已存在，已跳过重复导入')
			}
			let inserted = 0
			for (let index = 0; index < seedProducts.length; index += 1) {
				await products.add(buildPayload(seedProducts[index], index))
				inserted += 1
			}
			return ok({ inserted, skipped: 0, seed_batch: seedBatch }, '演示商品导入成功')
		} catch (error) {
			return fail(`演示商品导入失败：${normalizeError(error)}`)
		}
	},

	async status() {
		try {
			const res = await products.where({ seed_batch: seedBatch }).count()
			return ok({ total: res.total, seed_batch: seedBatch })
		} catch (error) {
			return fail(`演示商品状态读取失败：${normalizeError(error)}`)
		}
	}
}