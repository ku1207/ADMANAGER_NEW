'use client'

import { useState, useMemo, useRef } from 'react'
import {
  Button,
  Input,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Card, CardContent,
  RadioGroup, RadioGroupItem,
  Label,
} from '@/components/ui'
import { FileText, Plus, Download, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabType = '광고 견적 AI' | '소재 제작 AI' | '보고서 AI' | '메일 AI'
type QuoteStatus = '진행중' | '완료' | '오류'

interface QuoteItem {
  id: string
  no: number
  name: string
  quoteMethod: '검색광고' | '브랜드검색광고'
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

// 견적 더미 데이터
const INITIAL_QUOTE_DATA: QuoteItem[] = [
  {
    id: 'QT001',
    no: 1,
    name: '화장품 키워드',
    quoteMethod: '검색광고',
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
    quoteMethod: '검색광고',
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
    quoteMethod: '검색광고',
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

// 엑셀 템플릿 다운로드
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

function getCurrentDateTime(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
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
  const [activeTab, setActiveTab] = useState<TabType>('광고 견적 AI')

  // 견적 데이터
  const [quoteData, setQuoteData] = useState<QuoteItem[]>(INITIAL_QUOTE_DATA)
  const [registrationFiles, setRegistrationFiles] = useState<Record<string, File>>({})

  // 검색광고 견적 등록
  const [searchAdRegisterOpen, setSearchAdRegisterOpen] = useState(false)
  const [searchAdQuote, setSearchAdQuote] = useState({
    name: '', pcBudget: '', mobileBudget: '', criteria: '클릭 최대화', file: null as File | null,
  })

  // 브랜드검색광고 견적 등록
  const [brandSearchRegisterOpen, setBrandSearchRegisterOpen] = useState(false)
  const [brandSearchQuote, setBrandSearchQuote] = useState({
    name: '', file: null as File | null,
  })

  // 검색광고 견적 등록 핸들러
  const handleSearchAdQuoteSubmit = () => {
    if (!searchAdQuote.name) return
    const id = `QT${Date.now()}`
    const newItem: QuoteItem = {
      id,
      no: quoteData.length + 1,
      name: searchAdQuote.name,
      quoteMethod: '검색광고',
      registeredAt: getCurrentDateTime(),
      worker: 'admin',
      status: '진행중',
      keyword: '', media: '',
      criteria: searchAdQuote.criteria,
      pcBudget: parseInt(searchAdQuote.pcBudget) || 0,
      mobileBudget: parseInt(searchAdQuote.mobileBudget) || 0,
    }
    if (searchAdQuote.file) setRegistrationFiles(prev => ({ ...prev, [id]: searchAdQuote.file! }))
    setQuoteData([...quoteData, newItem])
    setSearchAdQuote({ name: '', pcBudget: '', mobileBudget: '', criteria: '클릭 최대화', file: null })
    setSearchAdRegisterOpen(false)
  }

  // 브랜드검색광고 견적 등록 핸들러
  const handleBrandSearchQuoteSubmit = () => {
    if (!brandSearchQuote.name) return
    const id = `QT${Date.now()}`
    const newItem: QuoteItem = {
      id,
      no: quoteData.length + 1,
      name: brandSearchQuote.name,
      quoteMethod: '브랜드검색광고',
      registeredAt: getCurrentDateTime(),
      worker: 'admin',
      status: '진행중',
      keyword: '', media: '', criteria: '', pcBudget: 0, mobileBudget: 0,
    }
    if (brandSearchQuote.file) setRegistrationFiles(prev => ({ ...prev, [id]: brandSearchQuote.file! }))
    setQuoteData([...quoteData, newItem])
    setBrandSearchQuote({ name: '', file: null })
    setBrandSearchRegisterOpen(false)
  }

  // 등록 파일 다운로드
  const handleRegistrationDownload = (quoteId: string) => {
    const file = registrationFiles[quoteId]
    if (!file) { alert('업로드된 파일이 없습니다.'); return }
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url; link.download = file.name
    document.body.appendChild(link); link.click()
    document.body.removeChild(link); URL.revokeObjectURL(url)
  }

  const handleResultDownload = (quote: QuoteItem) => {
    alert(`${quote.name} 견적서를 다운로드합니다.`)
  }

  // 등록시간 내림차순 정렬 (신규 상단)
  const sortedQuoteRows = useMemo(() =>
    [...quoteData].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt)),
    [quoteData]
  )

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="p-8 space-y-6 w-[90%] mx-auto">
        <h1 className="text-2xl font-bold text-[#202124] tracking-tight">AI 자동화 센터</h1>

        <div className="bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]">
          {/* 탭 네비게이션 */}
          <nav className="flex border-b border-[#E8EAED]">
            {(['광고 견적 AI', '소재 제작 AI', '보고서 AI', '메일 AI'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  activeTab === tab ? "text-[#1A73E8]" : "text-[#5F6368] hover:text-[#202124] hover:bg-[#F8F9FA]"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#1A73E8] rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* ── 광고 견적 AI 탭 ── */}
          {activeTab === '광고 견적 AI' && (
            <div className="p-6">
              <div className="flex justify-end gap-2 mb-4">
                <Button
                  variant="outline"
                  onClick={handleTemplateDownload}
                  className="gap-2 border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] hover:border-[#1A73E8] hover:text-[#1A73E8] transition-all duration-200"
                >
                  <Download className="h-4 w-4" />템플릿 다운로드
                </Button>
                <Button
                  onClick={() => setSearchAdRegisterOpen(true)}
                  className="gap-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium px-6 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />검색광고 견적 등록
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setBrandSearchRegisterOpen(true)}
                  className="gap-2 border-[#1A73E8] text-[#1A73E8] rounded-xl hover:bg-[#E8F0FE] transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />브랜드검색광고 견적 등록
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
                    {sortedQuoteRows.map((row, index) => (
                      <TableRow
                        key={row.id}
                        className={`hover:bg-[#F8F9FA] transition-colors ${index < sortedQuoteRows.length - 1 ? 'border-b border-[#E8EAED]' : ''}`}
                      >
                        <TableCell className="text-center text-[#5F6368]">{row.no}</TableCell>
                        <TableCell className="text-center font-medium text-[#202124]">{row.name}</TableCell>
                        <TableCell className="text-center">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                            row.quoteMethod === '검색광고'
                              ? "bg-[#E8F0FE] text-[#1A73E8]"
                              : "bg-[#E6F4EA] text-[#137333]"
                          )}>
                            {row.quoteMethod === '검색광고' ? '검색광고 견적' : '브랜드검색광고 견적'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-[#5F6368]">{row.registeredAt}</TableCell>
                        <TableCell className="text-center text-[#5F6368]">{row.worker}</TableCell>
                        <StatusCell status={row.status} completedCount={row.completedCount} errorReason={row.errorReason} />
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
                    {sortedQuoteRows.length === 0 && (
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

      {/* ── 검색광고 견적 등록 다이얼로그 ── */}
      <Dialog open={searchAdRegisterOpen} onOpenChange={setSearchAdRegisterOpen}>
        <DialogContent className="bg-white rounded-2xl border-[#E8EAED] shadow-[0_2px_6px_2px_rgba(60,64,67,0.15),0_8px_16px_4px_rgba(60,64,67,0.15)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#202124] text-lg font-semibold">검색광고 견적 등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">작업 이름</label>
              <Input
                placeholder="작업 이름을 입력해주세요."
                value={searchAdQuote.name}
                onChange={(e) => setSearchAdQuote({ ...searchAdQuote, name: e.target.value })}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">파일 업로드</label>
              <FileUploadArea file={searchAdQuote.file} onFileChange={(f) => setSearchAdQuote({ ...searchAdQuote, file: f })} />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">PC 예산(원)</label>
              <Input
                type="number"
                placeholder="PC 예산을 입력해주세요."
                value={searchAdQuote.pcBudget}
                onChange={(e) => setSearchAdQuote({ ...searchAdQuote, pcBudget: e.target.value.replace(/[^0-9]/g, '') })}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">Mobile 예산(원)</label>
              <Input
                type="number"
                placeholder="Mobile 예산을 입력해주세요."
                value={searchAdQuote.mobileBudget}
                onChange={(e) => setSearchAdQuote({ ...searchAdQuote, mobileBudget: e.target.value.replace(/[^0-9]/g, '') })}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">최적화 기준</label>
              <RadioGroup
                value={searchAdQuote.criteria}
                onValueChange={(v) => setSearchAdQuote({ ...searchAdQuote, criteria: v })}
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
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="CPC 최소화" id="criteria-cpc" />
                  <Label htmlFor="criteria-cpc" className="text-sm text-[#202124] cursor-pointer">CPC 최소화</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => { setSearchAdRegisterOpen(false); setSearchAdQuote({ name: '', pcBudget: '', mobileBudget: '', criteria: '클릭 최대화', file: null }) }}
              className="border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] transition-all duration-200"
            >취소</Button>
            <Button
              onClick={handleSearchAdQuoteSubmit}
              disabled={!searchAdQuote.name}
              className="bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >등록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 브랜드검색광고 견적 등록 다이얼로그 ── */}
      <Dialog open={brandSearchRegisterOpen} onOpenChange={setBrandSearchRegisterOpen}>
        <DialogContent className="bg-white rounded-2xl border-[#E8EAED] shadow-[0_2px_6px_2px_rgba(60,64,67,0.15),0_8px_16px_4px_rgba(60,64,67,0.15)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#202124] text-lg font-semibold">브랜드검색광고 견적 등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">작업 이름</label>
              <Input
                placeholder="작업 이름을 입력해주세요."
                value={brandSearchQuote.name}
                onChange={(e) => setBrandSearchQuote({ ...brandSearchQuote, name: e.target.value })}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">파일 업로드</label>
              <FileUploadArea file={brandSearchQuote.file} onFileChange={(f) => setBrandSearchQuote({ ...brandSearchQuote, file: f })} />
            </div>
          </div>
          <DialogFooter className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => { setBrandSearchRegisterOpen(false); setBrandSearchQuote({ name: '', file: null }) }}
              className="border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] transition-all duration-200"
            >취소</Button>
            <Button
              onClick={handleBrandSearchQuoteSubmit}
              disabled={!brandSearchQuote.name}
              className="bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >등록</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
