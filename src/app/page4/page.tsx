'use client'

import { useState } from 'react'
import {
  Button,
  Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  Card, CardContent,
} from '@/components/ui'
import { Mail, RefreshCw, Calendar, Link2, Copy, Send, Loader2, FileText, AlertCircle, CheckCircle2, Plus, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabType = '메일 AI' | '견적 AI' | '제작 AI' | '보고서 AI'
type ToneType = '공손한' | '간결한' | '공식적인'
type QuoteStatus = '진행중' | '완료' | '오류'

interface EmailItem {
  id: string
  sender: string
  subject: string
  preview: string
  date: string
  isRead: boolean
  advertiserName?: string
  advertiserId?: string
  requestSummary?: string
  missingDocs?: string[]
}

interface QuoteItem {
  id: string
  no: number
  name: string
  registeredAt: string
  worker: string
  status: QuoteStatus
  keyword: string
  media: string
  criteria: string
  pcBudget: number
  mobileBudget: number
}

// 더미 메일 데이터
const DUMMY_EMAILS: EmailItem[] = [
  {
    id: 'mail-001',
    sender: '김마케팅 <marketing@healthkorea.com>',
    subject: '네이버 검색광고 캠페인 집행 요청 드립니다',
    preview: '안녕하세요, 헬스케어코리아 마케팅팀입니다. 다음 달부터 네이버 검색광고 캠페인을...',
    date: '2026-02-05 09:30',
    isRead: false,
    advertiserName: '헬스케어코리아',
    advertiserId: 'ADV-001',
    requestSummary: '네이버 검색광고 신규 캠페인 집행 요청 (월 예산 500만원, 키워드: 건강기능식품 관련)',
    missingDocs: ['통장사본'],
  },
  {
    id: 'mail-002',
    sender: '이대리 <lee@beautyplus.co.kr>',
    subject: 'Re: 카카오 모먼트 견적 문의',
    preview: '보내주신 견적서 확인했습니다. 추가로 메타 광고도 함께 진행하고 싶은데...',
    date: '2026-02-05 08:45',
    isRead: true,
    advertiserName: '뷰티플러스',
    advertiserId: 'ADV-002',
    requestSummary: '카카오 모먼트 + 메타 광고 동시 집행 견적 요청',
    missingDocs: [],
  },
  {
    id: 'mail-003',
    sender: '박팀장 <park@sportsmarket.kr>',
    subject: '광고 계정 권한 요청',
    preview: '안녕하세요, 스포츠마켓입니다. 구글 광고 계정 권한을 부여해 주시면...',
    date: '2026-02-04 17:20',
    isRead: true,
    advertiserName: '스포츠마켓',
    advertiserId: 'ADV-003',
    requestSummary: '구글 광고 계정 권한 부여 요청',
    missingDocs: ['사업자등록증', '매체 권한'],
  },
  {
    id: 'mail-004',
    sender: '최마케터 <choi@foodfactory.com>',
    subject: '2월 광고 예산 증액 요청',
    preview: '설 연휴 프로모션을 위해 2월 광고 예산을 증액하고자 합니다...',
    date: '2026-02-04 14:10',
    isRead: false,
    advertiserName: '푸드팩토리',
    advertiserId: 'ADV-004',
    requestSummary: '2월 설 연휴 프로모션을 위한 광고 예산 증액 요청 (기존 대비 50% 증액)',
    missingDocs: [],
  },
  {
    id: 'mail-005',
    sender: '정담당 <jung@techsolution.io>',
    subject: '신규 광고주 등록 문의',
    preview: '안녕하세요, 테크솔루션입니다. 귀사를 통해 온라인 광고를 진행하고자...',
    date: '2026-02-04 11:30',
    isRead: true,
    advertiserName: '테크솔루션',
    advertiserId: undefined,
    requestSummary: '신규 광고주 등록 및 메타/구글 광고 집행 문의',
    missingDocs: ['사업자등록증', '통장사본', '매체 권한'],
  },
]

// 견적 더미 데이터
const INITIAL_QUOTE_DATA: QuoteItem[] = [
  {
    id: 'QT001',
    no: 1,
    name: '화장품 키워드',
    registeredAt: '2026-02-05 14:30',
    worker: 'admin',
    status: '완료',
    keyword: '화장품',
    media: '네이버 검색광고',
    criteria: '클릭 최대화',
    pcBudget: 2000000,
    mobileBudget: 3000000,
  },
  {
    id: 'QT002',
    no: 2,
    name: '스포츠용품 키워드',
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
    registeredAt: '2026-02-06 09:00',
    worker: 'admin',
    status: '오류',
    keyword: '건강식품',
    media: '카카오 키워드',
    criteria: '클릭 최대화',
    pcBudget: 1000000,
    mobileBudget: 1500000,
  },
]

// 톤별 회신 템플릿
const generateReplyTemplate = (email: EmailItem, tone: ToneType): string => {
  const missingDocsText = email.missingDocs && email.missingDocs.length > 0
    ? `\n\n광고 집행을 위해 아래 서류가 필요합니다:\n${email.missingDocs.map(doc => `- ${doc}`).join('\n')}\n\n해당 서류를 회신해 주시면 빠르게 처리해 드리겠습니다.`
    : ''

  const quoteLinkText = email.requestSummary?.includes('견적')
    ? '\n\n견적 확인은 아래 링크에서 가능합니다:\n[견적 AI 바로가기]'
    : ''

  if (tone === '공손한') {
    return `안녕하세요, ${email.advertiserName || '고객'}님.

문의 주신 내용 잘 확인하였습니다.
요청하신 "${email.requestSummary}" 건에 대해 검토 후 안내드리겠습니다.${missingDocsText}${quoteLinkText}

추가 문의사항이 있으시면 언제든 연락 주시기 바랍니다.
감사합니다.

AD Manager 드림`
  } else if (tone === '간결한') {
    return `${email.advertiserName || '고객'}님, 안녕하세요.

요청사항 확인했습니다.
- ${email.requestSummary}${missingDocsText}${quoteLinkText}

확인 후 연락드리겠습니다.

AD Manager`
  } else {
    return `${email.advertiserName || '고객'}님께,

귀하의 문의에 감사드립니다.

아래 요청사항을 접수하였음을 알려드립니다.
요청 내용: ${email.requestSummary}${missingDocsText}${quoteLinkText}

담당자 검토 후 공식 회신을 드릴 예정입니다.

AD Manager 운영팀 드림`
  }
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

export default function Page4() {
  const [activeTab, setActiveTab] = useState<TabType>('메일 AI')
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [selectedTone, setSelectedTone] = useState<ToneType>('공손한')
  const [isApiModalOpen, setIsApiModalOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReply, setGeneratedReply] = useState<string>('')
  const [copySuccess, setCopySuccess] = useState(false)

  // 견적 AI 상태
  const [quoteData, setQuoteData] = useState<QuoteItem[]>(INITIAL_QUOTE_DATA)
  const [quoteRegisterOpen, setQuoteRegisterOpen] = useState(false)
  const [quoteDetailOpen, setQuoteDetailOpen] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState<QuoteItem | null>(null)
  const [newQuote, setNewQuote] = useState({
    keyword: '',
    media: '',
    criteria: '',
    pcBudget: '',
    mobileBudget: '',
  })

  const selectedEmail = DUMMY_EMAILS.find(e => e.id === selectedEmailId)

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
    }, 2000)
  }

  const handleGenerateReply = () => {
    if (!selectedEmail) return
    setIsGenerating(true)
    setTimeout(() => {
      setGeneratedReply(generateReplyTemplate(selectedEmail, selectedTone))
      setIsGenerating(false)
    }, 1500)
  }

  const handleCopyReply = async () => {
    if (!generatedReply) return
    try {
      await navigator.clipboard.writeText(generatedReply)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleToneChange = (tone: ToneType) => {
    setSelectedTone(tone)
    if (selectedEmail) {
      setGeneratedReply(generateReplyTemplate(selectedEmail, tone))
    }
  }

  const handleEmailSelect = (emailId: string) => {
    setSelectedEmailId(emailId)
    setGeneratedReply('')
    setIsGenerating(false)
  }

  // 견적 등록 핸들러
  const handleQuoteSubmit = () => {
    if (!newQuote.keyword || !newQuote.media || !newQuote.criteria) return

    const newItem: QuoteItem = {
      id: `QT${Date.now()}`,
      no: quoteData.length + 1,
      name: `${newQuote.keyword} 키워드`,
      registeredAt: getCurrentDateTime(),
      worker: 'admin',
      status: '진행중',
      keyword: newQuote.keyword,
      media: newQuote.media,
      criteria: newQuote.criteria,
      pcBudget: parseInt(newQuote.pcBudget) || 0,
      mobileBudget: parseInt(newQuote.mobileBudget) || 0,
    }

    setQuoteData([...quoteData, newItem])
    setNewQuote({ keyword: '', media: '', criteria: '', pcBudget: '', mobileBudget: '' })
    setQuoteRegisterOpen(false)
  }

  // 등록 상세 보기
  const handleViewDetail = (quote: QuoteItem) => {
    setSelectedQuote(quote)
    setQuoteDetailOpen(true)
  }

  // 결과 다운로드
  const handleDownload = (quote: QuoteItem) => {
    alert(`${quote.name} 견적서를 다운로드합니다.`)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="p-8 space-y-6 w-[90%] mx-auto">
        {/* 페이지 제목 */}
        <h1 className="text-2xl font-bold text-[#202124] tracking-tight">AI 자동화 센터</h1>

        {/* 탭 영역 */}
        <div className="bg-white rounded-2xl shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)]">
          <nav className="flex border-b border-[#E8EAED]">
            {(['메일 AI', '견적 AI', '제작 AI', '보고서 AI'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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

          {/* 메일 AI 탭 */}
          {activeTab === '메일 AI' && (
            <div>
              {/* 상단 설정 영역 */}
              <div className="p-6 border-b border-[#E8EAED]">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsApiModalOpen(true)}
                    className="border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] hover:border-[#1A73E8] hover:text-[#1A73E8] transition-all duration-200"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    메일 서비스 API 연동
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] hover:border-[#1A73E8] hover:text-[#1A73E8] transition-all duration-200"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    날짜
                  </Button>
                  <Button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium px-6 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    {isSyncing ? '동기화 중...' : '수신함 동기화'}
                  </Button>
                </div>
              </div>

              {/* 메일 리스트 및 상세 영역 */}
              <div className="flex min-h-[600px]">
                {/* 좌측: 메일 리스트 (30%) */}
                <div className="w-[30%] border-r border-[#E8EAED] overflow-y-auto">
                  {DUMMY_EMAILS.map(email => (
                    <div
                      key={email.id}
                      onClick={() => handleEmailSelect(email.id)}
                      className={cn(
                        "p-4 border-b border-[#E8EAED] cursor-pointer transition-colors",
                        selectedEmailId === email.id
                          ? "bg-[#E8F0FE]"
                          : "hover:bg-[#F8F9FA]",
                        !email.isRead && "bg-[#F8F9FA]"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                          !email.isRead ? "bg-[#1A73E8]" : "bg-transparent"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm truncate",
                            !email.isRead ? "font-semibold text-[#202124]" : "text-[#5F6368]"
                          )}>
                            {email.sender.split('<')[0].trim()}
                          </p>
                          <p className={cn(
                            "text-sm truncate mt-0.5",
                            !email.isRead ? "font-medium text-[#202124]" : "text-[#5F6368]"
                          )}>
                            {email.subject}
                          </p>
                          <p className="text-xs text-[#80868B] truncate mt-1">{email.preview}</p>
                          <p className="text-xs text-[#80868B] mt-2">{email.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 우측: 메일 상세 및 AI 분석 결과 (70%) */}
                <div className="w-[70%] p-6 overflow-y-auto">
                  {selectedEmail ? (
                    <div className="space-y-6">
                      {/* 정보 추출 카드 */}
                      <Card className="rounded-2xl border-[#E8EAED] shadow-sm">
                        <CardContent className="p-6">
                          <h3 className="text-sm font-semibold text-[#202124] mb-4 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-[#1A73E8]" />
                            AI 정보 추출
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-[#80868B]">광고주명</p>
                              <p className="text-sm font-medium text-[#202124] mt-1">
                                {selectedEmail.advertiserName || '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#80868B]">광고주 ID</p>
                              <p className="text-sm font-medium text-[#202124] mt-1">
                                {selectedEmail.advertiserId || '미등록 광고주'}
                              </p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-xs text-[#80868B]">요청 핵심 요약</p>
                              <p className="text-sm font-medium text-[#202124] mt-1">
                                {selectedEmail.requestSummary || '-'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 누락 서류 체크 카드 */}
                      <Card className="rounded-2xl border-[#E8EAED] shadow-sm">
                        <CardContent className="p-6">
                          <h3 className="text-sm font-semibold text-[#202124] mb-4 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-[#EA4335]" />
                            누락 서류 체크
                          </h3>
                          {selectedEmail.missingDocs && selectedEmail.missingDocs.length > 0 ? (
                            <div className="space-y-2">
                              {selectedEmail.missingDocs.map(doc => (
                                <div key={doc} className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
                                  <span className="text-sm text-[#EA4335] font-medium">{doc}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-[#34A853]" />
                              <span className="text-sm text-[#34A853]">모든 필수 서류가 확인되었습니다.</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* 회신 초안 생성 카드 */}
                      <Card className="rounded-2xl border-[#E8EAED] shadow-sm">
                        <CardContent className="p-6">
                          <h3 className="text-sm font-semibold text-[#202124] mb-4 flex items-center gap-2">
                            <Mail className="h-4 w-4 text-[#1A73E8]" />
                            회신 초안 생성
                          </h3>

                          {/* 톤앤매너 선택 */}
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-sm text-[#5F6368]">톤앤매너:</span>
                            {(['공손한', '간결한', '공식적인'] as ToneType[]).map(tone => (
                              <button
                                key={tone}
                                onClick={() => handleToneChange(tone)}
                                className={cn(
                                  "px-4 py-2 text-sm rounded-xl transition-all duration-200",
                                  selectedTone === tone
                                    ? "bg-[#1A73E8] text-white"
                                    : "bg-[#F8F9FA] text-[#5F6368] hover:bg-[#E8EAED]"
                                )}
                              >
                                {tone}
                              </button>
                            ))}
                          </div>

                          {/* 초안 생성 버튼 */}
                          {!generatedReply && !isGenerating && (
                            <Button
                              onClick={handleGenerateReply}
                              className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium py-3 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                            >
                              AI 회신 초안 생성
                            </Button>
                          )}

                          {/* 로딩 애니메이션 */}
                          {isGenerating && (
                            <div className="flex items-center justify-center py-8">
                              <div className="flex items-center gap-3">
                                <Loader2 className="h-6 w-6 text-[#1A73E8] animate-spin" />
                                <span className="text-sm text-[#5F6368]">AI가 회신 초안을 작성하고 있습니다...</span>
                              </div>
                            </div>
                          )}

                          {/* 생성된 회신 */}
                          {generatedReply && !isGenerating && (
                            <div className="space-y-4">
                              <div className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E8EAED]">
                                <pre className="text-sm text-[#202124] whitespace-pre-wrap font-sans leading-relaxed">
                                  {generatedReply}
                                </pre>
                              </div>

                              {/* 버튼 영역 */}
                              <div className="flex items-center gap-3">
                                <Button
                                  onClick={handleCopyReply}
                                  variant="outline"
                                  className={cn(
                                    "flex-1 border-[#DADCE0] rounded-xl transition-all duration-200",
                                    copySuccess
                                      ? "bg-[#E6F4EA] border-[#34A853] text-[#137333]"
                                      : "text-[#5F6368] hover:bg-[#F8F9FA] hover:border-[#1A73E8] hover:text-[#1A73E8]"
                                  )}
                                >
                                  {copySuccess ? (
                                    <>
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      복사 완료
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-4 w-4 mr-2" />
                                      회신 메일 복사하기
                                    </>
                                  )}
                                </Button>
                                <Button
                                  className="flex-1 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  답장 발송
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Mail className="h-16 w-16 text-[#E8EAED] mx-auto mb-4" />
                        <p className="text-[#5F6368]">좌측에서 메일을 선택해 주세요.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 견적 AI 탭 */}
          {activeTab === '견적 AI' && (
            <div className="p-6">
              {/* 상단 버튼 영역 */}
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => setQuoteRegisterOpen(true)}
                  className="gap-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-medium px-6 rounded-xl transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  견적 등록
                </Button>
              </div>

              {/* 견적 테이블 */}
              <Card className="rounded-2xl border-[#E8EAED] overflow-hidden shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F8F9FA] border-b border-[#E8EAED]">
                      <TableHead className="text-center font-semibold text-[#202124]">No</TableHead>
                      <TableHead className="text-center font-semibold text-[#202124]">작업이름</TableHead>
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
                        <TableCell className="text-center text-[#5F6368]">{row.registeredAt}</TableCell>
                        <TableCell className="text-center text-[#5F6368]">{row.worker}</TableCell>
                        <TableCell className="text-center">
                          <span
                            className={cn(
                              "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                              row.status === '완료' && "bg-[#E6F4EA] text-[#137333]",
                              row.status === '진행중' && "bg-[#E8F0FE] text-[#1A73E8]",
                              row.status === '오류' && "bg-[#FCE8E6] text-[#C5221F]"
                            )}
                          >
                            {row.status === '진행중' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                            {row.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => handleViewDetail(row)}
                            className="inline-flex items-center justify-center p-2 rounded-xl hover:bg-[#F8F9FA] transition-colors"
                            title="등록 정보 보기"
                          >
                            <FileText className="h-4 w-4 text-[#5F6368]" />
                          </button>
                        </TableCell>
                        <TableCell className="text-center">
                          {row.status === '완료' && (
                            <button
                              onClick={() => handleDownload(row)}
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
                        <TableCell colSpan={7} className="text-center py-12 text-[#5F6368]">
                          등록된 견적이 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          )}

          {/* 제작 AI 탭 */}
          {activeTab === '제작 AI' && (
            <div className="p-12 flex items-center justify-center min-h-[500px]">
              <Card className="rounded-2xl border-[#E8EAED] shadow-sm">
                <CardContent className="py-16 px-24 text-center">
                  <div className="w-20 h-20 rounded-full bg-[#F8F9FA] flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-10 w-10 text-[#DADCE0]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#202124] mb-2">제작 AI</h3>
                  <p className="text-[#5F6368]">준비 중인 기능입니다.</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 보고서 AI 탭 */}
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
        </div>
      </div>

      {/* 메일 서비스 API 연동 모달 */}
      <Dialog open={isApiModalOpen} onOpenChange={setIsApiModalOpen}>
        <DialogContent className="bg-white rounded-2xl border-[#E8EAED] shadow-[0_2px_6px_2px_rgba(60,64,67,0.15),0_8px_16px_4px_rgba(60,64,67,0.15)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#202124] text-lg font-semibold">
              메일 서비스 API 연동
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-[#5F6368]">연동할 메일 서비스를 선택해 주세요.</p>
            <div className="space-y-3">
              <button className="w-full p-4 border border-[#E8EAED] rounded-xl hover:border-[#1A73E8] hover:bg-[#F8F9FA] transition-all duration-200 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EA4335] flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#202124]">Gmail</p>
                    <p className="text-xs text-[#5F6368]">Google Workspace 계정으로 연동</p>
                  </div>
                </div>
              </button>
              <button className="w-full p-4 border border-[#E8EAED] rounded-xl hover:border-[#1A73E8] hover:bg-[#F8F9FA] transition-all duration-200 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0078D4] flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#202124]">Outlook</p>
                    <p className="text-xs text-[#5F6368]">Microsoft 365 계정으로 연동</p>
                  </div>
                </div>
              </button>
              <button className="w-full p-4 border border-[#E8EAED] rounded-xl hover:border-[#1A73E8] hover:bg-[#F8F9FA] transition-all duration-200 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#03C75A] flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-[#202124]">네이버 메일</p>
                    <p className="text-xs text-[#5F6368]">네이버 웍스 계정으로 연동</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApiModalOpen(false)}
              className="border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] transition-all duration-200"
            >
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 견적 등록 다이얼로그 */}
      <Dialog open={quoteRegisterOpen} onOpenChange={setQuoteRegisterOpen}>
        <DialogContent className="bg-white rounded-2xl border-[#E8EAED] shadow-[0_2px_6px_2px_rgba(60,64,67,0.15),0_8px_16px_4px_rgba(60,64,67,0.15)] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#202124] text-lg font-semibold">견적 등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">키워드</label>
              <Input
                placeholder="키워드를 입력해주세요."
                value={newQuote.keyword}
                onChange={(e) => setNewQuote({ ...newQuote, keyword: e.target.value })}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">매체</label>
              <Select value={newQuote.media} onValueChange={(v) => setNewQuote({ ...newQuote, media: v })}>
                <SelectTrigger className="w-full border-[#E8EAED] rounded-xl hover:border-[#DADCE0] transition-colors">
                  <SelectValue placeholder="매체" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border-[#E8EAED] shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]">
                  <SelectItem value="네이버 검색광고" className="rounded-lg hover:bg-[#F8F9FA]">네이버 검색광고</SelectItem>
                  <SelectItem value="브랜드검색" className="rounded-lg hover:bg-[#F8F9FA]">브랜드검색</SelectItem>
                  <SelectItem value="카카오 키워드" className="rounded-lg hover:bg-[#F8F9FA]">카카오 키워드</SelectItem>
                  <SelectItem value="구글 검색광고" className="rounded-lg hover:bg-[#F8F9FA]">구글 검색광고</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">기준</label>
              <Select value={newQuote.criteria} onValueChange={(v) => setNewQuote({ ...newQuote, criteria: v })}>
                <SelectTrigger className="w-full border-[#E8EAED] rounded-xl hover:border-[#DADCE0] transition-colors">
                  <SelectValue placeholder="기준" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-xl border-[#E8EAED] shadow-[0_1px_3px_0_rgba(60,64,67,0.3),0_4px_8px_3px_rgba(60,64,67,0.15)]">
                  <SelectItem value="노출 최대화" className="rounded-lg hover:bg-[#F8F9FA]">노출 최대화</SelectItem>
                  <SelectItem value="클릭 최대화" className="rounded-lg hover:bg-[#F8F9FA]">클릭 최대화</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">PC 예산</label>
              <Input
                type="number"
                placeholder="PC 월 예산을 입력해주세요."
                value={newQuote.pcBudget}
                onChange={(e) => setNewQuote({ ...newQuote, pcBudget: e.target.value.replace(/[^0-9]/g, '') })}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#5F6368]">Mobile 예산</label>
              <Input
                type="number"
                placeholder="Mobile 월 예산을 입력해주세요."
                value={newQuote.mobileBudget}
                onChange={(e) => setNewQuote({ ...newQuote, mobileBudget: e.target.value.replace(/[^0-9]/g, '') })}
                className="border-[#E8EAED] rounded-xl focus:border-[#1A73E8] focus:ring-2 focus:ring-[#E8F0FE]"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setQuoteRegisterOpen(false)
                setNewQuote({ keyword: '', media: '', criteria: '', pcBudget: '', mobileBudget: '' })
              }}
              className="border-[#DADCE0] text-[#5F6368] rounded-xl hover:bg-[#F8F9FA] transition-all duration-200"
            >
              취소
            </Button>
            <Button
              onClick={handleQuoteSubmit}
              disabled={!newQuote.keyword || !newQuote.media || !newQuote.criteria}
              className="bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 등록 상세 다이얼로그 */}
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
                  <p className="text-sm font-medium text-[#202124]">{selectedQuote.keyword}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5F6368] mb-1">매체</p>
                  <p className="text-sm font-medium text-[#202124]">{selectedQuote.media}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5F6368] mb-1">기준</p>
                  <p className="text-sm font-medium text-[#202124]">{selectedQuote.criteria}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5F6368] mb-1">상태</p>
                  <p className="text-sm font-medium text-[#202124]">{selectedQuote.status}</p>
                </div>
                <div>
                  <p className="text-xs text-[#5F6368] mb-1">PC 예산</p>
                  <p className="text-sm font-medium text-[#202124]">{selectedQuote.pcBudget.toLocaleString()}원</p>
                </div>
                <div>
                  <p className="text-xs text-[#5F6368] mb-1">Mobile 예산</p>
                  <p className="text-sm font-medium text-[#202124]">{selectedQuote.mobileBudget.toLocaleString()}원</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setQuoteDetailOpen(false)}
              className="bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-xl transition-all duration-200"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
