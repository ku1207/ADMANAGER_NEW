'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Search, Save } from 'lucide-react'
import {
  Button,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Dialog, DialogContent, DialogHeader, DialogTitle,
  Checkbox,
} from '@/components/ui'

// 계정 더미 데이터
const ACCOUNT_DATA = [
  { id: 'ACC001', name: '홍길동 광고주', email: 'hong@example.com' },
  { id: 'ACC002', name: '김철수 마케팅', email: 'kim@example.com' },
  { id: 'ACC003', name: '이영희 컴퍼니', email: 'lee@example.com' },
  { id: 'ACC004', name: '박지민 브랜드', email: 'park@example.com' },
  { id: 'ACC005', name: '최수현 에이전시', email: 'choi@example.com' },
  { id: 'ACC006', name: '정우성 광고', email: 'jung@example.com' },
  { id: 'ACC007', name: '강하늘 미디어', email: 'kang@example.com' },
  { id: 'ACC008', name: '송중기 마케팅', email: 'song@example.com' },
]

// 매체 더미 데이터 (계정별)
const MEDIA_DATA: Record<string, { id: string; name: string }[]> = {
  'ACC001': [
    { id: 'MED001', name: '네이버 검색광고' },
    { id: 'MED002', name: '카카오 키워드' },
    { id: 'MED003', name: '구글 검색광고' },
  ],
  'ACC002': [
    { id: 'MED004', name: '네이버 성과형 DA' },
    { id: 'MED005', name: '메타' },
  ],
  'ACC003': [
    { id: 'MED006', name: '네이버 검색광고' },
    { id: 'MED007', name: '카카오 모먼트' },
    { id: 'MED008', name: '틱톡' },
  ],
  'ACC004': [
    { id: 'MED009', name: '구글 디스플레이광고' },
    { id: 'MED010', name: '메타' },
  ],
  'ACC005': [
    { id: 'MED011', name: '네이버 쇼핑검색광고' },
    { id: 'MED012', name: '카카오 키워드' },
  ],
  'ACC006': [
    { id: 'MED013', name: '네이버 검색광고' },
    { id: 'MED014', name: '구글 검색광고' },
    { id: 'MED015', name: '메타' },
  ],
  'ACC007': [
    { id: 'MED016', name: '틱톡' },
    { id: 'MED017', name: '카카오 모먼트' },
  ],
  'ACC008': [
    { id: 'MED018', name: '네이버 성과형 DA' },
    { id: 'MED019', name: '구글 디스플레이광고' },
  ],
}

// 캠페인 더미 데이터 (매체별)
const CAMPAIGN_DATA: Record<string, { id: string; name: string }[]> = {
  'MED001': [
    { id: 'CAM001', name: '브랜드 캠페인' },
    { id: 'CAM002', name: '퍼포먼스 캠페인' },
  ],
  'MED002': [
    { id: 'CAM003', name: '카카오 브랜드' },
    { id: 'CAM004', name: '카카오 전환' },
  ],
  'MED003': [
    { id: 'CAM005', name: '구글 브랜드' },
    { id: 'CAM006', name: '구글 퍼포먼스' },
  ],
  'MED004': [
    { id: 'CAM007', name: 'DA 브랜딩' },
    { id: 'CAM008', name: 'DA 전환' },
  ],
  'MED005': [
    { id: 'CAM009', name: '메타 전환' },
    { id: 'CAM010', name: '메타 트래픽' },
  ],
  'MED006': [
    { id: 'CAM011', name: '시즌 캠페인' },
  ],
  'MED007': [
    { id: 'CAM012', name: '모먼트 도달' },
    { id: 'CAM013', name: '모먼트 전환' },
  ],
  'MED008': [
    { id: 'CAM014', name: '틱톡 전환' },
  ],
  'MED009': [
    { id: 'CAM015', name: 'GDN 리마케팅' },
  ],
  'MED010': [
    { id: 'CAM016', name: '메타 인지도' },
  ],
  'MED011': [
    { id: 'CAM017', name: '쇼핑 메인' },
    { id: 'CAM018', name: '쇼핑 시즌' },
  ],
  'MED012': [
    { id: 'CAM019', name: '카카오 확장' },
  ],
  'MED013': [
    { id: 'CAM020', name: '네이버 핵심KW' },
  ],
  'MED014': [
    { id: 'CAM021', name: '구글 CPA' },
  ],
  'MED015': [
    { id: 'CAM022', name: '메타 LAL' },
  ],
  'MED016': [
    { id: 'CAM023', name: '틱톡 도달' },
  ],
  'MED017': [
    { id: 'CAM024', name: '모먼트 브랜드' },
  ],
  'MED018': [
    { id: 'CAM025', name: 'DA 리타겟' },
  ],
  'MED019': [
    { id: 'CAM026', name: 'GDN 관심사' },
  ],
}

// 그룹 더미 데이터 (캠페인별)
const GROUP_DATA: Record<string, { id: string; name: string }[]> = {
  'CAM001': [
    { id: 'GRP001', name: '브랜드_핵심KW' },
    { id: 'GRP002', name: '브랜드_확장KW' },
  ],
  'CAM002': [
    { id: 'GRP003', name: '퍼포먼스_전환' },
    { id: 'GRP004', name: '퍼포먼스_CPA' },
  ],
  'CAM003': [
    { id: 'GRP005', name: '카카오_핵심KW' },
  ],
  'CAM004': [
    { id: 'GRP006', name: '카카오_전환_A' },
    { id: 'GRP007', name: '카카오_전환_B' },
  ],
  'CAM005': [
    { id: 'GRP008', name: '구글_브랜드KW' },
  ],
  'CAM006': [
    { id: 'GRP009', name: '구글_퍼포먼스_A' },
    { id: 'GRP010', name: '구글_퍼포먼스_B' },
  ],
  'CAM007': [
    { id: 'GRP011', name: 'DA_브랜드인지' },
  ],
  'CAM008': [
    { id: 'GRP012', name: 'DA_전환_리타겟' },
  ],
  'CAM009': [
    { id: 'GRP013', name: '메타_전환_LAL' },
    { id: 'GRP014', name: '메타_전환_관심사' },
  ],
  'CAM010': [
    { id: 'GRP015', name: '메타_트래픽_A' },
  ],
  'CAM011': [
    { id: 'GRP016', name: '시즌_봄' },
    { id: 'GRP017', name: '시즌_여름' },
  ],
  'CAM012': [
    { id: 'GRP018', name: '모먼트_도달_A' },
  ],
  'CAM013': [
    { id: 'GRP019', name: '모먼트_전환_A' },
  ],
  'CAM014': [
    { id: 'GRP020', name: '틱톡_전환_A' },
  ],
  'CAM015': [
    { id: 'GRP021', name: 'GDN_리마케팅_30일' },
    { id: 'GRP022', name: 'GDN_리마케팅_7일' },
  ],
  'CAM016': [
    { id: 'GRP023', name: '메타_인지도_A' },
  ],
  'CAM017': [
    { id: 'GRP024', name: '쇼핑_인기상품' },
  ],
  'CAM018': [
    { id: 'GRP025', name: '쇼핑_할인' },
  ],
  'CAM019': [
    { id: 'GRP026', name: '카카오_확장KW' },
  ],
  'CAM020': [
    { id: 'GRP027', name: '네이버_핵심_A' },
  ],
  'CAM021': [
    { id: 'GRP028', name: '구글_CPA_A' },
  ],
  'CAM022': [
    { id: 'GRP029', name: '메타_LAL_A' },
  ],
  'CAM023': [
    { id: 'GRP030', name: '틱톡_도달_A' },
  ],
  'CAM024': [
    { id: 'GRP031', name: '모먼트_브랜드_A' },
  ],
  'CAM025': [
    { id: 'GRP032', name: 'DA_리타겟_A' },
  ],
  'CAM026': [
    { id: 'GRP033', name: 'GDN_관심사_A' },
  ],
}

// 저장된 필터 세트 더미 데이터
interface SavedFilter {
  id: string
  name: string
  accountMedias: string[]
  campaigns: string[]
  groups: string[]
}

const INITIAL_SAVED_FILTERS: SavedFilter[] = [
  {
    id: 'SF001',
    name: '홍길동 네이버',
    accountMedias: ['ACC001_MED001'],
    campaigns: ['CAM001'],
    groups: ['GRP001'],
  },
  {
    id: 'SF002',
    name: '김철수 메타',
    accountMedias: ['ACC002_MED005'],
    campaigns: ['CAM009'],
    groups: ['GRP013'],
  },
]

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

type FilterTab = '계정&매체' | '캠페인' | '그룹'
type SortDirection = 'asc' | 'desc' | null
type DailySortKey = 'date' | 'impressions' | 'clicks' | 'ctr' | 'cost' | 'cpc' | 'conversions' | 'cvr' | 'cpa'

// 드롭다운 필터용 데이터 추출
function getAllAccountIds(): string[] {
  return ACCOUNT_DATA.map(a => a.id)
}

function getAllMediaNames(): string[] {
  const names = new Set<string>()
  Object.values(MEDIA_DATA).forEach(medias => {
    medias.forEach(m => names.add(m.name))
  })
  return Array.from(names)
}

function getAllCampaignNames(): string[] {
  const names = new Set<string>()
  Object.values(CAMPAIGN_DATA).forEach(campaigns => {
    campaigns.forEach(c => names.add(c.name))
  })
  return Array.from(names)
}

function getAllGroupNames(): string[] {
  const names = new Set<string>()
  Object.values(GROUP_DATA).forEach(groups => {
    groups.forEach(g => names.add(g.name))
  })
  return Array.from(names)
}

function SortIcon({ direction }: { direction: SortDirection }) {
  return (
    <span className="inline-flex flex-col ml-1 -space-y-1">
      <span className={`text-[10px] leading-none ${direction === 'asc' ? 'text-[#202124]' : 'text-[#DADCE0]'}`}>&#9650;</span>
      <span className={`text-[10px] leading-none ${direction === 'desc' ? 'text-[#202124]' : 'text-[#DADCE0]'}`}>&#9660;</span>
    </span>
  )
}

export default function Page1() {
  const [startDate, setStartDate] = useState(getDefaultStartDate())
  const [endDate, setEndDate] = useState(getDefaultEndDate())
  const [budgetVisible, setBudgetVisible] = useState(true)

  // 드롭다운 필터 상태
  const [filterAccountId, setFilterAccountId] = useState<string>('all')
  const [filterMedia, setFilterMedia] = useState<string>('all')
  const [filterCampaign, setFilterCampaign] = useState<string>('all')
  const [filterGroup, setFilterGroup] = useState<string>('all')

  // 필터 팝업 상태 (기존 유지 for saved filters)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterApplied, setFilterApplied] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('계정&매체')

  // 선택된 필터 값
  const [selectedAccountMedias, setSelectedAccountMedias] = useState<string[]>([])
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  // 임시 선택 상태 (팝업 내에서만 사용)
  const [tempAccountMedias, setTempAccountMedias] = useState<string[]>([])
  const [tempCampaigns, setTempCampaigns] = useState<string[]>([])
  const [tempGroups, setTempGroups] = useState<string[]>([])

  // 검색어
  const [searchTerm, setSearchTerm] = useState('')

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  // 저장된 필터 세트
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(INITIAL_SAVED_FILTERS)
  const [showSavedFilters, setShowSavedFilters] = useState(false)
  const [saveFilterName, setSaveFilterName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // 정렬 상태
  const [sortKey, setSortKey] = useState<DailySortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  // 정렬 토글
  const handleSort = (key: DailySortKey) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortKey(null)
        setSortDirection(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const getSortDirection = (key: DailySortKey): SortDirection => {
    return sortKey === key ? sortDirection : null
  }

  // 탭별 데이터 가져오기
  const getTabData = () => {
    switch (activeTab) {
      case '계정&매체': {
        const accountMediaList: { id: string; accountId: string; accountName: string; mediaName: string }[] = []
        ACCOUNT_DATA.forEach(acc => {
          const medias = MEDIA_DATA[acc.id] || []
          medias.forEach(m => {
            accountMediaList.push({
              id: `${acc.id}_${m.id}`,
              accountId: acc.id,
              accountName: acc.name,
              mediaName: m.name,
            })
          })
        })
        return accountMediaList.map(item => ({
          id: item.id,
          col1: item.accountId,
          col2: item.accountName,
          col3: item.mediaName,
        }))
      }
      case '캠페인': {
        const campaignList: { id: string; col1: string; col2: string; col3: string }[] = []
        tempAccountMedias.forEach(amId => {
          const [accId, medId] = amId.split('_')
          const campaigns = CAMPAIGN_DATA[medId] || []
          campaigns.forEach(c => {
            if (!campaignList.find(item => item.id === c.id)) {
              let mediaName = ''
              const medias = MEDIA_DATA[accId] || []
              const found = medias.find(m => m.id === medId)
              if (found) {
                mediaName = found.name
              }
              campaignList.push({ id: c.id, col1: c.name, col2: accId, col3: mediaName })
            }
          })
        })
        return campaignList
      }
      case '그룹': {
        const groupList: { id: string; col1: string; col2: string; col3: string }[] = []
        tempCampaigns.forEach(camId => {
          const groups = GROUP_DATA[camId] || []
          groups.forEach(g => {
            if (!groupList.find(item => item.id === g.id)) {
              let campaignName = ''
              for (const medId of Object.keys(CAMPAIGN_DATA)) {
                const found = CAMPAIGN_DATA[medId].find(c => c.id === camId)
                if (found) {
                  campaignName = found.name
                  break
                }
              }
              groupList.push({ id: g.id, col1: g.name, col2: campaignName, col3: '' })
            }
          })
        })
        return groupList
      }
      default:
        return []
    }
  }

  // 검색 필터링된 데이터
  const filteredData = useMemo(() => {
    const data = getTabData()
    if (searchTerm.length < 2) return data
    return data.filter(item =>
      item.col1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.col2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.col3 && item.col3.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [activeTab, tempAccountMedias, tempCampaigns, searchTerm])

  // 페이지네이션된 데이터
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredData, currentPage])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)

  // 현재 탭의 선택 상태 가져오기
  const getCurrentSelection = () => {
    switch (activeTab) {
      case '계정&매체': return tempAccountMedias
      case '캠페인': return tempCampaigns
      case '그룹': return tempGroups
      default: return []
    }
  }

  // 전체 선택/해제
  const handleSelectAll = () => {
    const currentSelection = getCurrentSelection()
    const currentData = getTabData()
    const allIds = currentData.map(item => item.id)
    const isAllSelected = allIds.length > 0 && allIds.every(id => currentSelection.includes(id))

    switch (activeTab) {
      case '계정&매체':
        if (isAllSelected) {
          setTempAccountMedias([])
          setTempCampaigns([])
          setTempGroups([])
        } else {
          setTempAccountMedias(allIds)
        }
        break
      case '캠페인':
        if (isAllSelected) {
          setTempCampaigns([])
          setTempGroups([])
        } else {
          setTempCampaigns(allIds)
        }
        break
      case '그룹':
        if (isAllSelected) {
          setTempGroups([])
        } else {
          setTempGroups(allIds)
        }
        break
    }
  }

  // 전체 선택 상태 확인
  const isAllSelected = () => {
    const currentSelection = getCurrentSelection()
    const currentData = getTabData()
    const allIds = currentData.map(item => item.id)
    return allIds.length > 0 && allIds.every(id => currentSelection.includes(id))
  }

  // 항목 선택/해제
  const handleItemToggle = (id: string) => {
    const currentSelection = getCurrentSelection()
    const isSelected = currentSelection.includes(id)

    switch (activeTab) {
      case '계정&매체':
        if (isSelected) {
          setTempAccountMedias(tempAccountMedias.filter(i => i !== id))
          setTempCampaigns([])
          setTempGroups([])
        } else {
          setTempAccountMedias([...tempAccountMedias, id])
        }
        break
      case '캠페인':
        if (isSelected) {
          setTempCampaigns(tempCampaigns.filter(i => i !== id))
          setTempGroups([])
        } else {
          setTempCampaigns([...tempCampaigns, id])
        }
        break
      case '그룹':
        if (isSelected) {
          setTempGroups(tempGroups.filter(i => i !== id))
        } else {
          setTempGroups([...tempGroups, id])
        }
        break
    }
  }

  // 적용 버튼 활성화 여부
  const canApply = () => {
    switch (activeTab) {
      case '계정&매체': return tempAccountMedias.length > 0
      case '캠페인': return tempCampaigns.length > 0
      case '그룹': return tempGroups.length > 0
      default: return false
    }
  }

  // 탭 이동 가능 여부
  const canAccessTab = (tab: FilterTab) => {
    switch (tab) {
      case '계정&매체': return true
      case '캠페인': return tempAccountMedias.length > 0
      case '그룹': return tempCampaigns.length > 0
      default: return false
    }
  }

  // 필터 팝업 열기
  const handleOpenFilter = () => {
    setTempAccountMedias(selectedAccountMedias)
    setTempCampaigns(selectedCampaigns)
    setTempGroups(selectedGroups)
    setSearchTerm('')
    setCurrentPage(1)
    setActiveTab('계정&매체')
    setShowSavedFilters(false)
    setFilterOpen(true)
  }

  // 적용 버튼 클릭
  const handleApply = () => {
    switch (activeTab) {
      case '계정&매체':
        setSelectedAccountMedias(tempAccountMedias)
        if (tempAccountMedias.length > 0) {
          setActiveTab('캠페인')
          setSearchTerm('')
          setCurrentPage(1)
        }
        break
      case '캠페인':
        setSelectedCampaigns(tempCampaigns)
        if (tempCampaigns.length > 0) {
          setActiveTab('그룹')
          setSearchTerm('')
          setCurrentPage(1)
        }
        break
      case '그룹':
        setSelectedGroups(tempGroups)
        setFilterApplied(true)
        setFilterOpen(false)
        break
    }
  }

  // 저장된 필터 불러오기
  const handleLoadFilter = (filter: SavedFilter) => {
    setTempAccountMedias(filter.accountMedias)
    setTempCampaigns(filter.campaigns)
    setTempGroups(filter.groups)
    setShowSavedFilters(false)
  }

  // 필터 저장
  const handleSaveFilter = () => {
    if (saveFilterName.trim().length < 2) return

    const newFilter: SavedFilter = {
      id: `SF${Date.now()}`,
      name: saveFilterName.trim(),
      accountMedias: tempAccountMedias,
      campaigns: tempCampaigns,
      groups: tempGroups,
    }
    setSavedFilters([...savedFilters, newFilter])
    setSaveFilterName('')
    setShowSaveDialog(false)
  }

  // 잔액 계산
  const budgetAmount = useMemo(() => {
    if (selectedAccountMedias.length === 0) {
      return Object.values(BUDGET_DATA).reduce((a, b) => a + b, 0)
    }
    let total = 0
    const addedMediaNames = new Set<string>()
    selectedAccountMedias.forEach(amId => {
      const [accId, medId] = amId.split('_')
      const medias = MEDIA_DATA[accId] || []
      const found = medias.find(m => m.id === medId)
      if (found && BUDGET_DATA[found.name] && !addedMediaNames.has(found.name)) {
        total += BUDGET_DATA[found.name]
        addedMediaNames.add(found.name)
      }
    })
    return total || Object.values(BUDGET_DATA).reduce((a, b) => a + b, 0)
  }, [selectedAccountMedias])

  // 기간별 합산 데이터
  const summaryData = useMemo(() => {
    const today = getToday()

    const last7Days: string[] = []
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      last7Days.push(formatDate(d))
    }

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

  // 일자별 상세 데이터
  const dailyData = useMemo(() => {
    const dates = getDatesInRange(startDate, endDate)
    return dates.map(date => ({
      date,
      ...generateDailyData(date),
    }))
  }, [startDate, endDate])

  // 합계 데이터
  const totalsData = useMemo(() => {
    const totals = dailyData.reduce(
      (acc, row) => ({
        impressions: acc.impressions + row.impressions,
        clicks: acc.clicks + row.clicks,
        cost: acc.cost + row.cost,
        conversions: acc.conversions + row.conversions,
      }),
      { impressions: 0, clicks: 0, cost: 0, conversions: 0 }
    )
    return totals
  }, [dailyData])

  // 정렬된 일자별 데이터
  const sortedDailyData = useMemo(() => {
    if (!sortKey || !sortDirection) return dailyData

    return [...dailyData].sort((a, b) => {
      let aVal: number
      let bVal: number

      switch (sortKey) {
        case 'date':
          aVal = new Date(a.date).getTime()
          bVal = new Date(b.date).getTime()
          break
        case 'impressions':
          aVal = a.impressions
          bVal = b.impressions
          break
        case 'clicks':
          aVal = a.clicks
          bVal = b.clicks
          break
        case 'ctr':
          aVal = a.impressions > 0 ? a.clicks / a.impressions : 0
          bVal = b.impressions > 0 ? b.clicks / b.impressions : 0
          break
        case 'cost':
          aVal = a.cost
          bVal = b.cost
          break
        case 'cpc':
          aVal = a.clicks > 0 ? a.cost / a.clicks : 0
          bVal = b.clicks > 0 ? b.cost / b.clicks : 0
          break
        case 'conversions':
          aVal = a.conversions
          bVal = b.conversions
          break
        case 'cvr':
          aVal = a.clicks > 0 ? a.conversions / a.clicks : 0
          bVal = b.clicks > 0 ? b.conversions / b.clicks : 0
          break
        case 'cpa':
          aVal = a.conversions > 0 ? a.cost / a.conversions : 0
          bVal = b.conversions > 0 ? b.cost / b.conversions : 0
          break
        default:
          return 0
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [dailyData, sortKey, sortDirection])

  const FILTER_TABS: FilterTab[] = ['계정&매체', '캠페인', '그룹']

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="p-8 space-y-6 w-[90%] mx-auto">
        {/* 페이지 제목 */}
        <h1 className="text-2xl font-bold text-[#202124] tracking-tight">일자별 데이터</h1>

        {/* 필터 설정 영역 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]">
          <div className="flex flex-wrap items-center gap-4">
            {/* 드롭다운 필터: 계정 ID */}
            <Select value={filterAccountId} onValueChange={setFilterAccountId}>
              <SelectTrigger className="w-[160px] border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]">
                <SelectValue placeholder="계정 ID" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl border-[#E8EAED] shadow-lg">
                <SelectItem value="all">계정 ID (전체)</SelectItem>
                {getAllAccountIds().map(id => (
                  <SelectItem key={id} value={id}>{id}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 드롭다운 필터: 매체 */}
            <Select value={filterMedia} onValueChange={setFilterMedia}>
              <SelectTrigger className="w-[180px] border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]">
                <SelectValue placeholder="매체" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl border-[#E8EAED] shadow-lg">
                <SelectItem value="all">매체 (전체)</SelectItem>
                {getAllMediaNames().map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 드롭다운 필터: 캠페인 */}
            <Select value={filterCampaign} onValueChange={setFilterCampaign}>
              <SelectTrigger className="w-[180px] border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]">
                <SelectValue placeholder="캠페인" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl border-[#E8EAED] shadow-lg">
                <SelectItem value="all">캠페인 (전체)</SelectItem>
                {getAllCampaignNames().map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 드롭다운 필터: 그룹 */}
            <Select value={filterGroup} onValueChange={setFilterGroup}>
              <SelectTrigger className="w-[180px] border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]">
                <SelectValue placeholder="그룹" />
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl border-[#E8EAED] shadow-lg">
                <SelectItem value="all">그룹 (전체)</SelectItem>
                {getAllGroupNames().map(name => (
                  <SelectItem key={name} value={name}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 구분선 */}
            <div className="h-10 w-px bg-[#E8EAED]" />

            {/* 조회 기간 */}
            <div className="flex items-center gap-3">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[150px] border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
              <span className="text-[#5F6368]">~</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[150px] border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>

            {/* 검색 버튼 */}
            <Button className="bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium px-6 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98]">
              검색
            </Button>
          </div>
        </div>

        {/* 필터 팝업 */}
        <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
          <DialogContent className="max-w-2xl bg-white rounded-2xl p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4 border-b border-[#E8EAED]">
              <div className="flex items-center gap-4">
                <DialogTitle className="text-lg font-semibold text-[#202124]">검색 방식</DialogTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSavedFilters(!showSavedFilters)}
                  className="text-[#1A73E8] border-[#1A73E8] hover:bg-[#E8F0FE] rounded-lg"
                >
                  검색 기록 불러오기
                </Button>
              </div>
            </DialogHeader>

            {/* 저장된 필터 목록 */}
            {showSavedFilters && (
              <div className="px-6 py-4 bg-[#F8F9FA] border-b border-[#E8EAED]">
                <p className="text-sm text-[#5F6368] mb-3">저장된 검색 기록</p>
                <div className="flex flex-wrap gap-2">
                  {savedFilters.map(filter => (
                    <Button
                      key={filter.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadFilter(filter)}
                      className="rounded-lg border-[#DADCE0] text-[#202124] hover:bg-white hover:border-[#1A73E8]"
                    >
                      {filter.name}
                    </Button>
                  ))}
                  {savedFilters.length === 0 && (
                    <p className="text-sm text-[#9AA0A6]">저장된 기록이 없습니다.</p>
                  )}
                </div>
              </div>
            )}

            {/* 탭 헤더 */}
            <div className="flex border-b border-[#E8EAED]">
              {FILTER_TABS.map((tab) => {
                const isAccessible = canAccessTab(tab)
                const isActive = activeTab === tab
                return (
                  <button
                    key={tab}
                    onClick={() => {
                      if (isAccessible) {
                        setActiveTab(tab)
                        setSearchTerm('')
                        setCurrentPage(1)
                      }
                    }}
                    disabled={!isAccessible}
                    className={`flex-1 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'text-[#1A73E8] border-b-2 border-[#1A73E8]'
                        : isAccessible
                          ? 'text-[#5F6368] hover:text-[#202124] hover:bg-[#F8F9FA]'
                          : 'text-[#DADCE0] cursor-not-allowed'
                    }`}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>

            {/* 탭 컨텐츠 */}
            <div className="p-6">
              {/* 검색 입력 */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9AA0A6]" />
                <Input
                  type="text"
                  placeholder="검색어를 입력하세요 (2글자 이상)"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
                />
              </div>

              {/* 데이터 테이블 */}
              <div className="border border-[#E8EAED] rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F8F9FA] border-b border-[#E8EAED]">
                      <TableHead className="w-12 text-center">
                        <Checkbox
                          checked={isAllSelected()}
                          onCheckedChange={handleSelectAll}
                          className="border-[#DADCE0] data-[state=checked]:bg-[#1A73E8] data-[state=checked]:border-[#1A73E8]"
                        />
                      </TableHead>
                      <TableHead className="font-semibold text-[#202124]">
                        {activeTab === '계정&매체' ? '계정 ID' : activeTab === '캠페인' ? '캠페인' : '그룹'}
                      </TableHead>
                      <TableHead className="font-semibold text-[#202124]">
                        {activeTab === '계정&매체' ? '계정명' : activeTab === '캠페인' ? '계정 ID' : '캠페인'}
                      </TableHead>
                      {activeTab !== '그룹' && (
                        <TableHead className="font-semibold text-[#202124]">매체</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item, index) => {
                        const isSelected = getCurrentSelection().includes(item.id)
                        return (
                          <TableRow
                            key={item.id}
                            className={`cursor-pointer transition-colors hover:bg-[#F8F9FA] ${
                              index < paginatedData.length - 1 ? 'border-b border-[#E8EAED]' : ''
                            } ${isSelected ? 'bg-[#E8F0FE]' : ''}`}
                            onClick={() => handleItemToggle(item.id)}
                          >
                            <TableCell className="text-center">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleItemToggle(item.id)}
                                className="border-[#DADCE0] data-[state=checked]:bg-[#1A73E8] data-[state=checked]:border-[#1A73E8]"
                              />
                            </TableCell>
                            <TableCell className="font-medium text-[#202124]">{item.col1}</TableCell>
                            <TableCell className="text-[#5F6368]">{item.col2}</TableCell>
                            {activeTab !== '그룹' && (
                              <TableCell className="text-[#5F6368]">{item.col3}</TableCell>
                            )}
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={activeTab === '그룹' ? 3 : 4} className="text-center py-8 text-[#9AA0A6]">
                          {activeTab !== '계정&매체' && getCurrentSelection().length === 0
                            ? '이전 단계에서 항목을 선택해주세요.'
                            : searchTerm.length > 0 && searchTerm.length < 2
                              ? '검색어는 2글자 이상 입력해주세요.'
                              : '데이터가 없습니다.'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border-[#DADCE0] disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#5F6368]">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-lg border-[#DADCE0] disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* 선택 정보 및 버튼 */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E8EAED]">
                <span className="text-sm text-[#5F6368]">
                  {getCurrentSelection().length}개 선택됨
                </span>
                <div className="flex items-center gap-3">
                  {activeTab === '그룹' && tempGroups.length > 0 && (
                    <>
                      {showSaveDialog ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            placeholder="필터명 입력 (2글자 이상)"
                            value={saveFilterName}
                            onChange={(e) => setSaveFilterName(e.target.value)}
                            className="w-40 h-9 text-sm border-[#E8EAED] rounded-lg focus:border-[#1A73E8]"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveFilter}
                            disabled={saveFilterName.trim().length < 2}
                            className="rounded-lg border-[#1A73E8] text-[#1A73E8] hover:bg-[#E8F0FE] disabled:opacity-50"
                          >
                            저장
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowSaveDialog(false)
                              setSaveFilterName('')
                            }}
                            className="rounded-lg border-[#DADCE0] text-[#5F6368]"
                          >
                            취소
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSaveDialog(true)}
                          className="gap-2 rounded-lg border-[#DADCE0] text-[#5F6368] hover:border-[#1A73E8] hover:text-[#1A73E8]"
                        >
                          <Save className="h-4 w-4" />
                          검색기록 저장
                        </Button>
                      )}
                    </>
                  )}
                  <Button
                    onClick={handleApply}
                    disabled={!canApply()}
                    className="bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    적용
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 예산 확인 영역 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]">
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              onClick={() => setBudgetVisible(true)}
              className="border-[#DADCE0] text-[#1A73E8] rounded-xl hover:bg-[#F8F9FA] hover:border-[#1A73E8] transition-all duration-200"
            >
              예산 새로고침
            </Button>
            {budgetVisible && (
              <span className="text-sm text-[#5F6368]">
                현재 잔액 <span className="font-bold text-xl text-[#202124]">{budgetAmount.toLocaleString()}</span>원
              </span>
            )}
          </div>
        </div>

        {/* 기간별 합산 데이터 영역 */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8F9FA] border-b border-[#E8EAED]">
                <TableHead className="text-center font-semibold text-[#202124]">구분</TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">노출</TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">클릭</TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">CTR</TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">광고비</TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">CPC</TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">전환수</TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">CVR</TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">CPA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-b border-[#E8EAED] hover:bg-[#F8F9FA] transition-colors">
                <TableCell className="text-center font-medium text-[#202124]">최근 7일</TableCell>
                <TableCell className="text-right text-[#5F6368]">{summaryData.last7.impressions.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[#5F6368]">{summaryData.last7.clicks.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[#5F6368]">{calcCTR(summaryData.last7.impressions, summaryData.last7.clicks)}</TableCell>
                <TableCell className="text-right text-[#5F6368]">{summaryData.last7.cost.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[#5F6368]">{calcCPC(summaryData.last7.cost, summaryData.last7.clicks)}</TableCell>
                <TableCell className="text-right text-[#5F6368]">{summaryData.last7.conversions.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[#5F6368]">{calcCVR(summaryData.last7.conversions, summaryData.last7.clicks)}</TableCell>
                <TableCell className="text-right text-[#5F6368]">{calcCPA(summaryData.last7.cost, summaryData.last7.conversions)}</TableCell>
              </TableRow>
              <TableRow className="hover:bg-[#F8F9FA] transition-colors">
                <TableCell className="text-center font-medium text-[#202124]">전일</TableCell>
                <TableCell className="text-right text-[#5F6368]">{summaryData.yesterday.impressions.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[#5F6368]">{summaryData.yesterday.clicks.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[#5F6368]">{calcCTR(summaryData.yesterday.impressions, summaryData.yesterday.clicks)}</TableCell>
                <TableCell className="text-right text-[#5F6368]">{summaryData.yesterday.cost.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[#5F6368]">{calcCPC(summaryData.yesterday.cost, summaryData.yesterday.clicks)}</TableCell>
                <TableCell className="text-right text-[#5F6368]">{summaryData.yesterday.conversions.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[#5F6368]">{calcCVR(summaryData.yesterday.conversions, summaryData.yesterday.clicks)}</TableCell>
                <TableCell className="text-right text-[#5F6368]">{calcCPA(summaryData.yesterday.cost, summaryData.yesterday.conversions)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* 일자별 상세 데이터 영역 */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F8F9FA] border-b border-[#E8EAED]">
                <TableHead className="text-center font-semibold text-[#202124]">
                  <button onClick={() => handleSort('date')} className="inline-flex items-center gap-0.5 hover:text-[#1A73E8]">
                    일자 <SortIcon direction={getSortDirection('date')} />
                  </button>
                </TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">
                  <button onClick={() => handleSort('impressions')} className="inline-flex items-center gap-0.5 hover:text-[#1A73E8]">
                    노출 <SortIcon direction={getSortDirection('impressions')} />
                  </button>
                </TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">
                  <button onClick={() => handleSort('clicks')} className="inline-flex items-center gap-0.5 hover:text-[#1A73E8]">
                    클릭 <SortIcon direction={getSortDirection('clicks')} />
                  </button>
                </TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">
                  <button onClick={() => handleSort('ctr')} className="inline-flex items-center gap-0.5 hover:text-[#1A73E8]">
                    CTR <SortIcon direction={getSortDirection('ctr')} />
                  </button>
                </TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">
                  <button onClick={() => handleSort('cost')} className="inline-flex items-center gap-0.5 hover:text-[#1A73E8]">
                    광고비 <SortIcon direction={getSortDirection('cost')} />
                  </button>
                </TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">
                  <button onClick={() => handleSort('cpc')} className="inline-flex items-center gap-0.5 hover:text-[#1A73E8]">
                    CPC <SortIcon direction={getSortDirection('cpc')} />
                  </button>
                </TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">
                  <button onClick={() => handleSort('conversions')} className="inline-flex items-center gap-0.5 hover:text-[#1A73E8]">
                    전환수 <SortIcon direction={getSortDirection('conversions')} />
                  </button>
                </TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">
                  <button onClick={() => handleSort('cvr')} className="inline-flex items-center gap-0.5 hover:text-[#1A73E8]">
                    CVR <SortIcon direction={getSortDirection('cvr')} />
                  </button>
                </TableHead>
                <TableHead className="text-center font-semibold text-[#202124]">
                  <button onClick={() => handleSort('cpa')} className="inline-flex items-center gap-0.5 hover:text-[#1A73E8]">
                    CPA <SortIcon direction={getSortDirection('cpa')} />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* 합계 행 */}
              <TableRow className="bg-[#E8F0FE] border-b border-[#D2E3FC] font-semibold">
                <TableCell className="text-center text-[#1A73E8]">합계</TableCell>
                <TableCell className="text-right text-[#202124]">{totalsData.impressions.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[#202124]">{totalsData.clicks.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[#202124]">{calcCTR(totalsData.impressions, totalsData.clicks)}</TableCell>
                <TableCell className="text-right text-[#202124]">{totalsData.cost.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[#202124]">{calcCPC(totalsData.cost, totalsData.clicks)}</TableCell>
                <TableCell className="text-right text-[#202124]">{totalsData.conversions.toLocaleString()}</TableCell>
                <TableCell className="text-right text-[#202124]">{calcCVR(totalsData.conversions, totalsData.clicks)}</TableCell>
                <TableCell className="text-right text-[#202124]">{calcCPA(totalsData.cost, totalsData.conversions)}</TableCell>
              </TableRow>
              {sortedDailyData.map((row, index) => (
                <TableRow
                  key={row.date}
                  className={`hover:bg-[#F8F9FA] transition-colors ${index < sortedDailyData.length - 1 ? 'border-b border-[#E8EAED]' : ''}`}
                >
                  <TableCell className="text-center text-[#202124]">{row.date}</TableCell>
                  <TableCell className="text-right text-[#5F6368]">{row.impressions.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-[#5F6368]">{row.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-[#5F6368]">{calcCTR(row.impressions, row.clicks)}</TableCell>
                  <TableCell className="text-right text-[#5F6368]">{row.cost.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-[#5F6368]">{calcCPC(row.cost, row.clicks)}</TableCell>
                  <TableCell className="text-right text-[#5F6368]">{row.conversions.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-[#5F6368]">{calcCVR(row.conversions, row.clicks)}</TableCell>
                  <TableCell className="text-right text-[#5F6368]">{calcCPA(row.cost, row.conversions)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
