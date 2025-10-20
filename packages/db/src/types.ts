// Database types generated from Supabase
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          instrument: string;
          trade_date: string;
          side: string;
          quantity: number;
          entry_price: number;
          entry_time: string;
          exit_price: number;
          exit_time: string;
          pnl: number;
          pnl_percent: number | null;
          duration_seconds: number | null;
          commission: number;
          import_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          instrument: string;
          trade_date: string;
          side: string;
          quantity: number;
          entry_price: number;
          entry_time: string;
          exit_price: number;
          exit_time: string;
          pnl: number;
          pnl_percent?: number | null;
          duration_seconds?: number | null;
          commission?: number;
          import_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          instrument?: string;
          trade_date?: string;
          side?: string;
          quantity?: number;
          entry_price?: number;
          entry_time?: string;
          exit_price?: number;
          exit_time?: string;
          pnl?: number;
          pnl_percent?: number | null;
          duration_seconds?: number | null;
          commission?: number;
          import_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          color: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          slug: string;
          color?: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          slug?: string;
          color?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      trade_tags: {
        Row: {
          trade_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          trade_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          trade_id?: string;
          tag_id?: string;
          created_at?: string;
        };
      };
      imports: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          file_path: string | null;
          file_size: number | null;
          status: string;
          trades_imported: number;
          trades_skipped: number;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          filename: string;
          file_path?: string | null;
          file_size?: number | null;
          status?: string;
          trades_imported?: number;
          trades_skipped?: number;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          file_path?: string | null;
          file_size?: number | null;
          status?: string;
          trades_imported?: number;
          trades_skipped?: number;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
