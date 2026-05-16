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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      about_sections: {
        Row: {
          body: string
          heading: string | null
          id: number
          language_id: number
          position: number
          updated_at: string | null
        }
        Insert: {
          body?: string
          heading?: string | null
          id?: number
          language_id: number
          position?: number
          updated_at?: string | null
        }
        Update: {
          body?: string
          heading?: string | null
          id?: number
          language_id?: number
          position?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "about_sections_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: number
          ip_hash: string | null
          locale: string | null
          message: string
          name: string
          read_at: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: number
          ip_hash?: string | null
          locale?: string | null
          message: string
          name: string
          read_at?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: number
          ip_hash?: string | null
          locale?: string | null
          message?: string
          name?: string
          read_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          id: number
          language_id: number
          slug: string
          updated_at: string | null
          value: string
        }
        Insert: {
          id?: number
          language_id: number
          slug: string
          updated_at?: string | null
          value: string
        }
        Update: {
          id?: number
          language_id?: number
          slug?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_blocks_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          id: number
          is_default: boolean
          name: string
        }
        Insert: {
          code: string
          id?: number
          is_default?: boolean
          name: string
        }
        Update: {
          code?: string
          id?: number
          is_default?: boolean
          name?: string
        }
        Relationships: []
      }
      navbar: {
        Row: {
          id: number
          language_id: number
          position: number
          slug: string
          value: string
        }
        Insert: {
          id?: number
          language_id: number
          position: number
          slug: string
          value: string
        }
        Update: {
          id?: number
          language_id?: number
          position?: number
          slug?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "navbar_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      not_found: {
        Row: {
          id: number
          language_id: number
          position: number
          slug: string
          value: string
        }
        Insert: {
          id?: number
          language_id: number
          position: number
          slug: string
          value: string
        }
        Update: {
          id?: number
          language_id?: number
          position?: number
          slug?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "not-found_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          forks: number | null
          homepage: string | null
          id: string
          language: string | null
          name: string | null
          og_image: string | null
          outcome: string | null
          position: number
          problem: string | null
          pushed_at: string | null
          repo: string
          screenshot_url: string | null
          solution: string | null
          stars: number | null
          synced_at: string | null
          topics: string[] | null
          url: string | null
          visible: boolean
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          forks?: number | null
          homepage?: string | null
          id?: string
          language?: string | null
          name?: string | null
          og_image?: string | null
          outcome?: string | null
          position?: number
          problem?: string | null
          pushed_at?: string | null
          repo: string
          screenshot_url?: string | null
          solution?: string | null
          stars?: number | null
          synced_at?: string | null
          topics?: string[] | null
          url?: string | null
          visible?: boolean
        }
        Update: {
          created_at?: string | null
          description?: string | null
          forks?: number | null
          homepage?: string | null
          id?: string
          language?: string | null
          name?: string | null
          og_image?: string | null
          outcome?: string | null
          position?: number
          problem?: string | null
          pushed_at?: string | null
          repo?: string
          screenshot_url?: string | null
          solution?: string | null
          stars?: number | null
          synced_at?: string | null
          topics?: string[] | null
          url?: string | null
          visible?: boolean
        }
        Relationships: []
      }
      projects_i18n: {
        Row: {
          description: string | null
          language_id: number
          outcome: string | null
          problem: string | null
          project_id: string
          solution: string | null
        }
        Insert: {
          description?: string | null
          language_id: number
          outcome?: string | null
          problem?: string | null
          project_id: string
          solution?: string | null
        }
        Update: {
          description?: string | null
          language_id?: number
          outcome?: string | null
          problem?: string | null
          project_id?: string
          solution?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_i18n_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_i18n_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_identity: {
        Row: {
          email: string | null
          id: number
          name: string
          primary_cta_href: string | null
          profile_photo_url: string | null
          secondary_cta_href: string | null
          updated_at: string | null
        }
        Insert: {
          email?: string | null
          id?: number
          name?: string
          primary_cta_href?: string | null
          profile_photo_url?: string | null
          secondary_cta_href?: string | null
          updated_at?: string | null
        }
        Update: {
          email?: string | null
          id?: number
          name?: string
          primary_cta_href?: string | null
          profile_photo_url?: string | null
          secondary_cta_href?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          dark: boolean
          icon_dark_url: string | null
          icon_url: string | null
          id: number
          name: string
          percentage: number | null
          position: number
        }
        Insert: {
          category?: string | null
          dark?: boolean
          icon_dark_url?: string | null
          icon_url?: string | null
          id?: number
          name: string
          percentage?: number | null
          position?: number
        }
        Update: {
          category?: string | null
          dark?: boolean
          icon_dark_url?: string | null
          icon_url?: string | null
          id?: number
          name?: string
          percentage?: number | null
          position?: number
        }
        Relationships: []
      }
      social_links: {
        Row: {
          id: number
          kind: string
          label: string | null
          position: number
          updated_at: string | null
          url: string
          visible: boolean
        }
        Insert: {
          id?: number
          kind: string
          label?: string | null
          position?: number
          updated_at?: string | null
          url: string
          visible?: boolean
        }
        Update: {
          id?: number
          kind?: string
          label?: string | null
          position?: number
          updated_at?: string | null
          url?: string
          visible?: boolean
        }
        Relationships: []
      }
      theme: {
        Row: {
          id: number
          language_id: number
          position: number
          slug: string
          value: string
        }
        Insert: {
          id?: number
          language_id: number
          position: number
          slug: string
          value: string
        }
        Update: {
          id?: number
          language_id?: number
          position?: number
          slug?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "theme_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_settings: {
        Row: {
          description: string | null
          group_name: string
          key: string
          position: number | null
          type: string
          updated_at: string | null
          value_dark: string | null
          value_light: string
        }
        Insert: {
          description?: string | null
          group_name?: string
          key: string
          position?: number | null
          type: string
          updated_at?: string | null
          value_dark?: string | null
          value_light: string
        }
        Update: {
          description?: string | null
          group_name?: string
          key?: string
          position?: number | null
          type?: string
          updated_at?: string | null
          value_dark?: string | null
          value_light?: string
        }
        Relationships: []
      }
      uses_items: {
        Row: {
          category: string
          icon_url: string | null
          id: number
          name: string
          position: number
          updated_at: string | null
          url: string | null
          visible: boolean
        }
        Insert: {
          category: string
          icon_url?: string | null
          id?: number
          name: string
          position?: number
          updated_at?: string | null
          url?: string | null
          visible?: boolean
        }
        Update: {
          category?: string
          icon_url?: string | null
          id?: number
          name?: string
          position?: number
          updated_at?: string | null
          url?: string | null
          visible?: boolean
        }
        Relationships: []
      }
      uses_items_i18n: {
        Row: {
          description: string | null
          item_id: number
          language_id: number
        }
        Insert: {
          description?: string | null
          item_id: number
          language_id: number
        }
        Update: {
          description?: string | null
          item_id?: number
          language_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "uses_items_i18n_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "uses_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uses_items_i18n_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      work_experience: {
        Row: {
          company: string
          created_at: string | null
          ended_at: string | null
          id: number
          is_current: boolean
          location: string | null
          position: number
          role: string
          started_at: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          company: string
          created_at?: string | null
          ended_at?: string | null
          id?: number
          is_current?: boolean
          location?: string | null
          position?: number
          role: string
          started_at: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          company?: string
          created_at?: string | null
          ended_at?: string | null
          id?: number
          is_current?: boolean
          location?: string | null
          position?: number
          role?: string
          started_at?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      work_experience_i18n: {
        Row: {
          bullets: string[]
          experience_id: number
          language_id: number
          summary: string | null
        }
        Insert: {
          bullets?: string[]
          experience_id: number
          language_id: number
          summary?: string | null
        }
        Update: {
          bullets?: string[]
          experience_id?: number
          language_id?: number
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_experience_i18n_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "work_experience"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_experience_i18n_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      clone_language: {
        Args: { source_code: string; target_code: string; target_name: string }
        Returns: number
      }
      upsert_navbar_item: {
        Args: {
          item_position?: number
          item_slug: string
          item_value: string
          lang_code: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
