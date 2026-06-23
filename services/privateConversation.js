import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { privateCareDurations, privateCareServices } from '../data/careData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const recordsPath = path.join(__dirname, '..', 'data', 'careRecords.json')

const sessions = new Map()

const stepQuestions = {
  contactName: '請輸入主要聯絡人姓名。',
  contactPhone: '請輸入聯絡電話，例如 0912345678。',
  receiverName: '請輸入需要被服務的對象姓名。',
  elderCondition: '請簡單描述長輩狀況，例如：可自行行走、需攙扶、失智、跌倒風險。',
  preferredTime: '請輸入希望服務時間，例如：6/20 上午、每週三下午、今晚 20:00。',
  address: '請輸入服務地址。',
  notes: '最後，請輸入其他需求。若沒有請輸入「無」。',
}

const nextStep = {
  contactName: 'contactPhone',
  contactPhone: 'receiverName',
  receiverName: 'elderCondition',
  elderCondition: 'preferredTime',
  preferredTime: 'address',
  address: 'notes',
  notes: 'confirm',
}

const getUserKey = (lineEvent) => lineEvent.source?.userId || lineEvent.replyToken

const textMessage = (text) => ({
  type: 'text',
  text,
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
    flexText(icon, { flex: 0, size: 'sm' }),
    flexText(label, { flex: 3, size: 'xs', color: '#607D8B' }),
    flexText(value || '未填寫', {
      flex: 7,
      size: 'sm',
      color: '#263238',
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

const privateServiceLabel = (serviceId) =>
  privateCareServices.find((item) => item.id === serviceId)?.title || '自費服務'

const privateDurationLabel = (durationId) =>
  privateCareDurations.find((item) => item.id === durationId)?.label || '由機構回電討論'

const estimatedAmount = (serviceId, durationId) => {
  const service = privateCareServices.find((item) => item.id === serviceId)
  const duration = privateCareDurations.find((item) => item.id === durationId)

  if (!service || !duration?.hours) {
    return 0
  }

  return service.pricePerHour * duration.hours
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

const confirmationMessage = (session) => ({
  type: 'flex',
  altText: '自費服務回電資料確認',
  contents: {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#8A4B32',
      paddingAll: '16px',
      contents: [
        flexText('自費服務回電資料', {
          color: '#FFFFFF',
          weight: 'bold',
          size: 'lg',
        }),
        flexText('辦公室會依此資料回電確認', {
          color: '#FFE8D8',
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
        detailRow('🧩', '服務', session.data.serviceType),
        detailRow('⏱️', '時間', session.data.duration),
        detailRow('🧾', '預估', session.data.estimatedAmount || '回電確認'),
        detailRow('🧑', '聯絡人', session.data.contactName),
        detailRow('☎️', '電話', session.data.contactPhone),
        detailRow('🧓', '對象', session.data.receiverName),
        detailRow('🩺', '狀況', session.data.elderCondition),
        detailRow('🕒', '希望', session.data.preferredTime),
        detailRow('📍', '地址', session.data.address),
        detailRow('💬', '備註', session.data.notes || '無'),
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        button('確認送出', 'private:confirm'),
        button(
          '重新填寫',
          `private:startWith:${session.data.serviceId}:${session.data.durationId}`,
          'secondary',
        ),
        button('取消', 'private:cancel', 'secondary'),
      ],
    },
  },
})

const savePrivateRequest = async (lineEvent, session) => {
  const records = await readRecords()
  const record = {
    id: `PRIVATE-${Date.now()}`,
    recordType: 'private_self_pay_request',
    status: '待辦公室回電',
    createdAt: new Date().toISOString(),
    lineUserId: lineEvent.source?.userId || '',
    lineDisplayName: '',
    receiverName: session.data.receiverName,
    serviceType: session.data.serviceType,
    frequency: '自費服務',
    timeSlot: session.data.preferredTime,
    duration: session.data.duration,
    estimatedAmount: session.data.estimatedAmount,
    address: session.data.address,
    contactName: session.data.contactName,
    contactPhone: session.data.contactPhone,
    relationship: '',
    elderCondition: session.data.elderCondition,
    notes: session.data.notes || '無',
  }

  records.push(record)
  await writeRecords(records)
  return record
}

export const startPrivateConversation = (lineEvent, serviceId, durationId) => {
  const userKey = getUserKey(lineEvent)
  const amount = estimatedAmount(serviceId, durationId)
  const session = {
    step: 'contactName',
    data: {
      serviceId,
      durationId,
      serviceType: privateServiceLabel(serviceId),
      duration: privateDurationLabel(durationId),
      estimatedAmount: amount ? `NT$${amount.toLocaleString('zh-TW')}` : '由機構回電確認',
    },
  }

  sessions.set(userKey, session)

  return [
    textMessage(
      '我會協助整理自費服務需求，送出後由辦公室人員回電確認。你可以輸入「取消」停止填寫。',
    ),
    textMessage(stepQuestions[session.step]),
  ]
}

export const hasActivePrivateConversation = (lineEvent) => sessions.has(getUserKey(lineEvent))

export const clearPrivateConversation = (lineEvent) => {
  sessions.delete(getUserKey(lineEvent))
}

export const handlePrivateText = (lineEvent, messageText) => {
  const userKey = getUserKey(lineEvent)
  const session = sessions.get(userKey)

  if (!session) {
    return null
  }

  if (messageText === '取消') {
    sessions.delete(userKey)
    return textMessage('已停止自費服務填寫。')
  }

  const error = validateAnswer(session.step, messageText)
  if (error) {
    return textMessage(error)
  }

  const completedStep = session.step
  session.data[completedStep] = messageText
  session.step = nextStep[completedStep]

  if (session.step === 'confirm') {
    return confirmationMessage(session)
  }

  return textMessage(stepQuestions[session.step])
}

export const handlePrivatePostback = async (lineEvent) => {
  const data = lineEvent.postback.data
  const userKey = getUserKey(lineEvent)

  if (data.startsWith('private:startWith:')) {
    const [, , serviceId, durationId] = data.split(':')
    return startPrivateConversation(lineEvent, serviceId, durationId)
  }

  if (data === 'private:cancel') {
    sessions.delete(userKey)
    return textMessage('已取消自費服務填寫。')
  }

  const session = sessions.get(userKey)
  if (!session) {
    return textMessage('目前沒有進行中的自費服務填寫，請重新點選「自費服務」。')
  }

  if (data === 'private:confirm') {
    const record = await savePrivateRequest(lineEvent, session)
    sessions.delete(userKey)
    return textMessage(`已送出自費服務需求，紀錄編號：${record.id}\n辦公室人員會依資料回電確認。`)
  }

  return textMessage('找不到這個自費服務操作，請重新點選「自費服務」。')
}
