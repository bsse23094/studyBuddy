/**
 * Routine and Schedule Management Models
 */

export interface RoutinePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  defaultActivities: ActivityTemplate[];
  targetAudience: 'student' | 'professional' | 'custom';
}

export interface ActivityTemplate {
  name: string;
  icon: string;
  color: string;
  suggestedDuration: number; // in minutes
  category: 'study' | 'health' | 'social' | 'work' | 'leisure' | 'essential';
  isOptional: boolean;
}

export interface UserRoutinePreferences {
  studyGoalHours: number; // Daily study goal in hours
  wakeUpTime: string; // HH:mm format
  sleepTime: string; // HH:mm format
  schoolOrWorkHours: number; // Hours spent at school/work
  schoolOrWorkStartTime: string; // HH:mm format
  includedActivities: string[]; // Activity names user wants to include
  priorityLevel: 'balanced' | 'study-focused' | 'relaxed';
  breakPreference: 'frequent-short' | 'few-long' | 'pomodoro';
}

export interface ScheduleBlock {
  id: string;
  activityName: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  duration: number; // in minutes
  category: ActivityTemplate['category'];
  icon: string;
  color: string;
  isFlexible: boolean; // Can be moved/adjusted
  notes?: string;
}

export interface DailyRoutine {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserRoutinePreferences;
  schedule: ScheduleBlock[];
  isActive: boolean;
  presetId?: string; // If based on a preset
  aiSuggestions?: string[]; // AI-generated tips
  completionRate?: number; // Percentage of followed schedule
}

export interface RoutineStats {
  totalStudyHours: number;
  totalBreakTime: number;
  totalSleepHours: number;
  balanceScore: number; // 0-100, how balanced the routine is
  productivityScore: number; // 0-100, AI-calculated productivity
  recommendations: string[];
}

export interface ActivityCompletion {
  routineId: string;
  blockId: string;
  date: Date;
  completed: boolean;
  actualDuration?: number; // Actual time spent in minutes
  feedback?: 'too-short' | 'perfect' | 'too-long';
}
