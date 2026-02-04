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
    <aside className="fixed left-0 top-0 h-full w-[230px] bg-white border-r border-gray-200 shadow-sm z-50">
      <div className="p-6">
        {/* 로고 영역 */}
        <div className="mb-12">
          <Link href="/" className="text-xl font-bold text-gray-900">
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
                  "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
                  isActive
                    ? "bg-gray-900 text-white font-medium"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
