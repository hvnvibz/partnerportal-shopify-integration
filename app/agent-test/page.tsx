'use client'
import Script from 'next/script'
import { ChatKit, useChatKit } from '@openai/chatkit-react'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

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
      <div className="min-h-screen bg-gray-100 flex">
        <AppSidebar />
        <SidebarInset>
          <Script src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" async />
          <div className="flex items-center justify-center p-6">
            <ChatKit control={control} className="h-[780px] w-[720px]" />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}


