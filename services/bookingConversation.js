import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const recordsPath = path.join(__dirname, '..', 'data', 'careRecords.json')

const sessions = new Map()

const serviceOptions = {
  BA01: 'BA01 基本身體清潔',
  BA02: 'BA02 基本日常照顧',
  BA03: 'BA03 測量生命徵象',
  BA04: 'BA04 協助進食或管灌餵食',
  BA05: 'BA05 餐食照顧',
  BA06: 'BA06 協助沐浴及洗頭',
  BA07: 'BA07 足部照護',
  BA08: 'BA08 翻身拍背',
  BA09: 'BA09 肢體關節活動',
  BA10: 'BA10 協助上下樓梯',
  BA11: 'BA11 陪同外出',
  BA12: 'BA12 陪同就醫',
  BA13: 'BA13 家務服務',
  BA14: 'BA14 代購或代領物品',
  BA15: 'BA15 安全看視',
  BA16: 'BA16 陪伴服務',
  BA17: 'BA17 巡迴服務',
  BA18: 'BA18 依指示抽吸',
  BA19: 'BA19 施打胰島素',
  BA20: 'BA20 甘油球通便',
  BA21: 'BA21 照顧服務綜合加計',
  BA22: 'BA22 假日照顧加計',
  BA23: 'BA23 夜間照顧加計',
  BA24: 'BA24 偏遠地區加計',
}

const serviceGroups = {
  basic: {
    label: 'BA01-BA12 身體照顧',
    codes: [
      'BA01',
      'BA02',
      'BA03',
      'BA04',
      'BA05',
      'BA06',
      'BA07',
      'BA08',
      'BA09',
      'BA10',
      'BA11',
      'BA12',
    ],
  },
  extended: {
    label: 'BA13-BA24 生活協助與加計',
    codes: [
      'BA13',
      'BA14',
      'BA15',
      'BA16',
      'BA17',
      'BA18',
      'BA19',
      'BA20',
      'BA21',
      'BA22',
      'BA23',
      'BA24',
    ],
  },
}

const timeOptions = {
  morning: '上午 08:00-12:00',
  afternoon: '下午 13:30-17:30',
  evening: '傍晚 18:00-21:00',
}

const frequencyOptions = {
  w1: '每週 1 次',
  w2: '每週 2 次',
  w3: '每週 3 次',
  w5: '每週 5 次',
  daily: '每天固定',
}

const durationOptions = {
  30: '30 分鐘',
  60: '1 小時',
  90: '1.5 小時',
  120: '2 小時',
}

const relationshipOptions = {
  child: '子女',
  spouse: '配偶',
  grandchild: '孫子女',
  relative: '其他親屬',
  friend: '朋友/照顧者',
}

const stepQuestions = {
  contactName: '請輸入主要聯絡人姓名。',
  contactPhone: '請輸入聯絡電話，例如 0912345678。',
  receiverName: '請輸入需要被服務的對象姓名。',
  address: '請輸入服務地址。',
  notes:
    '最後，請輸入特殊注意事項。例如：跌倒風險、失智、寵物、門禁、指定醫院。若沒有請輸入「無」。',
}

const textMessage = (text) => ({
  type: 'text',
  text,
})

const postbackAction = (label, data) => ({
  type: 'action',
  action: {
    type: 'postback',
    label,
    data,
    displayText: label,
  },
})

const quickReplyMessage = (text, items) => ({
  type: 'text',
  text,
  quickReply: {
    items,
  },
})

const flexText = (text, options = {}) => ({
  type: 'text',
  text,
  wrap: true,
  ...options,
})

const detailRow = (icon, label, value) => ({
  type: 'box',
  layout: 'baseline',
  spacing: 'sm',
  contents: [
    flexText(icon, {
      flex: 0,
      size: 'sm',
    }),
    flexText(label, {
      flex: 3,
      size: 'xs',
      color: '#607D8B',
    }),
    flexText(value || '未填寫', {
      flex: 7,
      size: 'sm',
      color: '#263238',
      weight: 'bold',
    }),
  ],
})

const sectionLabel = (icon, label, color = '#1F6F78') => ({
  type: 'box',
  layout: 'horizontal',
  spacing: 'sm',
  margin: 'md',
  contents: [
    flexText(icon, {
      flex: 0,
      size: 'sm',
    }),
    flexText(label, {
      size: 'sm',
      color,
      weight: 'bold',
    }),
  ],
})

const button = (label, data, style = 'primary') => ({
  type: 'button',
  style,
  height: 'sm',
  action: {
    type: 'postback',
    label,
    data,
    displayText: label,
  },
})

const getUserKey = (lineEvent) => lineEvent.source?.userId || lineEvent.replyToken

const readRecords = async () => {
  try {
    const text = await fs.readFile(recordsPath, 'utf8')
    return JSON.parse(text)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []
    }
    throw error
  }
}

const writeRecords = async (records) => {
  await fs.writeFile(recordsPath, JSON.stringify(records, null, 2))
}

const createSession = (data = {}) => ({
  step: 'contactName',
  data,
})

const nextStep = {
  contactName: 'contactPhone',
  contactPhone: 'receiverName',
  receiverName: 'relationship',
  relationship: 'address',
  address: 'serviceGroup',
  serviceGroup: 'serviceType',
  serviceType: 'timeSlot',
  timeSlot: 'notes',
  notes: 'confirm',
}

const getNextStep = (session, completedStep) => {
  if (
    completedStep === 'address' &&
    session.data.serviceType &&
    session.data.frequency &&
    session.data.timeSlot &&
    session.data.duration
  ) {
    return 'notes'
  }

  return nextStep[completedStep]
}

const buildQuestion = (session) => {
  if (session.step === 'relationship') {
    return quickReplyMessage(
      '請選擇你和被服務對象的關係。',
      Object.entries(relationshipOptions).map(([id, label]) =>
        postbackAction(label, `booking:answer:relationship:${id}`),
      ),
    )
  }

  if (session.step === 'serviceGroup') {
    return quickReplyMessage(
      '請先選擇服務項目分類。',
      Object.entries(serviceGroups).map(([id, group]) =>
        postbackAction(group.label, `booking:answer:serviceGroup:${id}`),
      ),
    )
  }

  if (session.step === 'serviceType') {
    const group = serviceGroups[session.data.serviceGroup]

    return quickReplyMessage(
      `請選擇預約服務項目：${group.label}`,
      group.codes.map((code) =>
        postbackAction(serviceOptions[code], `booking:answer:serviceType:${code}`),
      ),
    )
  }

  if (session.step === 'timeSlot') {
    return quickReplyMessage(
      '請選擇希望預約的服務時間。',
      Object.entries(timeOptions).map(([id, label]) =>
        postbackAction(label, `booking:answer:timeSlot:${id}`),
      ),
    )
  }

  return textMessage(stepQuestions[session.step])
}

const validateAnswer = (step, answer) => {
  if (!answer) {
    return '這個欄位不能空白，請再輸入一次。'
  }

  if (step === 'contactPhone' && !/^09\d{8}$/.test(answer)) {
    return '電話格式需要是 09 開頭的 10 碼手機號碼，例如 0912345678。'
  }

  return ''
}

const scheduledSummaryMessage = (session) => ({
  type: 'flex',
  altText: '已排定服務班表',
  contents: {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#1F6F78',
      paddingAll: '16px',
      contents: [
        flexText('已排定服務班表', {
          color: '#FFFFFF',
          weight: 'bold',
          size: 'lg',
        }),
        flexText('接著留下聯絡與服務地址資料', {
          color: '#D9F4F2',
          size: 'sm',
          margin: 'xs',
        }),
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        sectionLabel('🗓️', '服務安排'),
        detailRow('🧩', '項目', session.data.serviceType),
        detailRow('🔁', '頻率', session.data.frequency),
        detailRow('🕒', '時段', session.data.timeSlot),
        detailRow('⏱️', '每次', session.data.duration),
        {
          type: 'separator',
          margin: 'md',
        },
        flexText('你可以隨時輸入「取消」停止填寫。', {
          size: 'xs',
          color: '#607D8B',
          margin: 'md',
        }),
      ],
    },
  },
})

const confirmationMessage = (session) => ({
  type: 'flex',
  altText: '預約資料確認',
  contents: {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#1F6F78',
      paddingAll: '16px',
      contents: [
        flexText('請確認資料', {
          weight: 'bold',
          size: 'xs',
          color: '#D9F4F2',
        }),
        flexText('預約資料確認', {
          weight: 'bold',
          size: 'lg',
          color: '#FFFFFF',
        }),
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        sectionLabel('👤', '家屬與被服務者'),
        detailRow('🧑', '聯絡人', session.data.contactName),
        detailRow('☎️', '電話', session.data.contactPhone),
        detailRow('🧓', '對象', session.data.receiverName),
        detailRow('🤝', '關係', session.data.relationship),
        sectionLabel('🏠', '服務地點'),
        detailRow('📍', '地址', session.data.address),
        sectionLabel('🗓️', '照顧安排', '#C65F2E'),
        detailRow('🧩', '項目', session.data.serviceType),
        detailRow('🔁', '頻率', session.data.frequency || '待確認'),
        detailRow('🕒', '時間', session.data.timeSlot),
        detailRow('⏱️', '每次', session.data.duration || '待確認'),
        sectionLabel('📝', '注意事項', '#7A5C00'),
        detailRow('💬', '備註', session.data.notes || '無'),
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        button('確認送出', 'booking:confirm'),
        button('重新填寫', 'booking:start', 'secondary'),
        button('取消', 'booking:cancel', 'secondary'),
      ],
    },
  },
})

const saveBooking = async (lineEvent, session) => {
  const records = await readRecords()
  const record = {
    id: `CARE-${Date.now()}`,
    recordType: 'booking',
    status: '已送出',
    createdAt: new Date().toISOString(),
    lineUserId: lineEvent.source?.userId || '',
    lineDisplayName: '',
    receiverName: session.data.receiverName,
    birthday: '',
    cmsLevel: '',
    welfareStatus: '',
    serviceType: session.data.serviceType,
    frequency: session.data.frequency || '',
    timeSlot: session.data.timeSlot,
    duration: session.data.duration || '',
    address: session.data.address,
    contactName: session.data.contactName,
    contactPhone: session.data.contactPhone,
    relationship: session.data.relationship,
    notes: session.data.notes || '無',
  }

  records.push(record)
  await writeRecords(records)
  return record
}

export const startBookingConversation = (lineEvent) => {
  const userKey = getUserKey(lineEvent)
  const session = createSession()
  sessions.set(userKey, session)

  return [
    textMessage('好的，我會一步一步協助你完成預約資料。你可以隨時輸入「取消」停止填寫。'),
    buildQuestion(session),
  ]
}

const startBookingConversationWithSchedule = (
  lineEvent,
  serviceCode,
  frequencyId,
  timeSlotId,
  durationId,
) => {
  const userKey = getUserKey(lineEvent)
  const session = createSession({
    serviceType: serviceOptions[serviceCode] || serviceCode,
    frequency: frequencyOptions[frequencyId] || '',
    timeSlot: timeOptions[timeSlotId] || '',
    duration: durationOptions[durationId] || '',
  })
  sessions.set(userKey, session)

  return [scheduledSummaryMessage(session), buildQuestion(session)]
}

export const hasActiveBookingConversation = (lineEvent) => sessions.has(getUserKey(lineEvent))

export const clearBookingConversation = (lineEvent) => {
  sessions.delete(getUserKey(lineEvent))
}

export const handleBookingText = (lineEvent, messageText) => {
  const userKey = getUserKey(lineEvent)
  const session = sessions.get(userKey)

  if (!session) {
    return null
  }

  if (messageText === '取消') {
    sessions.delete(userKey)
    return textMessage('已取消本次預約填寫。需要時請重新點選「預約照顧服務」。')
  }

  const error = validateAnswer(session.step, messageText)
  if (error) {
    return textMessage(error)
  }

  const completedStep = session.step
  session.data[completedStep] = messageText
  session.step = getNextStep(session, completedStep)

  if (session.step === 'confirm') {
    return confirmationMessage(session)
  }

  return buildQuestion(session)
}

export const handleBookingPostback = async (lineEvent) => {
  const data = lineEvent.postback.data
  const userKey = getUserKey(lineEvent)

  if (data === 'booking:start') {
    return startBookingConversation(lineEvent)
  }

  if (data.startsWith('booking:startWith:')) {
    const [, , serviceCode, frequencyId, timeSlotId, durationId] = data.split(':')
    return startBookingConversationWithSchedule(
      lineEvent,
      serviceCode,
      frequencyId,
      timeSlotId,
      durationId,
    )
  }

  if (data === 'booking:cancel') {
    sessions.delete(userKey)
    return textMessage('已取消本次預約填寫。')
  }

  const session = sessions.get(userKey)
  if (!session) {
    return textMessage('目前沒有進行中的預約填寫，請重新點選「預約照顧服務」。')
  }

  if (data === 'booking:confirm') {
    const record = await saveBooking(lineEvent, session)
    sessions.delete(userKey)
    return {
      type: 'text',
      text: `已送出預約資料，資料編號：${record.id}\n管理者可下載 CSV 報表用 Excel 開啟。`,
    }
  }

  const [, action, field, value] = data.split(':')
  if (action !== 'answer') {
    return textMessage('找不到這個預約操作，請重新點選「預約照顧服務」。')
  }

  if (field === 'relationship') {
    session.data.relationship = relationshipOptions[value]
  } else if (field === 'serviceType') {
    session.data.serviceType = serviceOptions[value]
  } else if (field === 'serviceGroup') {
    session.data.serviceGroup = value
  } else if (field === 'timeSlot') {
    session.data.timeSlot = timeOptions[value]
  }

  session.step = nextStep[field]

  if (session.step === 'confirm') {
    return confirmationMessage(session)
  }

  return buildQuestion(session)
}
