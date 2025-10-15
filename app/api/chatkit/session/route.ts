import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { deviceId } = await request.json().catch(() => ({ deviceId: undefined }))

    const res = await fetch('https://api.openai.com/v1/chatkit/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        workflow: { id: process.env.CHATKIT_WORKFLOW_ID },
        user: deviceId || 'anonymous',
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'openai_error', details: text }, { status: 500 })
    }

    const { client_secret } = await res.json()
    return NextResponse.json({ client_secret })
  } catch (err) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}


