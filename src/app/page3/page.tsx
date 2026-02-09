'use client'

import { useState, useMemo } from 'react'
import {
  Button,
  Checkbox,
  Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui'
import { RotateCw, Settings, Trash2, CheckCircle2, XCircle, HelpCircle, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

// 매체 목록
const MEDIA_OPTIONS = [
  '네이버',
  '네이버 성과형 DA',
  '카카오',
  '카카오 모먼트',
  '구글',
  '메타',
  '틱톡',
]

// 매체별 필요 API 키 필드 정의
const MEDIA_API_FIELDS: Record<string, { label: string; key: string; type?: string }[]> = {
  '네이버': [
    { label: 'API Key', key: 'apiKey' },
    { label: 'Secret Key', key: 'secretKey', type: 'password' },
    { label: 'Customer ID', key: 'customerId' },
  ],
  '네이버 성과형 DA': [
    { label: 'API Key', key: 'apiKey' },
    { label: 'Secret Key', key: 'secretKey', type: 'password' },
    { label: 'Customer ID', key: 'customerId' },
  ],
  '카카오': [
    { label: 'API Key', key: 'apiKey' },
    { label: 'Ad Account ID', key: 'adAccountId' },
  ],
  '카카오 모먼트': [
    { label: 'API Key', key: 'apiKey' },
    { label: 'Ad Account ID', key: 'adAccountId' },
  ],
  '구글': [
    { label: 'Client ID', key: 'clientId' },
    { label: 'Client Secret', key: 'clientSecret', type: 'password' },
    { label: 'Developer Token', key: 'developerToken' },
    { label: 'Customer ID', key: 'customerId' },
  ],
  '메타': [
    { label: 'Access Token', key: 'accessToken', type: 'password' },
    { label: 'Ad Account ID', key: 'adAccountId' },
  ],
  '틱톡': [
    { label: 'Access Token', key: 'accessToken', type: 'password' },
    { label: 'App ID', key: 'appId' },
    { label: 'Advertiser ID', key: 'advertiserId' },
  ],
}

type AdvertiserStatus = '정상 연동' | '연동 오류'

interface Advertiser {
  id: string
  name: string
  media: string
  balance: number
  dailySpend: number
  weeklySpend: number
  updatedAt: string
  status: AdvertiserStatus
}

// 광고주 더미 데이터
const INITIAL_ADVERTISER_DATA: Advertiser[] = [
  { id: 'ADV-001', name: '헬스케어코리아', media: '네이버', balance: 5200000, dailySpend: 320000, weeklySpend: 2240000, updatedAt: '2026-02-03 14:30', status: '정상 연동' },
  { id: 'ADV-002', name: '뷰티플러스', media: '네이버', balance: 3800000, dailySpend: 280000, weeklySpend: 1960000, updatedAt: '2026-02-03 15:10', status: '정상 연동' },
  { id: 'ADV-003', name: '스포츠마켓', media: '카카오', balance: 1200000, dailySpend: 150000, weeklySpend: 1050000, updatedAt: '2026-02-03 13:45', status: '연동 오류' },
  { id: 'ADV-004', name: '푸드팩토리', media: '구글', balance: 7500000, dailySpend: 450000, weeklySpend: 3150000, updatedAt: '2026-02-03 16:00', status: '정상 연동' },
  { id: 'ADV-005', name: '테크솔루션', media: '메타', balance: 2300000, dailySpend: 180000, weeklySpend: 1260000, updatedAt: '2026-02-03 12:20', status: '정상 연동' },
  { id: 'ADV-006', name: '패션하우스', media: '네이버 성과형 DA', balance: 4100000, dailySpend: 350000, weeklySpend: 2450000, updatedAt: '2026-02-03 11:55', status: '정상 연동' },
  { id: 'ADV-007', name: '에듀케이션랩', media: '카카오 모먼트', balance: 900000, dailySpend: 120000, weeklySpend: 840000, updatedAt: '2026-02-03 10:30', status: '연동 오류' },
  { id: 'ADV-008', name: '트래블조이', media: '구글', balance: 6200000, dailySpend: 400000, weeklySpend: 2800000, updatedAt: '2026-02-03 09:15', status: '정상 연동' },
  { id: 'ADV-009', name: '리빙스타일', media: '틱톡', balance: 1800000, dailySpend: 200000, weeklySpend: 1400000, updatedAt: '2026-02-03 14:00', status: '정상 연동' },
  { id: 'ADV-010', name: '오토모빌', media: '네이버', balance: 8900000, dailySpend: 520000, weeklySpend: 3640000, updatedAt: '2026-02-03 15:45', status: '정상 연동' },
  { id: 'ADV-011', name: '펫프렌즈', media: '네이버', balance: 3200000, dailySpend: 250000, weeklySpend: 1750000, updatedAt: '2026-02-03 13:20', status: '연동 오류' },
  { id: 'ADV-012', name: '키즈월드', media: '카카오', balance: 2700000, dailySpend: 190000, weeklySpend: 1330000, updatedAt: '2026-02-03 11:10', status: '정상 연동' },
  { id: 'ADV-013', name: '홈인테리어', media: '구글', balance: 4500000, dailySpend: 310000, weeklySpend: 2170000, updatedAt: '2026-02-03 16:30', status: '정상 연동' },
  { id: 'ADV-014', name: '디지털프로', media: '메타', balance: 1500000, dailySpend: 170000, weeklySpend: 1190000, updatedAt: '2026-02-03 10:00', status: '정상 연동' },
  { id: 'ADV-015', name: '그린라이프', media: '네이버 성과형 DA', balance: 5800000, dailySpend: 380000, weeklySpend: 2660000, updatedAt: '2026-02-03 14:50', status: '정상 연동' },
  { id: 'ADV-016', name: '뮤직스토어', media: '카카오 모먼트', balance: 2100000, dailySpend: 160000, weeklySpend: 1120000, updatedAt: '2026-02-03 12:40', status: '연동 오류' },
  { id: 'ADV-017', name: '북클럽', media: '구글', balance: 800000, dailySpend: 95000, weeklySpend: 665000, updatedAt: '2026-02-03 09:50', status: '정상 연동' },
  { id: 'ADV-018', name: '카페드림', media: '틱톡', balance: 3400000, dailySpend: 270000, weeklySpend: 1890000, updatedAt: '2026-02-03 15:30', status: '정상 연동' },
  { id: 'ADV-019', name: '웰니스케어', media: '네이버', balance: 6700000, dailySpend: 430000, weeklySpend: 3010000, updatedAt: '2026-02-03 13:00', status: '정상 연동' },
  { id: 'ADV-020', name: '스마트팜', media: '카카오', balance: 1100000, dailySpend: 130000, weeklySpend: 910000, updatedAt: '2026-02-03 11:30', status: '연동 오류' },
  { id: 'ADV-021', name: '클린에너지', media: '메타', balance: 4800000, dailySpend: 340000, weeklySpend: 2380000, updatedAt: '2026-02-03 16:15', status: '정상 연동' },
  { id: 'ADV-022', name: '아트갤러리', media: '구글', balance: 1900000, dailySpend: 145000, weeklySpend: 1015000, updatedAt: '2026-02-03 10:45', status: '정상 연동' },
  { id: 'ADV-023', name: '헬스케어플러스', media: '네이버', balance: 7200000, dailySpend: 470000, weeklySpend: 3290000, updatedAt: '2026-02-03 14:15', status: '정상 연동' },
]

function calcEstimatedDays(balance: number, weeklySpend: number): number {
  const dailyAvg = weeklySpend / 7
  if (dailyAvg === 0) return 0
  return Math.floor(balance / dailyAvg)
}

function generateRandomBalance(): number {
  return Math.floor(Math.random() * 9000000) + 500000
}

function getCurrentTime(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

const ITEMS_PER_PAGE = 10

type TabType = '광고주 목록' | '계정 잔액 확인' | '광고주 등록'
type TestStatus = 'idle' | 'testing' | 'success' | 'error'
type SortDirection = 'asc' | 'desc' | null
type BalanceSortKey = 'id' | 'balance' | 'dailySpend' | 'weeklySpend' | 'estimatedDays'

function SortIcon({ direction }: { direction: SortDirection }) {
  if (!direction) {
    return (
      <span className="inline-flex flex-col ml-1 -space-y-1">
        <span className="text-[10px] leading-none text-[#DADCE0]">&#9650;</span>
        <span className="text-[10px] leading-none text-[#DADCE0]">&#9660;</span>
      </span>
    )
  }
  return (
    <span className="inline-flex ml-1">
      <span className="text-[10px] leading-none text-[#202124]">
        {direction === 'asc' ? '\u25B2' : '\u25BC'}
      </span>
    </span>
  )
}

export default function Page3() {
  const [activeTab, setActiveTab] = useState<TabType>('광고주 목록')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchError, setSearchError] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [advertiserData, setAdvertiserData] = useState<Advertiser[]>(INITIAL_ADVERTISER_DATA)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [settingsTargetId, setSettingsTargetId] = useState<string | null>(null)

  // 광고주 등록 탭 상태
  const [regMedia, setRegMedia] = useState<string>('')
  const [regApiValues, setRegApiValues] = useState<Record<string, string>>({})
  const [testStatus, setTestStatus] = useState<TestStatus>('idle')

  // 매체 도움말 툴팁 상태
  const [showMediaTooltip, setShowMediaTooltip] = useState(false)
  const [showMediaTooltipList, setShowMediaTooltipList] = useState(false)

  // 설정 다이얼로그 테스트 상태
  const [settingsTestStatus, setSettingsTestStatus] = useState<TestStatus>('idle')

  // 예상 소진일 가이드라인 툴팁 상태
  const [showEstimatedDaysTooltip, setShowEstimatedDaysTooltip] = useState(false)

  // 정렬 상태 (계정 잔액 확인 탭)
  const [balanceSortKey, setBalanceSortKey] = useState<BalanceSortKey | null>(null)
  const [balanceSortDirection, setBalanceSortDirection] = useState<SortDirection>(null)

  // 정렬 토글
  const handleBalanceSort = (key: BalanceSortKey) => {
    if (balanceSortKey === key) {
      if (balanceSortDirection === 'asc') {
        setBalanceSortDirection('desc')
      } else if (balanceSortDirection === 'desc') {
        setBalanceSortKey(null)
        setBalanceSortDirection(null)
      } else {
        setBalanceSortDirection('asc')
      }
    } else {
      setBalanceSortKey(key)
      setBalanceSortDirection('asc')
    }
  }

  const getBalanceSortDirection = (key: BalanceSortKey): SortDirection => {
    return balanceSortKey === key ? balanceSortDirection : null
  }

  const handleSearch = () => {
    if (searchKeyword.length > 0 && searchKeyword.length < 2) {
      setSearchError('2글자 이상 입력해 주세요.')
      return
    }
    setSearchError('')
    setAppliedKeyword(searchKeyword)
    setCurrentPage(1)
    setSelectedIds(new Set())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSelectedIds(new Set())
    if (tab === '광고주 등록') {
      setRegMedia('')
      setRegApiValues({})
      setTestStatus('idle')
    }
  }

  // 검색 필터링된 데이터
  const filteredData = useMemo(() => {
    if (!appliedKeyword) return advertiserData
    return advertiserData.filter(
      item =>
        item.name.includes(appliedKeyword) ||
        item.id.includes(appliedKeyword)
    )
  }, [appliedKeyword, advertiserData])

  // 정렬된 데이터 (계정 잔액 확인 탭용)
  const sortedFilteredData = useMemo(() => {
    if (!balanceSortKey || !balanceSortDirection) return filteredData

    return [...filteredData].sort((a, b) => {
      let aVal: number
      let bVal: number

      switch (balanceSortKey) {
        case 'id':
          return balanceSortDirection === 'asc'
            ? a.id.localeCompare(b.id)
            : b.id.localeCompare(a.id)
        case 'balance':
          aVal = a.balance
          bVal = b.balance
          break
        case 'dailySpend':
          aVal = a.dailySpend
          bVal = b.dailySpend
          break
        case 'weeklySpend':
          aVal = a.weeklySpend
          bVal = b.weeklySpend
          break
        case 'estimatedDays':
          aVal = calcEstimatedDays(a.balance, a.weeklySpend)
          bVal = calcEstimatedDays(b.balance, b.weeklySpend)
          break
        default:
          return 0
      }

      return balanceSortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [filteredData, balanceSortKey, balanceSortDirection])

  // 페이지네이션 - 계정 잔액 확인 탭에서는 정렬된 데이터 사용
  const dataForPagination = activeTab === '계정 잔액 확인' ? sortedFilteredData : filteredData
  const totalPages = Math.ceil(dataForPagination.length / ITEMS_PER_PAGE)
  const paginatedData = dataForPagination.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // 선택 상자
  const allPageSelected = paginatedData.length > 0 && paginatedData.every(item => selectedIds.has(item.id))

  const toggleSelectAll = () => {
    const newSelected = new Set(selectedIds)
    if (allPageSelected) {
      paginatedData.forEach(item => newSelected.delete(item.id))
    } else {
      paginatedData.forEach(item => newSelected.add(item.id))
    }
    setSelectedIds(newSelected)
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  // 개별 행 새로고침
  const handleRefresh = (id: string) => {
    setAdvertiserData(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, balance: generateRandomBalance(), updatedAt: getCurrentTime() }
          : item
      )
    )
  }

  // 선택된 행 일괄 예산 새로고침
  const handleBulkRefresh = () => {
    if (selectedIds.size === 0) return
    setAdvertiserData(prev =>
      prev.map(item =>
        selectedIds.has(item.id)
          ? { ...item, balance: generateRandomBalance(), updatedAt: getCurrentTime() }
          : item
      )
    )
  }

  // 삭제 확인
  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return
    setAdvertiserData(prev => prev.filter(item => item.id !== deleteTargetId))
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(deleteTargetId)
      return newSet
    })
    setDeleteTargetId(null)
  }

  // 설정 대상 광고주 정보
  const settingsTarget = settingsTargetId
    ? advertiserData.find(item => item.id === settingsTargetId)
    : null

  // 설정 다이얼로그 테스트 핸들러
  const handleSettingsTest = () => {
    setSettingsTestStatus('testing')
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3
      setSettingsTestStatus(isSuccess ? 'success' : 'error')
    }, 1500)
  }

  // 설정 다이얼로그 닫기 핸들러
  const handleSettingsClose = () => {
    setSettingsTargetId(null)
    setSettingsTestStatus('idle')
  }

  // 매체 변경 핸들러 (등록 탭)
  const handleRegMediaChange = (value: string) => {
    setRegMedia(value)
    setRegApiValues({})
    setTestStatus('idle')
  }

  // API 값 변경 핸들러
  const handleApiValueChange = (key: string, value: string) => {
    setRegApiValues(prev => ({ ...prev, [key]: value }))
    setTestStatus('idle')
  }

  // 연결 테스트 핸들러
  const handleTest = () => {
    if (!regMedia) return
    setTestStatus('testing')

    setTimeout(() => {
      const isSuccess = Math.random() > 0.3
      setTestStatus(isSuccess ? 'success' : 'error')
    }, 1500)
  }

  // 페이지네이션 컴포넌트
  const renderPagination = () => {
    if (totalPages <= 1) return null
    return (
      <div className="flex items-center justify-center gap-2 py-6 border-t border-[#E8EAED]">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
          className="rounded-xl border-[#DADCE0] hover:bg-[#F8F9FA] transition-all duration-200"
        >
          이전
        </Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Button
            key={page}
            variant="outline"
            size="sm"
            className={cn(
              "rounded-xl transition-all duration-200",
              page === currentPage
                ? 'bg-[#1A73E8] text-white hover:bg-[#1557B0] border-[#1A73E8]'
                : 'border-[#DADCE0] hover:bg-[#F8F9FA]'
            )}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(prev => prev + 1)}
          className="rounded-xl border-[#DADCE0] hover:bg-[#F8F9FA] transition-all duration-200"
        >
          다음
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="p-8 space-y-6 w-[90%] mx-auto">
        {/* 페이지 제목 */}
        <h1 className="text-2xl font-bold text-[#202124] tracking-tight">광고주 관리</h1>

        {/* 탭 영역 */}
        <div className="bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]">
          <nav className="flex border-b border-[#E8EAED]">
            {(['광고주 목록', '계정 잔액 확인', '광고주 등록'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  "relative px-6 py-4 text-sm font-medium transition-all duration-200",
                  activeTab === tab
                    ? "text-[#1A73E8]"
                    : "text-[#5F6368] hover:text-[#202124] hover:bg-[#F8F9FA]"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1A73E8] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* 필터 설정 영역 (광고주 목록, 계정 잔액 확인 탭에서만 표시) */}
          {(activeTab === '광고주 목록' || activeTab === '계정 잔액 확인') && (
            <div className="p-6 border-b border-[#E8EAED]">
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-md">
                  <Input
                    type="text"
                    placeholder="광고주명이나 광고주 ID를 입력해 주세요."
                    value={searchKeyword}
                    onChange={(e) => {
                      setSearchKeyword(e.target.value)
                      if (searchError) setSearchError('')
                    }}
                    onKeyDown={handleKeyDown}
                    className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
                  />
                  {searchError && (
                    <p className="mt-2 text-sm text-[#EA4335]">{searchError}</p>
                  )}
                </div>
                <Button
                  className="bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium px-6 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                  onClick={handleSearch}
                >
                  검색
                </Button>
              </div>
            </div>
          )}

          {/* 광고주 목록 탭 */}
          {activeTab === '광고주 목록' && (
            <div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8F9FA] border-b border-[#E8EAED]">
                    <TableHead className="text-center font-semibold text-[#202124]">광고주 ID</TableHead>
                    <TableHead className="text-center font-semibold text-[#202124]">광고주명</TableHead>
                    <TableHead className="text-center font-semibold text-[#202124]">
                      <div className="inline-flex items-center gap-1.5 justify-center">
                        매체
                        <div className="relative">
                          <button
                            onClick={() => setShowMediaTooltipList(!showMediaTooltipList)}
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[#DADCE0] hover:bg-[#E8EAED] transition-colors"
                          >
                            <HelpCircle className="h-3.5 w-3.5 text-[#5F6368]" />
                          </button>
                          {showMediaTooltipList && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowMediaTooltipList(false)}
                              />
                              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-64 p-4 bg-[#202124] text-white text-xs rounded-xl shadow-lg">
                                <div className="space-y-2">
                                  <p><span className="font-semibold">네이버:</span> 네이버 검색광고 + 네이버 쇼핑검색광고</p>
                                  <p><span className="font-semibold">카카오:</span> 카카오 검색광고</p>
                                  <p><span className="font-semibold">구글:</span> 구글 검색광고 + 구글 디스플레이광고</p>
                                </div>
                                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#202124] rotate-45" />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-semibold text-[#202124]">현 상태</TableHead>
                    <TableHead className="text-center font-semibold text-[#202124]">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className={`hover:bg-[#F8F9FA] transition-colors ${index < paginatedData.length - 1 ? 'border-b border-[#E8EAED]' : ''}`}
                    >
                      <TableCell className="text-center text-[#5F6368]">{row.id}</TableCell>
                      <TableCell className="text-center font-medium text-[#202124]">{row.name}</TableCell>
                      <TableCell className="text-center text-[#5F6368]">{row.media}</TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-block w-2.5 h-2.5 rounded-full",
                              row.status === '정상 연동' ? 'bg-[#34A853]' : 'bg-[#EA4335]'
                            )}
                          />
                          <span className={cn(
                            "text-sm",
                            row.status === '정상 연동' ? 'text-[#137333]' : 'text-[#C5221F]'
                          )}>
                            {row.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setSettingsTargetId(row.id)}
                            className="inline-flex items-center justify-center p-2 rounded-xl hover:bg-[#F8F9FA] transition-all duration-200"
                            title="설정"
                          >
                            <Settings className="h-4 w-4 text-[#5F6368]" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(row.id)}
                            className="inline-flex items-center justify-center p-2 rounded-xl hover:bg-[#FCE8E6] transition-all duration-200"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4 text-[#EA4335]" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-[#5F6368]">
                        검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {renderPagination()}
            </div>
          )}

          {/* 계정 잔액 확인 탭 */}
          {activeTab === '계정 잔액 확인' && (
            <div>
              {/* 예산 새로고침 버튼 */}
              <div className="flex justify-end px-6 py-4">
                <Button
                  className="bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium px-6 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                  onClick={handleBulkRefresh}
                  disabled={selectedIds.size === 0}
                >
                  예산 새로고침
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8F9FA] border-b border-[#E8EAED]">
                    <TableHead className="text-center w-[50px]">
                      <Checkbox
                        checked={allPageSelected}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-center font-semibold text-[#202124]">
                      <button onClick={() => handleBalanceSort('id')} className="inline-flex items-center gap-0.5 hover:text-[#1A73E8]">
                        광고주 ID <SortIcon direction={getBalanceSortDirection('id')} />
                      </button>
                    </TableHead>
                    <TableHead className="text-center font-semibold text-[#202124]">광고주명</TableHead>
                    <TableHead className="text-center font-semibold text-[#202124]">
                      <div className="inline-flex items-center gap-1.5 justify-center">
                        매체
                        <div className="relative">
                          <button
                            onClick={() => setShowMediaTooltip(!showMediaTooltip)}
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[#DADCE0] hover:bg-[#E8EAED] transition-colors"
                          >
                            <HelpCircle className="h-3.5 w-3.5 text-[#5F6368]" />
                          </button>
                          {showMediaTooltip && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowMediaTooltip(false)}
                              />
                              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-64 p-4 bg-[#202124] text-white text-xs rounded-xl shadow-lg">
                                <div className="space-y-2">
                                  <p><span className="font-semibold">네이버:</span> 네이버 검색광고 + 네이버 쇼핑검색광고</p>
                                  <p><span className="font-semibold">카카오:</span> 카카오 검색광고</p>
                                  <p><span className="font-semibold">구글:</span> 구글 검색광고 + 구글 디스플레이광고</p>
                                </div>
                                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#202124] rotate-45" />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-semibold text-[#202124]">
                      <button onClick={() => handleBalanceSort('balance')} className="inline-flex items-center gap-0.5 hover:text-[#1A73E8]">
                        계정 잔액 <SortIcon direction={getBalanceSortDirection('balance')} />
                      </button>
                    </TableHead>
                    <TableHead className="text-center font-semibold text-[#202124]">
                      <button onClick={() => handleBalanceSort('dailySpend')} className="inline-flex items-center gap-0.5 hover:text-[#1A73E8]">
                        전일 집행비 <SortIcon direction={getBalanceSortDirection('dailySpend')} />
                      </button>
                    </TableHead>
                    <TableHead className="text-center font-semibold text-[#202124]">
                      <button onClick={() => handleBalanceSort('weeklySpend')} className="inline-flex items-center gap-0.5 hover:text-[#1A73E8]">
                        최근 7일 집행비 <SortIcon direction={getBalanceSortDirection('weeklySpend')} />
                      </button>
                    </TableHead>
                    <TableHead className="text-center font-semibold text-[#202124]">
                      <div className="inline-flex items-center gap-1.5 justify-center">
                        <button onClick={() => handleBalanceSort('estimatedDays')} className="inline-flex items-center gap-0.5 hover:text-[#1A73E8]">
                          예상 소진일 <SortIcon direction={getBalanceSortDirection('estimatedDays')} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setShowEstimatedDaysTooltip(!showEstimatedDaysTooltip)}
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[#DADCE0] hover:bg-[#E8EAED] transition-colors"
                          >
                            <HelpCircle className="h-3.5 w-3.5 text-[#5F6368]" />
                          </button>
                          {showEstimatedDaysTooltip && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowEstimatedDaysTooltip(false)}
                              />
                              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 w-72 p-4 bg-[#202124] text-white text-xs rounded-xl shadow-lg">
                                <div className="space-y-2">
                                  <p className="font-semibold">예상 소진일 계산 로직</p>
                                  <p>계정 잔액 / (최근 7일 집행비 / 7)</p>
                                  <p className="text-[#9AA0A6]">최근 7일간의 일평균 집행비를 기준으로 잔액이 소진되는 데 걸리는 예상 일수를 계산합니다.</p>
                                </div>
                                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#202124] rotate-45" />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </TableHead>
                    <TableHead className="text-center font-semibold text-[#202124]">업데이트 시간</TableHead>
                    <TableHead className="text-center font-semibold text-[#202124] w-[60px]">새로고침</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((row, index) => {
                    const estimatedDays = calcEstimatedDays(row.balance, row.weeklySpend)
                    return (
                      <TableRow
                        key={row.id}
                        className={`hover:bg-[#F8F9FA] transition-colors ${index < paginatedData.length - 1 ? 'border-b border-[#E8EAED]' : ''}`}
                      >
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedIds.has(row.id)}
                            onCheckedChange={() => toggleSelect(row.id)}
                          />
                        </TableCell>
                        <TableCell className="text-center text-[#5F6368]">{row.id}</TableCell>
                        <TableCell className="text-center font-medium text-[#202124]">{row.name}</TableCell>
                        <TableCell className="text-center text-[#5F6368]">{row.media}</TableCell>
                        <TableCell className="text-right text-[#5F6368]">{row.balance.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-[#5F6368]">{row.dailySpend.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-[#5F6368]">{row.weeklySpend.toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <span className={cn(
                              "text-[#5F6368]",
                              estimatedDays < 3 && "font-semibold text-[#C5221F]",
                              estimatedDays >= 3 && estimatedDays < 5 && "font-semibold text-[#E37400]"
                            )}>
                              {estimatedDays}일
                            </span>
                            {estimatedDays < 3 && (
                              <AlertTriangle className="h-4 w-4 text-[#EA4335]" />
                            )}
                            {estimatedDays >= 3 && estimatedDays < 5 && (
                              <AlertTriangle className="h-4 w-4 text-[#F9AB00]" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-[#5F6368]">{row.updatedAt}</TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => handleRefresh(row.id)}
                            className="inline-flex items-center justify-center p-2 rounded-xl hover:bg-[#F8F9FA] transition-all duration-200"
                          >
                            <RotateCw className="h-4 w-4 text-[#5F6368]" />
                          </button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {paginatedData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-[#5F6368]">
                        검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {renderPagination()}
            </div>
          )}

          {/* 광고주 등록 탭 */}
          {activeTab === '광고주 등록' && (
            <div className="p-8">
              <div className="max-w-xl space-y-6">
                {/* 매체 선택 */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-[#202124]">매체 선택</label>
                  <Select value={regMedia} onValueChange={handleRegMediaChange}>
                    <SelectTrigger className="w-full bg-white border-[#E8EAED] rounded-xl hover:border-[#DADCE0] transition-colors">
                      <SelectValue placeholder="매체를 선택해 주세요." />
                    </SelectTrigger>
                    <SelectContent className="bg-white rounded-xl border-[#E8EAED] shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]">
                      {MEDIA_OPTIONS.map(option => (
                        <SelectItem key={option} value={option} className="rounded-lg hover:bg-[#F8F9FA]">
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 매체별 API 키 입력 필드 */}
                {regMedia && MEDIA_API_FIELDS[regMedia] && (
                  <div className="space-y-4 pt-2">
                    {MEDIA_API_FIELDS[regMedia].map(field => (
                      <div key={field.key} className="space-y-2">
                        <label className="block text-sm font-medium text-[#5F6368]">
                          {field.label}
                        </label>
                        <Input
                          type={field.type || 'text'}
                          placeholder={`${field.label}를 입력해 주세요.`}
                          value={regApiValues[field.key] || ''}
                          onChange={(e) => handleApiValueChange(field.key, e.target.value)}
                          className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 테스트 버튼 */}
                {regMedia && (
                  <div className="pt-4">
                    <Button
                      onClick={handleTest}
                      disabled={testStatus === 'testing'}
                      className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium py-3 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {testStatus === 'testing' ? '연결 테스트 중...' : '테스트'}
                    </Button>
                  </div>
                )}

                {/* 연결 테스트 결과 블록 */}
                {testStatus !== 'idle' && testStatus !== 'testing' && (
                  <div
                    className={cn(
                      "mt-6 p-6 rounded-2xl flex items-center gap-4",
                      testStatus === 'success'
                        ? "bg-[#E6F4EA] border border-[#34A853]"
                        : "bg-[#FCE8E6] border border-[#EA4335]"
                    )}
                  >
                    {testStatus === 'success' ? (
                      <>
                        <CheckCircle2 className="h-8 w-8 text-[#34A853] flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-[#137333]">연결 성공</p>
                          <p className="text-sm text-[#137333] mt-1">
                            API 연동이 정상적으로 확인되었습니다.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-8 w-8 text-[#EA4335] flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-[#C5221F]">연결 실패</p>
                          <p className="text-sm text-[#C5221F] mt-1">
                            입력하신 API 정보를 다시 확인해 주세요.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteTargetId !== null} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <DialogContent className="bg-white rounded-2xl border-[#E8EAED] shadow-[0_2px_6px_2px_rgba(60,64,67,0.15),0_8px_16px_4px_rgba(60,64,67,0.15)]">
          <DialogHeader>
            <DialogTitle className="text-[#202124] text-lg font-semibold">광고주 삭제</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#5F6368] py-4">정말 삭제하시겠습니까?</p>
          <DialogFooter className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setDeleteTargetId(null)}
              className="border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] transition-all duration-200"
            >
              아니오
            </Button>
            <Button
              className="bg-[#EA4335] hover:bg-[#C5221F] text-white rounded-xl transition-all duration-200"
              onClick={handleDeleteConfirm}
            >
              네
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 설정 다이얼로그 */}
      <Dialog open={settingsTargetId !== null} onOpenChange={(open) => !open && handleSettingsClose()}>
        <DialogContent className="bg-white rounded-2xl border-[#E8EAED] shadow-[0_2px_6px_2px_rgba(60,64,67,0.15),0_8px_16px_4px_rgba(60,64,67,0.15)] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#202124] text-lg font-semibold">
              API 연동 설정 - {settingsTarget?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">매체</label>
              <Input
                value={settingsTarget?.media || ''}
                readOnly
                className="bg-[#F8F9FA] border-[#E8EAED] rounded-xl text-[#5F6368]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">광고주 ID</label>
              <Input
                value={settingsTarget?.id || ''}
                readOnly
                className="bg-[#F8F9FA] border-[#E8EAED] rounded-xl text-[#5F6368]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">API Key</label>
              <Input
                placeholder="API Key를 입력해 주세요."
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">Secret Key</label>
              <Input
                placeholder="Secret Key를 입력해 주세요."
                type="password"
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">Customer ID</label>
              <Input
                placeholder="Customer ID를 입력해 주세요."
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>

            {/* 테스트 버튼 */}
            <Button
              onClick={handleSettingsTest}
              disabled={settingsTestStatus === 'testing'}
              className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium py-3 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {settingsTestStatus === 'testing' ? '연결 테스트 중...' : '테스트'}
            </Button>

            {/* 연결 테스트 결과 블록 */}
            {settingsTestStatus !== 'idle' && settingsTestStatus !== 'testing' && (
              <div
                className={cn(
                  "p-4 rounded-xl flex items-center gap-3",
                  settingsTestStatus === 'success'
                    ? "bg-[#E6F4EA] border border-[#34A853]"
                    : "bg-[#FCE8E6] border border-[#EA4335]"
                )}
              >
                {settingsTestStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-[#34A853] flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[#137333] text-sm">연결 성공</p>
                      <p className="text-xs text-[#137333]">API 연동이 정상적으로 확인되었습니다.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 text-[#EA4335] flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-[#C5221F] text-sm">연결 실패</p>
                      <p className="text-xs text-[#C5221F]">입력하신 API 정보를 다시 확인해 주세요.</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleSettingsClose}
              className="border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] transition-all duration-200"
            >
              취소
            </Button>
            <Button
              className="bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-xl transition-all duration-200"
              onClick={handleSettingsClose}
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
