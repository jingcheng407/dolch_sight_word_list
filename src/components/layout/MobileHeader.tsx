import { MobileSidebar } from "./MobileSidebar";
import { TabType } from "@/types/word";

type MobileHeaderProps = {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

export const MobileHeader = ({ activeTab, onTabChange }: MobileHeaderProps) => {
  return (
    <nav className="fixed top-0 z-50 flex h-[50px] w-full items-center border-b bg-green-600 px-4 lg:hidden">
      <MobileSidebar activeTab={activeTab} onTabChange={onTabChange} />
      <h1 className="ml-4 text-lg font-bold text-white">Dolch Words</h1>
    </nav>
  );
};