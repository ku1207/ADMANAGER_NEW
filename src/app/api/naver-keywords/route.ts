import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const CUSTOMER_ID = process.env.NAVER_CUSTOMER_ID ?? ''
const ACCESS_LICENSE = process.env.NAVER_ACCESS_LICENSE ?? ''
const SECRET_KEY = process.env.NAVER_SECRET_KEY ?? ''

function generateSignature(timestamp: number, method: string, uri: string): string {
  const message = `${timestamp}.${method}.${uri}`
  return crypto
    .createHmac('sha256', Buffer.from(SECRET_KEY, 'base64'))
    .update(message)
    .digest('base64')
}

export async function GET(request: NextRequest) {
  if (!CUSTOMER_ID || !ACCESS_LICENSE || !SECRET_KEY) {
    return NextResponse.json({ error: 'Naver API credentials not configured' }, { status: 500 })
  }

  const keyword = new URL(request.url).searchParams.get('keyword') ?? ''
  const timestamp = Date.now()
  const uri = '/keywordstool'

  try {
    const res = await fetch(
      `https://api.naver.com${uri}?hintKeywords=${encodeURIComponent(keyword)}&showDetail=1`,
      {
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Timestamp': String(timestamp),
          'X-API-KEY': ACCESS_LICENSE,
          'X-Customer': CUSTOMER_ID,
          'X-Signature': generateSignature(timestamp, 'GET', uri),
        },
      }
    )

    if (!res.ok) {
      const detail = await res.text()
      return NextResponse.json(
        { error: `Naver API error: ${res.status}`, detail },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch from Naver API' }, { status: 500 })
  }
}
