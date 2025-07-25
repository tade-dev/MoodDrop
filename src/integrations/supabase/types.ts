export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_playlist_comments: {
        Row: {
          ai_playlist_id: string
          created_at: string
          id: string
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_playlist_id: string
          created_at?: string
          id?: string
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_playlist_id?: string
          created_at?: string
          id?: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_playlist_comments_ai_playlist_id_fkey"
            columns: ["ai_playlist_id"]
            isOneToOne: false
            referencedRelation: "ai_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_playlist_reactions: {
        Row: {
          ai_playlist_id: string
          created_at: string
          id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          ai_playlist_id: string
          created_at?: string
          id?: string
          reaction_type: string
          user_id: string
        }
        Update: {
          ai_playlist_id?: string
          created_at?: string
          id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_playlist_reactions_ai_playlist_id_fkey"
            columns: ["ai_playlist_id"]
            isOneToOne: false
            referencedRelation: "ai_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_playlists: {
        Row: {
          created_at: string
          id: string
          playlist_data: Json
          prompt: string
          spotify_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          playlist_data: Json
          prompt: string
          spotify_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          playlist_data?: Json
          prompt?: string
          spotify_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          drop_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          drop_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          drop_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_drop_id_fkey"
            columns: ["drop_id"]
            isOneToOne: false
            referencedRelation: "drops"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string
          end_at: string
          id: string
          mood_id: string
          prompt: string
          start_at: string
          winner_drop_id: string | null
        }
        Insert: {
          created_at?: string
          end_at: string
          id?: string
          mood_id: string
          prompt: string
          start_at: string
          winner_drop_id?: string | null
        }
        Update: {
          created_at?: string
          end_at?: string
          id?: string
          mood_id?: string
          prompt?: string
          start_at?: string
          winner_drop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenges_mood_id_fkey"
            columns: ["mood_id"]
            isOneToOne: false
            referencedRelation: "moods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_winner_drop_id_fkey"
            columns: ["winner_drop_id"]
            isOneToOne: false
            referencedRelation: "drops"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          created_at: string
          drop_id: string
          id: string
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          drop_id: string
          id?: string
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          drop_id?: string
          id?: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_drop_id_fkey"
            columns: ["drop_id"]
            isOneToOne: false
            referencedRelation: "drops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "creator_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_drops: {
        Row: {
          created_at: string
          drop_count: number
          drop_date: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          drop_count?: number
          drop_date?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          drop_count?: number
          drop_date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      drops: {
        Row: {
          artist_name: string
          caption: string | null
          challenge_id: string | null
          challenge_winner: boolean | null
          created_at: string
          drop_type: string | null
          group_id: string
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          mood_id: string
          mood_ids: string[] | null
          song_title: string
          spotify_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_name: string
          caption?: string | null
          challenge_id?: string | null
          challenge_winner?: boolean | null
          created_at?: string
          drop_type?: string | null
          group_id: string
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          mood_id: string
          mood_ids?: string[] | null
          song_title: string
          spotify_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_name?: string
          caption?: string | null
          challenge_id?: string | null
          challenge_winner?: boolean | null
          created_at?: string
          drop_type?: string | null
          group_id?: string
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          mood_id?: string
          mood_ids?: string[] | null
          song_title?: string
          spotify_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drops_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drops_mood_id_fkey"
            columns: ["mood_id"]
            isOneToOne: false
            referencedRelation: "moods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drops_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "creator_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drops_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          followed_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string
          followed_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string
          followed_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: []
      }
      global_settings: {
        Row: {
          created_at: string
          id: number
          premium_enabled: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          premium_enabled?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          premium_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      moods: {
        Row: {
          created_at: string
          created_by: string | null
          emoji: string
          id: string
          is_custom: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          emoji: string
          id?: string
          is_custom?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          emoji?: string
          id?: string
          is_custom?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "moods_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "creator_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moods_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_tracks: {
        Row: {
          added_by: string
          created_at: string
          drop_id: string
          id: string
          playlist_id: string
        }
        Insert: {
          added_by: string
          created_at?: string
          drop_id: string
          id?: string
          playlist_id: string
        }
        Update: {
          added_by?: string
          created_at?: string
          drop_id?: string
          id?: string
          playlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_tracks_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "creator_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_drop_id_fkey"
            columns: ["drop_id"]
            isOneToOne: false
            referencedRelation: "drops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_tracks_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlists: {
        Row: {
          contributors: string[] | null
          cover_art_url: string | null
          created_at: string
          created_by: string
          description: string | null
          follower_count: number
          id: string
          is_collab: boolean | null
          is_featured: boolean
          mood_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          contributors?: string[] | null
          cover_art_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          follower_count?: number
          id?: string
          is_collab?: boolean | null
          is_featured?: boolean
          mood_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          contributors?: string[] | null
          cover_art_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          follower_count?: number
          id?: string
          is_collab?: boolean | null
          is_featured?: boolean
          mood_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "creator_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlists_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlists_mood_id_fkey"
            columns: ["mood_id"]
            isOneToOne: false
            referencedRelation: "moods"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          flagged: boolean
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          flagged?: boolean
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          flagged?: boolean
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan: string
          status: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          drop_id: string
          id: string
          updated_at: string
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Insert: {
          created_at?: string
          drop_id: string
          id?: string
          updated_at?: string
          user_id: string
          vote_type: Database["public"]["Enums"]["vote_type"]
        }
        Update: {
          created_at?: string
          drop_id?: string
          id?: string
          updated_at?: string
          user_id?: string
          vote_type?: Database["public"]["Enums"]["vote_type"]
        }
        Relationships: [
          {
            foreignKeyName: "votes_drop_id_fkey"
            columns: ["drop_id"]
            isOneToOne: false
            referencedRelation: "drops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "creator_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      creator_leaderboard: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string | null
          upvote_count: number | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_delete_drop: {
        Args: { drop_id: string }
        Returns: undefined
      }
      admin_delete_mood: {
        Args: { mood_id: string }
        Returns: undefined
      }
      admin_delete_user: {
        Args: { user_id: string }
        Returns: undefined
      }
      admin_flag_user: {
        Args: { user_id: string; flag_status: boolean }
        Returns: undefined
      }
      can_user_create_drop: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      create_weekly_challenge: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      finalize_challenge: {
        Args: { challenge_id: string }
        Returns: undefined
      }
      get_admin_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          user_email: string
          username: string
          plan: string
          status: string
          current_period_end: string
          created_at: string
        }[]
      }
      get_all_drops_admin: {
        Args: {
          page_limit?: number
          page_offset?: number
          mood_filter?: string
        }
        Returns: {
          id: string
          song_title: string
          artist_name: string
          spotify_url: string
          caption: string
          mood_name: string
          mood_emoji: string
          username: string
          user_email: string
          vote_count: number
          created_at: string
        }[]
      }
      get_all_users_admin: {
        Args: { page_limit?: number; page_offset?: number }
        Returns: {
          id: string
          email: string
          username: string
          flagged: boolean
          created_at: string
          drops_count: number
          total_votes: number
        }[]
      }
      get_current_challenge: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          prompt: string
          mood_id: string
          mood_name: string
          mood_emoji: string
          start_at: string
          end_at: string
        }[]
      }
      get_grouped_drops_feed: {
        Args: {
          page_limit?: number
          page_offset?: number
          mood_filter?: string
        }
        Returns: {
          group_id: string
          spotify_url: string
          song_title: string
          artist_name: string
          caption: string
          created_at: string
          user_id: string
          username: string
          avatar_url: string
          moods: Json
          total_votes: number
          total_comments: number
          drop_ids: string[]
        }[]
      }
      get_hot_drops: {
        Args: { hours_back?: number; result_limit?: number }
        Returns: {
          id: string
          song_title: string
          artist_name: string
          spotify_url: string
          caption: string
          mood_name: string
          mood_emoji: string
          username: string
          vote_count: number
          created_at: string
        }[]
      }
      get_moods_admin: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          emoji: string
          is_custom: boolean
          created_by: string
          creator_username: string
          drops_count: number
          created_at: string
        }[]
      }
      get_nearby_drops: {
        Args: {
          user_lat: number
          user_lng: number
          radius_km?: number
          result_limit?: number
        }
        Returns: {
          id: string
          song_title: string
          artist_name: string
          spotify_url: string
          caption: string
          mood_name: string
          mood_emoji: string
          username: string
          distance_km: number
          created_at: string
        }[]
      }
      get_trending_moods: {
        Args: { hours_back?: number; result_limit?: number }
        Returns: {
          id: string
          name: string
          emoji: string
          drop_count: number
        }[]
      }
      get_user_profile_with_stats: {
        Args: { profile_user_id: string }
        Returns: {
          id: string
          username: string
          email: string
          avatar_url: string
          created_at: string
          followers_count: number
          following_count: number
          drops_count: number
        }[]
      }
      get_user_subscription: {
        Args: { check_user_id?: string }
        Returns: {
          id: string
          plan: string
          status: string
          current_period_end: string
          is_premium: boolean
        }[]
      }
      increment_daily_drop_count: {
        Args: { check_user_id?: string }
        Returns: undefined
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_user_premium: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      migrate_existing_drops_to_groups: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      vote_type: "up" | "down" | "fire" | "chill"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      vote_type: ["up", "down", "fire", "chill"],
    },
  },
} as const
