import Image from "next/image";
import { cn } from "@/lib/utils";
import { SidebarItem } from "./SidebarItem";
import { TabType } from "@/types/word";

type SidebarProps = {
  className?: string;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

export const Sidebar = ({ className, activeTab, onTabChange }: SidebarProps) => {
  return (
    <div
      className={cn(
        "left-0 top-0 flex h-full flex-col border-r-2 border-border px-4 lg:fixed lg:w-[256px] bg-sidebar",
        className
      )}
    >
      {/* Logo区域 */}
      <div className="flex items-center gap-x-3 pb-7 pl-4 pt-8">
        <Image src="/mascot.svg" alt="Mascot" height={40} width={40} />
        <h1 className="text-2xl font-extrabold tracking-wide text-green-600">
          Dolch Words
        </h1>
      </div>

      {/* 导航菜单 */}
      <div className="flex flex-1 flex-col gap-y-2">
        <SidebarItem 
          label="学习" 
          iconSrc="/learn.svg" 
          isActive={activeTab === 'learn'}
          onClick={() => onTabChange('learn')}
        />
        <SidebarItem 
          label="练习" 
          iconSrc="/practice.svg" 
          isActive={activeTab === 'practice'}
          onClick={() => onTabChange('practice')}
        />
        <SidebarItem 
          label="测验" 
          iconSrc="/quiz.svg" 
          isActive={activeTab === 'quiz'}
          onClick={() => onTabChange('quiz')}
        />
        <SidebarItem 
          label="统计" 
          iconSrc="/stats.svg" 
          isActive={activeTab === 'stats'}
          onClick={() => onTabChange('stats')}
        />
      </div>

      {/* 底部用户区域 */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">学习者</p>
            <p className="text-xs text-muted-foreground">继续加油！</p>
          </div>
        </div>
      </div>
    </div>
  );
};