export interface Assignment {
  id: string
  title: string
  className: string
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