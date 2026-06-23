import {
  bookingDone,
  bookingIntro,
  calculatorAmount,
  calculatorCms,
  calculatorResult,
  calculatorWelfare,
  emergencyMessage,
  extendedServiceCarousel,
  faqMessage,
  guideMessage,
  homeMenu,
  institutionLocationRequest,
  planningMessage,
  privateCareCarousel,
  privateCareDuration,
  privateCareIntro,
  privateCareQuote,
  scheduleDuration,
  scheduleFrequency,
  scheduleResult,
  scheduleSlot,
  serviceCarousel,
  serviceDetailMessage,
  serviceSearchMessage,
  serviceSelected,
  startGuideMessage,
  welfareInfoMessage,
} from '../templates/care.js'

export const careKeywords = ['照服', '居家照服', '照護', '安心照護', '長照', '主頁']

export const commandCareHome = async (event) => {
  try {
    await event.reply(homeMenu())
  } catch (error) {
    console.error(error)
  }
}

export const commandStartGuide = async (event) => {
  try {
    await event.reply(startGuideMessage())
  } catch (error) {
    console.error(error)
  }
}

export const commandCareText = async (event, messageText) => {
  try {
    const serviceCode = messageText.trim().toUpperCase()

    if (/^BA\d{2}$/.test(serviceCode)) {
      await event.reply(serviceDetailMessage(serviceCode))
      return true
    }

    const serviceSearchResult = serviceSearchMessage(messageText)
    if (serviceSearchResult) {
      await event.reply(serviceSearchResult)
      return true
    }

    if (['補助試算', '輔助試算', '試算'].includes(messageText.trim())) {
      await event.reply(calculatorCms())
      return true
    }

    return false
  } catch (error) {
    console.error(error)
    return false
  }
}

export const handleCarePostback = async (event) => {
  try {
    const data = event.postback.data
    const parts = data.split(':')

    if (data === 'care:home') {
      await event.reply(homeMenu())
      return
    }

    if (data === 'care:planning') {
      await event.reply(planningMessage())
      return
    }

    if (data === 'care:start') {
      await event.reply(startGuideMessage())
      return
    }

    if (data === 'care:booking:intro') {
      await event.reply(bookingIntro())
      return
    }

    if (data === 'care:private:intro') {
      await event.reply(privateCareIntro())
      return
    }

    if (data === 'care:private:services') {
      await event.reply(privateCareCarousel())
      return
    }

    if (parts[0] === 'care' && parts[1] === 'private' && parts[2] === 'service') {
      await event.reply(privateCareDuration(parts[3]))
      return
    }

    if (parts[0] === 'care' && parts[1] === 'private' && parts[2] === 'quote') {
      await event.reply(privateCareQuote(parts[3], parts[4]))
      return
    }

    if (data === 'care:institutions') {
      await event.reply(institutionLocationRequest())
      return
    }

    if (data === 'care:booking:done') {
      await event.reply(bookingDone())
      return
    }

    if (data === 'care:services') {
      await event.reply([serviceCarousel(), extendedServiceCarousel()])
      return
    }

    if (parts[0] === 'care' && parts[1] === 'service') {
      await event.reply(serviceSelected(parts[2]))
      return
    }

    if (data === 'care:schedule:frequency') {
      await event.reply(scheduleFrequency())
      return
    }

    if (parts[0] === 'care' && parts[1] === 'schedule' && parts[2] === 'slot') {
      await event.reply(scheduleSlot(parts[3], parts[4]))
      return
    }

    if (parts[0] === 'care' && parts[1] === 'schedule' && parts[2] === 'duration') {
      await event.reply(scheduleDuration(parts[3], parts[4], parts[5]))
      return
    }

    if (parts[0] === 'care' && parts[1] === 'schedule' && parts[2] === 'result') {
      await event.reply(scheduleResult(parts[3], parts[4], parts[5], parts[6]))
      return
    }

    if (data === 'care:calculator:cms') {
      await event.reply(calculatorCms())
      return
    }

    if (data === 'care:welfare:info') {
      await event.reply(welfareInfoMessage())
      return
    }

    if (parts[0] === 'care' && parts[1] === 'calculator' && parts[2] === 'welfare') {
      await event.reply(calculatorWelfare(parts[3]))
      return
    }

    if (parts[0] === 'care' && parts[1] === 'calculator' && parts[2] === 'amount') {
      await event.reply(calculatorAmount(parts[3], parts[4]))
      return
    }

    if (parts[0] === 'care' && parts[1] === 'calculator' && parts[2] === 'result') {
      await event.reply(calculatorResult(parts[3], parts[4], parts[5]))
      return
    }

    if (data === 'care:guide') {
      await event.reply(guideMessage())
      return
    }

    if (data === 'care:faq') {
      await event.reply(faqMessage())
      return
    }

    if (data === 'care:emergency') {
      await event.reply(emergencyMessage())
      return
    }

    await event.reply('找不到這個照服功能，請輸入「照服」回到主頁。')
  } catch (error) {
    console.error(error)
  }
}
