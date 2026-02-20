'use client'

import { useState, useRef } from 'react'
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
import { FileText, Plus, Download, Upload, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabType = '검색광고 견적 AI' | '브랜드검색광고 견적 AI' | '소재 제작 AI' | '보고서 AI' | '메일 AI'
type QuoteStatus = '진행중' | '완료' | '오류'

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
  const handleRegistrationDownload = (quoteId: string, quoteName: string) => {
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

                        {/* 등록 열: 업로드한 엑셀 파일 다운로드 */}
                        <TableCell className="text-center">
                          <button
                            onClick={() => handleRegistrationDownload(row.id, row.name)}
                            className="inline-flex items-center justify-center p-2 rounded-xl hover:bg-[#F8F9FA] transition-colors"
                            title="등록 파일 다운로드"
                          >
                            <Download className="h-4 w-4 text-[#5F6368]" />
                          </button>
                        </TableCell>

                        {/* 결과 열: 완료 시 견적서 다운로드 */}
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
                /* 상세 페이지 뷰 */
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
                      <h2 className="text-xl font-bold text-[#202124]">{brandDetailItem.brandName}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] hover:border-[#1A73E8] hover:text-[#1A73E8] transition-all duration-200"
                      >
                        자동 선택
                      </Button>
                      <Button
                        className="gap-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium px-6 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                      >
                        <Download className="h-4 w-4" />
                        견적 다운로드
                      </Button>
                    </div>
                  </div>

                  {/* 상세 내용 플레이스홀더 */}
                  <Card className="rounded-2xl border-[#E8EAED] shadow-sm">
                    <CardContent className="py-24 text-center">
                      <FileText className="h-12 w-12 text-[#DADCE0] mx-auto mb-4" />
                      <p className="text-base font-medium text-[#202124] mb-1">{brandDetailItem.name}</p>
                      <p className="text-sm text-[#5F6368]">견적 상세 내용이 표시됩니다.</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                /* 목록 뷰 */
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

          {/* ── 메일 AI 탭 (내용 없음) ── */}
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
            {/* 작업 이름 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">작업 이름</label>
              <Input
                placeholder="작업 이름을 입력해주세요."
                value={brandQuote.name}
                onChange={(e) => setBrandQuote({ ...brandQuote, name: e.target.value })}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            {/* 브랜드명 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">브랜드명</label>
              <Input
                placeholder="브랜드명 혹은 서비스명을 입력해주세요."
                value={brandQuote.brandName}
                onChange={(e) => setBrandQuote({ ...brandQuote, brandName: e.target.value })}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            {/* 디바이스 - 라디오 버튼 */}
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
    </div>
  )
}
