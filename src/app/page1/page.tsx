'use client'

import { useState, useMemo } from 'react'
import {
  Button,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Input,
} from '@/components/ui'

// 매체 목록
const MEDIA_OPTIONS = [
  '종합',
  '네이버 검색광고',
  '네이버 쇼핑검색광고',
  '네이버 성과형 DA',
  '카카오 키워드',
  '카카오 모먼트',
  '구글 검색광고',
  '구글 디스플레이광고',
  '메타',
  '틱톡',
]

// 캠페인 더미 데이터
const CAMPAIGN_OPTIONS: Record<string, string[]> = {
  '네이버 검색광고': ['브랜드 캠페인', '퍼포먼스 캠페인', '시즌 캠페인'],
  '네이버 쇼핑검색광고': ['쇼핑 메인', '쇼핑 시즌'],
  '네이버 성과형 DA': ['DA 브랜딩', 'DA 전환'],
  '카카오 키워드': ['카카오 브랜드', '카카오 전환'],
  '카카오 모먼트': ['모먼트 도달', '모먼트 전환'],
  '구글 검색광고': ['구글 브랜드', '구글 퍼포먼스'],
  '구글 디스플레이광고': ['GDN 리마케팅', 'GDN 관심사'],
  '메타': ['메타 전환', '메타 트래픽', '메타 인지도'],
  '틱톡': ['틱톡 전환', '틱톡 도달'],
}

// 광고그룹 더미 데이터
const ADGROUP_OPTIONS: Record<string, string[]> = {
  '브랜드 캠페인': ['브랜드_핵심KW', '브랜드_확장KW'],
  '퍼포먼스 캠페인': ['퍼포먼스_전환', '퍼포먼스_CPA'],
  '시즌 캠페인': ['시즌_봄', '시즌_여름'],
  '쇼핑 메인': ['쇼핑_인기상품', '쇼핑_신상품'],
  '쇼핑 시즌': ['쇼핑_할인', '쇼핑_기획전'],
  'DA 브랜딩': ['DA_브랜드인지', 'DA_브랜드도달'],
  'DA 전환': ['DA_전환_리타겟', 'DA_전환_신규'],
  '카카오 브랜드': ['카카오_핵심KW', '카카오_확장KW'],
  '카카오 전환': ['카카오_전환_A', '카카오_전환_B'],
  '모먼트 도달': ['모먼트_도달_A', '모먼트_도달_B'],
  '모먼트 전환': ['모먼트_전환_A'],
  '구글 브랜드': ['구글_브랜드KW'],
  '구글 퍼포먼스': ['구글_퍼포먼스_A', '구글_퍼포먼스_B'],
  'GDN 리마케팅': ['GDN_리마케팅_30일', 'GDN_리마케팅_7일'],
  'GDN 관심사': ['GDN_관심사_A'],
  '메타 전환': ['메타_전환_LAL', '메타_전환_관심사'],
  '메타 트래픽': ['메타_트래픽_A'],
  '메타 인지도': ['메타_인지도_A'],
  '틱톡 전환': ['틱톡_전환_A'],
  '틱톡 도달': ['틱톡_도달_A'],
}

// 매체별 잔액 더미 데이터
const BUDGET_DATA: Record<string, number> = {
  '네이버 검색광고': 3500000,
  '네이버 쇼핑검색광고': 2100000,
  '네이버 성과형 DA': 1800000,
  '카카오 키워드': 1200000,
  '카카오 모먼트': 950000,
  '구글 검색광고': 4200000,
  '구글 디스플레이광고': 2800000,
  '메타': 5500000,
  '틱톡': 1500000,
}

// 날짜 유틸리티
function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getToday(): Date {
  return new Date()
}

function getDefaultStartDate(): string {
  const today = getToday()
  return formatDate(new Date(today.getFullYear(), today.getMonth(), 1))
}

function getDefaultEndDate(): string {
  const today = getToday()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  return formatDate(yesterday)
}

// 일별 더미 데이터 생성
function generateDailyData(dateStr: string) {
  const seed = dateStr.split('-').reduce((a, b) => a + parseInt(b), 0)
  const impressions = 10000 + (seed * 137) % 50000
  const clicks = Math.floor(impressions * (0.02 + (seed % 5) * 0.005))
  const cost = clicks * (300 + (seed % 10) * 50)
  const conversions = Math.floor(clicks * (0.03 + (seed % 3) * 0.01))
  return { impressions, clicks, cost, conversions }
}

function calcCTR(impressions: number, clicks: number): string {
  if (impressions === 0) return '0.00%'
  return ((clicks / impressions) * 100).toFixed(2) + '%'
}

function calcCPC(cost: number, clicks: number): string {
  if (clicks === 0) return '0'
  return Math.round(cost / clicks).toLocaleString()
}

function calcCVR(conversions: number, clicks: number): string {
  if (clicks === 0) return '0.00%'
  return ((conversions / clicks) * 100).toFixed(2) + '%'
}

function calcCPA(cost: number, conversions: number): string {
  if (conversions === 0) return '0'
  return Math.round(cost / conversions).toLocaleString()
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = []
  const current = new Date(start)
  const endDate = new Date(end)
  while (current <= endDate) {
    dates.push(formatDate(current))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

export default function Page1() {
  const [media, setMedia] = useState<string>('')
  const [campaign, setCampaign] = useState<string>('')
  const [adGroup, setAdGroup] = useState<string>('')
  const [startDate, setStartDate] = useState(getDefaultStartDate())
  const [endDate, setEndDate] = useState(getDefaultEndDate())
  const [budgetVisible, setBudgetVisible] = useState(true)

  // 필터 연동
  const showCampaign = media !== '' && media !== '종합'
  const showAdGroup = showCampaign && campaign !== ''

  const handleMediaChange = (value: string) => {
    setMedia(value)
    setCampaign('')
    setAdGroup('')
  }

  const handleCampaignChange = (value: string) => {
    setCampaign(value)
    setAdGroup('')
  }

  // 잔액 계산
  const budgetAmount = useMemo(() => {
    if (media === '' || media === '종합') {
      return Object.values(BUDGET_DATA).reduce((a, b) => a + b, 0)
    }
    return BUDGET_DATA[media] || 0
  }, [media])

  // 기간별 합산 데이터
  const summaryData = useMemo(() => {
    const today = getToday()

    // 최근 7일 (오늘 제외, 직전 7일)
    const last7Days: string[] = []
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      last7Days.push(formatDate(d))
    }

    // 전일
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = formatDate(yesterday)

    const sumData = (dates: string[]) => {
      let totalImpressions = 0, totalClicks = 0, totalCost = 0, totalConversions = 0
      dates.forEach(d => {
        const data = generateDailyData(d)
        totalImpressions += data.impressions
        totalClicks += data.clicks
        totalCost += data.cost
        totalConversions += data.conversions
      })
      return { impressions: totalImpressions, clicks: totalClicks, cost: totalCost, conversions: totalConversions }
    }

    return {
      last7: sumData(last7Days),
      yesterday: sumData([yesterdayStr]),
    }
  }, [])

  // 일자별 상세 데이터 (오름차순)
  const dailyData = useMemo(() => {
    const dates = getDatesInRange(startDate, endDate)
    return dates.map(date => ({
      date,
      ...generateDailyData(date),
    }))
  }, [startDate, endDate])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6 w-[85%] mx-auto">
        {/* 페이지 제목 */}
        <h1 className="text-2xl font-bold text-gray-900">일자별 데이터</h1>

        {/* 필터 설정 영역 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* 매체 드롭다운 */}
            <Select value={media} onValueChange={handleMediaChange}>
              <SelectTrigger className="w-[180px] bg-white">
                <SelectValue placeholder="매체" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {MEDIA_OPTIONS.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 캠페인 드롭다운 */}
            {showCampaign && (
              <Select value={campaign} onValueChange={handleCampaignChange}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="캠페인" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {(CAMPAIGN_OPTIONS[media] || []).map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* 광고그룹 드롭다운 */}
            {showAdGroup && (
              <Select value={adGroup} onValueChange={setAdGroup}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="광고그룹" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {(ADGROUP_OPTIONS[campaign] || []).map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* 구분선 */}
            <div className="h-8 w-px bg-gray-200" />

            {/* 조회 기간 */}
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[150px]"
              />
              <span className="text-gray-500">~</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[150px]"
              />
            </div>

            {/* 검색 버튼 */}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">검색</Button>
          </div>
        </div>

        {/* 예산 확인 영역 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setBudgetVisible(true)}
            >
              예산 새로고침
            </Button>
            {budgetVisible && (
              <span className="text-sm text-gray-700">
                현재 잔액 <span className="font-bold text-lg text-gray-900">{budgetAmount.toLocaleString()}</span>원
              </span>
            )}
          </div>
        </div>

        {/* 기간별 합산 데이터 영역 */}
        <div className="bg-white rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-center font-semibold">구분</TableHead>
                <TableHead className="text-center font-semibold">노출</TableHead>
                <TableHead className="text-center font-semibold">클릭</TableHead>
                <TableHead className="text-center font-semibold">CTR</TableHead>
                <TableHead className="text-center font-semibold">광고비</TableHead>
                <TableHead className="text-center font-semibold">CPC</TableHead>
                <TableHead className="text-center font-semibold">전환수</TableHead>
                <TableHead className="text-center font-semibold">CVR</TableHead>
                <TableHead className="text-center font-semibold">CPA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-center font-medium">최근 7일</TableCell>
                <TableCell className="text-right">{summaryData.last7.impressions.toLocaleString()}</TableCell>
                <TableCell className="text-right">{summaryData.last7.clicks.toLocaleString()}</TableCell>
                <TableCell className="text-right">{calcCTR(summaryData.last7.impressions, summaryData.last7.clicks)}</TableCell>
                <TableCell className="text-right">{summaryData.last7.cost.toLocaleString()}</TableCell>
                <TableCell className="text-right">{calcCPC(summaryData.last7.cost, summaryData.last7.clicks)}</TableCell>
                <TableCell className="text-right">{summaryData.last7.conversions.toLocaleString()}</TableCell>
                <TableCell className="text-right">{calcCVR(summaryData.last7.conversions, summaryData.last7.clicks)}</TableCell>
                <TableCell className="text-right">{calcCPA(summaryData.last7.cost, summaryData.last7.conversions)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-center font-medium">전일</TableCell>
                <TableCell className="text-right">{summaryData.yesterday.impressions.toLocaleString()}</TableCell>
                <TableCell className="text-right">{summaryData.yesterday.clicks.toLocaleString()}</TableCell>
                <TableCell className="text-right">{calcCTR(summaryData.yesterday.impressions, summaryData.yesterday.clicks)}</TableCell>
                <TableCell className="text-right">{summaryData.yesterday.cost.toLocaleString()}</TableCell>
                <TableCell className="text-right">{calcCPC(summaryData.yesterday.cost, summaryData.yesterday.clicks)}</TableCell>
                <TableCell className="text-right">{summaryData.yesterday.conversions.toLocaleString()}</TableCell>
                <TableCell className="text-right">{calcCVR(summaryData.yesterday.conversions, summaryData.yesterday.clicks)}</TableCell>
                <TableCell className="text-right">{calcCPA(summaryData.yesterday.cost, summaryData.yesterday.conversions)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* 일자별 상세 데이터 영역 */}
        <div className="bg-white rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-center font-semibold">일자</TableHead>
                <TableHead className="text-center font-semibold">노출</TableHead>
                <TableHead className="text-center font-semibold">클릭</TableHead>
                <TableHead className="text-center font-semibold">CTR</TableHead>
                <TableHead className="text-center font-semibold">광고비</TableHead>
                <TableHead className="text-center font-semibold">CPC</TableHead>
                <TableHead className="text-center font-semibold">전환수</TableHead>
                <TableHead className="text-center font-semibold">CVR</TableHead>
                <TableHead className="text-center font-semibold">CPA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyData.map(row => (
                <TableRow key={row.date}>
                  <TableCell className="text-center">{row.date}</TableCell>
                  <TableCell className="text-right">{row.impressions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{calcCTR(row.impressions, row.clicks)}</TableCell>
                  <TableCell className="text-right">{row.cost.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{calcCPC(row.cost, row.clicks)}</TableCell>
                  <TableCell className="text-right">{row.conversions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{calcCVR(row.conversions, row.clicks)}</TableCell>
                  <TableCell className="text-right">{calcCPA(row.cost, row.conversions)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
