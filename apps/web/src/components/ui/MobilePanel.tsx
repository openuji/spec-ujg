import { PanelRight, PanelLeft } from "lucide-react"
import { useState, useEffect } from "react"

export const MobilePanel = () => {
  const [isToggled, setIsToggled] = useState(false)

  useEffect(() => {
    const handleToggle = (e: any) => {
      if (typeof e.detail === "boolean") {
        setIsToggled(e.detail);
      } else {
        setIsToggled(prev => !prev);
      }
    };
    window.addEventListener("toggle-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-sidebar", handleToggle);
  }, []);

  const toggle = () => {
    const next = !isToggled;
    setIsToggled(next);
    window.dispatchEvent(new CustomEvent("toggle-sidebar", { detail: next }));
  }

  return (
    <button
      onClick={toggle}
      className="sidebar-restore-btn p-2 border border-border shadow-panel rounded-md hover:bg-zinc-50 hover:text-primary transition-all duration-300"
      title={isToggled ? "Collapse sidebar" : "Expand sidebar"}
    >
      {isToggled ? <PanelLeft className="w-5 h-5" /> : <PanelRight className="w-5 h-5" />}
    </button>
  )
}
