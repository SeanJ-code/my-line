export const policySources = [
  {
    title: '衛福部 1966 長照服務申請及給付',
    url: 'https://1966.gov.tw/LTC/cp-6495-69915-207.html',
    checkedDate: '2026-06-12',
  },
]

export const calculatorMeta = {
  version: '2026_v1',
  currency: 'TWD',
  policy_base: '中華民國衛生福利部長期照顧服務給付及支付基準',
}

export const calculatorFormulas = {
  total_cost: 'Σ(單項長照項目政府核定價 * 服務次數)',
  description_1: '若總費用在政府月額度內：個案自付額 = 總費用 * 福利身份自付比率',
  description_2:
    '若總費用超出政府月額度：個案自付額 = (政府月額度 * 福利身份自付比率) + (總費用 - 政府月額度)',
}

export const cmsAllowances = [
  { level: 2, label: 'CMS 第2級', allowance: 10020, note: '' },
  { level: 3, label: 'CMS 第3級', allowance: 15460, note: '' },
  { level: 4, label: 'CMS 第4級', allowance: 18580, note: '' },
  { level: 5, label: 'CMS 第5級', allowance: 24100, note: '' },
  { level: 6, label: 'CMS 第6級', allowance: 28070, note: '' },
  { level: 7, label: 'CMS 第7級', allowance: 32290, note: '' },
  { level: 8, label: 'CMS 第8級', allowance: 36180, note: '' },
]

export const welfareStatuses = [
  {
    id: 'W01',
    category: '第一類',
    name: '長照低收入戶',
    subsidyRate: 1,
    copaymentRate: 0,
    label: '長照低收入戶：自付 0%',
    description: '列冊低收入戶且符合長照給付資格，政府補助100%，民眾免自付。',
  },
  {
    id: 'W02',
    category: '第二類',
    name: '長照中低收入戶',
    subsidyRate: 0.95,
    copaymentRate: 0.05,
    label: '長照中低收入戶：自付 5%',
    description: '中低收入戶且符合長照給付資格，政府補助95%，民眾自付5%。',
  },
  {
    id: 'W03',
    category: '第三類',
    name: '長照一般戶',
    subsidyRate: 0.84,
    copaymentRate: 0.16,
    label: '長照一般戶：自付 16%',
    description: '一般身分民眾且符合長照給付資格，政府補助84%，民眾自付16%。',
  },
  {
    id: 'W04',
    category: '自費戶',
    name: '全額自費',
    subsidyRate: 0,
    copaymentRate: 1,
    label: '全額自費：自付 100%',
    description: '未經照管中心評估、額度用畢，或不符補助資格者，需全額自行負擔。',
  },
]

export const visualAssets = {
  home: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
  booking:
    'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
  calculator:
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
  guide:
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
  schedule:
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
  emergency:
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
  planning:
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
  privateCare:
    'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80&sat=-8',
}

export const faqImages = [
  'https://loremflickr.com/cache/resized/65535_49160730708_a02eeb7d1c_b_900_600_nofilter.jpg',
  'https://loremflickr.com/cache/resized/295_18445835412_4f19153d34_h_900_600_nofilter.jpg',
  'https://loremflickr.com/cache/resized/5562_31287545212_55fba3a6c3_b_900_600_nofilter.jpg',
  'https://loremflickr.com/cache/resized/330_31711595351_23f0b40d7e_h_900_600_nofilter.jpg',
  'https://loremflickr.com/cache/resized/7342_27534045982_dca842e3b6_h_900_600_nofilter.jpg',
  'https://loremflickr.com/cache/resized/5658_30570044414_acf77181a0_b_900_600_nofilter.jpg',
  'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80',
]

export const startGuide = [
  '還沒申請或不知道資格：先看 1966 指南。',
  '已經有 CMS 等級：直接做補助試算。',
  '已決定要服務：進入預約並排定固定班表。',
]

export const designRecommendations = {
  addToLineBot: [
    '歡迎首頁與功能分流',
    '預約照顧服務',
    '長照補助計算機',
    '1966 申請免緊張指南',
    '常見問題',
    '緊急聯絡資訊',
    '福利身分與固定班表選擇',
  ],
  keepAsBackstageData: [
    '完整 BA01-BA24 明細',
    '照服員資格審核',
    '機構派案與排班',
    '服務紀錄簽到退',
    '每月請款與核銷資料',
  ],
  skipInFirstVersion: ['線上付款', '照服員登入後台', '即時 GPS 追蹤', '完整醫療病歷管理'],
}

export const plannedMonthlyCosts = [
  { id: '6000', label: '每月 NT$6,000', amount: 6000 },
  { id: '12000', label: '每月 NT$12,000', amount: 12000 },
  { id: '20000', label: '每月 NT$20,000', amount: 20000 },
  { id: '36000', label: '每月 NT$36,000', amount: 36000 },
]

export const privateCareServices = [
  {
    id: 'companion',
    title: '居家陪伴照顧',
    pricePerHour: 350,
    summary: '聊天陪伴、作息提醒、安全看視、簡易活動陪同。',
    imageUrl:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'clinic',
    title: '陪同就醫',
    pricePerHour: 450,
    summary: '陪同掛號、看診、領藥、交通銜接與返家回報。',
    imageUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'meal_home',
    title: '家務備餐',
    pricePerHour: 400,
    summary: '個案生活區域整理、簡易備餐、衣物與環境維持。',
    imageUrl:
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'night',
    title: '夜間短時照顧',
    pricePerHour: 500,
    summary: '夜間安全看視、如廁協助、用藥提醒與突發狀況通報。',
    imageUrl:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'respite',
    title: '家屬喘息半日',
    pricePerHour: 450,
    summary: '家屬外出或休息時，由照顧人員接手陪伴與看視。',
    imageUrl:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80',
  },
]

export const privateCareDurations = [
  { id: '2', label: '2 小時', hours: 2 },
  { id: '4', label: '4 小時', hours: 4 },
  { id: '8', label: '8 小時', hours: 8 },
  { id: 'custom', label: '由機構回電討論', hours: 0 },
]

export const privateCareNotes = [
  '自費服務不需等待政府核定，可先由機構回電確認人力與時間。',
  '試算以單純鐘點費估算，實際費用仍依距離、夜間、假日與照顧難度調整。',
  '若已有 CMS 等級，建議同時比較公費額度與自費補足方案。',
]

export const baServices = [
  {
    code: 'BA01',
    name: '基本身體清潔',
    summary: '床上或浴室洗頭、洗澡、擦澡、更衣、口腔清潔。',
    imageUrl:
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=80',
    group: 'basic',
  },
  {
    code: 'BA02',
    name: '基本日常照顧',
    summary: '翻身、拍背、上下床、梳洗與簡易肢體活動。',
    imageUrl:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80',
    group: 'basic',
  },
  {
    code: 'BA03',
    name: '測量生命徵象',
    summary: '定時測量血壓、血糖、體溫、脈搏或呼吸。',
    imageUrl:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80',
    group: 'basic',
  },
  {
    code: 'BA04',
    name: '協助進食或管灌餵食',
    summary: '協助餵食、準備管灌食物、灌食及灌食後清理。',
    imageUrl:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80',
    group: 'basic',
  },
  {
    code: 'BA05',
    name: '餐食照顧',
    summary: '備餐、餵食或協助進食、餐後簡易整理。',
    imageUrl:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80&sat=-12',
    group: 'basic',
  },
  {
    code: 'BA06',
    name: '協助沐浴及洗頭',
    summary: '於浴室協助個案全身沐浴、洗頭與吹乾頭髮。',
    imageUrl:
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=80&crop=faces',
    group: 'basic',
  },
  {
    code: 'BA07',
    name: '足部照護',
    summary: '足部清潔、趾甲修剪與足部狀況檢查。',
    imageUrl:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80',
    group: 'basic',
  },
  {
    code: 'BA08',
    name: '翻身拍背',
    summary: '每隔固定時間協助個案翻身、調整臥位與拍背。',
    imageUrl:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80&crop=entropy',
    group: 'basic',
  },
  {
    code: 'BA09',
    name: '肢體關節活動',
    summary: '協助進行被動或主動的肢體關節運動，非專業復能。',
    imageUrl:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80&sat=-20',
    group: 'basic',
  },
  {
    code: 'BA10',
    name: '協助上下樓梯',
    summary: '協助個案在無電梯環境安全上下樓梯。',
    imageUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80&crop=entropy',
    group: 'basic',
  },
  {
    code: 'BA11',
    name: '陪同外出',
    summary: '陪同散步、購物、訪友或參與社區活動。',
    imageUrl:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80&sat=-10',
    group: 'basic',
  },
  {
    code: 'BA12',
    name: '陪同就醫',
    summary: '陪同看診、領藥、掛號、住院手續與返家回報。',
    imageUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
    group: 'basic',
  },
  {
    code: 'BA13',
    name: '家務服務',
    summary: '以受照顧者主要生活範圍為限的清潔、衣物洗滌、垃圾清運。',
    imageUrl:
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80',
    group: 'extended',
  },
  {
    code: 'BA14',
    name: '代購或代領物品',
    summary: '代購生活必需品、藥品、代繳費用或領取郵件。',
    imageUrl:
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80&crop=entropy',
    group: 'extended',
  },
  {
    code: 'BA15',
    name: '安全看視',
    summary: '針對失智症或特殊行為個案，提供在場看視與陪伴。',
    imageUrl:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80&bri=-5',
    group: 'extended',
  },
  {
    code: 'BA16',
    name: '陪伴服務',
    summary: '聊天、讀報、散步、情緒支持與作息提醒。',
    imageUrl:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80&sat=10',
    group: 'extended',
  },
  {
    code: 'BA17',
    name: '巡迴服務',
    summary: '定時或定點巡視，確認個案安全與突發狀況。',
    imageUrl:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80&crop=faces',
    group: 'extended',
  },
  {
    code: 'BA18',
    name: '依指示抽吸',
    summary: '依醫囑或護理人員指示，協助清除呼吸道分泌物。',
    imageUrl:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80&crop=entropy',
    group: 'extended',
  },
  {
    code: 'BA19',
    name: '施打胰島素',
    summary: '依醫囑協助糖尿病個案皮下注射胰島素。',
    imageUrl:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80&bri=-5',
    group: 'extended',
  },
  {
    code: 'BA20',
    name: '甘油球通便',
    summary: '協助個案使用甘油球進行通便照護。',
    imageUrl:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80&sat=-15',
    group: 'extended',
  },
  {
    code: 'BA21',
    name: '照顧服務綜合加計',
    summary: '針對照顧難度較高個案之服務加計。',
    imageUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80&sat=-10',
    group: 'extended',
  },
  {
    code: 'BA22',
    name: '假日照顧加計',
    summary: '國定假日或例假日提供服務時之加計項目。',
    imageUrl:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80&crop=faces',
    group: 'extended',
  },
  {
    code: 'BA23',
    name: '夜間照顧加計',
    summary: '於夜間指定時段提供服務時之加計項目。',
    imageUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80&bri=-15',
    group: 'extended',
  },
  {
    code: 'BA24',
    name: '偏遠地區加計',
    summary: '服務地點位於政府認定偏遠地區或原鄉時之加計。',
    imageUrl:
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=900&q=80&sat=-10',
    group: 'extended',
  },
]

export const scheduleOptions = {
  frequencies: [
    { id: 'w1', label: '每週 1 次' },
    { id: 'w2', label: '每週 2 次' },
    { id: 'w3', label: '每週 3 次' },
    { id: 'w5', label: '每週 5 次' },
    { id: 'daily', label: '每天固定' },
  ],
  timeSlots: [
    { id: 'morning', label: '上午 08:00-12:00', defaultStartTime: '09:00' },
    { id: 'afternoon', label: '下午 13:30-17:30', defaultStartTime: '14:00' },
    { id: 'evening', label: '傍晚 18:00-21:00', defaultStartTime: '18:30' },
  ],
  durationOptions: [
    { id: '30', label: '30 分鐘' },
    { id: '60', label: '1 小時' },
    { id: '90', label: '1.5 小時' },
    { id: '120', label: '2 小時' },
  ],
  requirements: [
    '單次服務建議以 30 分鐘為基本單位。',
    '家務服務限受照顧者本人主要生活範圍，不含全家大掃除。',
    '特殊照護、夜間、假日與偏遠地區服務需由機構確認是否可派案。',
  ],
}

export const bookingFormFields = [
  '被照顧者姓名與生日',
  '被照顧者身分證字號或長照個案編號',
  'CMS 失能等級或是否尚未評估',
  '福利身分：低收入戶、中低收入戶、一般戶或自費',
  '服務地址與可停車/門禁資訊',
  '主要聯絡人姓名、電話、與個案關係',
  '需要的 BA 服務項目',
  '希望服務週期、星期、時段與每次時間',
  '疾病、管路、失智、跌倒風險、寵物、鑰匙交付等特殊注意事項',
  '緊急聯絡人與指定送醫醫院',
]

export const guideSteps = [
  {
    title: '確認資格',
    content: '65歲以上失能者、55歲以上失能原住民、50歲以上失智症者，或領有身心障礙證明者可申請。',
  },
  {
    title: '撥打 1966',
    content: '撥打長照專線 1966，準備個案身分證字號、現住地址、聯絡人電話與主要照顧問題。',
  },
  {
    title: '到府評估',
    content: '照管專員到府評估 CMS 等級，確認每月給付額度與可使用服務。',
  },
  {
    title: '擬定照顧計畫',
    content: '個案管理員與家屬討論服務項目、頻率、班表與自付額。',
  },
  {
    title: '開始服務',
    content: '照服員依約到府服務，家屬可追蹤服務紀錄與每月費用。',
  },
]

export const officialContacts = [
  {
    name: '長照服務專線',
    phone: '1966',
    note: '長照申請、評估與服務諮詢。',
  },
  {
    name: '緊急救護',
    phone: '119',
    note: '跌倒、意識不清、呼吸困難、胸痛等立即危及生命狀況。',
  },
  {
    name: '反詐騙諮詢',
    phone: '165',
    note: '陌生匯款、假冒補助、可疑收費或個資詐騙。',
  },
]

export const emergencyContacts = [
  {
    title: '立即危急狀況',
    name: '119 緊急救護',
    phone: '119',
    note: '跌倒昏迷、胸痛、呼吸困難、嚴重外傷時優先撥打。',
  },
  {
    title: '長照申請與諮詢',
    name: '1966 長照專線',
    phone: '1966',
    note: '申請長照、安排評估、詢問補助與服務資格。',
  },
  {
    title: '機構督導示範',
    name: '安心照護個管師',
    phone: '02-2345-6789',
    note: '服務異動、照服員未到、現場照顧問題回報。',
  },
  {
    title: '第一緊急聯絡人示範',
    name: '王小明 家屬',
    phone: '0912-345-678',
    note: '正式版本請改成家屬 24 小時可聯絡電話。',
  },
  {
    title: '指定送醫示範',
    name: '台北市立聯合醫院',
    phone: '02-2555-3000',
    note: '正式版本請填長輩平常就診、有完整病歷的醫院。',
  },
]

export const emergencyFields = [
  '第一緊急聯絡人姓名、關係、手機',
  '第二緊急聯絡人姓名、關係、手機',
  '指定送醫醫院與常就診科別',
  '慢性病、過敏藥物、管路、近期手術或跌倒紀錄',
  '住家地址、樓層、門禁、鑰匙或管理員資訊',
  '機構督導、個管師與服務單位電話',
]

export const faqItems = [
  {
    question: '長照2.0補助要怎麼申請？',
    answer: '可撥打 1966 長照專線，後續由照管專員聯繫並安排到府評估。',
  },
  {
    question: 'LINE Bot 可以直接核定補助嗎？',
    answer: '不行。Bot 可協助試算與整理資料，正式額度仍以政府照管中心評估結果為準。',
  },
  {
    question: '照服員可以幫全家打掃或煮飯嗎？',
    answer: '不行。公費長照服務以受照顧者本人為主，家務範圍限個案主要生活區域。',
  },
  {
    question: '政府補助額度不夠怎麼辦？',
    answer: '超過核定月額度的部分可選擇自費，或重新與個管師討論服務組合。',
  },
  {
    question: '低收入戶需要付費嗎？',
    answer: '照顧及專業服務核定額度內，長照低收入戶自付 0%。',
  },
  {
    question: '一般戶自付比例是多少？',
    answer: '照顧及專業服務核定額度內，一般戶常用自付比例為 16%。',
  },
  {
    question: '可以固定每週同一天服務嗎？',
    answer: '可以，但實際班表需視照服員可排班時間與機構派案結果確認。',
  },
  {
    question: '臨時取消服務怎麼辦？',
    answer: '建議至少前一個工作天通知機構或個管師，避免影響排班與費用計算。',
  },
  {
    question: '家中已有外籍看護還能使用長照嗎？',
    answer: '仍可申請部分長照資源，但可使用項目會受規範限制，需由照管中心確認。',
  },
  {
    question: '對照服員或服務內容不滿意怎麼辦？',
    answer: '可向機構督導或個管師反映，請求溝通、調整服務內容或重新媒合。',
  },
]

export const calculateSubsidy = ({ cmsLevel, welfareId, plannedAmount }) => {
  const cms = cmsAllowances.find((item) => item.level === Number(cmsLevel))
  const welfare = welfareStatuses.find((item) => item.id === welfareId)
  const amount = Number(plannedAmount)

  if (!cms || !welfare || Number.isNaN(amount)) {
    return null
  }

  const coveredAmount = Math.min(amount, cms.allowance)
  const overAmount = Math.max(amount - cms.allowance, 0)
  const copayment = Math.round(coveredAmount * welfare.copaymentRate + overAmount)
  const subsidy = Math.round(coveredAmount * welfare.subsidyRate)

  return {
    cms,
    welfare,
    plannedAmount: amount,
    coveredAmount,
    overAmount,
    subsidy,
    copayment,
  }
}
