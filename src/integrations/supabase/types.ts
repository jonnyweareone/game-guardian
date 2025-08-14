export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activation_codes: {
        Row: {
          activation_token: string
          code: string
          created_at: string
          device_id: string
          device_jwt: string | null
          expires_at: string
          id: string
          profile_id: string | null
          status: string
        }
        Insert: {
          activation_token: string
          code: string
          created_at?: string
          device_id: string
          device_jwt?: string | null
          expires_at?: string
          id?: string
          profile_id?: string | null
          status?: string
        }
        Update: {
          activation_token?: string
          code?: string
          created_at?: string
          device_id?: string
          device_jwt?: string | null
          expires_at?: string
          id?: string
          profile_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "activation_codes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activation_codes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
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
            foreignKeyName: "alerts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["device_id"]
          },
          {
            foreignKeyName: "alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "vw_admin_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      app_activity: {
        Row: {
          app_id: string
          child_id: string | null
          created_at: string
          device_id: string
          duration_seconds: number | null
          id: string
          session_end: string | null
          session_start: string
        }
        Insert: {
          app_id: string
          child_id?: string | null
          created_at?: string
          device_id: string
          duration_seconds?: number | null
          id?: string
          session_end?: string | null
          session_start?: string
        }
        Update: {
          app_id?: string
          child_id?: string | null
          created_at?: string
          device_id?: string
          duration_seconds?: number | null
          id?: string
          session_end?: string | null
          session_start?: string
        }
        Relationships: []
      }
      app_catalog: {
        Row: {
          age_max: number | null
          age_min: number | null
          category: string
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          is_essential: boolean | null
          name: string
          pegi_descriptors: string[] | null
          pegi_rating: number | null
          platform: string | null
          publisher: string | null
          updated_at: string
          version: string | null
          website: string | null
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          category: string
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id: string
          is_active?: boolean | null
          is_essential?: boolean | null
          name: string
          pegi_descriptors?: string[] | null
          pegi_rating?: number | null
          platform?: string | null
          publisher?: string | null
          updated_at?: string
          version?: string | null
          website?: string | null
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          category?: string
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          is_essential?: boolean | null
          name?: string
          pegi_descriptors?: string[] | null
          pegi_rating?: number | null
          platform?: string | null
          publisher?: string | null
          updated_at?: string
          version?: string | null
          website?: string | null
        }
        Relationships: []
      }
      app_category_policies: {
        Row: {
          allowed: boolean
          category: string
          created_at: string
          daily_limit_minutes: number | null
          enforced_hours: string[] | null
          id: string
          subject_id: string
          subject_type: string
          updated_at: string
        }
        Insert: {
          allowed?: boolean
          category: string
          created_at?: string
          daily_limit_minutes?: number | null
          enforced_hours?: string[] | null
          id?: string
          subject_id: string
          subject_type: string
          updated_at?: string
        }
        Update: {
          allowed?: boolean
          category?: string
          created_at?: string
          daily_limit_minutes?: number | null
          enforced_hours?: string[] | null
          id?: string
          subject_id?: string
          subject_type?: string
          updated_at?: string
        }
        Relationships: []
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
      audit_log: {
        Row: {
          action: string | null
          actor: string | null
          detail: Json | null
          id: number
          target: string | null
          ts: string
        }
        Insert: {
          action?: string | null
          actor?: string | null
          detail?: Json | null
          id?: number
          target?: string | null
          ts?: string
        }
        Update: {
          action?: string | null
          actor?: string | null
          detail?: Json | null
          id?: number
          target?: string | null
          ts?: string
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
      child_app_selections: {
        Row: {
          app_id: string
          child_id: string
          id: string
          selected: boolean
          updated_at: string
        }
        Insert: {
          app_id: string
          child_id: string
          id?: string
          selected?: boolean
          updated_at?: string
        }
        Update: {
          app_id?: string
          child_id?: string
          id?: string
          selected?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_app_selections_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "app_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_app_selections_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_child_app_selections"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "child_app_selections_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_app_selections_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
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
      child_time_policies: {
        Row: {
          bedtime: unknown | null
          child_id: string
          created_at: string | null
          daily_total_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          bedtime?: unknown | null
          child_id: string
          created_at?: string | null
          daily_total_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          bedtime?: unknown | null
          child_id?: string
          created_at?: string | null
          daily_total_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_time_policies_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_time_policies_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      child_time_tokens: {
        Row: {
          child_id: string
          created_at: string
          delta_minutes: number
          id: string
          reason: string | null
        }
        Insert: {
          child_id: string
          created_at?: string
          delta_minutes: number
          id?: string
          reason?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string
          delta_minutes?: number
          id?: string
          reason?: string | null
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
      clips: {
        Row: {
          child_id: string | null
          created_at: string
          description: string | null
          device_id: string | null
          id: string
          parent_id: string
          source_url: string | null
          status: Database["public"]["Enums"]["clip_status"]
          thumbnail_url: string | null
          title: string | null
          updated_at: string
          youtube_url: string | null
          youtube_video_id: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          description?: string | null
          device_id?: string | null
          id?: string
          parent_id: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["clip_status"]
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string
          description?: string | null
          device_id?: string | null
          id?: string
          parent_id?: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["clip_status"]
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "conversations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      device_activations: {
        Row: {
          consent_ip: unknown | null
          consent_user_agent: string | null
          consent_version: string
          created_at: string
          device_id: string
          id: string
          user_id: string
        }
        Insert: {
          consent_ip?: unknown | null
          consent_user_agent?: string | null
          consent_version: string
          created_at?: string
          device_id: string
          id?: string
          user_id: string
        }
        Update: {
          consent_ip?: unknown | null
          consent_user_agent?: string | null
          consent_version?: string
          created_at?: string
          device_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_activations_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_activations_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["device_id"]
          },
          {
            foreignKeyName: "device_activations_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "vw_admin_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_activations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
          last_used_at: string | null
          name: string
          pegi_descriptors: string[] | null
          pegi_rating: number | null
          platform: string | null
          publisher: string | null
          source: string | null
          version: string | null
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
          last_used_at?: string | null
          name: string
          pegi_descriptors?: string[] | null
          pegi_rating?: number | null
          platform?: string | null
          publisher?: string | null
          source?: string | null
          version?: string | null
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
          last_used_at?: string | null
          name?: string
          pegi_descriptors?: string[] | null
          pegi_rating?: number | null
          platform?: string | null
          publisher?: string | null
          source?: string | null
          version?: string | null
          website?: string | null
        }
        Relationships: []
      }
      device_child_assignments: {
        Row: {
          child_id: string
          created_at: string | null
          device_id: string
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          device_id: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          device_id?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_child_assignments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_child_assignments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "device_child_assignments_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_child_assignments_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["device_id"]
          },
          {
            foreignKeyName: "device_child_assignments_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "vw_admin_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      device_commands: {
        Row: {
          cmd: string
          created_at: string
          device_id: string
          id: string
          payload: Json
          processed_at: string | null
          status: string
        }
        Insert: {
          cmd: string
          created_at?: string
          device_id: string
          id?: string
          payload?: Json
          processed_at?: string | null
          status?: string
        }
        Update: {
          cmd?: string
          created_at?: string
          device_id?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      device_config: {
        Row: {
          device_id: string
          eula_version: string | null
          factory_reset: boolean
          features: Json
          firmware_update: string | null
          manifest_url: string | null
          theme: Json
          ui_update: string | null
          updated_at: string
        }
        Insert: {
          device_id: string
          eula_version?: string | null
          factory_reset?: boolean
          features?: Json
          firmware_update?: string | null
          manifest_url?: string | null
          theme?: Json
          ui_update?: string | null
          updated_at?: string
        }
        Update: {
          device_id?: string
          eula_version?: string | null
          factory_reset?: boolean
          features?: Json
          firmware_update?: string | null
          manifest_url?: string | null
          theme?: Json
          ui_update?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_config_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: true
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_config_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: true
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["device_id"]
          },
          {
            foreignKeyName: "device_config_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: true
            referencedRelation: "vw_admin_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      device_heartbeats: {
        Row: {
          battery: number | null
          child_id: string | null
          created_at: string
          device_id: string
          id: string
          ip_address: string | null
          ssid: string | null
        }
        Insert: {
          battery?: number | null
          child_id?: string | null
          created_at?: string
          device_id: string
          id?: string
          ip_address?: string | null
          ssid?: string | null
        }
        Update: {
          battery?: number | null
          child_id?: string | null
          created_at?: string
          device_id?: string
          id?: string
          ip_address?: string | null
          ssid?: string | null
        }
        Relationships: []
      }
      devices: {
        Row: {
          build_id: string | null
          child_id: string | null
          created_at: string
          device_code: string
          device_jwt: string | null
          device_name: string | null
          firmware_version: string | null
          id: string
          is_active: boolean | null
          kernel_version: string | null
          last_ip: unknown | null
          last_refresh_ip: unknown | null
          last_seen: string | null
          last_token_issued_at: string | null
          location: Json | null
          model: string | null
          os_version: string | null
          paired_at: string | null
          parent_id: string
          refresh_secret_hash: string | null
          status: string | null
          ui_version: string | null
          updated_at: string
        }
        Insert: {
          build_id?: string | null
          child_id?: string | null
          created_at?: string
          device_code: string
          device_jwt?: string | null
          device_name?: string | null
          firmware_version?: string | null
          id?: string
          is_active?: boolean | null
          kernel_version?: string | null
          last_ip?: unknown | null
          last_refresh_ip?: unknown | null
          last_seen?: string | null
          last_token_issued_at?: string | null
          location?: Json | null
          model?: string | null
          os_version?: string | null
          paired_at?: string | null
          parent_id: string
          refresh_secret_hash?: string | null
          status?: string | null
          ui_version?: string | null
          updated_at?: string
        }
        Update: {
          build_id?: string | null
          child_id?: string | null
          created_at?: string
          device_code?: string
          device_jwt?: string | null
          device_name?: string | null
          firmware_version?: string | null
          id?: string
          is_active?: boolean | null
          kernel_version?: string | null
          last_ip?: unknown | null
          last_refresh_ip?: unknown | null
          last_seen?: string | null
          last_token_issued_at?: string | null
          location?: Json | null
          model?: string | null
          os_version?: string | null
          paired_at?: string | null
          parent_id?: string
          refresh_secret_hash?: string | null
          status?: string | null
          ui_version?: string | null
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
            foreignKeyName: "devices_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
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
      identity_verifications: {
        Row: {
          address_lat: number | null
          address_lng: number | null
          created_at: string
          id: string
          id_check_completed: boolean
          likeness_check_completed: boolean
          provider: string | null
          provider_reference: string | null
          status: string
          updated_at: string
          user_id: string
          verified_address_line1: string | null
          verified_address_line2: string | null
          verified_at: string | null
          verified_city: string | null
          verified_country: string | null
          verified_postal_code: string | null
          verified_state: string | null
        }
        Insert: {
          address_lat?: number | null
          address_lng?: number | null
          created_at?: string
          id?: string
          id_check_completed?: boolean
          likeness_check_completed?: boolean
          provider?: string | null
          provider_reference?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verified_address_line1?: string | null
          verified_address_line2?: string | null
          verified_at?: string | null
          verified_city?: string | null
          verified_country?: string | null
          verified_postal_code?: string | null
          verified_state?: string | null
        }
        Update: {
          address_lat?: number | null
          address_lng?: number | null
          created_at?: string
          id?: string
          id_check_completed?: boolean
          likeness_check_completed?: boolean
          provider?: string | null
          provider_reference?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verified_address_line1?: string | null
          verified_address_line2?: string | null
          verified_at?: string | null
          verified_city?: string | null
          verified_country?: string | null
          verified_postal_code?: string | null
          verified_state?: string | null
        }
        Relationships: []
      }
      location_match_results: {
        Row: {
          created_at: string
          details: Json | null
          device_id: string
          distance_meters: number | null
          id: string
          matched: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          device_id: string
          distance_meters?: number | null
          id?: string
          matched: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          device_id?: string
          distance_meters?: number | null
          id?: string
          matched?: boolean
          user_id?: string
        }
        Relationships: []
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
          is_admin: boolean | null
          stripe_customer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_admin?: boolean | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_admin?: boolean | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_id?: string
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
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan: string
          status: string
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ui_manifests: {
        Row: {
          created_at: string
          manifest: Json
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          manifest?: Json
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          manifest?: Json
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ui_manifests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ui_manifests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      ui_themes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          theme_data: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          theme_data?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          theme_data?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          intent: string
          notes: string | null
          product: string
          source: string | null
          status: string
          updated_at: string
          user_id: string | null
          utm: Json
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          intent?: string
          notes?: string | null
          product: string
          source?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          utm?: Json
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          intent?: string
          notes?: string | null
          product?: string
          source?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          utm?: Json
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
      v_child_app_selections: {
        Row: {
          app_age_rating: number | null
          app_category: string | null
          app_description: string | null
          app_id: string | null
          app_is_essential: boolean | null
          app_name: string | null
          child_id: string | null
          id: string | null
          selected: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "child_app_selections_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_app_selections_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      v_effective_app_policy: {
        Row: {
          allowed: boolean | null
          app_id: string | null
          category: string | null
          child_id: string | null
          daily_limit_minutes: number | null
          device_id: string | null
          enforced_hours: string[] | null
          icon_url: string | null
          is_active: boolean | null
          name: string | null
        }
        Relationships: []
      }
      vw_admin_devices: {
        Row: {
          active_child_id: string | null
          build_id: string | null
          child_id: string | null
          child_name: string | null
          created_at: string | null
          current_period_end: string | null
          device_code: string | null
          device_jwt: string | null
          device_name: string | null
          firmware_version: string | null
          id: string | null
          is_active: boolean | null
          kernel_version: string | null
          last_ip: unknown | null
          last_seen: string | null
          location: Json | null
          model: string | null
          os_version: string | null
          paired_at: string | null
          parent_email: string | null
          parent_id: string | null
          parent_name: string | null
          status: string | null
          subscription_plan: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          ui_version: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_child_assignments_child_id_fkey"
            columns: ["active_child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_child_assignments_child_id_fkey"
            columns: ["active_child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "devices_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
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
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      is_parent_of_child: {
        Args: { _child: string }
        Returns: boolean
      }
      mark_devices_offline_if_stale: {
        Args: { grace_seconds: number }
        Returns: undefined
      }
      rpc_assign_child_to_device: {
        Args: { _child: string; _device: string; _is_active?: boolean }
        Returns: {
          child_id: string
          created_at: string | null
          device_id: string
          id: string
          is_active: boolean | null
          updated_at: string | null
        }
      }
      rpc_issue_command: {
        Args: { _cmd: string; _device: string; _payload?: Json }
        Returns: {
          cmd: string
          created_at: string
          device_id: string
          id: string
          payload: Json
          processed_at: string | null
          status: string
        }
      }
      rpc_set_active_child: {
        Args: { _child: string; _device: string }
        Returns: boolean
      }
    }
    Enums: {
      alert_type:
        | "bullying"
        | "grooming"
        | "explicit_language"
        | "violent_content"
        | "inappropriate_sharing"
        | "cyberbullying"
      app_role: "admin" | "moderator" | "user"
      clip_status:
        | "pending"
        | "approved"
        | "declined"
        | "uploading"
        | "uploaded"
        | "failed"
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
      app_role: ["admin", "moderator", "user"],
      clip_status: [
        "pending",
        "approved",
        "declined",
        "uploading",
        "uploaded",
        "failed",
      ],
      risk_level: ["low", "medium", "high", "critical"],
      rule_action: ["allow", "block", "timebox"],
    },
  },
} as const
