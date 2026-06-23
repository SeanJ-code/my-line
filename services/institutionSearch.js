import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const institutionsPath = path.join(__dirname, '..', 'dump', 'abc.json')

const rawInstitutions = JSON.parse(fs.readFileSync(institutionsPath, 'utf8'))

const cityNames = [
  '臺北市',
  '新北市',
  '桃園市',
  '臺中市',
  '臺南市',
  '高雄市',
  '基隆市',
  '新竹市',
  '嘉義市',
  '新竹縣',
  '苗栗縣',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義縣',
  '屏東縣',
  '宜蘭縣',
  '花蓮縣',
  '臺東縣',
  '澎湖縣',
  '金門縣',
  '連江縣',
]

const toNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

const formatDate = (value) => {
  const text = String(value || '').trim()
  if (!text) {
    return '未提供'
  }

  const compactDate = text.match(/^(\d{4})(\d{2})(\d{2})/)
  if (!compactDate) {
    return text
  }

  return `${compactDate[1]}-${compactDate[2]}-${compactDate[3]}`
}

const formatFlag = (value) => {
  if (String(value) === '1') {
    return '是'
  }

  if (String(value) === '0') {
    return '否'
  }

  return value || '未提供'
}

const toRadians = (degree) => (degree * Math.PI) / 180

const haversineKm = (from, to) => {
  const earthRadiusKm = 6371
  const dLat = toRadians(to.latitude - from.latitude)
  const dLng = toRadians(to.longitude - from.longitude)
  const lat1 = toRadians(from.latitude)
  const lat2 = toRadians(to.latitude)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusKm * c
}

const estimateMinutes = (straightDistanceKm, speedKmPerHour) => {
  const routeDistanceKm = straightDistanceKm * 1.35
  const minutes = Math.ceil((routeDistanceKm / speedKmPerHour) * 60 + 4)

  return Math.max(minutes, 3)
}

const parseAddressArea = (address, fallbackCity, fallbackDistrict) => {
  const city = cityNames.find((name) => address.startsWith(name))
  if (!city) {
    return {
      city: fallbackCity || '未提供',
      district: fallbackDistrict || '未提供',
    }
  }

  const restAddress = address.slice(city.length)
  const district = restAddress.match(/^(.+?[區鄉鎮市])/)

  return {
    city,
    district: district?.[1] || fallbackDistrict || '未提供',
  }
}

const normalizeInstitution = (item, index) => {
  const longitude = toNumber(item['經度'])
  const latitude = toNumber(item['緯度'])
  const address = item['地址全址'] || '未提供'
  const area = parseAddressArea(address, item['縣市'], item['區'])

  return {
    id: item['機構代碼'] || `institution-${index}`,
    name: item['機構名稱'] || '未命名機構',
    kind: item['機構種類'] || '未提供',
    cityCode: item['縣市'] || '未提供',
    districtCode: item['區'] || '未提供',
    city: area.city,
    district: area.district,
    address,
    abcLevel: item['O_ABC'] || '未提供',
    serviceItems: item['特約服務項目'] || '未提供',
    contractCity: item['特約縣市'] || '未提供',
    contractArea: item['特約區域'] || '未提供',
    phone: item['機構電話'] || '未提供',
    email: item['電子郵件'] || '未提供',
    director: item['機構負責人姓名'] || '未提供',
    contractStart: formatDate(item['特約起日']),
    contractEnd: formatDate(item['特約迄日']),
    lastUpdated: formatDate(item['最後異動時間']),
    beds: item['開放床數'] || '0',
    residents: item['現有住民'] || '0',
    categoryLevel3: item['機構種類代碼第三階層'] || '未提供',
    isResidentialDisabilityOrg: formatFlag(item['身障機構註記是否為住宿式機構']),
    longitude,
    latitude,
  }
}

const institutionsByKey = rawInstitutions
  .map(normalizeInstitution)
  .filter((item) => item.longitude !== null && item.latitude !== null)
  .reduce((groups, institution) => {
    const key = `${institution.id}-${institution.name}-${institution.address}`
    const existingInstitution = groups.get(key)

    if (!existingInstitution) {
      groups.set(key, institution)
      return groups
    }

    const serviceItems = new Set(
      `${existingInstitution.serviceItems}、${institution.serviceItems}`
        .split(/[、;,；]/)
        .map((item) => item.trim())
        .filter(Boolean),
    )
    existingInstitution.serviceItems = [...serviceItems].join('、')

    return groups
  }, new Map())

const institutions = [...institutionsByKey.values()]

export const findNearbyInstitutions = ({ latitude, longitude }, limit = 5) => {
  const userLocation = {
    latitude: toNumber(latitude),
    longitude: toNumber(longitude),
  }

  if (userLocation.latitude === null || userLocation.longitude === null) {
    return []
  }

  return institutions
    .map((institution) => {
      const distanceKm = haversineKm(userLocation, institution)

      return {
        ...institution,
        distanceKm,
        drivingMinutes: estimateMinutes(distanceKm, 34),
        scooterMinutes: estimateMinutes(distanceKm, 25),
      }
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
}
