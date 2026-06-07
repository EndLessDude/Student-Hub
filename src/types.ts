export interface Assignment {
  id: string
  title: string
  className: string
  classId?: string
  dueDate: string
  notes: string
  links: string[]
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface ExamObjective {
  id: string
  text: string
  completed: boolean
}

export interface StudyResource {
  id: string
  title: string
  url: string
}

export interface Exam {
  id: string
  title: string
  className: string
  classId?: string
  examDate: string
  objectives: ExamObjective[]
  studyResources: StudyResource[]
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface Reminder {
  id: string
  title: string
  dateTime: string
  notes: string
  repeatRule: 'none' | 'daily' | 'weekly' | 'custom'
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type LinkIconType = 'canvas' | 'google-classroom' | 'gmail' | 'outlook' | 'genesis' | 'link'

export interface ClassLink {
  id: string
  title: string
  url: string
  iconType: LinkIconType
}

export interface ClassItem {
  id: string
  name: string
  color: string
  links: ClassLink[]
  createdAt: string
  updatedAt: string
}

export interface GlobalLink {
  id: string
  title: string
  url: string
  iconType: LinkIconType
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  theme: string
  fontSize: string
  density: string
  notifications: {
    reminders: boolean
    exams: boolean
    browser: boolean
  }
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  fontSize: 'normal',
  density: 'comfortable',
  notifications: { reminders: true, exams: true, browser: false },
}

export const CLASS_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6',
  '#EC4899', '#64748B',
]