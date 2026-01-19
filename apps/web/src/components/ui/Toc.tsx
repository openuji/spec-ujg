import * as React from "react"
import { cn } from "@/utils/cn"

import type { TocEntry } from "@openuji/speculator"
export type { TocEntry }

interface TocProps {
  toc: TocEntry[]
  className?: string
  onItemClick?: () => void
}

export const Toc: React.FC<TocProps> = ({ toc, className, onItemClick }) => {
  if (!toc || toc.length === 0) return null

  return (
    <nav className={cn("flex flex-col", className)}>
      <ul className="flex flex-col list-none p-0">
        {toc.map((entry, index) => (
          <TocItem key={entry.id || index} entry={entry} onItemClick={onItemClick} />
        ))}
      </ul>
    </nav>
  )
}

const TocItem: React.FC<{ entry: TocEntry; onItemClick?: () => void }> = ({
  entry,
  onItemClick,
}) => {
  const [isOpen, setIsOpen] = React.useState(true)

  const hasChildren = entry.children && entry.children.length > 0

  return (
    <li className="flex flex-col">
      <div className="flex items-center group relative">
        <a
          href={`#${entry.id || ""}`}
          onClick={onItemClick}
          className={cn(
            "flex-1 py-1.5 pl-3 text-[13px] leading-snug transition-all border-l-2 border-transparent",
            "hover:bg-zinc-100/50 hover:text-zinc-900",
            entry.depth === 1 
              ? "font-medium text-zinc-900 mt-2" 
              : "text-zinc-600 hover:border-zinc-200"
          )}
          // style={{ paddingLeft: `${entry.depth * 0.75 + 0.5}rem` }}
        >
          {entry.number && (
            <span className="mr-2 font-mono text-[10px] tracking-tight text-zinc-400 group-hover:text-zinc-600 transition-colors">
              {entry.number}
            </span>
          )}
          <span>{entry.text}</span>
        </a>
      </div>
      {hasChildren && isOpen && (
        <ul className="flex flex-col list-none p-0 m-0 border-l border-zinc-100 ml-4">
          {entry.children?.map((child, index) => (
            <TocItem key={child.id || index} entry={child} onItemClick={onItemClick} />
          ))}
        </ul>
      )}
    </li>
  )
}
