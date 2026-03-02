"use client";

import React, { useEffect, useRef, useState } from "react";
import { logout } from "@/app/logout/actions";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";

interface ProfileDropdownProps {
  email: string;
  avatarUrl?: string;
}

export function ProfileDropdown({ email, avatarUrl }: ProfileDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  function handleAvatarClick() {
    setIsDropdownOpen((prev) => !prev);
  }

  function handleLogoutClick() {
    setIsDropdownOpen(false);
    setIsDialogOpen(true);
  }

  function handleConfirm() {
    logout();
  }

  function handleCancel() {
    setIsDialogOpen(false);
  }

  return (
    <>
      <div className="relative" ref={containerRef}>
        <button
          className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden"
          data-testid="profile-avatar"
          onClick={handleAvatarClick}
        >
          {avatarUrl ? (
            <img
              alt="User profile"
              className="w-full h-full object-cover"
              src={avatarUrl}
            />
          ) : (
            <span className="text-xs font-bold text-primary">
              {email.charAt(0).toUpperCase()}
            </span>
          )}
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg min-w-[200px] py-2 z-50">
            <div className="px-4 py-2 text-sm text-slate-500 border-b border-slate-200 dark:border-slate-700">
              {email}
            </div>
            <button
              className="px-4 py-2 w-full text-left text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={handleLogoutClick}
            >
              로그아웃
            </button>
          </div>
        )}
      </div>

      <LogoutConfirmDialog
        isOpen={isDialogOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
