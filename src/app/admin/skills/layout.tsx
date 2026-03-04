import type { ReactNode } from 'react';

interface SkillsLayoutProps {
  children: ReactNode;
  modal?: ReactNode;
}

export default function SkillsLayout({ children, modal }: SkillsLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
