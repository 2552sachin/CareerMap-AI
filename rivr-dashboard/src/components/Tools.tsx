import { lazy, Suspense, type ReactNode, type ReactElement, type ComponentType } from 'react'
import type { ToolId } from '../types'
import { FileSearch, Mail, MessageSquareQuote, FileText, Bot, DollarSign, KanbanSquare, GitCompareArrows, BookOpen } from 'lucide-react'
import ToolModal from './ToolModal'
import { LoadingOverlay } from './Skeleton'

const AnalyzerTool = lazy(() => import('../tools/AnalyzerTool'))
const LettersTool = lazy(() => import('../tools/LettersTool'))
const InterviewTool = lazy(() => import('../tools/InterviewTool'))
const BuilderTool = lazy(() => import('../tools/BuilderTool'))
const CopilotTool = lazy(() => import('../tools/CopilotTool'))
const SalaryTool = lazy(() => import('../tools/SalaryTool'))
const JobTrackerTool = lazy(() => import('../tools/JobTrackerTool'))
const ResumeCompareTool = lazy(() => import('../tools/ResumeCompareTool'))
const DocumentationTool = lazy(() => import('../tools/DocumentationTool'))

interface ToolDef {
  id: ToolId
  title: string
  subtitle: string
  icon: ReactNode
  component: ComponentType
  maxWidth?: string
}

const TOOLS: ToolDef[] = [
  {
    id: 'analyzer',
    title: 'Resume Analyzer',
    subtitle: 'ATS score, job match, and improvement suggestions',
    icon: <FileSearch className="w-5 h-5" />,
    component: AnalyzerTool,
  },
  {
    id: 'letters',
    title: 'Smart Letters',
    subtitle: 'Cover letters, follow-ups, LinkedIn messages',
    icon: <Mail className="w-5 h-5" />,
    component: LettersTool,
  },
  {
    id: 'interview',
    title: 'Interview Prep',
    subtitle: 'Role-specific questions, STAR stories, negotiation scripts',
    icon: <MessageSquareQuote className="w-5 h-5" />,
    component: InterviewTool,
  },
  {
    id: 'builder',
    title: 'Resume Builder',
    subtitle: 'Build a complete ATS-friendly resume from scratch',
    icon: <FileText className="w-5 h-5" />,
    component: BuilderTool,
  },
  {
    id: 'copilot',
    title: 'AI Copilot',
    subtitle: 'Interactive career coach chat for any obstacle',
    icon: <Bot className="w-5 h-5" />,
    component: CopilotTool,
  },
  {
    id: 'salary',
    title: 'Salary Benchmark',
    subtitle: 'Market salary data, negotiation tips, and trend analysis',
    icon: <DollarSign className="w-5 h-5" />,
    component: SalaryTool,
  },
  {
    id: 'tracker',
    title: 'Job Tracker',
    subtitle: 'Kanban board to track applications from wishlist to offer',
    icon: <KanbanSquare className="w-5 h-5" />,
    component: JobTrackerTool,
    maxWidth: 'max-w-4xl',
  },
  {
    id: 'compare',
    title: 'Resume Compare',
    subtitle: 'Diff two resume versions with score change and improvement analysis',
    icon: <GitCompareArrows className="w-5 h-5" />,
    component: ResumeCompareTool,
    maxWidth: 'max-w-3xl',
  },
  {
    id: 'docs',
    title: 'Documentation',
    subtitle: 'Guides, API reference, provider key links, and setup',
    icon: <BookOpen className="w-5 h-5" />,
    component: DocumentationTool,
    maxWidth: 'max-w-3xl',
  },
]

interface ToolsProps {
  openId: ToolId | null
  onClose: () => void
}

export default function Tools({ openId, onClose }: ToolsProps): ReactElement {
  return (
    <>
      {TOOLS.map((tool) => {
        const Component = tool.component
        return (
          <ToolModal
            key={tool.id}
            open={openId === tool.id}
            onClose={onClose}
            title={tool.title}
            subtitle={tool.subtitle}
            icon={tool.icon}
            maxWidth={tool.maxWidth}
          >
            <Suspense fallback={<LoadingOverlay label="Loading tool..." />}>
              <Component />
            </Suspense>
          </ToolModal>
        )
      })}
    </>
  )
}

export { TOOLS }
