import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoutineService } from '../../services/routine.service';
import {
  DailyRoutine,
  RoutinePreset,
  UserRoutinePreferences,
  ActivityTemplate,
  ScheduleBlock,
  RoutineStats
} from '../../models';

type Step = 'view' | 'select-preset' | 'customize' | 'preview' | 'schedule-view';

@Component({
  selector: 'app-routine',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './routine.component.html',
  styleUrls: ['./routine.component.css']
})
export class RoutineComponent implements OnInit {
  currentStep: Step = 'view';
  routines: DailyRoutine[] = [];
  activeRoutine: DailyRoutine | null = null;
  presets: RoutinePreset[] = [];
  selectedPreset: RoutinePreset | null = null;
  
  // Form data
  customName: string = 'My Custom Routine';
  preferences: UserRoutinePreferences = {
    studyGoalHours: 4,
    wakeUpTime: '07:00',
    sleepTime: '23:00',
    schoolOrWorkHours: 6,
    schoolOrWorkStartTime: '09:00',
    includedActivities: [],
    priorityLevel: 'balanced',
    breakPreference: 'frequent-short'
  };
  
  availableActivities: ActivityTemplate[] = [
    { name: 'Morning Routine', icon: 'sun', color: '#F59E0B', suggestedDuration: 60, category: 'essential', isOptional: false },
    { name: 'Exercise', icon: 'dumbbell', color: '#EF4444', suggestedDuration: 45, category: 'health', isOptional: true },
    { name: 'Yoga/Meditation', icon: 'spa', color: '#EC4899', suggestedDuration: 30, category: 'health', isOptional: true },
    { name: 'Study Session', icon: 'book', color: '#4F46E5', suggestedDuration: 120, category: 'study', isOptional: false },
    { name: 'Revision', icon: 'list-check', color: '#8B5CF6', suggestedDuration: 60, category: 'study', isOptional: true },
    { name: 'Meals', icon: 'utensils', color: '#10B981', suggestedDuration: 90, category: 'essential', isOptional: false },
    { name: 'Social Time', icon: 'users', color: '#8B5CF6', suggestedDuration: 60, category: 'social', isOptional: true },
    { name: 'Hobbies', icon: 'palette', color: '#EC4899', suggestedDuration: 90, category: 'leisure', isOptional: true },
    { name: 'Gaming/Entertainment', icon: 'gamepad', color: '#EC4899', suggestedDuration: 90, category: 'leisure', isOptional: true },
    { name: 'Reading', icon: 'book-open', color: '#6366F1', suggestedDuration: 60, category: 'leisure', isOptional: true },
    { name: 'Family Time', icon: 'heart', color: '#F43F5E', suggestedDuration: 60, category: 'social', isOptional: true },
    { name: 'Power Nap', icon: 'bed', color: '#6366F1', suggestedDuration: 20, category: 'health', isOptional: true },
    { name: 'Evening Routine', icon: 'moon', color: '#6366F1', suggestedDuration: 60, category: 'essential', isOptional: false },
  ];
  
  previewRoutine: DailyRoutine | null = null;
  routineStats: RoutineStats | null = null;
  isCreating = false;
  viewingRoutine: DailyRoutine | null = null;
  currentTime: string = '';

  constructor(
    private routineService: RoutineService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRoutines();
    this.presets = this.routineService.getPresets();
    this.updateCurrentTime();
    setInterval(() => this.updateCurrentTime(), 60000); // Update every minute
  }

  updateCurrentTime(): void {
    const now = new Date();
    this.currentTime = now.toTimeString().substring(0, 5);
  }

  // Convert 24-hour time to 12-hour AM/PM format
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  // Get time range string
  getTimeRange(startTime: string, duration: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
    return `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`;
  }

  // Format duration to readable text
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    return `${hours}h ${mins}m`;
  }

  // Get activity description based on category
  getActivityDescription(block: ScheduleBlock): string {
    const descriptions: { [key: string]: string } = {
      'Morning Routine': 'Start your day fresh with morning essentials',
      'Exercise': 'Physical activity to boost energy and focus',
      'Yoga/Meditation': 'Mindfulness practice for mental clarity',
      'Study Session': 'Focused deep work on your studies',
      'Revision': 'Review and reinforce learned material',
      'Meals': 'Nutritious meals to fuel your day',
      'Social Time': 'Connect with friends and peers',
      'Hobbies': 'Pursue your personal interests',
      'Gaming/Entertainment': 'Relaxation and entertainment',
      'Reading': 'Personal reading for growth or leisure',
      'Family Time': 'Quality time with loved ones',
      'Power Nap': 'Quick rest to recharge',
      'Evening Routine': 'Wind down and prepare for rest',
      'School/Work': 'Classes, lectures, or work commitments',
      'Commute': 'Travel time to and from destinations'
    };
    return block.notes || descriptions[block.activityName] || 'Scheduled activity';
  }

  async loadRoutines(): Promise<void> {
    this.routineService.routines$.subscribe(routines => {
      this.routines = routines;
    });
    
    this.routineService.activeRoutine$.subscribe(active => {
      this.activeRoutine = active;
    });
  }

  selectPreset(preset: RoutinePreset): void {
    this.selectedPreset = preset;
    this.customName = preset.name;
    this.preferences.includedActivities = preset.defaultActivities.map(a => a.name);
    
    // Set reasonable defaults based on preset
    if (preset.id === 'exam-intensive') {
      this.preferences.studyGoalHours = 8;
      this.preferences.priorityLevel = 'study-focused';
      this.preferences.breakPreference = 'frequent-short';
    } else if (preset.id === 'relaxed-learner') {
      this.preferences.studyGoalHours = 3;
      this.preferences.priorityLevel = 'relaxed';
      this.preferences.breakPreference = 'few-long';
    } else {
      this.preferences.studyGoalHours = 4;
      this.preferences.priorityLevel = 'balanced';
      this.preferences.breakPreference = 'frequent-short';
    }
    
    this.currentStep = 'customize';
  }

  toggleActivity(activityName: string): void {
    const index = this.preferences.includedActivities.indexOf(activityName);
    if (index >= 0) {
      this.preferences.includedActivities.splice(index, 1);
    } else {
      this.preferences.includedActivities.push(activityName);
    }
  }

  isActivitySelected(activityName: string): boolean {
    return this.preferences.includedActivities.includes(activityName);
  }

  async generatePreview(): Promise<void> {
    this.isCreating = true;
    try {
      const selectedActivities = this.availableActivities.filter(a => 
        this.preferences.includedActivities.includes(a.name)
      );

      if (this.selectedPreset) {
        this.previewRoutine = await this.routineService.createRoutineFromPreset(
          this.selectedPreset.id,
          this.preferences
        );
      } else {
        this.previewRoutine = await this.routineService.createCustomRoutine(
          this.customName,
          this.preferences,
          selectedActivities
        );
      }
      
      this.routineStats = this.routineService.calculateRoutineStats(this.previewRoutine);
      this.currentStep = 'preview';
    } catch (error) {
      console.error('Failed to generate routine:', error);
      alert('Failed to generate routine. Please try again.');
    } finally {
      this.isCreating = false;
    }
  }

  async saveRoutine(): Promise<void> {
    if (this.previewRoutine) {
      await this.routineService.saveRoutine(this.previewRoutine);
      this.currentStep = 'view';
      this.resetForm();
    }
  }

  async setAsActive(routine: DailyRoutine): Promise<void> {
    await this.routineService.setActiveRoutine(routine);
  }

  async deleteRoutine(routine: DailyRoutine): Promise<void> {
    if (confirm(`Are you sure you want to delete "${routine.name}"?`)) {
      await this.routineService.deleteRoutine(routine.id);
    }
  }

  viewSchedule(routine: DailyRoutine): void {
    this.viewingRoutine = routine;
    this.routineStats = this.routineService.calculateRoutineStats(routine);
    this.currentStep = 'schedule-view';
  }

  resetForm(): void {
    this.selectedPreset = null;
    this.previewRoutine = null;
    this.routineStats = null;
    this.customName = 'My Custom Routine';
    this.preferences = {
      studyGoalHours: 4,
      wakeUpTime: '07:00',
      sleepTime: '23:00',
      schoolOrWorkHours: 6,
      schoolOrWorkStartTime: '09:00',
      includedActivities: [],
      priorityLevel: 'balanced',
      breakPreference: 'frequent-short'
    };
  }

  startCustomRoutine(): void {
    this.selectedPreset = null;
    this.customName = 'My Custom Routine';
    this.currentStep = 'customize';
  }

  // Get time period (Morning, Afternoon, Evening)
  getTimePeriod(time: string): string {
    const hours = parseInt(time.split(':')[0]);
    if (hours < 12) return 'Morning';
    if (hours < 17) return 'Afternoon';
    return 'Evening';
  }

  // Get morning status for styling
  getMorningStatus(time: string): string {
    const hours = parseInt(time.split(':')[0]);
    if (hours < 12) return 'morning';
    if (hours < 17) return 'afternoon';
    return 'evening';
  }

  // Adjust study hours with bounds checking
  adjustStudyHours(delta: number): void {
    const newValue = this.preferences.studyGoalHours + delta;
    if (newValue >= 1 && newValue <= 12) {
      this.preferences.studyGoalHours = Math.round(newValue * 2) / 2; // Round to nearest 0.5
    }
  }

  // Adjust work hours with bounds checking
  adjustWorkHours(delta: number): void {
    const newValue = this.preferences.schoolOrWorkHours + delta;
    if (newValue >= 0 && newValue <= 12) {
      this.preferences.schoolOrWorkHours = Math.round(newValue * 2) / 2; // Round to nearest 0.5
    }
  }

  back(): void {
    if (this.currentStep === 'customize') {
      this.currentStep = 'select-preset';
      this.selectedPreset = null;
    } else if (this.currentStep === 'preview') {
      this.currentStep = 'customize';
    } else if (this.currentStep === 'schedule-view') {
      this.currentStep = 'view';
      this.viewingRoutine = null;
    } else {
      this.currentStep = 'view';
    }
  }

  getBlockPosition(block: ScheduleBlock): { top: number, height: number } {
    const [startHour, startMin] = block.startTime.split(':').map(Number);
    const [endHour, endMin] = block.endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    // Map to 24-hour timeline (0 = midnight)
    const top = (startMinutes / 1440) * 100; // 1440 minutes in a day
    const height = ((endMinutes - startMinutes) / 1440) * 100;
    
    return { top, height };
  }

  isCurrentlyActive(block: ScheduleBlock): boolean {
    if (!this.currentTime) return false;
    return this.currentTime >= block.startTime && this.currentTime < block.endTime;
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      study: '#4F46E5',
      health: '#EF4444',
      social: '#8B5CF6',
      work: '#059669',
      leisure: '#EC4899',
      essential: '#10B981'
    };
    return colors[category] || '#6B7280';
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  }
}
