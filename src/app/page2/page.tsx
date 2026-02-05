'use client'

import { useState, useMemo } from 'react'
import {
  Button,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Input,
} from '@/components/ui'

// 매체 목록 (키워드 관련 매체만)
const MEDIA_OPTIONS = [
  '종합',
  '네이버 검색광고',
  '카카오 키워드',
  '구글 검색광고',
]

// 캠페인 더미 데이터
const CAMPAIGN_OPTIONS: Record<string, string[]> = {
  '네이버 검색광고': ['브랜드 캠페인', '퍼포먼스 캠페인', '시즌 캠페인'],
  '카카오 키워드': ['카카오 브랜드', '카카오 전환'],
  '구글 검색광고': ['구글 브랜드', '구글 퍼포먼스'],
}

// 광고그룹 더미 데이터
const ADGROUP_OPTIONS: Record<string, string[]> = {
  '브랜드 캠페인': ['브랜드_핵심KW', '브랜드_확장KW'],
  '퍼포먼스 캠페인': ['퍼포먼스_전환', '퍼포먼스_CPA'],
  '시즌 캠페인': ['시즌_봄', '시즌_여름'],
  '카카오 브랜드': ['카카오_핵심KW', '카카오_확장KW'],
  '카카오 전환': ['카카오_전환_A', '카카오_전환_B'],
  '구글 브랜드': ['구글_브랜드KW'],
  '구글 퍼포먼스': ['구글_퍼포먼스_A', '구글_퍼포먼스_B'],
}

// 키워드 더미 데이터 (매체, 캠페인, 광고그룹 포함)
const KEYWORD_DATA = [
  { media: '네이버 검색광고', campaign: '브랜드 캠페인', adGroup: '브랜드_핵심KW', keyword: '다이어트 보조제', impressions: 45200, clicks: 1580, cost: 632000, conversions: 47 },
  { media: '네이버 검색광고', campaign: '브랜드 캠페인', adGroup: '브랜드_확장KW', keyword: '프로틴 추천', impressions: 38700, clicks: 1320, cost: 528000, conversions: 39 },
  { media: '네이버 검색광고', campaign: '퍼포먼스 캠페인', adGroup: '퍼포먼스_전환', keyword: '헬스 보충제', impressions: 32100, clicks: 1090, cost: 436000, conversions: 33 },
  { media: '네이버 검색광고', campaign: '퍼포먼스 캠페인', adGroup: '퍼포먼스_CPA', keyword: '운동 영양제', impressions: 28400, clicks: 965, cost: 386000, conversions: 29 },
  { media: '네이버 검색광고', campaign: '시즌 캠페인', adGroup: '시즌_봄', keyword: '체중감량', impressions: 52300, clicks: 1780, cost: 712000, conversions: 53 },
  { media: '카카오 키워드', campaign: '카카오 브랜드', adGroup: '카카오_핵심KW', keyword: '단백질 쉐이크', impressions: 41600, clicks: 1415, cost: 566000, conversions: 42 },
  { media: '카카오 키워드', campaign: '카카오 브랜드', adGroup: '카카오_확장KW', keyword: '비타민 추천', impressions: 36900, clicks: 1255, cost: 502000, conversions: 38 },
  { media: '카카오 키워드', campaign: '카카오 전환', adGroup: '카카오_전환_A', keyword: '건강기능식품', impressions: 29800, clicks: 1015, cost: 406000, conversions: 30 },
  { media: '카카오 키워드', campaign: '카카오 전환', adGroup: '카카오_전환_B', keyword: '유산균 추천', impressions: 44100, clicks: 1500, cost: 600000, conversions: 45 },
  { media: '카카오 키워드', campaign: '카카오 브랜드', adGroup: '카카오_핵심KW', keyword: '오메가3', impressions: 25600, clicks: 870, cost: 348000, conversions: 26 },
  { media: '구글 검색광고', campaign: '구글 브랜드', adGroup: '구글_브랜드KW', keyword: '콜라겐 추천', impressions: 33500, clicks: 1140, cost: 456000, conversions: 34 },
  { media: '구글 검색광고', campaign: '구글 퍼포먼스', adGroup: '구글_퍼포먼스_A', keyword: '루테인', impressions: 21200, clicks: 720, cost: 288000, conversions: 22 },
  { media: '구글 검색광고', campaign: '구글 퍼포먼스', adGroup: '구글_퍼포먼스_B', keyword: '밀크씨슬', impressions: 18900, clicks: 645, cost: 258000, conversions: 19 },
  { media: '구글 검색광고', campaign: '구글 브랜드', adGroup: '구글_브랜드KW', keyword: '홍삼 추천', impressions: 27300, clicks: 930, cost: 372000, conversions: 28 },
  { media: '구글 검색광고', campaign: '구글 퍼포먼스', adGroup: '구글_퍼포먼스_A', keyword: '글루타치온', impressions: 15700, clicks: 535, cost: 214000, conversions: 16 },
]

// 날짜 유틸리티
function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getDefaultDate(): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  return formatDate(yesterday)
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

export default function Page2() {
  const [media, setMedia] = useState<string>('')
  const [campaign, setCampaign] = useState<string>('')
  const [adGroup, setAdGroup] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState(getDefaultDate())

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

  // 기간별 합산 데이터
  const summaryData = useMemo(() => {
    const totalKeywords = KEYWORD_DATA.reduce(
      (acc, kw) => ({
        impressions: acc.impressions + kw.impressions,
        clicks: acc.clicks + kw.clicks,
        cost: acc.cost + kw.cost,
        conversions: acc.conversions + kw.conversions,
      }),
      { impressions: 0, clicks: 0, cost: 0, conversions: 0 }
    )

    return {
      last7: {
        impressions: totalKeywords.impressions * 7,
        clicks: totalKeywords.clicks * 7,
        cost: totalKeywords.cost * 7,
        conversions: totalKeywords.conversions * 7,
      },
      yesterday: totalKeywords,
    }
  }, [])

  // 키워드 데이터 (광고비 내림차순 정렬)
  const sortedKeywordData = useMemo(() => {
    return [...KEYWORD_DATA].sort((a, b) => b.cost - a.cost)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6 w-[85%] mx-auto">
        {/* 페이지 제목 */}
        <h1 className="text-2xl font-bold text-gray-900">키워드별 데이터</h1>

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

            {/* 조회 기간 (단일 날짜) */}
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[150px]"
            />

            {/* 검색 버튼 */}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">검색</Button>
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

        {/* 키워드별 상세 데이터 영역 */}
        <div className="bg-white rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-center font-semibold">매체</TableHead>
                <TableHead className="text-center font-semibold">캠페인</TableHead>
                <TableHead className="text-center font-semibold">광고그룹</TableHead>
                <TableHead className="text-center font-semibold">키워드</TableHead>
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
              {sortedKeywordData.map(row => (
                <TableRow key={`${row.media}-${row.campaign}-${row.adGroup}-${row.keyword}`}>
                  <TableCell className="text-center">{row.media}</TableCell>
                  <TableCell className="text-center">{row.campaign}</TableCell>
                  <TableCell className="text-center">{row.adGroup}</TableCell>
                  <TableCell className="text-center font-medium">{row.keyword}</TableCell>
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
