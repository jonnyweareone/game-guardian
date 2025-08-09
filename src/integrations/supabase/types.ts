export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          ai_summary: string
          alert_type: Database["public"]["Enums"]["alert_type"]
          child_id: string
          confidence_score: number | null
          conversation_id: string | null
          created_at: string
          device_id: string
          emotional_impact: string | null
          flagged_at: string
          follow_up_required: boolean | null
          id: string
          is_reviewed: boolean | null
          reviewed_at: string | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          social_context: string | null
          transcript_snippet: string | null
        }
        Insert: {
          ai_summary: string
          alert_type: Database["public"]["Enums"]["alert_type"]
          child_id: string
          confidence_score?: number | null
          conversation_id?: string | null
          created_at?: string
          device_id: string
          emotional_impact?: string | null
          flagged_at?: string
          follow_up_required?: boolean | null
          id?: string
          is_reviewed?: boolean | null
          reviewed_at?: string | null
          risk_level: Database["public"]["Enums"]["risk_level"]
          social_context?: string | null
          transcript_snippet?: string | null
        }
        Update: {
          ai_summary?: string
          alert_type?: Database["public"]["Enums"]["alert_type"]
          child_id?: string
          confidence_score?: number | null
          conversation_id?: string | null
          created_at?: string
          device_id?: string
          emotional_impact?: string | null
          flagged_at?: string
          follow_up_required?: boolean | null
          id?: string
          is_reviewed?: boolean | null
          reviewed_at?: string | null
          risk_level?: Database["public"]["Enums"]["risk_level"]
          social_context?: string | null
          transcript_snippet?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alerts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      app_groups: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_policies: {
        Row: {
          allowed: boolean | null
          app_id: string
          daily_limit_minutes: number | null
          enforced_hours: unknown[] | null
          id: string
          subject_id: string
          subject_type: string
          updated_at: string | null
        }
        Insert: {
          allowed?: boolean | null
          app_id: string
          daily_limit_minutes?: number | null
          enforced_hours?: unknown[] | null
          id?: string
          subject_id: string
          subject_type: string
          updated_at?: string | null
        }
        Update: {
          allowed?: boolean | null
          app_id?: string
          daily_limit_minutes?: number | null
          enforced_hours?: unknown[] | null
          id?: string
          subject_id?: string
          subject_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      child_app_groups: {
        Row: {
          action: Database["public"]["Enums"]["rule_action"]
          child_id: string
          created_at: string
          group_id: string
          id: string
          updated_at: string
        }
        Insert: {
          action: Database["public"]["Enums"]["rule_action"]
          child_id: string
          created_at?: string
          group_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["rule_action"]
          child_id?: string
          created_at?: string
          group_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_app_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "app_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      child_app_rules: {
        Row: {
          action: Database["public"]["Enums"]["rule_action"]
          app_id: string
          child_id: string
          created_at: string
          id: string
          minutes_per_day: number
          updated_at: string
        }
        Insert: {
          action: Database["public"]["Enums"]["rule_action"]
          app_id: string
          child_id: string
          created_at?: string
          id?: string
          minutes_per_day?: number
          updated_at?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["rule_action"]
          app_id?: string
          child_id?: string
          created_at?: string
          id?: string
          minutes_per_day?: number
          updated_at?: string
        }
        Relationships: []
      }
      child_dns_profiles: {
        Row: {
          bypass_reason: string | null
          bypass_until: string | null
          child_id: string
          created_at: string
          nextdns_config: string
          school_hours_enabled: boolean
          updated_at: string
        }
        Insert: {
          bypass_reason?: string | null
          bypass_until?: string | null
          child_id: string
          created_at?: string
          nextdns_config: string
          school_hours_enabled?: boolean
          updated_at?: string
        }
        Update: {
          bypass_reason?: string | null
          bypass_until?: string | null
          child_id?: string
          created_at?: string
          nextdns_config?: string
          school_hours_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      child_game_rules: {
        Row: {
          action: Database["public"]["Enums"]["rule_action"]
          child_id: string
          created_at: string
          game_id: string
          id: string
          minutes_per_day: number
          updated_at: string
        }
        Insert: {
          action: Database["public"]["Enums"]["rule_action"]
          child_id: string
          created_at?: string
          game_id: string
          id?: string
          minutes_per_day?: number
          updated_at?: string
        }
        Update: {
          action?: Database["public"]["Enums"]["rule_action"]
          child_id?: string
          created_at?: string
          game_id?: string
          id?: string
          minutes_per_day?: number
          updated_at?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          parent_id: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          name: string
          parent_id: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          parent_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conversation_summaries: {
        Row: {
          ai_summary: string
          child_id: string
          concerns: string[] | null
          confidence_score: number | null
          conversation_id: string
          created_at: string
          emotional_tone: string | null
          id: string
          key_topics: string[] | null
          positive_highlights: string[] | null
          social_interactions: Json | null
          summary_type: string
          talking_points: string[] | null
        }
        Insert: {
          ai_summary: string
          child_id: string
          concerns?: string[] | null
          confidence_score?: number | null
          conversation_id: string
          created_at?: string
          emotional_tone?: string | null
          id?: string
          key_topics?: string[] | null
          positive_highlights?: string[] | null
          social_interactions?: Json | null
          summary_type: string
          talking_points?: string[] | null
        }
        Update: {
          ai_summary?: string
          child_id?: string
          concerns?: string[] | null
          confidence_score?: number | null
          conversation_id?: string
          created_at?: string
          emotional_tone?: string | null
          id?: string
          key_topics?: string[] | null
          positive_highlights?: string[] | null
          social_interactions?: Json | null
          summary_type?: string
          talking_points?: string[] | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          child_id: string
          conversation_type: string
          created_at: string
          device_id: string
          id: string
          participants: string[] | null
          platform: string
          risk_assessment: string | null
          sentiment_score: number | null
          session_end: string | null
          session_start: string
          total_messages: number | null
          transcript: Json | null
          updated_at: string
        }
        Insert: {
          child_id: string
          conversation_type?: string
          created_at?: string
          device_id: string
          id?: string
          participants?: string[] | null
          platform: string
          risk_assessment?: string | null
          sentiment_score?: number | null
          session_end?: string | null
          session_start?: string
          total_messages?: number | null
          transcript?: Json | null
          updated_at?: string
        }
        Update: {
          child_id?: string
          conversation_type?: string
          created_at?: string
          device_id?: string
          id?: string
          participants?: string[] | null
          platform?: string
          risk_assessment?: string | null
          sentiment_score?: number | null
          session_end?: string | null
          session_start?: string
          total_messages?: number | null
          transcript?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      device_apps: {
        Row: {
          app_id: string
          category: string | null
          description: string | null
          device_code: string
          first_seen: string | null
          icon_url: string | null
          id: string
          last_seen: string | null
          name: string
          pegi_descriptors: string[] | null
          pegi_rating: number | null
          platform: string | null
          publisher: string | null
          website: string | null
        }
        Insert: {
          app_id: string
          category?: string | null
          description?: string | null
          device_code: string
          first_seen?: string | null
          icon_url?: string | null
          id?: string
          last_seen?: string | null
          name: string
          pegi_descriptors?: string[] | null
          pegi_rating?: number | null
          platform?: string | null
          publisher?: string | null
          website?: string | null
        }
        Update: {
          app_id?: string
          category?: string | null
          description?: string | null
          device_code?: string
          first_seen?: string | null
          icon_url?: string | null
          id?: string
          last_seen?: string | null
          name?: string
          pegi_descriptors?: string[] | null
          pegi_rating?: number | null
          platform?: string | null
          publisher?: string | null
          website?: string | null
        }
        Relationships: []
      }
      devices: {
        Row: {
          child_id: string | null
          created_at: string
          device_code: string
          device_name: string | null
          id: string
          is_active: boolean | null
          paired_at: string | null
          parent_id: string
          updated_at: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          device_code: string
          device_name?: string | null
          id?: string
          is_active?: boolean | null
          paired_at?: string | null
          parent_id: string
          updated_at?: string
        }
        Update: {
          child_id?: string | null
          created_at?: string
          device_code?: string
          device_name?: string | null
          id?: string
          is_active?: boolean | null
          paired_at?: string | null
          parent_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      parent_notifications: {
        Row: {
          action_required: boolean | null
          child_id: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          notification_type: string
          parent_id: string
          priority: string
          read_at: string | null
          related_alert_id: string | null
          related_conversation_id: string | null
          title: string
        }
        Insert: {
          action_required?: boolean | null
          child_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          notification_type: string
          parent_id: string
          priority?: string
          read_at?: string | null
          related_alert_id?: string | null
          related_conversation_id?: string | null
          title: string
        }
        Update: {
          action_required?: boolean | null
          child_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          notification_type?: string
          parent_id?: string
          priority?: string
          read_at?: string | null
          related_alert_id?: string | null
          related_conversation_id?: string | null
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_security: {
        Row: {
          created_at: string
          has_2fa: boolean
          id: string
          passkeys: Json
          recovery_codes: string[]
          totp_enabled: boolean
          totp_secret: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          has_2fa?: boolean
          id?: string
          passkeys?: Json
          recovery_codes?: string[]
          totp_enabled?: boolean
          totp_secret?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          has_2fa?: boolean
          id?: string
          passkeys?: Json
          recovery_codes?: string[]
          totp_enabled?: boolean
          totp_secret?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webauthn_challenges: {
        Row: {
          challenge: string
          created_at: string
          expires_at: string
          id: string
          type: string
          used: boolean
          user_id: string
        }
        Insert: {
          challenge: string
          created_at?: string
          expires_at?: string
          id?: string
          type: string
          used?: boolean
          user_id: string
        }
        Update: {
          challenge?: string
          created_at?: string
          expires_at?: string
          id?: string
          type?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      webauthn_credentials: {
        Row: {
          backed_up: boolean
          counter: number
          created_at: string
          credential_id: string
          device_type: string | null
          id: string
          public_key: string
          transports: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          backed_up?: boolean
          counter?: number
          created_at?: string
          credential_id: string
          device_type?: string | null
          id?: string
          public_key: string
          transports?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          backed_up?: boolean
          counter?: number
          created_at?: string
          credential_id?: string
          device_type?: string | null
          id?: string
          public_key?: string
          transports?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      alert_type:
        | "bullying"
        | "grooming"
        | "explicit_language"
        | "violent_content"
        | "inappropriate_sharing"
        | "cyberbullying"
      risk_level: "low" | "medium" | "high" | "critical"
      rule_action: "allow" | "block" | "timebox"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_type: [
        "bullying",
        "grooming",
        "explicit_language",
        "violent_content",
        "inappropriate_sharing",
        "cyberbullying",
      ],
      risk_level: ["low", "medium", "high", "critical"],
      rule_action: ["allow", "block", "timebox"],
    },
  },
} as const
