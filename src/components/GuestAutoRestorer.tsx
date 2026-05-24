'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GuestAutoRestorer({ slug }: { slug: string }) {
  const router = useRouter()

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`povs-guest-${slug}`)
      if (!stored) return
      const { token } = JSON.parse(stored)
      if (token) router.replace(`/event/${slug}/upload?token=${token}`)
    } catch {
      // corrupted storage entry — ignore
    }
  }, [slug, router])

  return null
}
