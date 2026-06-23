import {
  baServices,
  bookingFormFields,
  calculatorFormulas,
  calculatorMeta,
  calculateSubsidy,
  cmsAllowances,
  designRecommendations,
  emergencyContacts,
  emergencyFields,
  faqImages,
  faqItems,
  guideSteps,
  officialContacts,
  plannedMonthlyCosts,
  privateCareDurations,
  privateCareNotes,
  privateCareServices,
  scheduleOptions,
  startGuide,
  visualAssets,
  welfareStatuses,
} from '../data/careData.js'

const currency = new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  maximumFractionDigits: 0,
})

const text = (value, options = {}) => ({
  type: 'text',
  text: value,
  wrap: true,
  ...options,
})

const postbackButton = (label, data, style = 'primary', displayText = label) => ({
  type: 'button',
  style,
  height: 'sm',
  action: {
    type: 'postback',
    label,
    data,
    displayText,
  },
})

const uriButton = (label, uri, style = 'secondary') => ({
  type: 'button',
  style,
  height: 'sm',
  action: {
    type: 'uri',
    label,
    uri,
  },
})

const heroImage = (url, aspectRatio = '20:13') => ({
  type: 'image',
  url,
  size: 'full',
  aspectRatio,
  aspectMode: 'cover',
})

const quickPostback = (label, data, displayText = label) => ({
  type: 'action',
  action: {
    type: 'postback',
    label,
    data,
    displayText,
  },
})

const fieldRows = (items) =>
  items.map((item) =>
    text(`・${item}`, {
      size: 'sm',
      color: '#455A64',
    }),
  )

const infoRow = (icon, label, value) => ({
  type: 'box',
  layout: 'baseline',
  spacing: 'sm',
  contents: [
    text(icon, {
      flex: 0,
      size: 'sm',
    }),
    text(label, {
      flex: 3,
      size: 'xs',
      color: '#607D8B',
    }),
    text(String(value || '未提供'), {
      flex: 7,
      size: 'xs',
      color: '#263238',
      wrap: true,
    }),
  ],
})

const shortText = (value, maxLength = 56) => {
  const content = String(value || '未提供')
  return content.length > maxLength ? `${content.slice(0, maxLength - 1)}…` : content
}

export const serviceName = (serviceCode) =>
  baServices.find((service) => service.code === serviceCode)?.name || '照顧服務'

export const startGuideMessage = () => ({
  type: 'flex',
  altText: '第一次使用提醒',
  contents: {
    type: 'bubble',
    size: 'mega',
    hero: heroImage(visualAssets.home, '20:11'),
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        text('第一次使用，先這樣開始', {
          weight: 'bold',
          size: 'xl',
          color: '#263238',
        }),
        ...fieldRows(startGuide),
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        postbackButton('我還沒申請長照', 'care:guide'),
        postbackButton('我已有 CMS 等級', 'care:calculator:cms', 'secondary'),
        postbackButton('我要安排服務', 'care:booking:intro', 'secondary'),
        postbackButton('尋找附近機構', 'care:institutions', 'secondary'),
      ],
    },
  },
})

export const homeMenu = () => ({
  type: 'flex',
  altText: '安心照護小幫手主頁',
  contents: {
    type: 'bubble',
    size: 'mega',
    hero: heroImage(visualAssets.home),
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#1F6F78',
      paddingAll: '20px',
      contents: [
        text('安心照護小幫手', {
          color: '#FFFFFF',
          weight: 'bold',
          size: 'xl',
        }),
        text('從申請、試算到預約，一步一步完成', {
          color: '#D9F4F2',
          size: 'sm',
          margin: 'sm',
        }),
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        text('你現在是哪一種狀況？', {
          weight: 'bold',
          size: 'md',
          color: '#263238',
        }),
        text('不用先懂長照流程，選最接近你的狀況就可以。', {
          size: 'sm',
          color: '#607D8B',
        }),
        postbackButton('尋找附近機構', 'care:institutions'),
        postbackButton('還沒申請，想先了解', 'care:guide', 'secondary'),
        postbackButton('補助試算', 'care:calculator:cms', 'secondary'),
        postbackButton('福利身分說明', 'care:welfare:info', 'secondary'),
        postbackButton('🗓 安排照顧服務', 'care:booking:intro', 'secondary'),
        postbackButton('自費服務', 'care:private:intro', 'secondary'),
        postbackButton('取消預約', 'cancel:start', 'secondary'),
        {
          type: 'separator',
          margin: 'md',
        },
        postbackButton('💬 常見問題', 'care:faq', 'secondary'),
        postbackButton('🚑 緊急聯絡資訊', 'care:emergency', 'secondary'),
      ],
    },
  },
})

export const institutionLocationRequest = () => ({
  type: 'text',
  text: '請傳送你目前的位置。我會用長照 ABC JSON 的經緯度找出最近 5 間機構，並估算與你相差的距離、開車時間與騎車時間。',
  quickReply: {
    items: [
      {
        type: 'action',
        action: {
          type: 'location',
          label: '傳送我的位置',
        },
      },
      quickPostback('回主頁', 'care:home'),
    ],
  },
})

export const nearbyInstitutionsMessage = (institutions) => {
  if (!institutions.length) {
    return {
      type: 'text',
      text: '目前無法取得附近機構資料，請確認你傳送的位置是否正確。',
    }
  }

  return {
    type: 'flex',
    altText: '附近長照機構',
    contents: {
      type: 'carousel',
      contents: institutions.map((institution, index) => ({
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: index === 0 ? '#1F6F78' : '#2A9D8F',
          paddingAll: '16px',
          contents: [
            text(`附近機構 ${index + 1}`, {
              color: '#E8FFFB',
              size: 'sm',
              weight: 'bold',
            }),
            text(shortText(institution.name, 40), {
              color: '#FFFFFF',
              size: 'lg',
              weight: 'bold',
            }),
          ],
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              spacing: 'sm',
              contents: [
                text(`📍 ${institution.distanceKm.toFixed(1)} km`, {
                  size: 'sm',
                  color: '#1F6F78',
                  weight: 'bold',
                }),
                text(`🚗 ${institution.drivingMinutes} 分`, {
                  size: 'sm',
                  color: '#C65F2E',
                  weight: 'bold',
                }),
                text(`🛵 ${institution.scooterMinutes} 分`, {
                  size: 'sm',
                  color: '#2A7A3B',
                  weight: 'bold',
                }),
              ],
            },
            {
              type: 'separator',
              margin: 'sm',
            },
            infoRow('🏷️', '機構代碼', institution.id),
            infoRow('🏛️', '機構種類', institution.kind),
            infoRow('🧩', 'ABC', institution.abcLevel),
            infoRow('🗺️', '縣市', `${institution.city}（${institution.cityCode}）`),
            infoRow('🧭', '區', `${institution.district}（${institution.districtCode}）`),
            infoRow('📌', '地址', institution.address),
            infoRow('📍', '經緯度', `${institution.longitude}, ${institution.latitude}`),
            infoRow('🧾', '服務', shortText(institution.serviceItems, 64)),
            infoRow('🗂️', '特約縣市', institution.contractCity),
            infoRow('📍', '特約區域', shortText(institution.contractArea, 72)),
            infoRow('☎️', '電話', institution.phone),
            infoRow('✉️', 'Email', institution.email),
            infoRow('👤', '負責人', institution.director),
            infoRow('🟢', '特約起日', institution.contractStart),
            infoRow('🔴', '特約迄日', institution.contractEnd),
            infoRow('🕒', '異動時間', institution.lastUpdated),
            infoRow('🛏️', '開放床數', institution.beds),
            infoRow('👥', '現有住民', institution.residents),
            infoRow('🏢', '第三階層', institution.categoryLevel3),
            infoRow('♿', '住宿式', institution.isResidentialDisabilityOrg),
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          contents: [
            uriButton(
              '開啟地圖',
              `https://www.google.com/maps/search/?api=1&query=${institution.latitude},${institution.longitude}`,
            ),
          ],
        },
      })),
    },
  }
}

export const planningMessage = () => ({
  type: 'flex',
  altText: '專題功能規劃建議',
  contents: {
    type: 'bubble',
    size: 'mega',
    hero: heroImage(visualAssets.planning, '20:11'),
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        text('專題功能規劃', {
          weight: 'bold',
          size: 'xl',
          color: '#263238',
        }),
        text('建議第一版加入', { weight: 'bold', color: '#1F6F78' }),
        ...fieldRows(designRecommendations.addToLineBot),
        text('先放資料庫，不放首頁', { weight: 'bold', color: '#7A5C00' }),
        ...fieldRows(designRecommendations.keepAsBackstageData.slice(0, 4)),
        text('第一版可先取消', { weight: 'bold', color: '#8A1C1C' }),
        ...fieldRows(designRecommendations.skipInFirstVersion),
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [postbackButton('回主頁', 'care:home', 'secondary')],
    },
  },
})

export const bookingIntro = () => ({
  type: 'flex',
  altText: '預約照顧服務需要填寫的資料',
  contents: {
    type: 'bubble',
    size: 'mega',
    hero: heroImage(visualAssets.booking, '20:11'),
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        text('預約照顧服務', {
          weight: 'bold',
          size: 'xl',
          color: '#263238',
        }),
        text('先選照顧項目，再排服務週期與時間，最後填寫聯絡與地址資料。', {
          size: 'sm',
          color: '#607D8B',
        }),
        ...fieldRows(bookingFormFields),
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        postbackButton('選擇照顧項目', 'care:services'),
        postbackButton('取消預約', 'cancel:start', 'secondary'),
      ],
    },
  },
})

export const privateCareIntro = () => ({
  type: 'flex',
  altText: '私立自費服務',
  contents: {
    type: 'bubble',
    size: 'mega',
    hero: heroImage(visualAssets.privateCare, '20:11'),
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        text('私立自費服務', {
          weight: 'bold',
          size: 'xl',
          color: '#263238',
        }),
        text('適合尚未完成長照評估、政府額度不足，或需要臨時加開照顧時段的家庭。', {
          size: 'sm',
          color: '#607D8B',
        }),
        text('計價方式', { weight: 'bold', color: '#1F6F78' }),
        ...fieldRows(privateCareNotes),
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        postbackButton('選擇自費服務', 'care:private:services'),
        postbackButton('回主頁', 'care:home', 'secondary'),
      ],
    },
  },
})

export const privateCareCarousel = () => ({
  type: 'flex',
  altText: '私立自費服務項目',
  contents: {
    type: 'carousel',
    contents: privateCareServices.map((service) => ({
      type: 'bubble',
      size: 'micro',
      hero: heroImage(service.imageUrl, '4:3'),
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#8A4B32',
        paddingAll: '12px',
        contents: [
          text(service.title, {
            color: '#FFFFFF',
            weight: 'bold',
            size: 'md',
          }),
          text(`${currency.format(service.pricePerHour)} / 小時起`, {
            color: '#FFE8D8',
            size: 'xs',
            margin: 'xs',
          }),
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          text(service.summary, {
            size: 'xs',
            color: '#455A64',
          }),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [postbackButton(service.title, `care:private:service:${service.id}`, 'primary')],
      },
    })),
  },
})

export const privateCareDuration = (serviceId) => {
  const service = privateCareServices.find((item) => item.id === serviceId)

  return {
    type: 'text',
    text: `已選擇「${service?.title || '自費服務'}」。請選擇預估服務時間：`,
    quickReply: {
      items: privateCareDurations.map((item) =>
        quickPostback(item.label, `care:private:quote:${serviceId}:${item.id}`),
      ),
    },
  }
}

export const privateCareQuote = (serviceId, durationId) => {
  const service = privateCareServices.find((item) => item.id === serviceId)
  const duration = privateCareDurations.find((item) => item.id === durationId)
  const estimatedAmount = service && duration?.hours ? service.pricePerHour * duration.hours : 0

  return {
    type: 'flex',
    altText: '自費服務試算',
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: heroImage(service?.imageUrl || visualAssets.privateCare, '20:11'),
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#8A4B32',
        paddingAll: '16px',
        contents: [
          text('自費服務試算', {
            color: '#FFFFFF',
            weight: 'bold',
            size: 'lg',
          }),
          text('正式金額由機構回電確認', {
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
          infoRow('🧩', '服務', service?.title || '自費服務'),
          infoRow(
            '💵',
            '單價',
            service ? `${currency.format(service.pricePerHour)} / 小時起` : '待確認',
          ),
          infoRow('⏱️', '時間', duration?.label || '待確認'),
          infoRow(
            '🧾',
            '預估',
            estimatedAmount ? currency.format(estimatedAmount) : '由機構回電確認',
          ),
          {
            type: 'separator',
            margin: 'md',
          },
          text('流程：選擇服務項目 → 填寫長輩狀況 → 選擇預期時間 → 機構回電確認。', {
            size: 'xs',
            color: '#607D8B',
            margin: 'md',
          }),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          postbackButton('填寫回電資料', `private:startWith:${serviceId}:${durationId}`),
          postbackButton('重新選擇自費服務', 'care:private:services', 'secondary'),
        ],
      },
    },
  }
}

export const serviceCarousel = () => ({
  type: 'flex',
  altText: '公費長照 BA01-BA12 服務項目',
  contents: {
    type: 'carousel',
    contents: baServices
      .filter((service) => service.group === 'basic')
      .map((service) => ({
        type: 'bubble',
        size: 'micro',
        hero: heroImage(service.imageUrl, '4:3'),
        header: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#E76F51',
          paddingAll: '12px',
          contents: [
            text(service.code, {
              color: '#FFF3EE',
              size: 'xs',
            }),
            text(service.name, {
              color: '#FFFFFF',
              weight: 'bold',
              size: 'md',
            }),
          ],
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            text(service.summary, {
              size: 'xs',
              color: '#455A64',
            }),
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            postbackButton(service.name, `care:service:${service.code}`, 'primary', service.name),
          ],
        },
      })),
  },
})

export const extendedServiceCarousel = () => ({
  type: 'flex',
  altText: '公費長照 BA13-BA24 服務項目',
  contents: {
    type: 'carousel',
    contents: baServices
      .filter((service) => service.group === 'extended')
      .map((service) => ({
        type: 'bubble',
        size: 'micro',
        hero: heroImage(service.imageUrl, '4:3'),
        header: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#7A5C00',
          paddingAll: '12px',
          contents: [
            text(service.code, {
              color: '#FFF8E1',
              size: 'xs',
            }),
            text(service.name, {
              color: '#FFFFFF',
              weight: 'bold',
              size: 'md',
            }),
          ],
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            text(service.summary, {
              size: 'xs',
              color: '#455A64',
            }),
          ],
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            postbackButton(service.name, `care:service:${service.code}`, 'primary', service.name),
          ],
        },
      })),
  },
})

export const serviceSelected = (serviceCode) => ({
  type: 'text',
  text: `已選擇「${serviceCode} ${serviceName(serviceCode)}」。接著排定固定服務週期。`,
  quickReply: {
    items: scheduleOptions.frequencies.map((item) =>
      quickPostback(item.label, `care:schedule:slot:${serviceCode}:${item.id}`),
    ),
  },
})

export const serviceDetailMessage = (serviceCode) => {
  const service = baServices.find((item) => item.code === serviceCode)

  if (!service) {
    return {
      type: 'text',
      text: '找不到這個服務代碼，請輸入 BA01 到 BA24，或回主頁查看服務項目。',
      quickReply: {
        items: [
          quickPostback('回主頁', 'care:home'),
          quickPostback('查看服務項目', 'care:services'),
        ],
      },
    }
  }

  return {
    type: 'flex',
    altText: `${service.code} ${service.name}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: heroImage(service.imageUrl, '20:11'),
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: service.group === 'basic' ? '#E76F51' : '#7A5C00',
        paddingAll: '16px',
        contents: [
          text(service.code, {
            color: '#FFF3EE',
            size: 'sm',
            weight: 'bold',
          }),
          text(service.name, {
            color: '#FFFFFF',
            size: 'lg',
            weight: 'bold',
          }),
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          text(service.summary, {
            color: '#455A64',
            size: 'sm',
          }),
          text('可直接排入預約流程，最後再留下聯絡與服務地址資料。', {
            color: '#607D8B',
            size: 'xs',
          }),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          postbackButton('安排這項服務', `care:service:${service.code}`),
          postbackButton('查看全部服務', 'care:services', 'secondary'),
        ],
      },
    },
  }
}

export const serviceSearchMessage = (query) => {
  const normalizedQuery = String(query || '')
    .trim()
    .toLowerCase()
  const matches = baServices
    .filter((service) =>
      [service.code, service.name, service.summary].some((value) =>
        String(value).toLowerCase().includes(normalizedQuery),
      ),
    )
    .slice(0, 5)

  if (!matches.length) {
    return null
  }

  return {
    type: 'text',
    text: `找到 ${matches.length} 個可能適合的服務：\n${matches
      .map((service) => `${service.code} ${service.name}：${service.summary}`)
      .join('\n')}`,
    quickReply: {
      items: matches.map((service) =>
        quickPostback(`${service.code} ${service.name}`, `care:service:${service.code}`),
      ),
    },
  }
}

export const scheduleFrequency = () => ({
  type: 'text',
  text: '請先選擇服務頻率：',
  quickReply: {
    items: scheduleOptions.frequencies.map((item) =>
      quickPostback(item.label, `care:schedule:slot:BA05:${item.id}`),
    ),
  },
})

export const scheduleSlot = (serviceCode, frequencyId) => ({
  type: 'text',
  text: '請選擇希望固定服務的時段：',
  quickReply: {
    items: scheduleOptions.timeSlots.map((item) =>
      quickPostback(item.label, `care:schedule:duration:${serviceCode}:${frequencyId}:${item.id}`),
    ),
  },
})

export const scheduleDuration = (serviceCode, frequencyId, slotId) => ({
  type: 'text',
  text: '請選擇每次單項服務時間：',
  quickReply: {
    items: scheduleOptions.durationOptions.map((item) =>
      quickPostback(
        item.label,
        `care:schedule:result:${serviceCode}:${frequencyId}:${slotId}:${item.id}`,
      ),
    ),
  },
})

export const scheduleResult = (serviceCode, frequencyId, slotId, durationId) => {
  const frequency = scheduleOptions.frequencies.find((item) => item.id === frequencyId)
  const slot = scheduleOptions.timeSlots.find((item) => item.id === slotId)
  const duration = scheduleOptions.durationOptions.find((item) => item.id === durationId)

  return {
    type: 'flex',
    altText: '固定班表確認',
    contents: {
      type: 'bubble',
      hero: heroImage(visualAssets.schedule, '20:11'),
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          text('固定班表確認', {
            weight: 'bold',
            size: 'xl',
            color: '#263238',
          }),
          text(`服務項目：${serviceCode} ${serviceName(serviceCode)}`),
          text(`服務頻率：${frequency?.label || '待確認'}`),
          text(`固定時段：${slot?.label || '待確認'}`),
          text(`每次時間：${duration?.label || '待確認'}`),
          text('服務要求', { weight: 'bold', color: '#1F6F78' }),
          ...fieldRows(scheduleOptions.requirements),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          postbackButton(
            '填寫聯絡與地址資料',
            `booking:startWith:${serviceCode}:${frequencyId}:${slotId}:${durationId}`,
          ),
          postbackButton('重新選擇服務', 'care:services', 'secondary'),
        ],
      },
    },
  }
}

export const bookingDone = () => ({
  type: 'text',
  text: '已建立預約示範資料。正式版本建議把資料寫入資料庫，並通知管理者審核與派案。',
  quickReply: {
    items: [quickPostback('回主頁', 'care:home'), quickPostback('補助試算', 'care:calculator:cms')],
  },
})

export const calculatorCms = () => ({
  type: 'text',
  text: '請選擇政府評估後的 CMS 失能等級：',
  quickReply: {
    items: cmsAllowances.map((item) =>
      quickPostback(
        `${item.label} ${currency.format(item.allowance)}`,
        `care:calculator:welfare:${item.level}`,
      ),
    ),
  },
})

export const calculatorWelfare = (cmsLevel) => ({
  type: 'text',
  text: '請選擇福利身分。此試算以「照顧及專業服務」常用自付率計算：',
  quickReply: {
    items: [
      ...welfareStatuses.map((item) =>
        quickPostback(item.label, `care:calculator:amount:${cmsLevel}:${item.id}`),
      ),
      quickPostback('福利身分說明', 'care:welfare:info'),
    ],
  },
})

export const calculatorAmount = (cmsLevel, welfareId) => ({
  type: 'text',
  text: '請選擇每月預估使用的服務總金額：',
  quickReply: {
    items: plannedMonthlyCosts.map((item) =>
      quickPostback(item.label, `care:calculator:result:${cmsLevel}:${welfareId}:${item.amount}`),
    ),
  },
})

export const calculatorResult = (cmsLevel, welfareId, plannedAmount) => {
  const result = calculateSubsidy({ cmsLevel, welfareId, plannedAmount })

  if (!result) {
    return {
      type: 'text',
      text: '試算資料不完整，請重新操作補助計算機。',
    }
  }

  return {
    type: 'flex',
    altText: '長照補助試算結果',
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: heroImage(visualAssets.calculator, '20:11'),
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#264653',
        paddingAll: '16px',
        contents: [
          text('長照補助試算結果', {
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
          text(`CMS 等級：${result.cms.label}`),
          text(`每月額度：${currency.format(result.cms.allowance)}`),
          text(`福利身分：${result.welfare.category} ${result.welfare.name}`),
          text(`預估使用：${currency.format(result.plannedAmount)}`),
          text(`額度內計算：${currency.format(result.coveredAmount)}`),
          text(`超額自費：${currency.format(result.overAmount)}`),
          {
            type: 'separator',
            margin: 'md',
          },
          text(`政府補助：約 ${currency.format(result.subsidy)}`, {
            weight: 'bold',
            color: '#1F6F78',
          }),
          text(`家屬自付：約 ${currency.format(result.copayment)}`, {
            weight: 'bold',
            color: '#C62828',
          }),
          text(
            `公式：${calculatorFormulas.description_2} 正式金額仍以政府核定與服務單位請款為準。`,
            {
              size: 'xs',
              color: '#607D8B',
              margin: 'md',
            },
          ),
          text(`資料版本：${calculatorMeta.version}｜${calculatorMeta.policy_base}`, {
            size: 'xs',
            color: '#607D8B',
          }),
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          postbackButton('重新試算', 'care:calculator:cms'),
          postbackButton('回主頁', 'care:home', 'secondary'),
        ],
      },
    },
  }
}

export const welfareInfoMessage = () => ({
  type: 'flex',
  altText: '福利身分與自付比例',
  contents: {
    type: 'bubble',
    size: 'mega',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#264653',
      paddingAll: '16px',
      contents: [
        text('福利身分與自付比例', {
          color: '#FFFFFF',
          weight: 'bold',
          size: 'lg',
        }),
        text('資料來源：衛福部長照給付及支付基準整理', {
          color: '#D9F4F2',
          size: 'xs',
          margin: 'xs',
        }),
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: welfareStatuses.flatMap((status) => [
        text(`${status.category}｜${status.name}`, {
          weight: 'bold',
          color: '#1F6F78',
        }),
        text(
          `政府補助 ${Math.round(status.subsidyRate * 100)}%，民眾自付 ${Math.round(
            status.copaymentRate * 100,
          )}%。${status.description}`,
          {
            size: 'sm',
            color: '#455A64',
          },
        ),
      ]),
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        postbackButton('開始補助試算', 'care:calculator:cms'),
        postbackButton('回主頁', 'care:home', 'secondary'),
      ],
    },
  },
})

export const guideMessage = () => ({
  type: 'flex',
  altText: '1966 申請免緊張指南',
  contents: {
    type: 'bubble',
    size: 'mega',
    hero: heroImage(visualAssets.guide, '20:11'),
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        text('1966 申請免緊張指南', {
          weight: 'bold',
          size: 'xl',
          color: '#263238',
        }),
        ...guideSteps.flatMap((step, index) => [
          text(`${index + 1}. ${step.title}`, {
            weight: 'bold',
            color: '#1F6F78',
          }),
          text(step.content, {
            size: 'sm',
            color: '#455A64',
          }),
        ]),
        text('常用聯絡方式', { weight: 'bold', color: '#263238' }),
        ...officialContacts.map((contact) =>
          text(`${contact.name}：${contact.phone}｜${contact.note}`, { size: 'sm' }),
        ),
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [postbackButton('回主頁', 'care:home', 'secondary')],
    },
  },
})

export const faqMessage = () => ({
  type: 'flex',
  altText: '居家照服常見問題',
  contents: {
    type: 'carousel',
    contents: faqItems.map((item, index) => ({
      type: 'bubble',
      size: 'micro',
      hero: heroImage(faqImages[index % faqImages.length], '4:3'),
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#2A9D8F',
        paddingAll: '12px',
        contents: [
          text(`Q${index + 1}`, {
            color: '#FFFFFF',
            weight: 'bold',
          }),
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          text(item.question, {
            weight: 'bold',
            size: 'sm',
            color: '#263238',
          }),
          text(item.answer, {
            size: 'xs',
            color: '#455A64',
          }),
        ],
      },
    })),
  },
})

export const emergencyMessage = () => ({
  type: 'flex',
  altText: '緊急聯絡資訊',
  contents: {
    type: 'bubble',
    size: 'mega',
    hero: heroImage(visualAssets.emergency, '20:11'),
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      contents: [
        text('緊急聯絡資訊', {
          weight: 'bold',
          size: 'xl',
          color: '#263238',
        }),
        text('創作者建議在後台或表單中預留這些欄位：', {
          size: 'sm',
          color: '#607D8B',
        }),
        text('立即可用電話', { weight: 'bold', color: '#C62828' }),
        ...emergencyContacts.flatMap((contact) => [
          text(contact.title, {
            weight: 'bold',
            size: 'sm',
            color: '#1F6F78',
          }),
          text(`${contact.name}｜${contact.phone}`, {
            weight: 'bold',
            size: 'sm',
            color: '#263238',
          }),
          text(contact.note, {
            size: 'xs',
            color: '#607D8B',
          }),
        ]),
        text('後台建議欄位', { weight: 'bold', color: '#263238', margin: 'md' }),
        ...fieldRows(emergencyFields),
      ],
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        {
          type: 'button',
          style: 'primary',
          height: 'sm',
          action: {
            type: 'uri',
            label: '撥打 119',
            uri: 'tel:119',
          },
        },
        postbackButton('回主頁', 'care:home', 'secondary'),
      ],
    },
  },
})
