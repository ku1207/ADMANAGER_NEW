'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Button,
  Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Card, CardContent,
  RadioGroup, RadioGroupItem,
  Label,
} from '@/components/ui'
import { FileText, Plus, Download, Upload, ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabType = '검색광고 견적 AI' | '브랜드검색광고 견적 AI' | '소재 제작 AI' | '보고서 AI' | '메일 AI'
type QuoteStatus = '진행중' | '완료' | '오류'
type SortDir = 'asc' | 'desc'

interface QuoteItem {
  id: string
  no: number
  name: string
  quoteMethod: '일반' | 'AI'
  registeredAt: string
  worker: string
  status: QuoteStatus
  keyword: string
  media: string
  criteria: string
  pcBudget: number
  mobileBudget: number
  completedCount?: number
  errorReason?: string
}

interface BrandQuoteItem {
  id: string
  no: number
  name: string
  brandName: string
  device: 'PC' | 'Mobile'
  registeredAt: string
  worker: string
  status: QuoteStatus
  completedCount?: number
  errorReason?: string
}

interface KeywordData {
  id: string
  keyword: string
  pcMonthlySearch: number
  mobileMonthlySearch: number
  pcCtr: number
  mobileCtr: number
  competition: '높음' | '중간' | '낮음'
  pcAvgCpc: number
  mobileAvgCpc: number
}

// 검색광고 견적 더미 데이터
const INITIAL_QUOTE_DATA: QuoteItem[] = [
  {
    id: 'QT001',
    no: 1,
    name: '화장품 키워드',
    quoteMethod: '일반',
    registeredAt: '2026-02-05 14:30',
    worker: 'admin',
    status: '완료',
    keyword: '화장품',
    media: '네이버 검색광고',
    criteria: '클릭 최대화',
    pcBudget: 2000000,
    mobileBudget: 3000000,
    completedCount: 150,
  },
  {
    id: 'QT002',
    no: 2,
    name: '스포츠용품 키워드',
    quoteMethod: 'AI',
    registeredAt: '2026-02-05 16:00',
    worker: 'admin',
    status: '진행중',
    keyword: '스포츠용품',
    media: '구글 검색광고',
    criteria: '노출 최대화',
    pcBudget: 1500000,
    mobileBudget: 2500000,
  },
  {
    id: 'QT003',
    no: 3,
    name: '건강식품 키워드',
    quoteMethod: 'AI',
    registeredAt: '2026-02-06 09:00',
    worker: 'admin',
    status: '오류',
    keyword: '건강식품',
    media: '카카오 키워드',
    criteria: '클릭 최대화',
    pcBudget: 1000000,
    mobileBudget: 1500000,
    errorReason: '규격에 맞지 않는 템플릿',
  },
]

// 브랜드검색광고 견적 더미 데이터
const INITIAL_BRAND_QUOTE_DATA: BrandQuoteItem[] = [
  {
    id: 'BQ001',
    no: 1,
    name: '화장품 브랜드',
    brandName: '뷰티코리아',
    device: 'PC',
    registeredAt: '2026-02-05 15:00',
    worker: 'admin',
    status: '완료',
    completedCount: 80,
  },
  {
    id: 'BQ002',
    no: 2,
    name: '스포츠 브랜드',
    brandName: '스포츠월드',
    device: 'Mobile',
    registeredAt: '2026-02-06 10:00',
    worker: 'admin',
    status: '진행중',
  },
  {
    id: 'BQ003',
    no: 3,
    name: '식품 브랜드',
    brandName: '푸드랩',
    device: 'PC',
    registeredAt: '2026-02-06 11:30',
    worker: 'admin',
    status: '오류',
    errorReason: '규격에 맞지 않는 입력값',
  },
]

// 키워드 더미 데이터 생성 (브랜드명 기반, 결정적)
const KEYWORD_SUFFIXES = ['정품', '할인', '추천', '리뷰', '가격', '구매', '후기', '공식', '쇼핑', '이벤트']
const PC_SEARCHES   = [45200, 12300, 8700, 31000, 22500, 9800, 18400, 6200, 27300, 4100]
const MOB_SEARCHES  = [72400, 19800, 14200, 58600, 39100, 17300, 31200, 9400, 44700, 7600]
const PC_CTRS       = [3.2, 1.8, 2.5, 4.1, 2.9, 1.3, 3.7, 0.9, 2.2, 1.1]
const MOB_CTRS      = [5.6, 3.1, 4.2, 6.8, 4.9, 2.4, 5.3, 1.7, 3.8, 1.9]
const COMPETITIONS  = ['높음', '중간', '낮음', '높음', '중간', '중간', '낮음', '낮음', '높음', '중간'] as const
const PC_CPCS       = [1850, 720, 950, 2100, 1340, 480, 1620, 290, 1150, 380]
const MOB_CPCS      = [1420, 560, 730, 1680, 1050, 370, 1240, 220, 890, 290]

function generateKeywordData(brandName: string): KeywordData[] {
  return KEYWORD_SUFFIXES.map((suffix, i) => ({
    id: `KW${i + 1}`,
    keyword: `${brandName} ${suffix}`,
    pcMonthlySearch: PC_SEARCHES[i],
    mobileMonthlySearch: MOB_SEARCHES[i],
    pcCtr: PC_CTRS[i],
    mobileCtr: MOB_CTRS[i],
    competition: COMPETITIONS[i],
    pcAvgCpc: PC_CPCS[i],
    mobileAvgCpc: MOB_CPCS[i],
  }))
}

// 그리디 배낭 알고리즘 (ILP 근사) - 예산 내 최대 노출량 선택
function autoSelectByBudget(keywords: KeywordData[], budgetWon: number, device: 'PC' | 'Mobile'): Set<string> {
  const cpcField: keyof KeywordData  = device === 'PC' ? 'pcAvgCpc' : 'mobileAvgCpc'
  const searchField: keyof KeywordData = device === 'PC' ? 'pcMonthlySearch' : 'mobileMonthlySearch'
  const sorted = [...keywords].sort((a, b) => {
    const ratioA = (a[searchField] as number) / (a[cpcField] as number)
    const ratioB = (b[searchField] as number) / (b[cpcField] as number)
    return ratioB - ratioA
  })
  const selected = new Set<string>()
  let remaining = budgetWon
  for (const kw of sorted) {
    const cost = kw[cpcField] as number
    if (remaining >= cost) {
      selected.add(kw.id)
      remaining -= cost
    }
  }
  return selected
}

// 엑셀(CSV) 다운로드 헬퍼
function downloadAsXlsx(rows: string[][], filename: string) {
  const tsv = rows.map(r => r.join('\t')).join('\n')
  const blob = new Blob(['\uFEFF' + tsv], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function getCurrentDateTime(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

function handleTemplateDownload() {
  const content = '\uFEFF키워드'
  const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'quote_template.xls'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function FileUploadArea({ file, onFileChange }: { file: File | null; onFileChange: (f: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const dropped = e.dataTransfer.files[0]
        if (dropped) onFileChange(dropped)
      }}
      className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#DADCE0] rounded-xl p-6 cursor-pointer hover:border-[#1A73E8] hover:bg-[#F8F9FA] transition-all duration-200"
    >
      <Upload className="h-6 w-6 text-[#80868B]" />
      {file ? (
        <p className="text-sm font-medium text-[#202124]">{file.name}</p>
      ) : (
        <>
          <p className="text-sm text-[#5F6368]">파일을 드래그하거나 클릭하여 업로드</p>
          <p className="text-xs text-[#80868B]">.xls, .xlsx 파일 지원</p>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".xls,.xlsx"
        className="hidden"
        onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}

// 상태 배지 + 상세값 셀 (좌우 분할)
function StatusCell({ status, completedCount, errorReason }: { status: QuoteStatus; completedCount?: number; errorReason?: string }) {
  return (
    <TableCell className="p-0">
      <div className="flex min-h-[52px]">
        <div className="flex-1 flex items-center justify-center border-r border-[#E8EAED] px-2">
          <span className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
            status === '완료' && "bg-[#E6F4EA] text-[#137333]",
            status === '진행중' && "bg-[#E8F0FE] text-[#1A73E8]",
            status === '오류' && "bg-[#FCE8E6] text-[#C5221F]"
          )}>
            {status}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center px-2">
          <span className="text-xs text-[#5F6368] text-center leading-relaxed">
            {status === '완료' && `${completedCount ?? 0}건 완료`}
            {status === '진행중' && '-'}
            {status === '오류' && (errorReason ?? '오류 발생')}
          </span>
        </div>
      </div>
    </TableCell>
  )
}

// 정렬 가능한 헤더 셀
function SortableHead({
  label, field, sortField, sortDir, onSort
}: {
  label: string
  field: keyof KeywordData
  sortField: keyof KeywordData | null
  sortDir: SortDir
  onSort: (f: keyof KeywordData) => void
}) {
  const active = sortField === field
  return (
    <TableHead
      className="text-center font-semibold text-[#202124] cursor-pointer select-none hover:bg-[#F1F3F4] transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center justify-center gap-1">
        {label}
        {active
          ? sortDir === 'asc'
            ? <ArrowUp className="h-3 w-3 text-[#1A73E8]" />
            : <ArrowDown className="h-3 w-3 text-[#1A73E8]" />
          : <ArrowUpDown className="h-3 w-3 text-[#DADCE0]" />
        }
      </div>
    </TableHead>
  )
}

export default function Page4() {
  const [activeTab, setActiveTab] = useState<TabType>('검색광고 견적 AI')

  // 검색광고 견적 AI
  const [quoteData, setQuoteData] = useState<QuoteItem[]>(INITIAL_QUOTE_DATA)
  const [quoteDetailOpen, setQuoteDetailOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<QuoteItem | null>(null)
  const [registrationFiles, setRegistrationFiles] = useState<Record<string, File>>({})

  // 일반 견적 등록
  const [normalRegisterOpen, setNormalRegisterOpen] = useState(false)
  const [normalQuote, setNormalQuote] = useState({
    name: '',
    pcRank: '',
    mobileRank: '',
    file: null as File | null,
  })

  // AI 견적 등록
  const [aiRegisterOpen, setAiRegisterOpen] = useState(false)
  const [aiQuote, setAiQuote] = useState({
    name: '',
    pcBudget: '',
    mobileBudget: '',
    criteria: '클릭 최대화',
    file: null as File | null,
  })

  // 브랜드검색광고 견적 AI
  const [brandQuoteData, setBrandQuoteData] = useState<BrandQuoteItem[]>(INITIAL_BRAND_QUOTE_DATA)
  const [brandRegisterOpen, setBrandRegisterOpen] = useState(false)
  const [brandQuote, setBrandQuote] = useState({
    name: '',
    brandName: '',
    device: 'PC' as 'PC' | 'Mobile',
  })
  const [brandDetailItem, setBrandDetailItem] = useState<BrandQuoteItem | null>(null)

  // 브랜드 상세 - 키워드 테이블
  const [keywordData, setKeywordData] = useState<KeywordData[]>([])
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<keyof KeywordData | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  // 자동 선택 다이얼로그
  const [autoSelectOpen, setAutoSelectOpen] = useState(false)
  const [autoSelectBudget, setAutoSelectBudget] = useState('')
  const [autoSelectDevice, setAutoSelectDevice] = useState<'PC' | 'Mobile'>('PC')

  // brandDetailItem 변경 시 키워드 데이터 초기화
  useEffect(() => {
    if (brandDetailItem) {
      setKeywordData(generateKeywordData(brandDetailItem.brandName))
      setCheckedIds(new Set())
      setSortField(null)
      setSortDir('desc')
      setAutoSelectBudget('')
      setAutoSelectDevice(brandDetailItem.device)
    }
  }, [brandDetailItem])

  // 정렬된 키워드 목록
  const sortedKeywords = useMemo(() => {
    if (!sortField) return keywordData
    return [...keywordData].sort((a, b) => {
      const av = a[sortField]
      const bv = b[sortField]
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av
      }
      return 0
    })
  }, [keywordData, sortField, sortDir])

  // 정렬 토글 핸들러
  const handleSort = (field: keyof KeywordData) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  // 전체 체크박스
  const allChecked = keywordData.length > 0 && checkedIds.size === keywordData.length
  const someChecked = checkedIds.size > 0 && !allChecked

  const toggleAll = () => {
    if (allChecked) {
      setCheckedIds(new Set())
    } else {
      setCheckedIds(new Set(keywordData.map(k => k.id)))
    }
  }

  const toggleOne = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // 선택된 키워드의 합계 계산
  const checkedKeywords = keywordData.filter(k => checkedIds.has(k.id))
  const totalPcBudget = checkedKeywords.reduce((s, k) => s + k.pcAvgCpc, 0)
  const totalMobBudget = checkedKeywords.reduce((s, k) => s + k.mobileAvgCpc, 0)
  const totalPcSearch = checkedKeywords.reduce((s, k) => s + k.pcMonthlySearch, 0)
  const totalMobSearch = checkedKeywords.reduce((s, k) => s + k.mobileMonthlySearch, 0)

  // 자동 선택 핸들러
  const handleAutoSelect = () => {
    const budget = parseInt(autoSelectBudget.replace(/,/g, ''))
    if (!budget || budget <= 0) return
    const selected = autoSelectByBudget(keywordData, budget, autoSelectDevice)
    setCheckedIds(selected)
    setAutoSelectOpen(false)
    setAutoSelectBudget('')
  }

  // 견적 다운로드 (선택된 키워드를 엑셀로)
  const handleQuoteDownload = () => {
    if (!brandDetailItem) return
    const device = brandDetailItem.device
    const rows: string[][] = [
      ['키워드', 'PC 월간검색수', '모바일 월간검색수', 'PC CTR(%)', '모바일 CTR(%)', '경쟁도', 'PC 평균CPC(원)', '모바일 평균CPC(원)'],
      ...checkedKeywords.map(k => [
        k.keyword,
        String(k.pcMonthlySearch),
        String(k.mobileMonthlySearch),
        String(k.pcCtr),
        String(k.mobileCtr),
        k.competition,
        String(k.pcAvgCpc),
        String(k.mobileAvgCpc),
      ]),
    ]
    const filename = `${brandDetailItem.brandName}_${device}_견적서_${getCurrentDateTime().replace(' ', '_').replace(/:/g, '')}.xlsx`
    downloadAsXlsx(rows, filename)
  }

  // 일반 견적 등록 핸들러
  const handleNormalQuoteSubmit = () => {
    if (!normalQuote.name || !normalQuote.pcRank || !normalQuote.mobileRank) return
    const id = `QT${Date.now()}`
    const newItem: QuoteItem = {
      id,
      no: quoteData.length + 1,
      name: normalQuote.name,
      quoteMethod: '일반',
      registeredAt: getCurrentDateTime(),
      worker: 'admin',
      status: '진행중',
      keyword: '',
      media: '',
      criteria: '',
      pcBudget: 0,
      mobileBudget: 0,
    }
    if (normalQuote.file) setRegistrationFiles(prev => ({ ...prev, [id]: normalQuote.file! }))
    setQuoteData([...quoteData, newItem])
    setNormalQuote({ name: '', pcRank: '', mobileRank: '', file: null })
    setNormalRegisterOpen(false)
  }

  // AI 견적 등록 핸들러
  const handleAiQuoteSubmit = () => {
    if (!aiQuote.name) return
    const id = `QT${Date.now()}`
    const newItem: QuoteItem = {
      id,
      no: quoteData.length + 1,
      name: aiQuote.name,
      quoteMethod: 'AI',
      registeredAt: getCurrentDateTime(),
      worker: 'admin',
      status: '진행중',
      keyword: '',
      media: '',
      criteria: aiQuote.criteria,
      pcBudget: parseInt(aiQuote.pcBudget) || 0,
      mobileBudget: parseInt(aiQuote.mobileBudget) || 0,
    }
    if (aiQuote.file) setRegistrationFiles(prev => ({ ...prev, [id]: aiQuote.file! }))
    setQuoteData([...quoteData, newItem])
    setAiQuote({ name: '', pcBudget: '', mobileBudget: '', criteria: '클릭 최대화', file: null })
    setAiRegisterOpen(false)
  }

  // 브랜드검색광고 견적 등록 핸들러
  const handleBrandQuoteSubmit = () => {
    if (!brandQuote.name || !brandQuote.brandName) return
    const newItem: BrandQuoteItem = {
      id: `BQ${Date.now()}`,
      no: brandQuoteData.length + 1,
      name: brandQuote.name,
      brandName: brandQuote.brandName,
      device: brandQuote.device,
      registeredAt: getCurrentDateTime(),
      worker: 'admin',
      status: '진행중',
    }
    setBrandQuoteData([...brandQuoteData, newItem])
    setBrandQuote({ name: '', brandName: '', device: 'PC' })
    setBrandRegisterOpen(false)
  }

  // 등록 파일 다운로드
  const handleRegistrationDownload = (quoteId: string) => {
    const file = registrationFiles[quoteId]
    if (!file) {
      alert('업로드된 파일이 없습니다.')
      return
    }
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 결과 다운로드
  const handleResultDownload = (quote: QuoteItem) => {
    alert(`${quote.name} 견적서를 다운로드합니다.`)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="p-8 space-y-6 w-[90%] mx-auto">
        <h1 className="text-2xl font-bold text-[#202124] tracking-tight">AI 자동화 센터</h1>

        <div className="bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]">
          {/* 탭 네비게이션 */}
          <nav className="flex border-b border-[#E8EAED]">
            {(['검색광고 견적 AI', '브랜드검색광고 견적 AI', '소재 제작 AI', '보고서 AI', '메일 AI'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  if (tab !== '브랜드검색광고 견적 AI') setBrandDetailItem(null)
                }}
                className={cn(
                  "relative px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap",
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

          {/* ── 검색광고 견적 AI 탭 ── */}
          {activeTab === '검색광고 견적 AI' && (
            <div className="p-6">
              <div className="flex justify-end gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={handleTemplateDownload}
                  className="gap-2 border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] hover:border-[#1A73E8] hover:text-[#1A73E8] transition-all duration-200"
                >
                  <Download className="h-4 w-4" />
                  템플릿 다운로드
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setNormalRegisterOpen(true)}
                  className="gap-2 border-[#1A73E8] text-[#1A73E8] rounded-xl hover:bg-[#E8F0FE] transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  일반 견적 등록
                </Button>
                <Button
                  onClick={() => setAiRegisterOpen(true)}
                  className="gap-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium px-6 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  AI 견적 등록
                </Button>
              </div>

              <Card className="rounded-2xl border-[#E8EAED] overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F8F9FA] border-b border-[#E8EAED]">
                      <TableHead className="text-center font-semibold text-[#202124]">No</TableHead>
                      <TableHead className="text-center font-semibold text-[#202124]">작업이름</TableHead>
                      <TableHead className="text-center font-semibold text-[#202124]">견적 방식</TableHead>
                      <TableHead className="text-center font-semibold text-[#202124]">등록시간</TableHead>
                      <TableHead className="text-center font-semibold text-[#202124]">작업자</TableHead>
                      <TableHead className="text-center font-semibold text-[#202124]">상태</TableHead>
                      <TableHead className="text-center font-semibold text-[#202124]">등록</TableHead>
                      <TableHead className="text-center font-semibold text-[#202124]">결과</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quoteData.map((row, index) => (
                      <TableRow
                        key={row.id}
                        className={`hover:bg-[#F8F9FA] transition-colors ${index < quoteData.length - 1 ? 'border-b border-[#E8EAED]' : ''}`}
                      >
                        <TableCell className="text-center text-[#5F6368]">{row.no}</TableCell>
                        <TableCell className="text-center font-medium text-[#202124]">{row.name}</TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                            row.quoteMethod === '일반' ? "bg-[#F1F3F4] text-[#5F6368]" : "bg-[#E8F0FE] text-[#1A73E8]"
                          )}>
                            {row.quoteMethod === '일반' ? '일반 견적' : 'AI 견적'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-[#5F6368]">{row.registeredAt}</TableCell>
                        <TableCell className="text-center text-[#5F6368]">{row.worker}</TableCell>

                        <StatusCell
                          status={row.status}
                          completedCount={row.completedCount}
                          errorReason={row.errorReason}
                        />

                        <TableCell className="text-center">
                          <button
                            onClick={() => handleRegistrationDownload(row.id)}
                            className="inline-flex items-center justify-center p-2 rounded-xl hover:bg-[#F8F9FA] transition-colors"
                            title="등록 파일 다운로드"
                          >
                            <Download className="h-4 w-4 text-[#5F6368]" />
                          </button>
                        </TableCell>

                        <TableCell className="text-center">
                          {row.status === '완료' && (
                            <button
                              onClick={() => handleResultDownload(row)}
                              className="inline-flex items-center justify-center p-2 rounded-xl hover:bg-[#F8F9FA] transition-colors"
                              title="결과 다운로드"
                            >
                              <Download className="h-4 w-4 text-[#1A73E8]" />
                            </button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {quoteData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-[#5F6368]">
                          등록된 견적이 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* ── 브랜드검색광고 견적 AI 탭 ── */}
          {activeTab === '브랜드검색광고 견적 AI' && (
            <div className="p-6">
              {brandDetailItem ? (
                /* ── 상세 페이지 뷰 ── */
                <div>
                  {/* 상단 헤더 */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setBrandDetailItem(null)}
                        className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-[#F1F3F4] transition-colors text-[#5F6368]"
                        title="목록으로 돌아가기"
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </button>
                      <div>
                        <h2 className="text-xl font-bold text-[#202124]">{brandDetailItem.brandName}</h2>
                        <p className="text-sm text-[#5F6368] mt-0.5">{brandDetailItem.name} · {brandDetailItem.device}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setAutoSelectOpen(true)}
                        className="gap-2 border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] hover:border-[#1A73E8] hover:text-[#1A73E8] transition-all duration-200"
                      >
                        <CheckSquare className="h-4 w-4" />
                        자동 선택
                      </Button>
                      <Button
                        onClick={handleQuoteDownload}
                        disabled={checkedIds.size === 0}
                        className="gap-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium px-6 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="h-4 w-4" />
                        견적 다운로드 {checkedIds.size > 0 && `(${checkedIds.size})`}
                      </Button>
                    </div>
                  </div>

                  {/* 선택 요약 바 */}
                  {checkedIds.size > 0 && (
                    <div className="mb-4 px-4 py-3 bg-[#E8F0FE] border border-[#C5D8FC] rounded-xl flex items-center gap-6 text-sm">
                      <span className="font-semibold text-[#1A73E8]">{checkedIds.size}개 선택됨</span>
                      <span className="text-[#5F6368]">PC 월간검색: <strong className="text-[#202124]">{totalPcSearch.toLocaleString()}</strong></span>
                      <span className="text-[#5F6368]">모바일 월간검색: <strong className="text-[#202124]">{totalMobSearch.toLocaleString()}</strong></span>
                      <span className="text-[#5F6368]">PC 예상비용: <strong className="text-[#202124]">{totalPcBudget.toLocaleString()}원</strong></span>
                      <span className="text-[#5F6368]">모바일 예상비용: <strong className="text-[#202124]">{totalMobBudget.toLocaleString()}원</strong></span>
                    </div>
                  )}

                  {/* 키워드 테이블 */}
                  <Card className="rounded-2xl border-[#E8EAED] overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#F8F9FA] border-b border-[#E8EAED]">
                          {/* 전체 선택 체크박스 */}
                          <TableHead className="w-12 text-center">
                            <button
                              onClick={toggleAll}
                              className={cn(
                                "w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-colors",
                                allChecked
                                  ? "bg-[#1A73E8] border-[#1A73E8]"
                                  : someChecked
                                  ? "bg-[#E8F0FE] border-[#1A73E8]"
                                  : "border-[#DADCE0] hover:border-[#1A73E8]"
                              )}
                            >
                              {(allChecked || someChecked) && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                                  <path
                                    d={someChecked && !allChecked ? "M2 6h8" : "M2 6l3 3 5-5"}
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </button>
                          </TableHead>
                          <TableHead className="text-center font-semibold text-[#202124]">키워드</TableHead>
                          <SortableHead label="PC 월간검색" field="pcMonthlySearch" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                          <SortableHead label="모바일 월간검색" field="mobileMonthlySearch" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                          <SortableHead label="PC CTR(%)" field="pcCtr" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                          <SortableHead label="모바일 CTR(%)" field="mobileCtr" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                          <TableHead className="text-center font-semibold text-[#202124]">경쟁도</TableHead>
                          <SortableHead label="PC 평균CPC" field="pcAvgCpc" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                          <SortableHead label="모바일 평균CPC" field="mobileAvgCpc" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedKeywords.map((kw, index) => {
                          const checked = checkedIds.has(kw.id)
                          return (
                            <TableRow
                              key={kw.id}
                              onClick={() => toggleOne(kw.id)}
                              className={cn(
                                "cursor-pointer transition-colors",
                                checked ? "bg-[#F0F4FF]" : "hover:bg-[#F8F9FA]",
                                index < sortedKeywords.length - 1 && "border-b border-[#E8EAED]"
                              )}
                            >
                              <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => toggleOne(kw.id)}
                                  className={cn(
                                    "w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-colors",
                                    checked ? "bg-[#1A73E8] border-[#1A73E8]" : "border-[#DADCE0] hover:border-[#1A73E8]"
                                  )}
                                >
                                  {checked && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </button>
                              </TableCell>
                              <TableCell className="text-center font-medium text-[#202124]">{kw.keyword}</TableCell>
                              <TableCell className="text-center text-[#5F6368]">{kw.pcMonthlySearch.toLocaleString()}</TableCell>
                              <TableCell className="text-center text-[#5F6368]">{kw.mobileMonthlySearch.toLocaleString()}</TableCell>
                              <TableCell className="text-center text-[#5F6368]">{kw.pcCtr}%</TableCell>
                              <TableCell className="text-center text-[#5F6368]">{kw.mobileCtr}%</TableCell>
                              <TableCell className="text-center">
                                <span className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                  kw.competition === '높음' && "bg-[#FCE8E6] text-[#C5221F]",
                                  kw.competition === '중간' && "bg-[#FEF3E2] text-[#E37400]",
                                  kw.competition === '낮음' && "bg-[#E6F4EA] text-[#137333]",
                                )}>
                                  {kw.competition}
                                </span>
                              </TableCell>
                              <TableCell className="text-center text-[#5F6368]">{kw.pcAvgCpc.toLocaleString()}원</TableCell>
                              <TableCell className="text-center text-[#5F6368]">{kw.mobileAvgCpc.toLocaleString()}원</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </Card>
                </div>
              ) : (
                /* ── 목록 뷰 ── */
                <div>
                  <div className="flex justify-end gap-2 mb-4">
                    <Button
                      onClick={() => setBrandRegisterOpen(true)}
                      className="gap-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium px-6 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                    >
                      <Plus className="h-4 w-4" />
                      견적 등록
                    </Button>
                  </div>

                  <Card className="rounded-2xl border-[#E8EAED] overflow-hidden shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#F8F9FA] border-b border-[#E8EAED]">
                          <TableHead className="text-center font-semibold text-[#202124]">No</TableHead>
                          <TableHead className="text-center font-semibold text-[#202124]">작업이름</TableHead>
                          <TableHead className="text-center font-semibold text-[#202124]">디바이스</TableHead>
                          <TableHead className="text-center font-semibold text-[#202124]">등록시간</TableHead>
                          <TableHead className="text-center font-semibold text-[#202124]">작업자</TableHead>
                          <TableHead className="text-center font-semibold text-[#202124]">상태</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {brandQuoteData.map((row, index) => (
                          <TableRow
                            key={row.id}
                            className={`hover:bg-[#F8F9FA] transition-colors ${index < brandQuoteData.length - 1 ? 'border-b border-[#E8EAED]' : ''}`}
                          >
                            <TableCell className="text-center text-[#5F6368]">{row.no}</TableCell>
                            <TableCell className="text-center">
                              {row.status === '완료' ? (
                                <button
                                  onClick={() => setBrandDetailItem(row)}
                                  className="font-medium text-[#1A73E8] underline underline-offset-2 hover:text-[#1557B0] transition-colors text-sm"
                                >
                                  {row.name}
                                </button>
                              ) : (
                                <span className="font-medium text-[#202124]">{row.name}</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                row.device === 'PC' ? "bg-[#E8F0FE] text-[#1A73E8]" : "bg-[#FEF3E2] text-[#E37400]"
                              )}>
                                {row.device}
                              </span>
                            </TableCell>
                            <TableCell className="text-center text-[#5F6368]">{row.registeredAt}</TableCell>
                            <TableCell className="text-center text-[#5F6368]">{row.worker}</TableCell>

                            <StatusCell
                              status={row.status}
                              completedCount={row.completedCount}
                              errorReason={row.errorReason}
                            />
                          </TableRow>
                        ))}
                        {brandQuoteData.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-12 text-[#5F6368]">
                              등록된 견적이 없습니다.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* ── 소재 제작 AI 탭 ── */}
          {activeTab === '소재 제작 AI' && (
            <div className="p-12 flex items-center justify-center min-h-[500px]">
              <Card className="rounded-2xl border-[#E8EAED] shadow-sm">
                <CardContent className="py-16 px-24 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#F8F9FA] flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-10 w-10 text-[#DADCE0]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#202124] mb-2">소재 제작 AI</h3>
                  <p className="text-[#5F6368]">준비 중인 기능입니다.</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── 보고서 AI 탭 ── */}
          {activeTab === '보고서 AI' && (
            <div className="p-12 flex items-center justify-center min-h-[500px]">
              <Card className="rounded-2xl border-[#E8EAED] shadow-sm">
                <CardContent className="py-16 px-24 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#F8F9FA] flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-10 w-10 text-[#DADCE0]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#202124] mb-2">보고서 AI</h3>
                  <p className="text-[#5F6368]">준비 중인 기능입니다.</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── 메일 AI 탭 ── */}
          {activeTab === '메일 AI' && (
            <div className="p-12 flex items-center justify-center min-h-[500px]">
              <Card className="rounded-2xl border-[#E8EAED] shadow-sm">
                <CardContent className="py-16 px-24 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#F8F9FA] flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-10 w-10 text-[#DADCE0]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#202124] mb-2">메일 AI</h3>
                  <p className="text-[#5F6368]">준비 중인 기능입니다.</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* ── 일반 견적 등록 다이얼로그 ── */}
      <Dialog open={normalRegisterOpen} onOpenChange={setNormalRegisterOpen}>
        <DialogContent className="bg-white rounded-2xl border-[#E8EAED] shadow-[0_2px_6px_2px_rgba(60,64,67,0.15),0_8px_16px_4px_rgba(60,64,67,0.15)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#202124] text-lg font-semibold">일반 견적 등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">작업 이름</label>
              <Input
                placeholder="작업 이름을 입력해주세요."
                value={normalQuote.name}
                onChange={(e) => setNormalQuote({ ...normalQuote, name: e.target.value })}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">파일 업로드</label>
              <FileUploadArea
                file={normalQuote.file}
                onFileChange={(f) => setNormalQuote({ ...normalQuote, file: f })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">PC 목표 순위</label>
              <Select value={normalQuote.pcRank} onValueChange={(v) => setNormalQuote({ ...normalQuote, pcRank: v })}>
                <SelectTrigger className="w-full border-[#E8EAED] rounded-xl">
                  <SelectValue placeholder="PC 순위 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border-[#E8EAED] shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(rank => (
                    <SelectItem key={rank} value={String(rank)} className="rounded-lg hover:bg-[#F8F9FA]">{rank}위</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">Mobile 목표 순위</label>
              <Select value={normalQuote.mobileRank} onValueChange={(v) => setNormalQuote({ ...normalQuote, mobileRank: v })}>
                <SelectTrigger className="w-full border-[#E8EAED] rounded-xl">
                  <SelectValue placeholder="Mobile 순위 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border-[#E8EAED] shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]">
                  {Array.from({ length: 5 }, (_, i) => i + 1).map(rank => (
                    <SelectItem key={rank} value={String(rank)} className="rounded-lg hover:bg-[#F8F9FA]">{rank}위</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => { setNormalRegisterOpen(false); setNormalQuote({ name: '', pcRank: '', mobileRank: '', file: null }) }}
              className="border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] transition-all duration-200"
            >취소</Button>
            <Button
              onClick={handleNormalQuoteSubmit}
              disabled={!normalQuote.name || !normalQuote.pcRank || !normalQuote.mobileRank}
              className="bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >등록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── AI 견적 등록 다이얼로그 ── */}
      <Dialog open={aiRegisterOpen} onOpenChange={setAiRegisterOpen}>
        <DialogContent className="bg-white rounded-2xl border-[#E8EAED] shadow-[0_2px_6px_2px_rgba(60,64,67,0.15),0_8px_16px_4px_rgba(60,64,67,0.15)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#202124] text-lg font-semibold">AI 견적 등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">작업 이름</label>
              <Input
                placeholder="작업 이름을 입력해주세요."
                value={aiQuote.name}
                onChange={(e) => setAiQuote({ ...aiQuote, name: e.target.value })}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">파일 업로드</label>
              <FileUploadArea
                file={aiQuote.file}
                onFileChange={(f) => setAiQuote({ ...aiQuote, file: f })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">PC 예산(원)</label>
              <Input
                type="number"
                placeholder="PC 예산을 입력해주세요."
                value={aiQuote.pcBudget}
                onChange={(e) => setAiQuote({ ...aiQuote, pcBudget: e.target.value.replace(/[^0-9]/g, '') })}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">Mobile 예산(원)</label>
              <Input
                type="number"
                placeholder="Mobile 예산을 입력해주세요."
                value={aiQuote.mobileBudget}
                onChange={(e) => setAiQuote({ ...aiQuote, mobileBudget: e.target.value.replace(/[^0-9]/g, '') })}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">최적화 기준</label>
              <RadioGroup
                value={aiQuote.criteria}
                onValueChange={(v) => setAiQuote({ ...aiQuote, criteria: v })}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="클릭 최대화" id="criteria-click" />
                  <Label htmlFor="criteria-click" className="text-sm text-[#202124] cursor-pointer">클릭 최대화</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="노출 최대화" id="criteria-exposure" />
                  <Label htmlFor="criteria-exposure" className="text-sm text-[#202124] cursor-pointer">노출 최대화</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => { setAiRegisterOpen(false); setAiQuote({ name: '', pcBudget: '', mobileBudget: '', criteria: '클릭 최대화', file: null }) }}
              className="border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] transition-all duration-200"
            >취소</Button>
            <Button
              onClick={handleAiQuoteSubmit}
              disabled={!aiQuote.name}
              className="bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >등록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 브랜드검색광고 견적 등록 다이얼로그 ── */}
      <Dialog open={brandRegisterOpen} onOpenChange={setBrandRegisterOpen}>
        <DialogContent className="bg-white rounded-2xl border-[#E8EAED] shadow-[0_2px_6px_2px_rgba(60,64,67,0.15),0_8px_16px_4px_rgba(60,64,67,0.15)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#202124] text-lg font-semibold">견적 등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">작업 이름</label>
              <Input
                placeholder="작업 이름을 입력해주세요."
                value={brandQuote.name}
                onChange={(e) => setBrandQuote({ ...brandQuote, name: e.target.value })}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">브랜드명</label>
              <Input
                placeholder="브랜드명 혹은 서비스명을 입력해주세요."
                value={brandQuote.brandName}
                onChange={(e) => setBrandQuote({ ...brandQuote, brandName: e.target.value })}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">디바이스</label>
              <RadioGroup
                value={brandQuote.device}
                onValueChange={(v) => setBrandQuote({ ...brandQuote, device: v as 'PC' | 'Mobile' })}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="PC" id="device-pc" />
                  <Label htmlFor="device-pc" className="text-sm text-[#202124] cursor-pointer">PC</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Mobile" id="device-mobile" />
                  <Label htmlFor="device-mobile" className="text-sm text-[#202124] cursor-pointer">Mobile</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => { setBrandRegisterOpen(false); setBrandQuote({ name: '', brandName: '', device: 'PC' }) }}
              className="border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] transition-all duration-200"
            >취소</Button>
            <Button
              onClick={handleBrandQuoteSubmit}
              disabled={!brandQuote.name || !brandQuote.brandName}
              className="bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >등록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 등록 상세 다이얼로그 (검색광고 견적) ── */}
      <Dialog open={quoteDetailOpen} onOpenChange={setQuoteDetailOpen}>
        <DialogContent className="bg-white rounded-2xl border-[#E8EAED] shadow-[0_2px_6px_2px_rgba(60,64,67,0.15),0_8px_16px_4px_rgba(60,64,67,0.15)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#202124] text-lg font-semibold">등록 정보</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[#5F6368] mb-1">키워드</p>
                  <p className="text-sm font-medium text-[#202124]">{selectedQuote.keyword || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5F6368] mb-1">매체</p>
                  <p className="text-sm font-medium text-[#202124]">{selectedQuote.media || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5F6368] mb-1">기준</p>
                  <p className="text-sm font-medium text-[#202124]">{selectedQuote.criteria || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5F6368] mb-1">상태</p>
                  <p className="text-sm font-medium text-[#202124]">{selectedQuote.status}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5F6368] mb-1">PC 예산</p>
                  <p className="text-sm font-medium text-[#202124]">{selectedQuote.pcBudget ? `${selectedQuote.pcBudget.toLocaleString()}원` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5F6368] mb-1">Mobile 예산</p>
                  <p className="text-sm font-medium text-[#202124]">{selectedQuote.mobileBudget ? `${selectedQuote.mobileBudget.toLocaleString()}원` : '-'}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setQuoteDetailOpen(false)}
              className="bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-xl transition-all duration-200"
            >확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 자동 선택 다이얼로그 (ILP 배낭 알고리즘) ── */}
      <Dialog open={autoSelectOpen} onOpenChange={setAutoSelectOpen}>
        <DialogContent className="bg-white rounded-2xl border-[#E8EAED] shadow-[0_2px_6px_2px_rgba(60,64,67,0.15),0_8px_16px_4px_rgba(60,64,67,0.15)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#202124] text-lg font-semibold">자동 선택</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-[#5F6368]">
              예산 내에서 월간 검색량 대비 CPC 효율이 높은 키워드를 자동으로 선택합니다.
            </p>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">총 예산 (원)</label>
              <Input
                type="number"
                placeholder="예: 5000000"
                value={autoSelectBudget}
                onChange={(e) => setAutoSelectBudget(e.target.value.replace(/[^0-9]/g, ''))}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">기준 디바이스</label>
              <RadioGroup
                value={autoSelectDevice}
                onValueChange={(v) => setAutoSelectDevice(v as 'PC' | 'Mobile')}
                className="flex gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="PC" id="auto-device-pc" />
                  <Label htmlFor="auto-device-pc" className="text-sm text-[#202124] cursor-pointer">PC</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="Mobile" id="auto-device-mobile" />
                  <Label htmlFor="auto-device-mobile" className="text-sm text-[#202124] cursor-pointer">Mobile</Label>
                </div>
              </RadioGroup>
            </div>
            {autoSelectBudget && (
              <div className="px-3 py-2 bg-[#F8F9FA] rounded-xl text-xs text-[#5F6368]">
                예산 <strong className="text-[#202124]">{parseInt(autoSelectBudget).toLocaleString()}원</strong> 내에서 검색량/CPC 효율 순으로 키워드를 선택합니다.
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => { setAutoSelectOpen(false); setAutoSelectBudget('') }}
              className="border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] transition-all duration-200"
            >취소</Button>
            <Button
              onClick={handleAutoSelect}
              disabled={!autoSelectBudget || parseInt(autoSelectBudget) <= 0}
              className="bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >자동 선택</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
