import { FC } from 'react'
import { BookOpen, GraduationCap, Mail, FileText, ExternalLink } from 'lucide-react'
import { ClassLink, GlobalLink, LinkIconType } from '../types'

export const LINK_ICON_CONFIG: Record<LinkIconType, {
  label: string
  bg: string
  text: string
  Icon: React.FC<{ className?: string }>
}> = {
  canvas: { label: 'Canvas', bg: 'bg-orange-100', text: 'text-orange-600', Icon: BookOpen },
  'google-classroom': { label: 'Google Classroom', bg: 'bg-green-100', text: 'text-green-700', Icon: GraduationCap },
  gmail: { label: 'Gmail', bg: 'bg-red-100', text: 'text-red-600', Icon: Mail },
  outlook: { label: 'Outlook', bg: 'bg-blue-100', text: 'text-blue-600', Icon: Mail },
  genesis: { label: 'Genesis', bg: 'bg-purple-100', text: 'text-purple-600', Icon: FileText },
  link: { label: 'Link', bg: 'bg-gray-100', text: 'text-gray-600', Icon: ExternalLink },
}

interface LinkIconButtonProps {
  link: ClassLink | GlobalLink
  size?: 'sm' | 'md'
}

export const LinkIconButton: FC<LinkIconButtonProps> = ({ link, size = 'md' }) => {
  const config = LINK_ICON_CONFIG[link.iconType] ?? LINK_ICON_CONFIG.link
  const { Icon, bg, text } = config
  const dim = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
  const iconDim = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      title={link.title}
      className={`inline-flex items-center justify-center ${dim} rounded-lg ${bg} ${text} hover:opacity-80 transition-opacity flex-shrink-0`}
    >
      <Icon className={iconDim} />
    </a>
  )
}

interface LinkIconSelectProps {
  value: LinkIconType
  onChange: (v: LinkIconType) => void
}

export const LinkIconSelect: FC<LinkIconSelectProps> = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value as LinkIconType)}
    className="input-field"
  >
    {(Object.keys(LINK_ICON_CONFIG) as LinkIconType[]).map((k) => (
      <option key={k} value={k}>{LINK_ICON_CONFIG[k].label}</option>
    ))}
  </select>
)