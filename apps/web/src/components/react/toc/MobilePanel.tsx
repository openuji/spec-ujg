import { PanelRight, PanelLeft } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { tocCollapsed, toggleTocCollapsed } from '@/stores/tocSidebar';
import { useState, useEffect } from 'react';

export const MobilePanel = () => {
  const isToggled = useStore(tocCollapsed);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // On server and first client render, use a stable default (e.g., false for expanded)
  // This matches what the CSS expects for the initial state.
  const displayToggled = isMounted ? isToggled : false;

  return (
    <button
      onClick={toggleTocCollapsed}
      className="sidebar-restore-btn p-2 border border-border bg-card text-muted-foreground shadow-panel rounded-md hover:bg-accent-soft/50 hover:text-foreground transition-[background-color,color,box-shadow] duration-300"
      title={displayToggled ? 'Collapse sidebar' : 'Expand sidebar'}
      aria-label={displayToggled ? 'Collapse sidebar' : 'Expand sidebar'}
    >
      {displayToggled ? <PanelLeft className="w-5 h-5" /> : <PanelRight className="w-5 h-5" />}
    </button>
  );
};
