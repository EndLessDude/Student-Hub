import { Assignment, Exam, Reminder } from './types'

const today = new Date()
const formatDate = (date: Date) => date.toISOString().split('T')[0]
const formatDateTime = (date: Date) => date.toISOString()

const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

const in3Days = new Date(today)
in3Days.setDate(in3Days.getDate() + 3)

const in5Days = new Date(today)
in5Days.setDate(in5Days.getDate() + 5)

const in7Days = new Date(today)
in7Days.setDate(in7Days.getDate() + 7)

const in10Days = new Date(today)
in10Days.setDate(in10Days.getDate() + 10)

const in14Days = new Date(today)
in14Days.setDate(in14Days.getDate() + 14)

const in21Days = new Date(today)
in21Days.setDate(in21Days.getDate() + 21)

export const mockAssignments: Assignment[] = [
  {
    id: 'a1',
    title: 'Linear Algebra Problem Set',
    className: 'Math 201',
    dueDate: formatDate(tomorrow),
    notes: 'Focus on eigenvalues and eigenvectors. Chapter 5-6 in textbook.',
    links: ['https://math.mit.edu/classes/18.06'],
    completed: false,
    createdAt: formatDateTime(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)),
    updatedAt: formatDateTime(today),
  },
  {
    id: 'a2',
    title: 'English Essay: Shakespeare Analysis',
    className: 'Literature 150',
    dueDate: formatDate(in3Days),
    notes: 'Write 2000 words analyzing character development. Include 5 scholarly sources.',
    links: ['https://www.shakespeare.org.uk'],
    completed: false,
    createdAt: formatDateTime(new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)),
    updatedAt: formatDateTime(today),
  },
  {
    id: 'a3',
    title: 'Biology Lab Report',
    className: 'Biology 102',
    dueDate: formatDate(in5Days),
    notes: 'Enzyme kinetics experiment. Include data tables, graphs, and discussion.',
    links: ['https://www.ncbi.nlm.nih.gov'],
    completed: false,
    createdAt: formatDateTime(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
    updatedAt: formatDateTime(today),
  },
  {
    id: 'a4',
    title: 'History Research Paper',
    className: 'History 210',
    dueDate: formatDate(in10Days),
    notes: 'Topic: Impact of Industrial Revolution. Minimum 3000 words, 10 sources.',
    links: ['https://historytoday.com'],
    completed: true,
    createdAt: formatDateTime(new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)),
    updatedAt: formatDateTime(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
  },
  {
    id: 'a5',
    title: 'Physics Problem Set Ch. 7-8',
    className: 'Physics 101',
    dueDate: formatDate(in7Days),
    notes: 'Complete problems 1-25 on pages 240-245. Show all work.',
    links: [],
    completed: false,
    createdAt: formatDateTime(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)),
    updatedAt: formatDateTime(today),
  },
  {
    id: 'a6',
    title: 'Computer Science Project',
    className: 'CS 301',
    dueDate: formatDate(in14Days),
    notes: 'Build a real-time chat application. Deploy to cloud platform.',
    links: ['https://github.com'],
    completed: false,
    createdAt: formatDateTime(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)),
    updatedAt: formatDateTime(today),
  },
  {
    id: 'a7',
    title: 'Chemistry Lab Report',
    className: 'Chemistry 150',
    dueDate: formatDate(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
    notes: 'Oxidation-reduction reaction. Format: Abstract, Methods, Results, Conclusion.',
    links: [],
    completed: false,
    createdAt: formatDateTime(new Date(today.getTime() - 4 * 24 * 60 * 60 * 1000)),
    updatedAt: formatDateTime(today),
  },
]

export const mockExams: Exam[] = [
  {
    id: 'e1',
    title: 'Calculus II Midterm',
    className: 'Math 102',
    examDate: formatDate(in7Days),
    objectives: [
      { id: 'o1', text: 'Integration by parts and substitution', completed: true },
      { id: 'o2', text: 'Trigonometric integrals', completed: true },
      { id: 'o3', text: 'Partial fractions', completed: false },
      { id: 'o4', text: 'Series and convergence tests', completed: false },
      { id: 'o5', text: 'Power series and Taylor series', completed: false },
    ],
    studyResources: [
      { id: 'r1', title: 'Stewart Calculus Textbook Ch. 5-7', url: 'https://stewartweb.com' },
      { id: 'r2', title: 'MIT OpenCourseWare Calc II', url: 'https://ocw.mit.edu' },
    ],
    completed: false,
    createdAt: formatDateTime(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)),
    updatedAt: formatDateTime(today),
  },
  {
    id: 'e2',
    title: 'Biology Final Exam',
    className: 'Biology 101',
    examDate: formatDate(in21Days),
    objectives: [
      { id: 'o6', text: 'Cell structure and function', completed: true },
      { id: 'o7', text: 'Photosynthesis and respiration', completed: false },
      { id: 'o8', text: 'DNA replication and protein synthesis', completed: false },
      { id: 'o9', text: 'Genetics and heredity', completed: false },
      { id: 'o10', text: 'Evolution and natural selection', completed: false },
    ],
    studyResources: [
      { id: 'r4', title: 'Campbell Biology Textbook', url: 'https://campbellbiology.com' },
    ],
    completed: false,
    createdAt: formatDateTime(new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000)),
    updatedAt: formatDateTime(today),
  },
  {
    id: 'e3',
    title: 'Chemistry Quiz',
    className: 'Chemistry 150',
    examDate: formatDate(in3Days),
    objectives: [
      { id: 'o12', text: 'Balancing chemical equations', completed: true },
      { id: 'o13', text: 'Molar calculations', completed: true },
      { id: 'o14', text: 'Stoichiometry problems', completed: true },
      { id: 'o15', text: 'Gas laws', completed: false },
    ],
    studyResources: [],
    completed: false,
    createdAt: formatDateTime(new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)),
    updatedAt: formatDateTime(today),
  },
  {
    id: 'e4',
    title: 'History Midterm',
    className: 'History 210',
    examDate: formatDate(in10Days),
    objectives: [
      { id: 'o16', text: 'Medieval Europe (476-1453)', completed: true },
      { id: 'o17', text: 'Renaissance (1300-1600)', completed: true },
      { id: 'o18', text: 'Age of Exploration', completed: false },
      { id: 'o19', text: 'Enlightenment (1600-1750)', completed: false },
    ],
    studyResources: [
      { id: 'r8', title: 'History Textbook Chapters 5-8', url: 'https://historytext.edu' },
    ],
    completed: false,
    createdAt: formatDateTime(new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000)),
    updatedAt: formatDateTime(today),
  },
]

export const mockReminders: Reminder[] = [
  {
    id: 'r1',
    title: 'Bring lab coat to Chemistry class',
    dateTime: formatDateTime(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0)),
    notes: 'Lab session at 10 AM',
    repeatRule: 'weekly',
    completed: false,
    createdAt: formatDateTime(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)),
    updatedAt: formatDateTime(today),
  },
  {
    id: 'r2',
    title: 'Submit club membership form',
    dateTime: formatDateTime(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 17, 0)),
    notes: 'Due by 5 PM',
    repeatRule: 'none',
    completed: false,
    createdAt: formatDateTime(today),
    updatedAt: formatDateTime(today),
  },
  {
    id: 'r3',
    title: 'Email professor about grade appeal',
    dateTime: formatDateTime(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0)),
    notes: 'Contact Professor Smith',
    repeatRule: 'none',
    completed: false,
    createdAt: formatDateTime(today),
    updatedAt: formatDateTime(today),
  },
  {
    id: 'r4',
    title: 'Review notes before exam',
    dateTime: formatDateTime(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 19, 0)),
    notes: 'Final review for Calculus II midterm',
    repeatRule: 'none',
    completed: false,
    createdAt: formatDateTime(new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)),
    updatedAt: formatDateTime(today),
  },
  {
    id: 'r5',
    title: 'Library book due',
    dateTime: formatDateTime(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 23, 59)),
    notes: 'Return book before due date',
    repeatRule: 'none',
    completed: true,
    createdAt: formatDateTime(new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000)),
    updatedAt: formatDateTime(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
  },
  {
    id: 'r6',
    title: 'Take medication',
    dateTime: formatDateTime(new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 0)),
    notes: 'Morning dose with breakfast',
    repeatRule: 'daily',
    completed: false,
    createdAt: formatDateTime(new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)),
    updatedAt: formatDateTime(today),
  },
]