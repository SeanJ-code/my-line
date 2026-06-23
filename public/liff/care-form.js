/* global document, window, liff */

const form = document.querySelector('#careForm')
const formMessage = document.querySelector('#formMessage')
const userStatus = document.querySelector('#userStatus')

const state = {
  lineUserId: '',
  lineDisplayName: '',
}

const setMessage = (message, isError = false) => {
  formMessage.textContent = message
  formMessage.style.color = isError ? '#b3261e' : '#1f6f78'
}

const loadLiffProfile = async () => {
  const configResponse = await fetch('/api/liff-config')
  const config = await configResponse.json()

  if (!config.liffId || !window.liff) {
    userStatus.textContent = '一般瀏覽器測試模式：可填表，但不會取得 LINE 使用者資料。'
    return
  }

  try {
    await liff.init({ liffId: config.liffId })

    if (!liff.isLoggedIn()) {
      liff.login()
      return
    }

    const profile = await liff.getProfile()
    state.lineUserId = profile.userId
    state.lineDisplayName = profile.displayName
    userStatus.textContent = `${profile.displayName}，可以開始填寫照護需求。`
  } catch (error) {
    console.error(error)
    userStatus.textContent = 'LIFF 初始化失敗，仍可先以測試模式填寫表單。'
  }
}

const getFormPayload = () => {
  const formData = new FormData(form)
  const payload = Object.fromEntries(formData.entries())

  return {
    ...payload,
    lineUserId: state.lineUserId,
    lineDisplayName: state.lineDisplayName,
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const submitButton = form.querySelector('button[type="submit"]')
  submitButton.disabled = true
  setMessage('正在送出資料...')

  try {
    const response = await fetch('/api/care-records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(getFormPayload()),
    })

    if (!response.ok) {
      throw new Error('資料送出失敗')
    }

    const result = await response.json()
    setMessage(`已建立資料編號 ${result.record.id}，可到 /reports/care-records.csv 匯出報表。`)
    form.reset()
  } catch (error) {
    console.error(error)
    setMessage('送出失敗，請稍後再試或聯絡管理者。', true)
  } finally {
    submitButton.disabled = false
  }
})

loadLiffProfile()
