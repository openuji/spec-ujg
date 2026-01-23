import { useEffect, useMemo, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { PanelLeft, PanelRight } from "lucide-react"

import { useStore } from "@nanostores/react"
import { tocCollapsed, setTocCollapsed, toggleTocCollapsed } from "@/stores/tocSidebar"


import type { TocEntry } from "@openuji/speculator"

interface TocProps {
  toc: TocEntry[]
  className?: string
  onItemClick?: () => void
}

const flattedIds = (toc: TocEntry[]) => {

  const ids: string[] = []
  const walk = (entries: TocEntry[]) => {
    for(const entry of entries) {
      if (entry.id) {
        ids.push(entry.id)
      }
      if (entry.children) {
        walk(entry.children)
      }
    }
    
  }

  walk(toc)

  return ids;
}



const useActiveId = (ids: string[]) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!ids.length) return;

    const HEADER_HEIGHT = Number(getComputedStyle(document.documentElement).getPropertyValue("--height-header").replace("px", ""));
    const THRESHOLD = HEADER_HEIGHT; // How far below header to consider "active"

    const onScroll = () => {
      let currentId: string | null = null;

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const prevId = ids[i - 1];
        const el = document.getElementById(id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        const top = rect.top;
        
        // If heading is at or above the detection zone, it's the candidate
        if (top <= HEADER_HEIGHT + THRESHOLD) {
          currentId = id;
        }
        // Last section: just needs to be visible below header
        else if (i === ids.length - 1 && prevId === currentId) {
          const prevEl = document.getElementById(prevId);
          if (!prevEl) continue;

          const prevRect = prevEl.getBoundingClientRect();
          const prevTop = prevRect.top;
          
          if(prevTop < 0) {
            currentId = id;
          }

          
        }
      }

      if (currentId !== activeId) {
        setActiveId(currentId);
      }
      
    };

    // Throttle for performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    onScroll(); // Initial check

    return () => window.removeEventListener("scroll", throttledScroll);
  }, [ids, activeId]);

  return activeId;
};

export const Toc: React.FC<TocProps> = ({ toc, className, onItemClick }) => {
  if (!toc || toc.length === 0) return null  
  
  const tocRef = useRef<HTMLDivElement>(null)
  const scrollDir = useRef<"up" | "down" | null>(null);

  const ids =  useMemo(() => flattedIds(toc), [toc])
  const activeId = useActiveId(ids)

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        scrollDir.current = "down";
      } else if (currentScrollY < lastScrollY) {
        scrollDir.current = "up";
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const padding = 0;
    const container = tocRef.current;
    if (!container || !activeId) return;

    const activeLink = container.querySelector<HTMLAnchorElement>(
      `a[href="#${activeId}"]`,
    );
    if (!activeLink) return;

    const linkTop = activeLink.offsetTop;
    const linkBottom = linkTop + activeLink.offsetHeight;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    if (linkTop > containerBottom && scrollDir.current === "down") {
      container.scrollTo({ top: linkTop - padding, behavior: "smooth" });
    } else if (linkBottom < containerTop && scrollDir.current === "up") {
      container.scrollTo({
        top: linkBottom - container.clientHeight + padding,
        behavior: "smooth",
      });
    }

    //console.log('Scrolling TOC to active link:', { linkTop, linkBottom, containerTop, containerBottom });
  }, [activeId]);


  const isToggled = useStore(tocCollapsed)
  const displayToggled = isMounted ? isToggled : false
  
  const restoreButton =
    isMounted && displayToggled && typeof document !== "undefined"
      ? createPortal(
          <button
            onClick={() => setTocCollapsed(false)}
            className="hidden sm:flex sidebar-restore-btn fixed left-4 top-[calc(var(--height-header)+1rem)] z-50 p-2 bg-white border border-border shadow-panel rounded-md hover:bg-zinc-50 hover:text-primary transition-[background-color,color,box-shadow,transform] duration-300"
            title="Expand sidebar"
          >
            <PanelRight className="w-5 h-5" />
          </button>,
          document.body
        )
      : null

  return (
    <>
      {restoreButton}
      <div ref={tocRef} className="overflow-y-auto max-h-[calc(100vh-var(--height-header))] py-md pr-3">
        <div
          className="sidebar-title flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500 pb-base pl-3 pr-2">
          <span>Table of Contents</span>
          <button
            onClick={toggleTocCollapsed}
            className="hidden sm:flex hover:text-zinc-900 transition-[background-color,color] p-1 rounded-md hover:bg-zinc-100"
            title={displayToggled ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={displayToggled ? "Expand sidebar" : "Collapse sidebar"}
          >
            {displayToggled ? <PanelRight className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>
        </div>
        <nav className={cn("flex flex-col", className)}>
          <ul className="flex flex-col list-none p-0">
            {toc.map((entry, index) => (
              <TocItem 
                key={entry.id || index} 
                entry={entry} 
                onItemClick={onItemClick} 
                activeId={activeId}
              />
            ))}
          </ul>
        </nav>
    </div>
    </>
  )
}

const TocItem: React.FC<{ 
  entry: TocEntry; 
  onItemClick?: () => void;
  activeId: string | null;
}> = ({
  entry,
  onItemClick,
  activeId,
}) => {
  const [isOpen] = useState(true)

  const hasChildren = entry.children && entry.children.length > 0

  return (
    <li className="flex flex-col">
        <a
          href={`#${entry.id || ""}`}
          onClick={onItemClick}
          className={cn(
            "flex items-center group relative",
            "flex-1 py-1.5 pl-3 text-sm leading-snug transition-[background-color,color,border-color] border-l-2 border-transparent",
            "hover:bg-zinc-100 hover:text-zinc-900",
            entry.depth === 1 
              ? "font-medium text-zinc-900 mt-2" 
              : "text-zinc-600 hover:border-zinc-200",
            activeId === entry.id && "text-accent border-accent bg-accent/5 font-medium"
          )}
        >
          {entry.number && (
            <span className="mr-2 font-mono text-2xs tracking-tight text-zinc-500 group-hover:text-zinc-700 transition-colors">
              {entry.number}
            </span>
          )}
          <span>{entry.text}</span>
        </a>
      {hasChildren && isOpen && (
        <ul className="flex flex-col list-none p-0 m-0 border-l border-zinc-100 ml-4">
          {entry.children?.map((child, index) => (
            <TocItem 
              key={child.id || index} 
              entry={child} 
              onItemClick={onItemClick} 
              activeId={activeId}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
