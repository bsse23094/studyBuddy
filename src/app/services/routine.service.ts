import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  DailyRoutine,
  RoutinePreset,
  ActivityTemplate,
  UserRoutinePreferences,
  ScheduleBlock,
  RoutineStats,
  ActivityCompletion
} from '../models';
import { StorageService } from './storage.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  private routinesSubject = new BehaviorSubject<DailyRoutine[]>([]);
  public routines$ = this.routinesSubject.asObservable();

  private activeRoutineSubject = new BehaviorSubject<DailyRoutine | null>(null);
  public activeRoutine$ = this.activeRoutineSubject.asObservable();

  // Predefined routine presets
  private presets: RoutinePreset[] = [
    {
      id: 'student-balanced',
      name: 'Balanced Student',
      description: 'Perfect balance between study, rest, and leisure',
      icon: 'graduation-cap',
      color: '#4F46E5',
      targetAudience: 'student',
      defaultActivities: [
        { name: 'Morning Routine', icon: 'sun', color: '#F59E0B', suggestedDuration: 60, category: 'essential', isOptional: false },
        { name: 'Study Session', icon: 'book', color: '#4F46E5', suggestedDuration: 120, category: 'study', isOptional: false },
        { name: 'Exercise', icon: 'dumbbell', color: '#EF4444', suggestedDuration: 45, category: 'health', isOptional: false },
        { name: 'Meals', icon: 'utensils', color: '#10B981', suggestedDuration: 90, category: 'essential', isOptional: false },
        { name: 'Social Time', icon: 'users', color: '#8B5CF6', suggestedDuration: 60, category: 'social', isOptional: true },
        { name: 'Leisure', icon: 'gamepad', color: '#EC4899', suggestedDuration: 90, category: 'leisure', isOptional: true },
        { name: 'Evening Routine', icon: 'moon', color: '#6366F1', suggestedDuration: 60, category: 'essential', isOptional: false },
      ]
    },
    {
      id: 'exam-intensive',
      name: 'Exam Intensive',
      description: 'Maximum study time with strategic breaks',
      icon: 'brain',
      color: '#DC2626',
      targetAudience: 'student',
      defaultActivities: [
        { name: 'Morning Routine', icon: 'sun', color: '#F59E0B', suggestedDuration: 45, category: 'essential', isOptional: false },
        { name: 'Deep Study Block', icon: 'book-open', color: '#DC2626', suggestedDuration: 180, category: 'study', isOptional: false },
        { name: 'Quick Exercise', icon: 'running', color: '#EF4444', suggestedDuration: 30, category: 'health', isOptional: false },
        { name: 'Meals', icon: 'utensils', color: '#10B981', suggestedDuration: 60, category: 'essential', isOptional: false },
        { name: 'Power Nap', icon: 'bed', color: '#6366F1', suggestedDuration: 20, category: 'health', isOptional: true },
        { name: 'Review Session', icon: 'list-check', color: '#8B5CF6', suggestedDuration: 90, category: 'study', isOptional: false },
      ]
    },
    {
      id: 'work-study-balance',
      name: 'Work-Study Balance',
      description: 'For those balancing part-time work and studies',
      icon: 'briefcase',
      color: '#059669',
      targetAudience: 'professional',
      defaultActivities: [
        { name: 'Morning Routine', icon: 'sun', color: '#F59E0B', suggestedDuration: 60, category: 'essential', isOptional: false },
        { name: 'Work Time', icon: 'briefcase', color: '#059669', suggestedDuration: 240, category: 'work', isOptional: false },
        { name: 'Study Session', icon: 'book', color: '#4F46E5', suggestedDuration: 90, category: 'study', isOptional: false },
        { name: 'Meals', icon: 'utensils', color: '#10B981', suggestedDuration: 90, category: 'essential', isOptional: false },
        { name: 'Self-Care', icon: 'spa', color: '#EC4899', suggestedDuration: 60, category: 'health', isOptional: false },
        { name: 'Evening Routine', icon: 'moon', color: '#6366F1', suggestedDuration: 60, category: 'essential', isOptional: false },
      ]
    },
    {
      id: 'relaxed-learner',
      name: 'Relaxed Learner',
      description: 'Gentle pace with plenty of breaks',
      icon: 'leaf',
      color: '#10B981',
      targetAudience: 'student',
      defaultActivities: [
        { name: 'Slow Morning', icon: 'coffee', color: '#F59E0B', suggestedDuration: 90, category: 'essential', isOptional: false },
        { name: 'Study Session', icon: 'book', color: '#4F46E5', suggestedDuration: 90, category: 'study', isOptional: false },
        { name: 'Exercise', icon: 'dumbbell', color: '#EF4444', suggestedDuration: 60, category: 'health', isOptional: true },
        { name: 'Meals', icon: 'utensils', color: '#10B981', suggestedDuration: 120, category: 'essential', isOptional: false },
        { name: 'Hobbies', icon: 'palette', color: '#EC4899', suggestedDuration: 120, category: 'leisure', isOptional: true },
        { name: 'Social Time', icon: 'users', color: '#8B5CF6', suggestedDuration: 90, category: 'social', isOptional: true },
        { name: 'Evening Wind-down', icon: 'moon', color: '#6366F1', suggestedDuration: 90, category: 'essential', isOptional: false },
      ]
    }
  ];

  constructor(
    private storage: StorageService,
    private api: ApiService
  ) {
    this.loadRoutines();
  }

  async loadRoutines(): Promise<void> {
    await this.storage.init();
    const routines = await this.storage.get<DailyRoutine[]>('routines') || [];
    this.routinesSubject.next(routines);

    // Load active routine
    const activeRoutineId = await this.storage.get<string>('activeRoutineId');
    if (activeRoutineId) {
      const activeRoutine = routines.find((r: DailyRoutine) => r.id === activeRoutineId);
      this.activeRoutineSubject.next(activeRoutine || null);
    }
  }

  getPresets(): RoutinePreset[] {
    return this.presets;
  }

  async createRoutineFromPreset(presetId: string, customPreferences?: Partial<UserRoutinePreferences>): Promise<DailyRoutine> {
    const preset = this.presets.find(p => p.id === presetId);
    if (!preset) {
      throw new Error('Preset not found');
    }

    // Default preferences
    const defaultPreferences: UserRoutinePreferences = {
      studyGoalHours: 4,
      wakeUpTime: '07:00',
      sleepTime: '23:00',
      schoolOrWorkHours: 6,
      schoolOrWorkStartTime: '09:00',
      includedActivities: preset.defaultActivities.map(a => a.name),
      priorityLevel: 'balanced',
      breakPreference: 'frequent-short',
      ...customPreferences
    };

    // Generate AI-powered schedule
    const schedule = await this.generateAISchedule(defaultPreferences, preset.defaultActivities);

    const routine: DailyRoutine = {
      id: this.generateId(),
      name: preset.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: defaultPreferences,
      schedule: schedule,
      isActive: false,
      presetId: preset.id,
      aiSuggestions: await this.generateAISuggestions(defaultPreferences)
    };

    await this.saveRoutine(routine);
    return routine;
  }

  async createCustomRoutine(name: string, preferences: UserRoutinePreferences, activities: ActivityTemplate[]): Promise<DailyRoutine> {
    const schedule = await this.generateAISchedule(preferences, activities);

    const routine: DailyRoutine = {
      id: this.generateId(),
      name: name,
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: preferences,
      schedule: schedule,
      isActive: false,
      aiSuggestions: await this.generateAISuggestions(preferences)
    };

    await this.saveRoutine(routine);
    return routine;
  }

  private async generateAISchedule(preferences: UserRoutinePreferences, activities: ActivityTemplate[]): Promise<ScheduleBlock[]> {
    try {
      // Call AI to generate optimized schedule
      const prompt = this.buildSchedulePrompt(preferences, activities);
      
      const response = await this.api.chat({
        conversationId: 'routine-gen-' + Date.now(),
        messages: [
          { 
            id: 'msg_' + Date.now(),
            role: 'user', 
            content: prompt, 
            timestamp: new Date().toISOString() 
          }
        ],
        options: { 
          mode: 'solve', 
          level: 'college',
          temperature: 0.7 
        }
      }).toPromise();

      if (response?.success && response.data?.message?.content) {
        // Parse AI response into schedule blocks
        return this.parseAISchedule(response.data.message.content, preferences, activities);
      }
    } catch (error) {
      console.error('AI schedule generation failed, using fallback:', error);
    }

    // Fallback to rule-based scheduling
    return this.generateRuleBasedSchedule(preferences, activities);
  }

  private buildSchedulePrompt(preferences: UserRoutinePreferences, activities: ActivityTemplate[]): string {
    const activityList = activities.map(a => `- ${a.name} (${a.suggestedDuration} min, ${a.category}${a.isOptional ? ', optional' : ''})`).join('\n');
    
    return `Create an optimized daily schedule with these constraints:

Wake up: ${preferences.wakeUpTime}
Sleep: ${preferences.sleepTime}
Study goal: ${preferences.studyGoalHours} hours
School/Work: ${preferences.schoolOrWorkHours} hours starting at ${preferences.schoolOrWorkStartTime}
Priority: ${preferences.priorityLevel}
Break style: ${preferences.breakPreference}

Activities to schedule:
${activityList}

Requirements:
1. Schedule must fit within wake-sleep times
2. Include all non-optional activities
3. Add ${preferences.breakPreference === 'pomodoro' ? '25-min study blocks with 5-min breaks' : preferences.breakPreference === 'frequent-short' ? '15-min breaks every 90 minutes' : '30-min breaks every 2-3 hours'}
4. Optimize for ${preferences.priorityLevel} lifestyle
5. Ensure adequate meal times and rest

Provide the schedule in this exact format for each block:
[HH:MM-HH:MM] Activity Name | Category | Notes

Example:
[07:00-08:00] Morning Routine | essential | Get ready, breakfast
[08:00-10:00] Deep Study | study | Focus time, no distractions`;
  }

  private parseAISchedule(aiResponse: string, preferences: UserRoutinePreferences, activities: ActivityTemplate[]): ScheduleBlock[] {
    const blocks: ScheduleBlock[] = [];
    const lines = aiResponse.split('\n');
    
    const timeBlockRegex = /\[(\d{2}:\d{2})-(\d{2}:\d{2})\]\s*([^|]+)\|([^|]+)\|?(.*)?/;
    
    for (const line of lines) {
      const match = line.match(timeBlockRegex);
      if (match) {
        const [, startTime, endTime, activityName, category, notes] = match;
        const activity = activities.find(a => a.name.toLowerCase().includes(activityName.trim().toLowerCase())) || activities[0];
        
        const start = this.parseTime(startTime.trim());
        const end = this.parseTime(endTime.trim());
        const duration = (end - start) / (1000 * 60);
        
        blocks.push({
          id: this.generateId(),
          activityName: activityName.trim(),
          startTime: startTime.trim(),
          endTime: endTime.trim(),
          duration: duration,
          category: (category.trim() as any) || activity.category,
          icon: activity.icon,
          color: activity.color,
          isFlexible: activity.isOptional,
          notes: notes?.trim()
        });
      }
    }
    
    return blocks.length > 0 ? blocks : this.generateRuleBasedSchedule(preferences, activities);
  }

  private generateRuleBasedSchedule(preferences: UserRoutinePreferences, activities: ActivityTemplate[]): ScheduleBlock[] {
    const blocks: ScheduleBlock[] = [];
    let currentTime = this.parseTime(preferences.wakeUpTime);
    const sleepTime = this.parseTime(preferences.sleepTime);
    
    // Morning routine
    const morningActivity = activities.find(a => a.name.toLowerCase().includes('morning')) || activities[0];
    blocks.push(this.createBlock(currentTime, morningActivity.suggestedDuration, morningActivity));
    currentTime = this.addMinutes(currentTime, morningActivity.suggestedDuration);
    
    // School/Work
    if (preferences.schoolOrWorkHours > 0) {
      currentTime = this.parseTime(preferences.schoolOrWorkStartTime);
      const workMinutes = preferences.schoolOrWorkHours * 60;
      blocks.push(this.createBlock(currentTime, workMinutes, {
        name: 'School/Work',
        icon: 'school',
        color: '#059669',
        suggestedDuration: workMinutes,
        category: 'work',
        isOptional: false
      }));
      currentTime = this.addMinutes(currentTime, workMinutes);
    }
    
    // Lunch break
    blocks.push(this.createBlock(currentTime, 60, {
      name: 'Lunch Break',
      icon: 'utensils',
      color: '#10B981',
      suggestedDuration: 60,
      category: 'essential',
      isOptional: false
    }));
    currentTime = this.addMinutes(currentTime, 60);
    
    // Study sessions
    const studyMinutes = preferences.studyGoalHours * 60;
    let remainingStudy = studyMinutes;
    
    while (remainingStudy > 0 && currentTime < sleepTime - (2 * 60 * 60 * 1000)) {
      const sessionLength = Math.min(90, remainingStudy);
      blocks.push(this.createBlock(currentTime, sessionLength, {
        name: 'Study Session',
        icon: 'book',
        color: '#4F46E5',
        suggestedDuration: sessionLength,
        category: 'study',
        isOptional: false
      }));
      currentTime = this.addMinutes(currentTime, sessionLength);
      remainingStudy -= sessionLength;
      
      if (remainingStudy > 0) {
        blocks.push(this.createBlock(currentTime, 15, {
          name: 'Break',
          icon: 'coffee',
          color: '#F59E0B',
          suggestedDuration: 15,
          category: 'leisure',
          isOptional: false
        }));
        currentTime = this.addMinutes(currentTime, 15);
      }
    }
    
    // Add other activities
    for (const activity of activities) {
      if (activity.isOptional && currentTime < sleepTime - (60 * 60 * 1000)) {
        blocks.push(this.createBlock(currentTime, activity.suggestedDuration, activity));
        currentTime = this.addMinutes(currentTime, activity.suggestedDuration);
      }
    }
    
    // Evening routine
    const eveningTime = sleepTime - (60 * 60 * 1000);
    const eveningActivity = activities.find(a => a.name.toLowerCase().includes('evening')) || {
      name: 'Evening Routine',
      icon: 'moon',
      color: '#6366F1',
      suggestedDuration: 60,
      category: 'essential' as const,
      isOptional: false
    };
    blocks.push(this.createBlock(eveningTime, eveningActivity.suggestedDuration, eveningActivity));
    
    return blocks;
  }

  private createBlock(startTime: number, durationMinutes: number, activity: ActivityTemplate): ScheduleBlock {
    const endTime = this.addMinutes(startTime, durationMinutes);
    return {
      id: this.generateId(),
      activityName: activity.name,
      startTime: this.formatTime(new Date(startTime)),
      endTime: this.formatTime(new Date(endTime)),
      duration: durationMinutes,
      category: activity.category,
      icon: activity.icon,
      color: activity.color,
      isFlexible: activity.isOptional
    };
  }

  private async generateAISuggestions(preferences: UserRoutinePreferences): Promise<string[]> {
    try {
      const prompt = `Based on this study routine profile:
- Study goal: ${preferences.studyGoalHours} hours/day
- Wake up: ${preferences.wakeUpTime}, Sleep: ${preferences.sleepTime}
- Priority: ${preferences.priorityLevel}
- Break style: ${preferences.breakPreference}

Provide 3-5 concise, actionable tips to maximize productivity and well-being. Format as a simple list.`;

      const response = await this.api.chat({
        conversationId: 'routine-tips-' + Date.now(),
        messages: [
          { 
            id: 'msg_' + Date.now(),
            role: 'user', 
            content: prompt, 
            timestamp: new Date().toISOString() 
          }
        ],
        options: { 
          mode: 'explain', 
          level: 'college',
          temperature: 0.7 
        }
      }).toPromise();

      if (response?.success && response.data?.message?.content) {
        return response.data.message.content
          .split('\n')
          .filter((line: string) => line.trim().length > 0)
          .slice(0, 5);
      }
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    }

    return [
      'Take regular breaks to maintain focus and prevent burnout',
      'Stay hydrated and maintain good posture while studying',
      'Use the Pomodoro technique for better time management',
      'Get 7-9 hours of quality sleep for optimal learning',
      'Exercise regularly to boost cognitive function'
    ];
  }

  async saveRoutine(routine: DailyRoutine): Promise<void> {
    const routines = this.routinesSubject.value;
    const index = routines.findIndex(r => r.id === routine.id);
    
    routine.updatedAt = new Date();
    
    if (index >= 0) {
      routines[index] = routine;
    } else {
      routines.push(routine);
    }
    
    await this.storage.set('routines', routines);
    this.routinesSubject.next([...routines]);
  }

  async deleteRoutine(routineId: string): Promise<void> {
    const routines = this.routinesSubject.value.filter(r => r.id !== routineId);
    await this.storage.set('routines', routines);
    this.routinesSubject.next(routines);
    
    // If deleted routine was active, clear it
    if (this.activeRoutineSubject.value?.id === routineId) {
      await this.setActiveRoutine(null);
    }
  }

  async setActiveRoutine(routine: DailyRoutine | null): Promise<void> {
    const routines = this.routinesSubject.value;
    
    // Deactivate all routines
    routines.forEach(r => r.isActive = false);
    
    if (routine) {
      const index = routines.findIndex(r => r.id === routine.id);
      if (index >= 0) {
        routines[index].isActive = true;
        await this.storage.set('activeRoutineId', routine.id);
      }
    } else {
      await this.storage.remove('activeRoutineId');
    }
    
    await this.storage.set('routines', routines);
    this.routinesSubject.next([...routines]);
    this.activeRoutineSubject.next(routine);
  }

  calculateRoutineStats(routine: DailyRoutine): RoutineStats {
    let totalStudyHours = 0;
    let totalBreakTime = 0;
    let totalSleepHours = 0;
    
    for (const block of routine.schedule) {
      const hours = block.duration / 60;
      if (block.category === 'study') {
        totalStudyHours += hours;
      } else if (block.category === 'leisure') {
        totalBreakTime += hours;
      }
    }
    
    const wakeTime = this.parseTime(routine.preferences.wakeUpTime);
    const sleepTime = this.parseTime(routine.preferences.sleepTime);
    totalSleepHours = 24 - ((sleepTime - wakeTime) / (1000 * 60 * 60));
    
    // Calculate balance score (0-100)
    const idealRatios = {
      study: 0.25,    // 25% of waking hours
      work: 0.35,     // 35% of waking hours
      leisure: 0.15,  // 15% of waking hours
      essential: 0.25 // 25% of waking hours
    };
    
    const wakingHours = 24 - totalSleepHours;
    const actualRatios = {
      study: totalStudyHours / wakingHours,
      work: routine.preferences.schoolOrWorkHours / wakingHours,
      leisure: totalBreakTime / wakingHours,
      essential: (wakingHours - totalStudyHours - routine.preferences.schoolOrWorkHours - totalBreakTime) / wakingHours
    };
    
    let balanceScore = 100;
    for (const key in idealRatios) {
      const diff = Math.abs(idealRatios[key as keyof typeof idealRatios] - actualRatios[key as keyof typeof actualRatios]);
      balanceScore -= diff * 100;
    }
    balanceScore = Math.max(0, Math.min(100, balanceScore));
    
    // Calculate productivity score
    const productivityScore = Math.min(100, 
      (totalStudyHours >= routine.preferences.studyGoalHours ? 50 : totalStudyHours / routine.preferences.studyGoalHours * 50) +
      (totalSleepHours >= 7 && totalSleepHours <= 9 ? 25 : 0) +
      (totalBreakTime >= 1 && totalBreakTime <= 3 ? 25 : 0)
    );
    
    const recommendations: string[] = [];
    if (totalStudyHours < routine.preferences.studyGoalHours) {
      recommendations.push('Consider adding more study time to meet your daily goal');
    }
    if (totalSleepHours < 7) {
      recommendations.push('Try to get at least 7 hours of sleep for better learning');
    }
    if (totalBreakTime < 1) {
      recommendations.push('Add more break time to prevent burnout');
    }
    if (balanceScore < 60) {
      recommendations.push('Your schedule could be better balanced across activities');
    }
    
    return {
      totalStudyHours,
      totalBreakTime,
      totalSleepHours,
      balanceScore: Math.round(balanceScore),
      productivityScore: Math.round(productivityScore),
      recommendations
    };
  }

  private parseTime(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  }

  private addMinutes(timestamp: number, minutes: number): number {
    return timestamp + (minutes * 60 * 1000);
  }

  private formatTime(date: Date): string {
    return date.toTimeString().substring(0, 5);
  }

  private generateId(): string {
    return `routine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
