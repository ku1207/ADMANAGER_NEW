'use client'

import { useState, useMemo } from 'react'
import {
  Button,
  Checkbox,
  Input,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui'
import { RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// 광고주 더미 데이터
const ADVERTISER_DATA = [
  { id: 'ADV-001', name: '헬스케어코리아', balance: 5200000, dailySpend: 320000, weeklySpend: 2240000, updatedAt: '2026-02-03 14:30' },
  { id: 'ADV-002', name: '뷰티플러스', balance: 3800000, dailySpend: 280000, weeklySpend: 1960000, updatedAt: '2026-02-03 15:10' },
  { id: 'ADV-003', name: '스포츠마켓', balance: 1200000, dailySpend: 150000, weeklySpend: 1050000, updatedAt: '2026-02-03 13:45' },
  { id: 'ADV-004', name: '푸드팩토리', balance: 7500000, dailySpend: 450000, weeklySpend: 3150000, updatedAt: '2026-02-03 16:00' },
  { id: 'ADV-005', name: '테크솔루션', balance: 2300000, dailySpend: 180000, weeklySpend: 1260000, updatedAt: '2026-02-03 12:20' },
  { id: 'ADV-006', name: '패션하우스', balance: 4100000, dailySpend: 350000, weeklySpend: 2450000, updatedAt: '2026-02-03 11:55' },
  { id: 'ADV-007', name: '에듀케이션랩', balance: 900000, dailySpend: 120000, weeklySpend: 840000, updatedAt: '2026-02-03 10:30' },
  { id: 'ADV-008', name: '트래블조이', balance: 6200000, dailySpend: 400000, weeklySpend: 2800000, updatedAt: '2026-02-03 09:15' },
  { id: 'ADV-009', name: '리빙스타일', balance: 1800000, dailySpend: 200000, weeklySpend: 1400000, updatedAt: '2026-02-03 14:00' },
  { id: 'ADV-010', name: '오토모빌', balance: 8900000, dailySpend: 520000, weeklySpend: 3640000, updatedAt: '2026-02-03 15:45' },
  { id: 'ADV-011', name: '펫프렌즈', balance: 3200000, dailySpend: 250000, weeklySpend: 1750000, updatedAt: '2026-02-03 13:20' },
  { id: 'ADV-012', name: '키즈월드', balance: 2700000, dailySpend: 190000, weeklySpend: 1330000, updatedAt: '2026-02-03 11:10' },
  { id: 'ADV-013', name: '홈인테리어', balance: 4500000, dailySpend: 310000, weeklySpend: 2170000, updatedAt: '2026-02-03 16:30' },
  { id: 'ADV-014', name: '디지털프로', balance: 1500000, dailySpend: 170000, weeklySpend: 1190000, updatedAt: '2026-02-03 10:00' },
  { id: 'ADV-015', name: '그린라이프', balance: 5800000, dailySpend: 380000, weeklySpend: 2660000, updatedAt: '2026-02-03 14:50' },
  { id: 'ADV-016', name: '뮤직스토어', balance: 2100000, dailySpend: 160000, weeklySpend: 1120000, updatedAt: '2026-02-03 12:40' },
  { id: 'ADV-017', name: '북클럽', balance: 800000, dailySpend: 95000, weeklySpend: 665000, updatedAt: '2026-02-03 09:50' },
  { id: 'ADV-018', name: '카페드림', balance: 3400000, dailySpend: 270000, weeklySpend: 1890000, updatedAt: '2026-02-03 15:30' },
  { id: 'ADV-019', name: '웰니스케어', balance: 6700000, dailySpend: 430000, weeklySpend: 3010000, updatedAt: '2026-02-03 13:00' },
  { id: 'ADV-020', name: '스마트팜', balance: 1100000, dailySpend: 130000, weeklySpend: 910000, updatedAt: '2026-02-03 11:30' },
  { id: 'ADV-021', name: '클린에너지', balance: 4800000, dailySpend: 340000, weeklySpend: 2380000, updatedAt: '2026-02-03 16:15' },
  { id: 'ADV-022', name: '아트갤러리', balance: 1900000, dailySpend: 145000, weeklySpend: 1015000, updatedAt: '2026-02-03 10:45' },
  { id: 'ADV-023', name: '헬스케어플러스', balance: 7200000, dailySpend: 470000, weeklySpend: 3290000, updatedAt: '2026-02-03 14:15' },
]

function calcEstimatedDays(balance: number, dailySpend: number): number {
  if (dailySpend === 0) return 0
  return Math.floor(balance / dailySpend)
}

const ITEMS_PER_PAGE = 10

export default function Page3() {
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchError, setSearchError] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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

  // 검색 필터링된 데이터
  const filteredData = useMemo(() => {
    if (!appliedKeyword) return ADVERTISER_DATA
    return ADVERTISER_DATA.filter(
      item =>
        item.name.includes(appliedKeyword) ||
        item.id.includes(appliedKeyword)
    )
  }, [appliedKeyword])

  // 페이지네이션
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice(
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

  const handleRefresh = (id: string) => {
    // 새로고침 동작 시뮬레이션
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6 w-[80%]">
        {/* 페이지 제목 */}
        <h1 className="text-2xl font-bold text-gray-900">광고주 관리</h1>

        {/* 탭 영역 */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className="px-4 py-2.5 text-sm font-medium border-b-2 border-blue-600 text-blue-600"
            >
              계정 잔액 확인
            </button>
          </nav>
        </div>

        {/* 필터 설정 영역 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
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
              />
              {searchError && (
                <p className="mt-1 text-sm text-red-500">{searchError}</p>
              )}
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSearch}
            >
              검색
            </Button>
          </div>
        </div>

        {/* 계정 잔액 확인 영역 */}
        <div className="bg-white rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-center w-[50px]">
                  <Checkbox
                    checked={allPageSelected}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-center font-semibold">광고주명</TableHead>
                <TableHead className="text-center font-semibold">광고주 ID</TableHead>
                <TableHead className="text-center font-semibold">계정 잔액</TableHead>
                <TableHead className="text-center font-semibold">전일 집행비</TableHead>
                <TableHead className="text-center font-semibold">최근 7일 집행비</TableHead>
                <TableHead className="text-center font-semibold">예상 소진일</TableHead>
                <TableHead className="text-center font-semibold">업데이트 시간</TableHead>
                <TableHead className="text-center font-semibold w-[60px]">새로고침</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map(row => (
                <TableRow key={row.id}>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedIds.has(row.id)}
                      onCheckedChange={() => toggleSelect(row.id)}
                    />
                  </TableCell>
                  <TableCell className="text-center font-medium">{row.name}</TableCell>
                  <TableCell className="text-center">{row.id}</TableCell>
                  <TableCell className="text-right">{row.balance.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.dailySpend.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{row.weeklySpend.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{calcEstimatedDays(row.balance, row.dailySpend)}일</TableCell>
                  <TableCell className="text-center">{row.updatedAt}</TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleRefresh(row.id)}
                      className="inline-flex items-center justify-center p-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      <RotateCw className="h-4 w-4 text-gray-500" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                이전
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant="outline"
                  size="sm"
                  className={cn(
                    page === currentPage && 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600'
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
              >
                다음
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
