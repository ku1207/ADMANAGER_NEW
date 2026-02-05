'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { CalendarDays, Search, Users } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { href: '/page1', label: '일자별 데이터', icon: CalendarDays },
    { href: '/page2', label: '키워드별 데이터', icon: Search },
    { href: '/page3', label: '광고주 관리', icon: Users },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-[230px] bg-white border-r border-[#E8EAED] z-50">
      <div className="p-6">
        {/* 로고 영역 */}
        <div className="mb-10">
          <Link href="/" className="text-xl font-bold text-[#202124] tracking-tight">
            AD Manager
          </Link>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-[#E8F0FE] text-[#1A73E8] font-semibold"
                    : "text-[#5F6368] hover:bg-[#F8F9FA] hover:text-[#202124]"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-[#1A73E8]" : "text-[#5F6368]"
                )} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
