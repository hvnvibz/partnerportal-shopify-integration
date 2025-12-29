'use client'
import Script from 'next/script'
import { ChatKit, useChatKit } from '@openai/chatkit-react'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export default function AgentTestPage() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          // implement refresh if needed
        }
        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
        const { client_secret } = await res.json()
        return client_secret
      },
    },
  })

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Mobile Header mit Burger-Menü */}
        <header className="flex md:hidden h-14 shrink-0 items-center gap-2 border-b px-4 sticky top-0 bg-background z-40">
          <SidebarTrigger className="-ml-1" />
          <span className="font-semibold text-lg text-blue-900">INDUWA Agent</span>
        </header>
        <Script src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" async />
        <div className="min-h-screen flex items-center justify-center p-4 md:p-6">
          <ChatKit control={control} className="h-[600px] md:h-[780px] w-full max-w-[720px]" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


