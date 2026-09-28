import giftData from '@/lib/giftData'
import GiftClient from '@/components/GiftClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Happy Birthday Ahmed! 🎂',
  description: 'A special birthday message for Ahmed',
}

export default function Home() {
  const data = giftData.ahmed || giftData.aya
  return <GiftClient data={data} />
}
