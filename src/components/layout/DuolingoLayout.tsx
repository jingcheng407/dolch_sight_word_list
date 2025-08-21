"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileHeader } from "./MobileHeader";
import { TabType } from "@/types/word";

type DuolingoLayoutProps = {
  children: ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
};

export const DuolingoLayout = ({ children, activeTab, onTabChange }: DuolingoLayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      {/* 桌面端侧边栏 */}
      <div className="hidden lg:flex lg:w-[256px] lg:fixed lg:inset-y-0">
        <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* 移动端头部 */}
      <MobileHeader activeTab={activeTab} onTabChange={onTabChange} />

      {/* 主内容区域 */}
      <div className="flex-1 lg:pl-[256px]">
        <div className="h-full pt-[50px] lg:pt-0">
          <div className="flex h-full">
            {/* 主内容 */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 overflow-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};