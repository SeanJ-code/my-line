import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const recordsPath = path.join(__dirname, '..', 'data', 'careRecords.json')

const sessions = new Map()

const stepQuestions = {
  bookingId: '請輸入要取消的預約資料編號。若不知道，請輸入「不知道」。',
  contactName: '請輸入主要聯絡人姓名。',
  contactPhone: '請輸入聯絡電話，例如 0912345678。',
  receiverName: '請輸入被服務者姓名。',
  cancelReason: '請輸入取消原因，例如：臨時就醫、家屬自行照顧、時間需改期。',
}

const nextStep = {
  bookingId: 'contactName',
  contactName: 'contactPhone',
  contactPhone: 'receiverName',
  receiverName: 'cancelReason',
  cancelReason: 'confirm',
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
  altText: '取消預約資料確認',
  contents: {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#8A4B32',
      paddingAll: '16px',
      contents: [
        flexText('取消預約申請', {
          color: '#FFFFFF',
          weight: 'bold',
          size: 'lg',
        }),
        flexText('送出後會建立辦公室待確認紀錄', {
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
        detailRow('🧾', '原編號', session.data.bookingId),
        detailRow('🧑', '聯絡人', session.data.contactName),
        detailRow('☎️', '電話', session.data.contactPhone),
        detailRow('🧓', '對象', session.data.receiverName),
        detailRow('📝', '原因', session.data.cancelReason),
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        button('確認取消申請', 'cancel:confirm'),
        button('重新填寫', 'cancel:start', 'secondary'),
        button('放棄取消', 'cancel:abort', 'secondary'),
      ],
    },
  },
})

const saveCancelRequest = async (lineEvent, session) => {
  const records = await readRecords()
  const record = {
    id: `CANCEL-${Date.now()}`,
    recordType: 'cancel_request',
    status: '待辦公室確認',
    createdAt: new Date().toISOString(),
    lineUserId: lineEvent.source?.userId || '',
    lineDisplayName: '',
    originalBookingId: session.data.bookingId,
    receiverName: session.data.receiverName,
    contactName: session.data.contactName,
    contactPhone: session.data.contactPhone,
    cancelReason: session.data.cancelReason,
    notes: `取消原因：${session.data.cancelReason}`,
  }

  records.push(record)
  await writeRecords(records)
  return record
}

export const startCancelConversation = (lineEvent) => {
  const userKey = getUserKey(lineEvent)
  const session = {
    step: 'bookingId',
    data: {},
  }
  sessions.set(userKey, session)

  return [
    textMessage('我會協助建立取消預約紀錄，送出後由辦公室人員確認。你可以輸入「取消」停止填寫。'),
    textMessage(stepQuestions[session.step]),
  ]
}

export const hasActiveCancelConversation = (lineEvent) => sessions.has(getUserKey(lineEvent))

export const clearCancelConversation = (lineEvent) => {
  sessions.delete(getUserKey(lineEvent))
}

export const handleCancelText = (lineEvent, messageText) => {
  const userKey = getUserKey(lineEvent)
  const session = sessions.get(userKey)

  if (!session) {
    return null
  }

  if (messageText === '取消') {
    sessions.delete(userKey)
    return textMessage('已停止取消預約填寫。')
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

export const handleCancelPostback = async (lineEvent) => {
  const data = lineEvent.postback.data
  const userKey = getUserKey(lineEvent)

  if (data === 'cancel:start') {
    return startCancelConversation(lineEvent)
  }

  if (data === 'cancel:abort') {
    sessions.delete(userKey)
    return textMessage('已放棄取消預約申請。')
  }

  const session = sessions.get(userKey)
  if (!session) {
    return textMessage('目前沒有進行中的取消預約填寫，請重新點選「取消預約」。')
  }

  if (data === 'cancel:confirm') {
    const record = await saveCancelRequest(lineEvent, session)
    sessions.delete(userKey)
    return textMessage(
      `已建立取消預約申請，紀錄編號：${record.id}\n辦公室人員可在 JSON 或 CSV 報表中確認處理。`,
    )
  }

  return textMessage('找不到這個取消預約操作，請重新點選「取消預約」。')
}
