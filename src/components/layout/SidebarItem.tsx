"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SidebarItemProps = {
  label: string;
  iconSrc: string;
  isActive?: boolean;
  onClick?: () => void;
};

export const SidebarItem = ({ label, iconSrc, isActive, onClick }: SidebarItemProps) => {
  return (
    <Button
      variant={isActive ? "sidebarOutline" : "sidebar"}
      className="h-[52px] justify-start"
      onClick={onClick}
    >
      <Image
        src={iconSrc}
        alt={label}
        className="mr-5"
        height={32}
        width={32}
      />
      {label}
    </Button>
  );
};