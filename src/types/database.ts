export interface Database {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string
          title: string
          description: string | null
          channel_name: string
          thumbnail_url: string | null
          video_url: string | null
          duration: string
          views: number
          likes: number
          dislikes: number
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          channel_name: string
          thumbnail_url?: string | null
          video_url?: string | null
          duration: string
          views?: number
          likes?: number
          dislikes?: number
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          channel_name?: string
          thumbnail_url?: string | null
          video_url?: string | null
          duration?: string
          views?: number
          likes?: number
          dislikes?: number
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          video_id: string
          user_id: string
          content: string
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          video_id: string
          user_id: string
          content: string
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          user_id?: string
          content?: string
          likes?: number
          created_at?: string
          updated_at?: string
        }
      }
      video_likes: {
        Row: {
          id: string
          video_id: string
          user_id: string
          is_like: boolean
          created_at: string
        }
        Insert: {
          id?: string
          video_id: string
          user_id: string
          is_like: boolean
          created_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          user_id?: string
          is_like?: boolean
          created_at?: string
        }
      }
      investments: {
        Row: {
          id: string
          video_id: string
          user_id: string
          amount: number
          tier: string
          created_at: string
        }
        Insert: {
          id?: string
          video_id: string
          user_id: string
          amount: number
          tier: string
          created_at?: string
        }
        Update: {
          id?: string
          video_id?: string
          user_id?: string
          amount?: number
          tier?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          subscriber_id: string
          channel_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          subscriber_id: string
          channel_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          subscriber_id?: string
          channel_user_id?: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          subscribers_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscribers_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          subscribers_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}