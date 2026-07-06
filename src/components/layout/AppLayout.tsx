import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { TopHeader } from './TopHeader'
import { GameFeedback } from '../game/GameFeedback'

interface AppLayoutProps {
  children: ReactNode
  titulo: string
}

export function AppLayout({ children, titulo }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">
      <Sidebar />

      {/* Main content area — offset by sidebar on desktop */}
      <div className="lg:pl-64">
        <TopHeader titulo={titulo} />

        <main className="page-enter px-4 py-6 lg:px-8 pb-32 lg:pb-8 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>

      <BottomNav />
      <GameFeedback />
    </div>
  )
}
