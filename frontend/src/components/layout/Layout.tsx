import type { ReactNode } from 'react';
import { Bell } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-bg-primary/95 backdrop-blur-sm border-b border-border">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <button className="relative p-2 rounded border border-border text-text-secondary hover:bg-bg-secondary transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-status-blocked rounded-full" />
        </button>
      </div>
    </header>
  );
}

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      <main className="pl-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}
