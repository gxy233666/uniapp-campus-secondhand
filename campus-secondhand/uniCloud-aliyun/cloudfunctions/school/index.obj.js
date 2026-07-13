const db = uniCloud.database()
const schools = db.collection('schools')

const schoolList = [
	{ school_id: 'fj_xiamen_university', name: '厦门大学', province: '福建省', city: '厦门市', level: '本科' },
	{ school_id: 'fj_fuzhou_university', name: '福州大学', province: '福建省', city: '福州市', level: '本科' },
	{ school_id: 'fj_fujian_normal_university', name: '福建师范大学', province: '福建省', city: '福州市', level: '本科' },
	{ school_id: 'fj_fujian_agriculture_forestry_university', name: '福建农林大学', province: '福建省', city: '福州市', level: '本科' },
	{ school_id: 'fj_huaqiao_university', name: '华侨大学', province: '福建省', city: '泉州市', level: '本科' },
	{ school_id: 'fj_jimei_university', name: '集美大学', province: '福建省', city: '厦门市', level: '本科' },
	{ school_id: 'fj_fujian_medical_university', name: '福建医科大学', province: '福建省', city: '福州市', level: '本科' },
	{ school_id: 'fj_fujian_university_tcm', name: '福建中医药大学', province: '福建省', city: '福州市', level: '本科' },
	{ school_id: 'fj_minnan_normal_university', name: '闽南师范大学', province: '福建省', city: '漳州市', level: '本科' },
	{ school_id: 'fj_fujian_university_technology', name: '福建理工大学', province: '福建省', city: '福州市', level: '本科' },
	{ school_id: 'fj_xiamen_university_technology', name: '厦门理工学院', province: '福建省', city: '厦门市', level: '本科' },
	{ school_id: 'fj_minjiang_university', name: '闽江学院', province: '福建省', city: '福州市', level: '本科' },
	{ school_id: 'fj_quanzhou_normal_university', name: '泉州师范学院', province: '福建省', city: '泉州市', level: '本科' },
	{ school_id: 'fj_putian_university', name: '莆田学院', province: '福建省', city: '莆田市', level: '本科' },
	{ school_id: 'fj_sanming_university', name: '三明学院', province: '福建省', city: '三明市', level: '本科' },
	{ school_id: 'fj_longyan_university', name: '龙岩学院', province: '福建省', city: '龙岩市', level: '本科' },
	{ school_id: 'fj_wuyi_university', name: '武夷学院', province: '福建省', city: '南平市', level: '本科' },
	{ school_id: 'fj_ningde_normal_university', name: '宁德师范学院', province: '福建省', city: '宁德市', level: '本科' },
	{ school_id: 'fj_xiamen_medical_college', name: '厦门医学院', province: '福建省', city: '厦门市', level: '本科' },
	{ school_id: 'fj_fujian_jiangxia_university', name: '福建江夏学院', province: '福建省', city: '福州市', level: '本科' },
	{ school_id: 'fj_fujian_police_college', name: '福建警察学院', province: '福建省', city: '福州市', level: '本科' },
	{ school_id: 'fj_minnan_science_technology_university', name: '闽南科技学院', province: '福建省', city: '泉州市', level: '本科' },
	{ school_id: 'fj_yang_en_university', name: '仰恩大学', province: '福建省', city: '泉州市', level: '本科' },
	{ school_id: 'fj_minnan_university_technology', name: '闽南理工学院', province: '福建省', city: '泉州市', level: '本科' },
	{ school_id: 'fj_fuzhou_business_college', name: '福州工商学院', province: '福建省', city: '福州市', level: '本科' },
	{ school_id: 'fj_fuzhou_university_international_studies_trade', name: '福州外语外贸学院', province: '福建省', city: '福州市', level: '本科' },
	{ school_id: 'fj_xiamen_institute_technology', name: '厦门工学院', province: '福建省', city: '厦门市', level: '本科' },
	{ school_id: 'fj_quanzhou_information_engineering', name: '泉州信息工程学院', province: '福建省', city: '泉州市', level: '本科' },
	{ school_id: 'ln_shenyang_agricultural_university', name: '沈阳农业大学', province: '辽宁省', city: '沈阳市', level: '本科' },
	{ school_id: 'bj_tsinghua_university', name: '清华大学', province: '北京市', city: '北京市', level: '本科' },
	{ school_id: 'bj_peking_university', name: '北京大学', province: '北京市', city: '北京市', level: '本科' }
]

function ok(data, message = 'ok') {
	return { code: 0, message, data }
}

function normalizeError(error) {
	return error && error.message ? error.message : String(error)
}

async function ensureSchools() {
	const countRes = await schools.count()
	if (countRes.total > 0) return
	for (const item of schoolList) {
		await schools.add({
			...item,
			created_at: Date.now(),
			updated_at: Date.now()
		})
	}
}

function sortSchools(list) {
	return list.sort((left, right) => {
		if (left.province !== right.province) return left.province.localeCompare(right.province, 'zh-CN')
		if (left.city !== right.city) return left.city.localeCompare(right.city, 'zh-CN')
		return left.name.localeCompare(right.name, 'zh-CN')
	})
}

module.exports = {
	async list() {
		try {
			await ensureSchools()
			const res = await schools.orderBy('province', 'asc').orderBy('city', 'asc').get()
			return ok(sortSchools(res.data))
		} catch (error) {
			return ok(sortSchools([...schoolList]), `使用内置院校数据：${normalizeError(error)}`)
		}
	}
}