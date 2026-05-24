export type EventType = 'wedding' | 'birthday' | 'trip' | 'party' | 'other'
export type EventStatus = 'active' | 'ended' | 'revealed'

export interface Event {
  id: string
  host_id: string
  name: string
  event_type: EventType
  slug: string
  description: string | null
  ends_at: string
  cover_image: string | null
  created_at: string
  status: EventStatus
}

export interface Guest {
  id: string
  event_id: string
  name: string
  token: string
  joined_at: string
}

export interface Photo {
  id: string
  event_id: string
  guest_id: string | null
  storage_path: string
  caption: string | null
  uploaded_at: string
  guest?: Guest
}
