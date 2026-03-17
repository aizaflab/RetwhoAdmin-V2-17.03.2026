import React, { useEffect, useRef, type ReactNode } from "react";

interface DropdownLayoutProps {
  children: ReactNode;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  clickMenu: boolean;
  setClickMenu: (click: boolean | ((prev: boolean) => boolean)) => void;
}

export default function DropdownLayout({
  children,
  dropdownOpen,
  setDropdownOpen,
  clickMenu,
  setClickMenu,
}: DropdownLayoutProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
        setClickMenu(false);
      }
    };

    if (dropdownOpen || clickMenu) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [dropdownOpen, clickMenu, setDropdownOpen, setClickMenu]);

  return (
    <div
      className="text-gray-0 flex gap-3 items-center relative cursor-pointer"
      onMouseEnter={() => !clickMenu && setDropdownOpen(true)}
      onMouseLeave={() => !clickMenu && setDropdownOpen(false)}
      onClick={() => {
        setDropdownOpen(true);
        setClickMenu((prev) => !prev);
      }}
      ref={dropdownRef}
    >
      {children}
    </div>
  );
}
