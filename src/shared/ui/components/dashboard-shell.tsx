"use client";

import { useState } from "react";
import { useDashboardState } from "../hooks/use-dashboard-state";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { MainContent } from "./main-content";
import { MarkdownViewDialog } from "./markdown-view-dialog";
import type { SkillSummary } from "../types/dashboard";

interface DashboardShellProps {
  readonly userEmail: string;
  readonly skills?: readonly SkillSummary[];
}

export function DashboardShell({ userEmail, skills = [] }: DashboardShellProps) {
  const {
    selectedCategory,
    searchQuery,
    isMobileMenuOpen,
    isMobile,
    pageTitle,
    filteredSkills,
    setSelectedCategory,
    setSearchQuery,
    toggleMobileMenu,
    closeMobileMenu,
  } = useDashboardState(skills);

  const [selectedSkill, setSelectedSkill] = useState<SkillSummary | null>(null);

  const handleSkillClick = (skill: SkillSummary) => {
    setSelectedSkill(skill);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedSkill(null);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={closeMobileMenu}
          data-testid="mobile-overlay"
        />
      )}

      {/* Sidebar */}
      <AppSidebar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Right content area */}
      <div className="flex flex-1 flex-col md:ml-64">
        <AppHeader
          pageTitle={pageTitle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isMobile={isMobile}
          onToggleMobileMenu={toggleMobileMenu}
          userEmail={userEmail}
        />
        <MainContent
          filteredSkills={filteredSkills}
          selectedCategory={selectedCategory}
          isLoading={false}
          onSkillClick={handleSkillClick}
        />
      </div>

      {/* Markdown View Dialog */}
      {selectedSkill && (
        <MarkdownViewDialog
          open={!!selectedSkill}
          onOpenChange={handleDialogClose}
          skillId={selectedSkill.id}
          skillTitle={selectedSkill.title}
          markdownFilePath={selectedSkill.markdownFilePath}
        />
      )}
    </div>
  );
}
