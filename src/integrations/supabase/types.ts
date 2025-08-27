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
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
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
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
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
          cross_platform_progress: string | null
          description: string | null
          description_long: string | null
          hero_url: string | null
          icon_url: string | null
          id: string
          install_path_desktop: string | null
          install_path_mobile: string | null
          is_active: boolean | null
          is_essential: boolean | null
          is_mobile_compatible: boolean | null
          name: string
          pegi_descriptors: string[] | null
          pegi_rating: number | null
          platform: string | null
          publisher: string | null
          type: string | null
          updated_at: string
          version: string | null
          website: string | null
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          category: string
          created_at?: string
          cross_platform_progress?: string | null
          description?: string | null
          description_long?: string | null
          hero_url?: string | null
          icon_url?: string | null
          id: string
          install_path_desktop?: string | null
          install_path_mobile?: string | null
          is_active?: boolean | null
          is_essential?: boolean | null
          is_mobile_compatible?: boolean | null
          name: string
          pegi_descriptors?: string[] | null
          pegi_rating?: number | null
          platform?: string | null
          publisher?: string | null
          type?: string | null
          updated_at?: string
          version?: string | null
          website?: string | null
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          category?: string
          created_at?: string
          cross_platform_progress?: string | null
          description?: string | null
          description_long?: string | null
          hero_url?: string | null
          icon_url?: string | null
          id?: string
          install_path_desktop?: string | null
          install_path_mobile?: string | null
          is_active?: boolean | null
          is_essential?: boolean | null
          is_mobile_compatible?: boolean | null
          name?: string
          pegi_descriptors?: string[] | null
          pegi_rating?: number | null
          platform?: string | null
          publisher?: string | null
          type?: string | null
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
      app_versions: {
        Row: {
          app_id: string
          created_at: string | null
          id: string
          max_os: string | null
          min_os: string | null
          package_hash_sha256: string | null
          package_url: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          release_channel:
            | Database["public"]["Enums"]["release_channel_type"]
            | null
          updated_at: string | null
          version: string
        }
        Insert: {
          app_id: string
          created_at?: string | null
          id?: string
          max_os?: string | null
          min_os?: string | null
          package_hash_sha256?: string | null
          package_url?: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          release_channel?:
            | Database["public"]["Enums"]["release_channel_type"]
            | null
          updated_at?: string | null
          version: string
        }
        Update: {
          app_id?: string
          created_at?: string | null
          id?: string
          max_os?: string | null
          min_os?: string | null
          package_hash_sha256?: string | null
          package_url?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          release_channel?:
            | Database["public"]["Enums"]["release_channel_type"]
            | null
          updated_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_versions_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "app_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_versions_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_child_app_selections"
            referencedColumns: ["app_id"]
          },
        ]
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
      book_chapter_images: {
        Row: {
          book_id: string
          chapter_id: string
          cost_estimate_cents: number | null
          created_at: string | null
          height: number | null
          id: string
          image_url: string
          negative_prompt: string | null
          prompt: string | null
          provider: string | null
          seed: number | null
          slot: number
          width: number | null
        }
        Insert: {
          book_id: string
          chapter_id: string
          cost_estimate_cents?: number | null
          created_at?: string | null
          height?: number | null
          id?: string
          image_url: string
          negative_prompt?: string | null
          prompt?: string | null
          provider?: string | null
          seed?: number | null
          slot: number
          width?: number | null
        }
        Update: {
          book_id?: string
          chapter_id?: string
          cost_estimate_cents?: number | null
          created_at?: string | null
          height?: number | null
          id?: string
          image_url?: string
          negative_prompt?: string | null
          prompt?: string | null
          provider?: string | null
          seed?: number | null
          slot?: number
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "book_chapter_images_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_chapter_images_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "book_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      book_chapters: {
        Row: {
          book_id: string
          chapter_hash: string | null
          chapter_index: number
          chapter_title: string | null
          created_at: string | null
          first_page_index: number | null
          generated_images: number
          id: string
          last_page_index: number | null
          max_images: number
        }
        Insert: {
          book_id: string
          chapter_hash?: string | null
          chapter_index: number
          chapter_title?: string | null
          created_at?: string | null
          first_page_index?: number | null
          generated_images?: number
          id?: string
          last_page_index?: number | null
          max_images?: number
        }
        Update: {
          book_id?: string
          chapter_hash?: string | null
          chapter_index?: number
          chapter_title?: string | null
          created_at?: string | null
          first_page_index?: number | null
          generated_images?: number
          id?: string
          last_page_index?: number | null
          max_images?: number
        }
        Relationships: [
          {
            foreignKeyName: "book_chapters_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_ingests: {
        Row: {
          book_id: string | null
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          source_url: string | null
          started_at: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          book_id?: string | null
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          source_url?: string | null
          started_at?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          book_id?: string | null
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          source_url?: string | null
          started_at?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      book_pages: {
        Row: {
          book_id: string
          chapter_index: number | null
          chapter_title: string | null
          content: string
          created_at: string
          id: string
          illustration_caption: string | null
          illustration_inline_at: number | null
          illustration_prompt: string | null
          illustration_url: string | null
          image_url: string | null
          is_front_matter: boolean
          page_index: number
          tokens: Json | null
          tts_segments: Json | null
          voice_spans: Json | null
        }
        Insert: {
          book_id: string
          chapter_index?: number | null
          chapter_title?: string | null
          content: string
          created_at?: string
          id?: string
          illustration_caption?: string | null
          illustration_inline_at?: number | null
          illustration_prompt?: string | null
          illustration_url?: string | null
          image_url?: string | null
          is_front_matter?: boolean
          page_index: number
          tokens?: Json | null
          tts_segments?: Json | null
          voice_spans?: Json | null
        }
        Update: {
          book_id?: string
          chapter_index?: number | null
          chapter_title?: string | null
          content?: string
          created_at?: string
          id?: string
          illustration_caption?: string | null
          illustration_inline_at?: number | null
          illustration_prompt?: string | null
          illustration_url?: string | null
          image_url?: string | null
          is_front_matter?: boolean
          page_index?: number
          tokens?: Json | null
          tts_segments?: Json | null
          voice_spans?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "book_pages_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_topics: {
        Row: {
          book_id: string
          topic_id: string
        }
        Insert: {
          book_id: string
          topic_id: string
        }
        Update: {
          book_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_topics_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "curriculum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          age_max: number | null
          age_min: number | null
          analysis_at: string | null
          analysis_done: boolean | null
          analysis_mode: string | null
          author: string | null
          authors: string[] | null
          category: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          download_epub_url: string | null
          download_pdf_url: string | null
          gutenberg_id: number | null
          has_audio: boolean | null
          id: string
          images_generated: boolean | null
          images_provider: string | null
          ingested: boolean
          ingested_at: string | null
          is_fiction: boolean | null
          ks: string | null
          language: string | null
          level_tags: string[] | null
          license: string | null
          pages: number | null
          published_year: number | null
          read_online_url: string | null
          source: string | null
          source_id: string | null
          source_url: string | null
          started_at: string | null
          subject: string | null
          subjects: string[] | null
          title: string
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          analysis_at?: string | null
          analysis_done?: boolean | null
          analysis_mode?: string | null
          author?: string | null
          authors?: string[] | null
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          download_epub_url?: string | null
          download_pdf_url?: string | null
          gutenberg_id?: number | null
          has_audio?: boolean | null
          id?: string
          images_generated?: boolean | null
          images_provider?: string | null
          ingested?: boolean
          ingested_at?: string | null
          is_fiction?: boolean | null
          ks?: string | null
          language?: string | null
          level_tags?: string[] | null
          license?: string | null
          pages?: number | null
          published_year?: number | null
          read_online_url?: string | null
          source?: string | null
          source_id?: string | null
          source_url?: string | null
          started_at?: string | null
          subject?: string | null
          subjects?: string[] | null
          title: string
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          analysis_at?: string | null
          analysis_done?: boolean | null
          analysis_mode?: string | null
          author?: string | null
          authors?: string[] | null
          category?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          download_epub_url?: string | null
          download_pdf_url?: string | null
          gutenberg_id?: number | null
          has_audio?: boolean | null
          id?: string
          images_generated?: boolean | null
          images_provider?: string | null
          ingested?: boolean
          ingested_at?: string | null
          is_fiction?: boolean | null
          ks?: string | null
          language?: string | null
          level_tags?: string[] | null
          license?: string | null
          pages?: number | null
          published_year?: number | null
          read_online_url?: string | null
          source?: string | null
          source_id?: string | null
          source_url?: string | null
          started_at?: string | null
          subject?: string | null
          subjects?: string[] | null
          title?: string
        }
        Relationships: []
      }
      challenge_completions: {
        Row: {
          child_id: string
          created_at: string
          daily_challenge_id: string
          event_id: string | null
          id: string
          points_awarded: number
        }
        Insert: {
          child_id: string
          created_at?: string
          daily_challenge_id: string
          event_id?: string | null
          id?: string
          points_awarded: number
        }
        Update: {
          child_id?: string
          created_at?: string
          daily_challenge_id?: string
          event_id?: string | null
          id?: string
          points_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenge_completions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_completions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "challenge_completions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "challenge_completions_daily_challenge_id_fkey"
            columns: ["daily_challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_templates: {
        Row: {
          bonus: Json
          created_at: string
          description: string
          id: string
          item_slug: string
          points: number
          requirement: Json
          subject: string
          title: string
        }
        Insert: {
          bonus?: Json
          created_at?: string
          description: string
          id?: string
          item_slug: string
          points?: number
          requirement: Json
          subject: string
          title: string
        }
        Update: {
          bonus?: Json
          created_at?: string
          description?: string
          id?: string
          item_slug?: string
          points?: number
          requirement?: Json
          subject?: string
          title?: string
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
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
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
      child_bookshelf: {
        Row: {
          book_id: string
          child_id: string
          finished_at: string | null
          last_location: Json | null
          progress: number | null
          saved_offline: boolean | null
          started_at: string | null
          status: Database["public"]["Enums"]["bookshelf_status"]
        }
        Insert: {
          book_id: string
          child_id: string
          finished_at?: string | null
          last_location?: Json | null
          progress?: number | null
          saved_offline?: boolean | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["bookshelf_status"]
        }
        Update: {
          book_id?: string
          child_id?: string
          finished_at?: string | null
          last_location?: Json | null
          progress?: number | null
          saved_offline?: boolean | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["bookshelf_status"]
        }
        Relationships: [
          {
            foreignKeyName: "child_bookshelf_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
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
      child_homework_links: {
        Row: {
          child_id: string
          created_at: string | null
          due_date: string | null
          id: string
          subject: string | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          child_id: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          subject?: string | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          child_id?: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          subject?: string | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_homework_links_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_homework_links_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_homework_links_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      child_interests: {
        Row: {
          child_id: string
          created_at: string | null
          id: string
          interest_id: string
        }
        Insert: {
          child_id: string
          created_at?: string | null
          id?: string
          interest_id: string
        }
        Update: {
          child_id?: string
          created_at?: string | null
          id?: string
          interest_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_interests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_interests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_interests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_interests_interest_id_fkey"
            columns: ["interest_id"]
            isOneToOne: false
            referencedRelation: "interests"
            referencedColumns: ["id"]
          },
        ]
      }
      child_listening_state: {
        Row: {
          book_id: string | null
          child_id: string
          is_listening: boolean
          session_id: string | null
          started_at: string | null
          updated_at: string
        }
        Insert: {
          book_id?: string | null
          child_id: string
          is_listening?: boolean
          session_id?: string | null
          started_at?: string | null
          updated_at?: string
        }
        Update: {
          book_id?: string | null
          child_id?: string
          is_listening?: boolean
          session_id?: string | null
          started_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_listening_state_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_listening_state_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_listening_state_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_listening_state_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_listening_state_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "child_reading_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      child_page_progress: {
        Row: {
          book_id: string
          child_id: string
          coins_awarded: number
          created_at: string
          id: string
          page_index: number
          read_percent: number
          updated_at: string
        }
        Insert: {
          book_id: string
          child_id: string
          coins_awarded?: number
          created_at?: string
          id?: string
          page_index: number
          read_percent?: number
          updated_at?: string
        }
        Update: {
          book_id?: string
          child_id?: string
          coins_awarded?: number
          created_at?: string
          id?: string
          page_index?: number
          read_percent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_page_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_page_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_page_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_page_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      child_reading_sessions: {
        Row: {
          book_id: string
          child_id: string
          created_at: string
          current_locator: string | null
          ended_at: string | null
          id: string
          started_at: string
          total_seconds: number
          updated_at: string
        }
        Insert: {
          book_id: string
          child_id: string
          created_at?: string
          current_locator?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string
          total_seconds?: number
          updated_at?: string
        }
        Update: {
          book_id?: string
          child_id?: string
          created_at?: string
          current_locator?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string
          total_seconds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_reading_sessions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_reading_sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_reading_sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_reading_sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      child_reading_timeline: {
        Row: {
          book_id: string
          child_id: string
          created_at: string
          event_type: string
          id: string
          session_id: string | null
        }
        Insert: {
          book_id: string
          child_id: string
          created_at?: string
          event_type: string
          id?: string
          session_id?: string | null
        }
        Update: {
          book_id?: string
          child_id?: string
          created_at?: string
          event_type?: string
          id?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_reading_timeline_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_reading_timeline_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_reading_timeline_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_reading_timeline_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "child_reading_timeline_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "child_reading_sessions"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
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
      child_tts_preferences: {
        Row: {
          child_id: string
          created_at: string
          id: string
          multi_voice: boolean
          updated_at: string
          voice_style: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          multi_voice?: boolean
          updated_at?: string
          voice_style?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          multi_voice?: boolean
          updated_at?: string
          voice_style?: string
        }
        Relationships: []
      }
      children: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string
          dob: string | null
          id: string
          name: string
          parent_id: string
          updated_at: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          dob?: string | null
          id?: string
          name: string
          parent_id: string
          updated_at?: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string
          dob?: string | null
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
      content_items: {
        Row: {
          created_at: string
          id: string
          kind: string
          launch_url: string
          meta: Json
          slug: string
          subject: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          launch_url: string
          meta?: Json
          slug: string
          subject: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          launch_url?: string
          meta?: Json
          slug?: string
          subject?: string
          title?: string
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
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
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
      curriculum_topics: {
        Row: {
          id: string
          keywords: string[] | null
          phase: string
          slug: string
          subject_area: string
          topic: string
        }
        Insert: {
          id?: string
          keywords?: string[] | null
          phase?: string
          slug: string
          subject_area: string
          topic: string
        }
        Update: {
          id?: string
          keywords?: string[] | null
          phase?: string
          slug?: string
          subject_area?: string
          topic?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          created_at: string
          id: string
          template_id: string
        }
        Insert: {
          challenge_date: string
          created_at?: string
          id?: string
          template_id: string
        }
        Update: {
          challenge_date?: string
          created_at?: string
          id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenges_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "challenge_templates"
            referencedColumns: ["id"]
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
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
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
      device_job_logs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          log: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          log: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          log?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_job_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "device_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      device_jobs: {
        Row: {
          attempts: number
          created_at: string
          device_id: string
          id: string
          payload: Json
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          device_id: string
          id?: string
          payload?: Json
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          device_id?: string
          id?: string
          payload?: Json
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_jobs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_jobs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["device_id"]
          },
          {
            foreignKeyName: "device_jobs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "vw_admin_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      device_pair_tokens: {
        Row: {
          child_id: string
          created_at: string
          expires_at: string
          id: string
          kind: Database["public"]["Enums"]["device_kind"]
          platform: string | null
          token: string
          used_at: string | null
        }
        Insert: {
          child_id: string
          created_at?: string
          expires_at: string
          id?: string
          kind?: Database["public"]["Enums"]["device_kind"]
          platform?: string | null
          token: string
          used_at?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["device_kind"]
          platform?: string | null
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_pair_tokens_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_pair_tokens_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "device_pair_tokens_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      devices: {
        Row: {
          battery: number | null
          build_id: string | null
          child_id: string | null
          created_at: string
          deleted_at: string | null
          device_code: string
          device_jwt: string | null
          device_name: string | null
          firmware_version: string | null
          iccid: string | null
          id: string
          is_active: boolean | null
          kernel_version: string | null
          kind: Database["public"]["Enums"]["device_kind"]
          last_ip: unknown | null
          last_refresh_ip: unknown | null
          last_seen: string | null
          last_token_issued_at: string | null
          location: Json | null
          mdm_enrolled: boolean | null
          model: string | null
          nextdns_profile_id: string | null
          os_version: string | null
          paired_at: string | null
          parent_id: string
          platform: string | null
          refresh_secret_hash: string | null
          status: string | null
          ui_version: string | null
          updated_at: string
          vpn_active: boolean | null
        }
        Insert: {
          battery?: number | null
          build_id?: string | null
          child_id?: string | null
          created_at?: string
          deleted_at?: string | null
          device_code: string
          device_jwt?: string | null
          device_name?: string | null
          firmware_version?: string | null
          iccid?: string | null
          id?: string
          is_active?: boolean | null
          kernel_version?: string | null
          kind?: Database["public"]["Enums"]["device_kind"]
          last_ip?: unknown | null
          last_refresh_ip?: unknown | null
          last_seen?: string | null
          last_token_issued_at?: string | null
          location?: Json | null
          mdm_enrolled?: boolean | null
          model?: string | null
          nextdns_profile_id?: string | null
          os_version?: string | null
          paired_at?: string | null
          parent_id: string
          platform?: string | null
          refresh_secret_hash?: string | null
          status?: string | null
          ui_version?: string | null
          updated_at?: string
          vpn_active?: boolean | null
        }
        Update: {
          battery?: number | null
          build_id?: string | null
          child_id?: string | null
          created_at?: string
          deleted_at?: string | null
          device_code?: string
          device_jwt?: string | null
          device_name?: string | null
          firmware_version?: string | null
          iccid?: string | null
          id?: string
          is_active?: boolean | null
          kernel_version?: string | null
          kind?: Database["public"]["Enums"]["device_kind"]
          last_ip?: unknown | null
          last_refresh_ip?: unknown | null
          last_seen?: string | null
          last_token_issued_at?: string | null
          location?: Json | null
          mdm_enrolled?: boolean | null
          model?: string | null
          nextdns_profile_id?: string | null
          os_version?: string | null
          paired_at?: string | null
          parent_id?: string
          platform?: string | null
          refresh_secret_hash?: string | null
          status?: string | null
          ui_version?: string | null
          updated_at?: string
          vpn_active?: boolean | null
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
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
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
      education_profiles: {
        Row: {
          child_id: string
          created_at: string | null
          key_stage: string | null
          school_id: string | null
          updated_at: string | null
          year_group: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          key_stage?: string | null
          school_id?: string | null
          updated_at?: string | null
          year_group?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          key_stage?: string | null
          school_id?: string | null
          updated_at?: string | null
          year_group?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "education_profiles_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "education_profiles_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "education_profiles_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      game_events: {
        Row: {
          child_id: string
          created_at: string
          event_type: string
          game: string
          id: string
          payload: Json
        }
        Insert: {
          child_id: string
          created_at?: string
          event_type: string
          game: string
          id?: string
          payload?: Json
        }
        Update: {
          child_id?: string
          created_at?: string
          event_type?: string
          game?: string
          id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "game_events_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_events_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "game_events_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      guardian_device_configs: {
        Row: {
          apps: Json
          created_at: string
          device_id: string
          effective_manifest: Json
          id: string
          nextdns_profile: string | null
          policies: Json
          version: number
        }
        Insert: {
          apps?: Json
          created_at?: string
          device_id: string
          effective_manifest?: Json
          id?: string
          nextdns_profile?: string | null
          policies?: Json
          version: number
        }
        Update: {
          apps?: Json
          created_at?: string
          device_id?: string
          effective_manifest?: Json
          id?: string
          nextdns_profile?: string | null
          policies?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "guardian_device_configs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "guardian_devices"
            referencedColumns: ["device_id"]
          },
        ]
      }
      guardian_device_heartbeats: {
        Row: {
          agent_version: string | null
          alerts: Json
          device_id: string
          id: number
          ip: unknown | null
          metrics: Json
          ts: string
        }
        Insert: {
          agent_version?: string | null
          alerts?: Json
          device_id: string
          id?: number
          ip?: unknown | null
          metrics?: Json
          ts?: string
        }
        Update: {
          agent_version?: string | null
          alerts?: Json
          device_id?: string
          id?: number
          ip?: unknown | null
          metrics?: Json
          ts?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardian_device_heartbeats_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "guardian_devices"
            referencedColumns: ["device_id"]
          },
        ]
      }
      guardian_devices: {
        Row: {
          activated_at: string | null
          activation_requested_at: string | null
          config_version: number | null
          device_code: string | null
          device_id: string
          hw_info: Json | null
          id: string
          labels: Json | null
          last_seen: string | null
          notes: string | null
          owner_user: string | null
          status: string
        }
        Insert: {
          activated_at?: string | null
          activation_requested_at?: string | null
          config_version?: number | null
          device_code?: string | null
          device_id: string
          hw_info?: Json | null
          id?: string
          labels?: Json | null
          last_seen?: string | null
          notes?: string | null
          owner_user?: string | null
          status?: string
        }
        Update: {
          activated_at?: string | null
          activation_requested_at?: string | null
          config_version?: number | null
          device_code?: string | null
          device_id?: string
          hw_info?: Json | null
          id?: string
          labels?: Json | null
          last_seen?: string | null
          notes?: string | null
          owner_user?: string | null
          status?: string
        }
        Relationships: []
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
      installed_apps: {
        Row: {
          app_id: string
          child_id: string | null
          device_id: string
          installed_at: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          version: string
        }
        Insert: {
          app_id: string
          child_id?: string | null
          device_id: string
          installed_at?: string | null
          platform: Database["public"]["Enums"]["platform_type"]
          version: string
        }
        Update: {
          app_id?: string
          child_id?: string | null
          device_id?: string
          installed_at?: string | null
          platform?: Database["public"]["Enums"]["platform_type"]
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "installed_apps_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "app_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installed_apps_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_child_app_selections"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "installed_apps_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installed_apps_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "installed_apps_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "installed_apps_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installed_apps_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["device_id"]
          },
          {
            foreignKeyName: "installed_apps_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "vw_admin_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      interests: {
        Row: {
          category: string
          code: string
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      learning_activities: {
        Row: {
          child_id: string
          coins_earned: number | null
          created_at: string | null
          duration_minutes: number | null
          evidence_url: string | null
          id: string
          ks: string | null
          meta: Json | null
          passed: boolean | null
          score: number | null
          source: string | null
          subject: string
          topic: string | null
        }
        Insert: {
          child_id: string
          coins_earned?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          evidence_url?: string | null
          id?: string
          ks?: string | null
          meta?: Json | null
          passed?: boolean | null
          score?: number | null
          source?: string | null
          subject: string
          topic?: string | null
        }
        Update: {
          child_id?: string
          coins_earned?: number | null
          created_at?: string | null
          duration_minutes?: number | null
          evidence_url?: string | null
          id?: string
          ks?: string | null
          meta?: Json | null
          passed?: boolean | null
          score?: number | null
          source?: string | null
          subject?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_activities_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_activities_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "learning_activities_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      livestream_feedback: {
        Row: {
          comfortable: boolean
          created_at: string
          headshot_path: string | null
          id: string
          notes: string | null
          preferred_intro: string | null
          speaker_slug: string
          tech_notes: string | null
          user_agent: string | null
        }
        Insert: {
          comfortable: boolean
          created_at?: string
          headshot_path?: string | null
          id?: string
          notes?: string | null
          preferred_intro?: string | null
          speaker_slug: string
          tech_notes?: string | null
          user_agent?: string | null
        }
        Update: {
          comfortable?: boolean
          created_at?: string
          headshot_path?: string | null
          id?: string
          notes?: string | null
          preferred_intro?: string | null
          speaker_slug?: string
          tech_notes?: string | null
          user_agent?: string | null
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
      notification_channel_verifications: {
        Row: {
          attempts: number
          channel_id: string | null
          created_at: string
          expires_at: string
          id: string
          max_attempts: number
          verification_code: string
        }
        Insert: {
          attempts?: number
          channel_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          max_attempts?: number
          verification_code: string
        }
        Update: {
          attempts?: number
          channel_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          max_attempts?: number
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_channel_verifications_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "notification_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_channels: {
        Row: {
          created_at: string
          destination: string
          id: string
          is_verified: boolean
          kind: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination: string
          id?: string
          is_verified?: boolean
          kind: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string
          id?: string
          is_verified?: boolean
          kind?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          alert_type: string
          channel_ids: string[]
          child_id: string | null
          created_at: string
          digest: string
          id: string
          min_severity: number
          quiet_hours: Json | null
          scope: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          channel_ids?: string[]
          child_id?: string | null
          created_at?: string
          digest?: string
          id?: string
          min_severity?: number
          quiet_hours?: Json | null
          scope: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          channel_ids?: string[]
          child_id?: string | null
          created_at?: string
          digest?: string
          id?: string
          min_severity?: number
          quiet_hours?: Json | null
          scope?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_preferences_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "notification_preferences_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      nova_child_tokens: {
        Row: {
          child_id: string
          created_at: string
          expires_at: string
          id: string
          parent_user_id: string
          token: string
          used_at: string | null
        }
        Insert: {
          child_id: string
          created_at?: string
          expires_at: string
          id?: string
          parent_user_id: string
          token: string
          used_at?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          parent_user_id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nova_child_tokens_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nova_child_tokens_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "nova_child_tokens_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      nova_games_rounds: {
        Row: {
          created_at: string | null
          id: string
          round_no: number
          seconds: number | null
          session_id: string
          success: boolean | null
          target_word: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          round_no: number
          seconds?: number | null
          session_id: string
          success?: boolean | null
          target_word: string
        }
        Update: {
          created_at?: string | null
          id?: string
          round_no?: number
          seconds?: number | null
          session_id?: string
          success?: boolean | null
          target_word?: string
        }
        Relationships: [
          {
            foreignKeyName: "nova_games_rounds_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "nova_games_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      nova_games_sessions: {
        Row: {
          book_id: string
          child_id: string
          ended_at: string | null
          game_code: string
          id: string
          score: number | null
          started_at: string | null
        }
        Insert: {
          book_id: string
          child_id: string
          ended_at?: string | null
          game_code: string
          id?: string
          score?: number | null
          started_at?: string | null
        }
        Update: {
          book_id?: string
          child_id?: string
          ended_at?: string | null
          game_code?: string
          id?: string
          score?: number | null
          started_at?: string | null
        }
        Relationships: []
      }
      nova_insights: {
        Row: {
          ai_summary: string
          book_id: string
          child_id: string
          comprehension_questions: string[] | null
          created_at: string
          difficulty_level: string | null
          emotional_tone: string | null
          id: string
          key_points: string[] | null
          reading_level_assessment: string | null
          scope: string
          session_id: string
        }
        Insert: {
          ai_summary: string
          book_id: string
          child_id: string
          comprehension_questions?: string[] | null
          created_at?: string
          difficulty_level?: string | null
          emotional_tone?: string | null
          id?: string
          key_points?: string[] | null
          reading_level_assessment?: string | null
          scope?: string
          session_id: string
        }
        Update: {
          ai_summary?: string
          book_id?: string
          child_id?: string
          comprehension_questions?: string[] | null
          created_at?: string
          difficulty_level?: string | null
          emotional_tone?: string | null
          id?: string
          key_points?: string[] | null
          reading_level_assessment?: string | null
          scope?: string
          session_id?: string
        }
        Relationships: []
      }
      nova_jobs: {
        Row: {
          attempts: number | null
          book_id: string
          chapter_id: string | null
          created_at: string | null
          error: string | null
          finished_at: string | null
          id: string
          job_type: string
          payload: Json | null
          started_at: string | null
          status: string
        }
        Insert: {
          attempts?: number | null
          book_id: string
          chapter_id?: string | null
          created_at?: string | null
          error?: string | null
          finished_at?: string | null
          id?: string
          job_type: string
          payload?: Json | null
          started_at?: string | null
          status?: string
        }
        Update: {
          attempts?: number | null
          book_id?: string
          chapter_id?: string | null
          created_at?: string | null
          error?: string | null
          finished_at?: string | null
          id?: string
          job_type?: string
          payload?: Json | null
          started_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "nova_jobs_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nova_jobs_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "book_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      nova_problem_words: {
        Row: {
          child_id: string
          count: number | null
          created_at: string
          definition: string | null
          difficulty_reason: string | null
          hints: string[] | null
          id: string
          phonetics: string | null
          session_id: string
          sounds: string[] | null
          syllables: string[] | null
          word: string
        }
        Insert: {
          child_id: string
          count?: number | null
          created_at?: string
          definition?: string | null
          difficulty_reason?: string | null
          hints?: string[] | null
          id?: string
          phonetics?: string | null
          session_id: string
          sounds?: string[] | null
          syllables?: string[] | null
          word: string
        }
        Update: {
          child_id?: string
          count?: number | null
          created_at?: string
          definition?: string | null
          difficulty_reason?: string | null
          hints?: string[] | null
          id?: string
          phonetics?: string | null
          session_id?: string
          sounds?: string[] | null
          syllables?: string[] | null
          word?: string
        }
        Relationships: []
      }
      nova_reading_progress: {
        Row: {
          book_id: string
          child_id: string
          comprehension_score: number | null
          created_at: string
          id: string
          pages_read: number | null
          reading_time_minutes: number | null
          session_id: string
          total_pages: number | null
          updated_at: string
          words_read: number | null
        }
        Insert: {
          book_id: string
          child_id: string
          comprehension_score?: number | null
          created_at?: string
          id?: string
          pages_read?: number | null
          reading_time_minutes?: number | null
          session_id: string
          total_pages?: number | null
          updated_at?: string
          words_read?: number | null
        }
        Update: {
          book_id?: string
          child_id?: string
          comprehension_score?: number | null
          created_at?: string
          id?: string
          pages_read?: number | null
          reading_time_minutes?: number | null
          session_id?: string
          total_pages?: number | null
          updated_at?: string
          words_read?: number | null
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
      parent_profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string | null
          full_name: string | null
          postcode: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          postcode?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          postcode?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      parent_rewards: {
        Row: {
          active: boolean
          coin_cost: number
          created_at: string
          description: string | null
          id: string
          name: string
          parent_user_id: string
        }
        Insert: {
          active?: boolean
          coin_cost: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_user_id: string
        }
        Update: {
          active?: boolean
          coin_cost?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_user_id?: string
        }
        Relationships: []
      }
      parent_timeline: {
        Row: {
          child_id: string
          created_at: string | null
          detail: Json | null
          id: string
          kind: Database["public"]["Enums"]["event_kind"]
          parent_user_id: string
          title: string
        }
        Insert: {
          child_id: string
          created_at?: string | null
          detail?: Json | null
          id?: string
          kind: Database["public"]["Enums"]["event_kind"]
          parent_user_id: string
          title: string
        }
        Update: {
          child_id?: string
          created_at?: string | null
          detail?: Json | null
          id?: string
          kind?: Database["public"]["Enums"]["event_kind"]
          parent_user_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_timeline_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_timeline_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "parent_timeline_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      pending_requests: {
        Row: {
          app_id: string
          child_id: string
          id: string
          platform: Database["public"]["Enums"]["platform_type"]
          processed_at: string | null
          processed_by: string | null
          requested_at: string | null
          status: string | null
        }
        Insert: {
          app_id: string
          child_id: string
          id?: string
          platform: Database["public"]["Enums"]["platform_type"]
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string | null
        }
        Update: {
          app_id?: string
          child_id?: string
          id?: string
          platform?: Database["public"]["Enums"]["platform_type"]
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pending_requests_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "app_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_requests_app_id_fkey"
            columns: ["app_id"]
            isOneToOne: false
            referencedRelation: "v_child_app_selections"
            referencedColumns: ["app_id"]
          },
          {
            foreignKeyName: "pending_requests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_requests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "pending_requests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      policy_effective: {
        Row: {
          created_at: string
          id: string
          policy_data: Json
          scope: string
          subject_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          policy_data?: Json
          scope: string
          subject_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          policy_data?: Json
          scope?: string
          subject_id?: string | null
          updated_at?: string
          user_id?: string
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
      reading_chunks: {
        Row: {
          book_id: string
          child_id: string
          created_at: string
          id: string
          locator: string | null
          raw_text: string | null
          session_id: string
        }
        Insert: {
          book_id: string
          child_id: string
          created_at?: string
          id?: string
          locator?: string | null
          raw_text?: string | null
          session_id: string
        }
        Update: {
          book_id?: string
          child_id?: string
          created_at?: string
          id?: string
          locator?: string | null
          raw_text?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_chunks_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_chunks_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_chunks_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "reading_chunks_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "reading_chunks_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "child_reading_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_rollups: {
        Row: {
          book_id: string
          child_id: string
          created_at: string
          last_session_at: string | null
          last_summary: string | null
          rollup_date: string
          sessions: number
          total_seconds: number
          updated_at: string
        }
        Insert: {
          book_id: string
          child_id: string
          created_at?: string
          last_session_at?: string | null
          last_summary?: string | null
          rollup_date: string
          sessions?: number
          total_seconds?: number
          updated_at?: string
        }
        Update: {
          book_id?: string
          child_id?: string
          created_at?: string
          last_session_at?: string | null
          last_summary?: string | null
          rollup_date?: string
          sessions?: number
          total_seconds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_rollups_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_rollups_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_rollups_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "reading_rollups_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      reading_sessions: {
        Row: {
          ai_difficulty: string | null
          ai_flags: Json | null
          ai_summary: string | null
          book_id: string | null
          child_id: string
          coins_earned: number | null
          created_at: string | null
          ended_at: string | null
          id: string
          pages_completed: number | null
          pages_target: number | null
          started_at: string
          transcript_ms: number | null
          words_estimated: number | null
        }
        Insert: {
          ai_difficulty?: string | null
          ai_flags?: Json | null
          ai_summary?: string | null
          book_id?: string | null
          child_id: string
          coins_earned?: number | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          pages_completed?: number | null
          pages_target?: number | null
          started_at?: string
          transcript_ms?: number | null
          words_estimated?: number | null
        }
        Update: {
          ai_difficulty?: string | null
          ai_flags?: Json | null
          ai_summary?: string | null
          book_id?: string | null
          child_id?: string
          coins_earned?: number | null
          created_at?: string | null
          ended_at?: string | null
          id?: string
          pages_completed?: number | null
          pages_target?: number | null
          started_at?: string
          transcript_ms?: number | null
          words_estimated?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reading_sessions_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "reading_sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
      }
      reward_redemptions: {
        Row: {
          child_id: string
          coins_spent: number | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          id: string
          note: string | null
          reward_id: string
          status: Database["public"]["Enums"]["reward_status"]
        }
        Insert: {
          child_id: string
          coins_spent?: number | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          note?: string | null
          reward_id: string
          status?: Database["public"]["Enums"]["reward_status"]
        }
        Update: {
          child_id?: string
          coins_spent?: number | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          note?: string | null
          reward_id?: string
          status?: Database["public"]["Enums"]["reward_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_redemptions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "reward_redemptions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "parent_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards_ledger: {
        Row: {
          child_id: string
          created_at: string | null
          id: string
          meta: Json | null
          points: number
          source: string
        }
        Insert: {
          child_id: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          points: number
          source: string
        }
        Update: {
          child_id?: string
          created_at?: string | null
          id?: string
          meta?: Json | null
          points?: number
          source?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          age_range_max: number | null
          age_range_min: number | null
          created_at: string | null
          id: string
          name: string
          postcode: string | null
          school_type: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          age_range_max?: number | null
          age_range_min?: number | null
          created_at?: string | null
          id?: string
          name: string
          postcode?: string | null
          school_type?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          age_range_max?: number | null
          age_range_min?: number | null
          created_at?: string | null
          id?: string
          name?: string
          postcode?: string | null
          school_type?: string | null
          updated_at?: string | null
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
      tts_analysis_cache: {
        Row: {
          analysis: Json
          book_id: string | null
          created_at: string
          id: string
          text_hash: string
        }
        Insert: {
          analysis: Json
          book_id?: string | null
          created_at?: string
          id?: string
          text_hash: string
        }
        Update: {
          analysis?: Json
          book_id?: string | null
          created_at?: string
          id?: string
          text_hash?: string
        }
        Relationships: []
      }
      tts_audio_cache: {
        Row: {
          audio_base64: string
          audio_hash: string
          created_at: string
          duration: number | null
          id: string
          text_preview: string | null
          voice: string
        }
        Insert: {
          audio_base64: string
          audio_hash: string
          created_at?: string
          duration?: number | null
          id?: string
          text_preview?: string | null
          voice: string
        }
        Update: {
          audio_base64?: string
          audio_hash?: string
          created_at?: string
          duration?: number | null
          id?: string
          text_preview?: string | null
          voice?: string
        }
        Relationships: []
      }
      tts_manifests: {
        Row: {
          book_id: string
          created_at: string
          id: string
          manifest: Json
          mode: string
          voice_style: string | null
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          manifest: Json
          mode: string
          voice_style?: string | null
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          manifest?: Json
          mode?: string
          voice_style?: string | null
        }
        Relationships: []
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
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
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
      wallets: {
        Row: {
          child_id: string
          coins: number
          updated_at: string | null
        }
        Insert: {
          child_id: string
          coins?: number
          updated_at?: string | null
        }
        Update: {
          child_id?: string
          coins?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallets_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
          },
          {
            foreignKeyName: "wallets_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "v_effective_app_policy"
            referencedColumns: ["child_id"]
          },
        ]
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
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
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
      v_children_with_parent: {
        Row: {
          age: number | null
          avatar_url: string | null
          child_id: string | null
          city: string | null
          country: string | null
          full_name: string | null
          parent_id: string | null
          postcode: string | null
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
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
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
            referencedRelation: "v_children_with_parent"
            referencedColumns: ["child_id"]
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
      award_coins: {
        Args: { p_child: string; p_delta: number }
        Returns: undefined
      }
      cleanup_expired_verification_codes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      decide_reward: {
        Args: {
          p_approve: boolean
          p_decided_by: string
          p_note?: string
          p_redemption: string
        }
        Returns: {
          coins_left: number
          ok: boolean
        }[]
      }
      device_jobs_claim_next: {
        Args: { p_device_id: string }
        Returns: {
          attempts: number
          created_at: string
          device_id: string
          id: string
          payload: Json
          status: string
          type: string
          updated_at: string
        }
      }
      ensure_wallet: {
        Args: { p_child: string }
        Returns: undefined
      }
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
      jwt_device_id_text: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      mark_devices_offline_if_stale: {
        Args: { grace_seconds: number }
        Returns: undefined
      }
      nova_claim_job: {
        Args: { p_job_type?: string }
        Returns: {
          attempts: number | null
          book_id: string
          chapter_id: string | null
          created_at: string | null
          error: string | null
          finished_at: string | null
          id: string
          job_type: string
          payload: Json | null
          started_at: string | null
          status: string
        }
      }
      request_reward: {
        Args: { p_child: string; p_note?: string; p_reward: string }
        Returns: string
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
      rpc_remove_device: {
        Args: { _device: string }
        Returns: boolean
      }
      rpc_set_active_child: {
        Args: { _child: string; _device: string }
        Returns: boolean
      }
      uk_year_and_key_stage: {
        Args: { p_dob: string; p_ref?: string }
        Returns: {
          key_stage: string
          year_group: string
        }[]
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
      bookshelf_status: "saved" | "reading" | "finished" | "abandoned"
      clip_status:
        | "pending"
        | "approved"
        | "declined"
        | "uploading"
        | "uploaded"
        | "failed"
      device_kind: "os" | "mobile"
      event_kind: "reading" | "learning" | "reward" | "store" | "system"
      platform_type: "linux-desktop" | "linux-mobile" | "android" | "web-pwa"
      release_channel_type: "stable" | "beta" | "alpha" | "nightly"
      reward_status: "requested" | "approved" | "rejected" | "fulfilled"
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
      bookshelf_status: ["saved", "reading", "finished", "abandoned"],
      clip_status: [
        "pending",
        "approved",
        "declined",
        "uploading",
        "uploaded",
        "failed",
      ],
      device_kind: ["os", "mobile"],
      event_kind: ["reading", "learning", "reward", "store", "system"],
      platform_type: ["linux-desktop", "linux-mobile", "android", "web-pwa"],
      release_channel_type: ["stable", "beta", "alpha", "nightly"],
      reward_status: ["requested", "approved", "rejected", "fulfilled"],
      risk_level: ["low", "medium", "high", "critical"],
      rule_action: ["allow", "block", "timebox"],
    },
  },
} as const
