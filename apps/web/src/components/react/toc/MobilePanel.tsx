import { PanelRight, PanelLeft } from "lucide-react"
import { useStore } from "@nanostores/react"
import { tocCollapsed, toggleTocCollapsed } from "@/stores/tocSidebar"

export const MobilePanel = () => {
  const isToggled = useStore(tocCollapsed)

  return (
    <button
      onClick={toggleTocCollapsed}
      className="sidebar-restore-btn p-2 border border-border shadow-panel rounded-md hover:bg-zinc-50 hover:text-primary transition-[background-color,color,box-shadow] duration-300"
      title={isToggled ? "Collapse sidebar" : "Expand sidebar"}
      aria-label={isToggled ? "Collapse sidebar" : "Expand sidebar"}
    >
      {isToggled ? <PanelLeft className="w-5 h-5" /> : <PanelRight className="w-5 h-5" />}
    </button>
  )
}
