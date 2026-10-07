export type UserRole = 'student' | 'instructor' | 'business_admin' | 'super_admin';
export type CourseStatus = 'draft' | 'review' | 'published' | 'archived';
export type PricingType = 'free' | 'one_time' | 'subscription_only' | 'both';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  headline?: string;
  bio?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  thumbnail_url?: string;
  price: number;
  pricing_type: PricingType;
  status: CourseStatus;
  learning_outcomes: string[];
  requirements: string[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  order_index: number;
  bunny_video_id?: string;
  duration_seconds: number;
  transcript?: string;
  is_free_preview: boolean;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}