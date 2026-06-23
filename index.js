import 'dotenv/config'
import axios from 'axios'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  careKeywords,
  commandCareHome,
  commandCareText,
  commandStartGuide,
  handleCarePostback,
} from './commands/care.js'
import {
  clearBookingConversation,
  handleBookingPostback,
  handleBookingText,
  hasActiveBookingConversation,
} from './services/bookingConversation.js'
import {
  clearCancelConversation,
  handleCancelPostback,
  handleCancelText,
  hasActiveCancelConversation,
} from './services/cancelConversation.js'
import {
  clearPrivateConversation,
  handlePrivatePostback,
  handlePrivateText,
  hasActivePrivateConversation,
} from './services/privateConversation.js'
import { findNearbyInstitutions } from './services/institutionSearch.js'
import { nearbyInstitutionsMessage } from './templates/care.js'

const port = process.env.PORT || 4000
const webhookPaths = ['/', '/webhook']
const lineReplyUrl = 'https://api.line.me/v2/bot/message/reply'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, 'public')
const recordsPath = path.join(__dirname, 'data', 'careRecords.json')

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
}

const readRawBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = []

    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })

const sendJson = (res, data, statusCode = 200) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

const readCareRecords = async () => {
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

const writeCareRecords = async (records) => {
  await fs.writeFile(recordsPath, JSON.stringify(records, null, 2))
}

const csvEscape = (value) => {
  const textValue = String(value ?? '')
  return `"${textValue.replaceAll('"', '""')}"`
}

const recordsToCsv = (records) => {
  const headers = [
    '資料編號',
    '紀錄類型',
    '狀態',
    '原預約編號',
    '建立時間',
    'LINE名稱',
    'LINE使用者ID',
    '被照顧者姓名',
    '出生日期',
    'CMS等級',
    '福利身分',
    '服務項目',
    '服務頻率',
    '希望時段',
    '每次服務時間',
    '預估金額',
    '服務地址',
    '聯絡人',
    '聯絡電話',
    '與被服務者關係',
    '取消原因',
    '長輩狀況',
    '特殊注意事項',
  ]
  const rows = records.map((record) => [
    record.id,
    record.recordType || 'booking',
    record.status || '',
    record.originalBookingId || '',
    record.createdAt,
    record.lineDisplayName,
    record.lineUserId,
    record.receiverName,
    record.birthday,
    record.cmsLevel,
    record.welfareStatus,
    record.serviceType,
    record.frequency,
    record.timeSlot,
    record.duration,
    record.estimatedAmount,
    record.address,
    record.contactName,
    record.contactPhone,
    record.relationship,
    record.cancelReason,
    record.elderCondition,
    record.notes,
  ])

  return [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')
}

const handleCreateCareRecord = async (req, res) => {
  const rawBody = await readRawBody(req)
  const body = JSON.parse(rawBody || '{}')
  const requiredFields = [
    'receiverName',
    'welfareStatus',
    'serviceType',
    'frequency',
    'timeSlot',
    'address',
    'contactName',
    'contactPhone',
    'relationship',
  ]
  const missingField = requiredFields.find((field) => !body[field])

  if (missingField) {
    sendJson(res, { message: `Missing field: ${missingField}` }, 400)
    return
  }

  const records = await readCareRecords()
  const record = {
    id: `CARE-${Date.now()}`,
    recordType: 'booking',
    status: '已送出',
    createdAt: new Date().toISOString(),
    lineUserId: body.lineUserId || '',
    lineDisplayName: body.lineDisplayName || '',
    receiverName: body.receiverName || '',
    birthday: body.birthday || '',
    cmsLevel: body.cmsLevel || '',
    welfareStatus: body.welfareStatus || '',
    serviceType: body.serviceType || '',
    frequency: body.frequency || '',
    timeSlot: body.timeSlot || '',
    duration: body.duration || '',
    address: body.address || '',
    contactName: body.contactName || '',
    contactPhone: body.contactPhone || '',
    relationship: body.relationship || '',
    notes: body.notes || '',
  }

  records.push(record)
  await writeCareRecords(records)
  sendJson(res, { record }, 201)
}

const serveStaticFile = async (pathname, res) => {
  const normalizedPath = pathname === '/' ? '/liff/care-form.html' : pathname
  const filePath = path.normalize(path.join(publicDir, normalizedPath))

  if (!filePath.startsWith(publicDir)) {
    res.statusCode = 403
    res.end('Forbidden')
    return true
  }

  try {
    const file = await fs.readFile(filePath)
    const ext = path.extname(filePath)
    res.statusCode = 200
    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream')
    res.end(file)
    return true
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
    return false
  }
}

const verifyLineSignature = (rawBody, signature) => {
  if (process.env.SKIP_SIGNATURE_VERIFY === 'true') {
    return true
  }

  if (!signature || !process.env.CHANNEL_SECRET) {
    return false
  }

  const hash = crypto
    .createHmac('sha256', process.env.CHANNEL_SECRET)
    .update(rawBody)
    .digest('base64')

  if (hash.length !== signature.length) {
    return false
  }

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))
}

const replyToLine = async (replyToken, messages) => {
  const normalizedMessages = Array.isArray(messages) ? messages : [messages]

  try {
    await axios.post(
      lineReplyUrl,
      {
        replyToken,
        messages: normalizedMessages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    )
    console.log('LINE 回覆成功')
  } catch (error) {
    console.error('LINE 回覆失敗')
    console.error(error.response?.status || error.message)
    console.error(JSON.stringify(error.response?.data || {}, null, 2))
  }
}

const createLineEventAdapter = (lineEvent) => ({
  ...lineEvent,
  reply: (messages) => replyToLine(lineEvent.replyToken, messages),
})

const handleLineEvent = async (lineEvent) => {
  if (lineEvent.type === 'message' && lineEvent.message?.type === 'location') {
    console.log('收到 location：', lineEvent.message.latitude, lineEvent.message.longitude)
    const nearbyInstitutions = findNearbyInstitutions({
      latitude: lineEvent.message.latitude,
      longitude: lineEvent.message.longitude,
    })
    await replyToLine(lineEvent.replyToken, nearbyInstitutionsMessage(nearbyInstitutions))
    return
  }

  if (lineEvent.type === 'message' && lineEvent.message?.type === 'text') {
    const messageText = lineEvent.message.text.trim()
    console.log('收到 message：', messageText)

    if (messageText.toLowerCase() === 'ping') {
      await replyToLine(lineEvent.replyToken, {
        type: 'text',
        text: 'pong：Webhook 與回覆功能正常',
      })
      return
    }

    if (hasActiveCancelConversation(lineEvent)) {
      await replyToLine(lineEvent.replyToken, handleCancelText(lineEvent, messageText))
      return
    }

    if (hasActivePrivateConversation(lineEvent)) {
      await replyToLine(lineEvent.replyToken, handlePrivateText(lineEvent, messageText))
      return
    }

    if (hasActiveBookingConversation(lineEvent)) {
      await replyToLine(lineEvent.replyToken, handleBookingText(lineEvent, messageText))
      return
    }

    if (careKeywords.includes(messageText)) {
      await commandCareHome(createLineEventAdapter(lineEvent))
      return
    }

    if (await commandCareText(createLineEventAdapter(lineEvent), messageText)) {
      return
    }

    await commandStartGuide(createLineEventAdapter(lineEvent))
    return
  }

  if (lineEvent.type === 'postback') {
    console.log('收到 postback：', lineEvent.postback.data)
    if (lineEvent.postback.data.startsWith('booking:')) {
      clearCancelConversation(lineEvent)
      clearPrivateConversation(lineEvent)
      await replyToLine(lineEvent.replyToken, await handleBookingPostback(lineEvent))
      return
    }

    if (lineEvent.postback.data.startsWith('cancel:')) {
      clearBookingConversation(lineEvent)
      clearPrivateConversation(lineEvent)
      await replyToLine(lineEvent.replyToken, await handleCancelPostback(lineEvent))
      return
    }

    if (lineEvent.postback.data.startsWith('private:')) {
      clearBookingConversation(lineEvent)
      clearCancelConversation(lineEvent)
      await replyToLine(lineEvent.replyToken, await handlePrivatePostback(lineEvent))
      return
    }

    await handleCarePostback(createLineEventAdapter(lineEvent))
    return
  }

  if (lineEvent.type === 'follow') {
    console.log('使用者加入好友，送出第一次使用提醒')
    await commandStartGuide(createLineEventAdapter(lineEvent))
    return
  }

  console.log('收到尚未處理的事件：', lineEvent.type)
}

const handleWebhook = async (req, res, pathname) => {
  const rawBody = await readRawBody(req)
  const signature = req.headers['x-line-signature']

  console.log(`收到 LINE Webhook POST：${pathname}`)

  if (!verifyLineSignature(rawBody, signature)) {
    console.error('LINE 簽章驗證失敗：請檢查 CHANNEL_SECRET，或確認 Webhook 是否來自 LINE')
    res.statusCode = 400
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Bad request: invalid LINE signature')
    return
  }

  let body
  try {
    body = JSON.parse(rawBody)
  } catch (error) {
    console.error('Webhook JSON 解析失敗')
    console.error(error)
    res.statusCode = 400
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Bad request: invalid JSON')
    return
  }

  for (const lineEvent of body.events || []) {
    await handleLineEvent(lineEvent)
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end('{}')
}

const server = http.createServer((req, res) => {
  const pathname = req.url.split('?')[0]

  if (req.method === 'GET' && pathname === '/') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('LINE Bot is running. Webhook paths: / or /webhook')
    return
  }

  if (req.method === 'GET' && pathname === '/api/liff-config') {
    sendJson(res, {
      liffId: process.env.LIFF_ID || '',
      formUrl:
        process.env.LIFF_FORM_URL || `${process.env.PUBLIC_BASE_URL || ''}/liff/care-form.html`,
    })
    return
  }

  if (req.method === 'GET' && pathname === '/api/care-records') {
    readCareRecords()
      .then((records) => sendJson(res, { records }))
      .catch((error) => {
        console.error(error)
        sendJson(res, { message: 'Failed to read records' }, 500)
      })
    return
  }

  if (req.method === 'POST' && pathname === '/api/care-records') {
    handleCreateCareRecord(req, res).catch((error) => {
      console.error(error)
      sendJson(res, { message: 'Failed to create record' }, 500)
    })
    return
  }

  if (req.method === 'GET' && pathname === '/reports/care-records.csv') {
    readCareRecords()
      .then((records) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader('Content-Disposition', 'attachment; filename="care-records.csv"')
        res.end(`\uFEFF${recordsToCsv(records)}`)
      })
      .catch((error) => {
        console.error(error)
        res.statusCode = 500
        res.end('Failed to export report')
      })
    return
  }

  if (req.method === 'GET' && pathname.startsWith('/liff/')) {
    serveStaticFile(pathname, res).catch((error) => {
      console.error(error)
      res.statusCode = 500
      res.end('Failed to serve static file')
    })
    return
  }

  if (req.method === 'POST' && webhookPaths.includes(pathname)) {
    handleWebhook(req, res, pathname).catch((error) => {
      console.error('Webhook 處理發生未預期錯誤')
      console.error(error)
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end('Internal server error')
    })
    return
  }

  res.statusCode = 404
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.end('Not found. Use POST / or POST /webhook for LINE.')
})

server.listen(port, () => {
  console.log(`機器人啟動：http://localhost:${port}`)
  console.log('LINE Developers Webhook URL 可填：公開網址/ 或 公開網址/webhook')
  console.log('測試：手機傳 ping，成功時終端機會顯示「收到 message： ping」')
})
