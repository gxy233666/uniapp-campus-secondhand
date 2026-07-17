export const defaultProducts = [
	{ _id: 'local-001', title: '高等数学同济第七版', description: '大一高数教材，少量笔记，重点章节已经标注，适合期末复习。', price: 26, category: '教材资料', condition: '八成新', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_name: '陈同学', image_url: '/static/default-products/book-math.svg' },
	{ _id: 'local-002', title: '英语四级真题资料包', description: '近年四级真题和听力材料，纸质资料保存完整，适合集中备考。', price: 18, category: '教材资料', condition: '九成新', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_name: '林同学', image_url: '/static/default-products/book-english.svg' },
	{ _id: 'local-003', title: 'Java 程序设计教材', description: '计算机课程教材，配套实验内容还在，适合入门练习。', price: 32, category: '教材资料', condition: '八成新', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_name: '黄同学', image_url: '/static/default-products/book-code.svg' },
	{ _id: 'local-004', title: '罗技无线鼠标', description: '宿舍闲置鼠标，点击和滚轮正常，带 USB 接收器。', price: 45, category: '数码电子', condition: '正常使用', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_name: '吴同学', image_url: '/static/default-products/digital-mouse.svg' },
	{ _id: 'local-005', title: '蓝牙耳机', description: '自习和通勤用过一段时间，续航正常，外壳有轻微使用痕迹。', price: 58, category: '数码电子', condition: '正常使用', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_name: '郑同学', image_url: '/static/default-products/digital-earphone.svg' },
	{ _id: 'local-006', title: '宿舍折叠收纳箱', description: '搬宿舍多出来的收纳箱，容量大，可放衣服和杂物。', price: 20, category: '生活用品', condition: '九成新', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_name: '许同学', image_url: '/static/default-products/life-storage.svg' },
	{ _id: 'local-007', title: '床边小台灯', description: '亮度可调，适合宿舍夜间学习，电源线正常。', price: 25, category: '生活用品', condition: '八成新', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_name: '周同学', image_url: '/static/default-products/life-lamp.svg' },
	{ _id: 'local-008', title: '羽毛球拍一支', description: '入门级羽毛球拍，线还比较紧，适合体育课或日常运动。', price: 35, category: '运动户外', condition: '正常使用', school_id: 'fj_minnan_science_technology_university', school_name: '闽南科技学院', seller_name: '叶同学', image_url: '/static/default-products/sport-badminton.svg' },
	{ _id: 'local-009', title: '考研政治资料套装', description: '考研政治基础资料和刷题本，部分页面有标注。', price: 30, category: '教材资料', condition: '八成新', school_id: 'fj_xiamen_university', school_name: '厦门大学', seller_name: '苏同学', image_url: '/static/default-products/book-exam.svg' },
	{ _id: 'local-010', title: 'iPad 保护壳', description: '适配 10.2 寸 iPad，边角保护完整，颜色偏深灰。', price: 22, category: '数码电子', condition: '九成新', school_id: 'fj_xiamen_university', school_name: '厦门大学', seller_name: '高同学', image_url: '/static/default-products/digital-charger.svg' },
	{ _id: 'local-011', title: '宿舍桌面置物架', description: '桌面置物架，适合放书和小物件，安装简单。', price: 28, category: '生活用品', condition: '正常使用', school_id: 'fj_xiamen_university', school_name: '厦门大学', seller_name: '邱同学', image_url: '/static/default-products/life-shelf.svg' },
	{ _id: 'local-012', title: '室外篮球一个', description: '气密性正常，适合日常训练和课后运动。', price: 40, category: '运动户外', condition: '正常使用', school_id: 'fj_xiamen_university', school_name: '厦门大学', seller_name: '赖同学', image_url: '/static/default-products/sport-basketball.svg' },
	{ _id: 'local-013', title: '机械键盘 87 键', description: '青轴机械键盘，按键正常，适合宿舍电脑使用。', price: 80, category: '数码电子', condition: '正常使用', school_id: 'fj_fuzhou_university', school_name: '福州大学', seller_name: '曾同学', image_url: '/static/default-products/digital-keyboard.svg' },
	{ _id: 'local-014', title: '宿舍热水壶', description: '宿舍用热水壶，烧水正常，毕业出闲置。', price: 30, category: '生活用品', condition: '八成新', school_id: 'fj_fuzhou_university', school_name: '福州大学', seller_name: '卢同学', image_url: '/static/default-products/life-kettle.svg' },
	{ _id: 'local-015', title: '瑜伽垫', description: '宿舍健身用瑜伽垫，厚度适中，边角完好。', price: 26, category: '运动户外', condition: '九成新', school_id: 'fj_fuzhou_university', school_name: '福州大学', seller_name: '唐同学', image_url: '/static/default-products/sport-yoga.svg' },
	{ _id: 'local-016', title: '植物学实验指导', description: '农学相关实验指导书，内容完整，适合课程预习。', price: 20, category: '教材资料', condition: '九成新', school_id: 'ln_shenyang_agricultural_university', school_name: '沈阳农业大学', seller_name: '赵同学', image_url: '/static/default-products/book-exam.svg' },
	{ _id: 'local-017', title: '算法导论中文版', description: '经典算法教材，书比较厚，适合计算机方向学习。', price: 65, category: '教材资料', condition: '八成新', school_id: 'bj_tsinghua_university', school_name: '清华大学', seller_name: '韩同学', image_url: '/static/default-products/book-code.svg' },
	{ _id: 'local-018', title: '经济学原理教材', description: '经济学入门教材，书页干净，适合通识课程。', price: 38, category: '教材资料', condition: '九成新', school_id: 'bj_peking_university', school_name: '北京大学', seller_name: '何同学', image_url: '/static/default-products/book-math.svg' }
]

export function normalizeDefaultProduct(item) {
	return {
		...item,
		is_local: true,
		source: 'default',
		status: '在售',
		seller_id: item.seller_id || `default-seller-${item._id}`,
		contact: item.contact || ''
	}
}

export function getDefaultProducts() {
	return defaultProducts.map((item) => normalizeDefaultProduct(item))
}

export function getDefaultProductById(id) {
	const product = defaultProducts.find((item) => item._id === id)
	return product ? normalizeDefaultProduct(product) : null
}
