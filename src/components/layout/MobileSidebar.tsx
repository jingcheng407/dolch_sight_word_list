import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { TabType } from "@/types/word";

type MobileSidebarProps = {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

export const MobileSidebar = ({ activeTab, onTabChange }: MobileSidebarProps) => {
  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="text-white h-6 w-6" />
      </SheetTrigger>

      <SheetContent className="z-[100] p-0" side="left">
        <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      </SheetContent>
    </Sheet>
  );
};