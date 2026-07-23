import { useState } from 'react';
import {
  LayoutDashboard, Ticket, Users, MessageSquare,
  Mail, UserCheck, Lightbulb, ShieldCheck,
  Star, Calendar, Newspaper, BookOpen,
  Video, Settings, ChevronLeft, ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { key: 'analytics', icon: LayoutDashboard, label: 'Dashboard', color: 'text-indigo-400' },
      { key: 'tickets', icon: Ticket, label: 'Tickets', color: 'text-amber-400' },
      { key: 'users', icon: Users, label: 'Users', color: 'text-violet-400' },
      { key: 'chat', icon: MessageSquare, label: 'Chat', color: 'text-emerald-400' },
    ],
  },
  {
    label: 'Management',
    items: [
      { key: 'contacts', icon: Mail, label: 'Contacts', color: 'text-cyan-400' },
      { key: 'teams', icon: UserCheck, label: 'Applications', color: 'text-pink-400' },
      { key: 'suggestions', icon: Lightbulb, label: 'Suggestions', color: 'text-orange-400' },
      { key: 'beneficiaries', icon: ShieldCheck, label: 'Beneficiaries', color: 'text-teal-400' },
      { key: 'testimonials', icon: Star, label: 'Testimonials', color: 'text-yellow-400' },
      { key: 'invites', icon: Calendar, label: 'Session Invites', color: 'text-purple-400' },
    ],
  },
  {
    label: 'Content',
    items: [
      { key: 'news', icon: Newspaper, label: 'News', color: 'text-rose-400' },
      { key: 'courses', icon: BookOpen, label: 'Courses', color: 'text-sky-400' },
      { key: 'live-sessions', icon: Video, label: 'Live Sessions', color: 'text-red-400' },
    ],
  },
];

export default function AdminSidebar({ activeTab, onTabChange, isOpen, onClose }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-slate-950 text-white transition-all duration-300 ease-in-out',
          'border-r border-white/5',
          collapsed ? 'w-[68px]' : 'w-[280px]',
          'max-lg:-translate-x-full max-lg:shadow-2xl',
          isOpen && 'max-lg:translate-x-0',
        )}
      >
        {/* Header */}
        <div className={cn('flex items-center gap-3 border-b border-white/5', collapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white p-0.5 shadow-lg shadow-black/20">
            <img src="/LOGO IMAGE.png" alt="CS Hub" className="h-full w-full rounded-[9px] object-contain" loading="lazy" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold tracking-tight text-white">CS Hub (iCT)</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              'hidden lg:flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white',
              collapsed && 'hidden',
            )}
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
        </div>

        {/* Collapsed toggle (only when collapsed) */}
        {collapsed && (
          <div className="flex justify-center py-1.5">
            <button
              onClick={() => setCollapsed(false)}
              className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Nav */}
        <ScrollArea className="flex-1 px-2 py-1">
          <nav className="flex flex-col gap-0.5">
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} className="mb-1">
                {!collapsed && (
                  <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
                    {section.label}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  const btn = (
                    <button
                      key={item.key}
                      onClick={() => { onTabChange(item.key); onClose(); }}
                      className={cn(
                        'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                        collapsed && 'justify-center px-0 py-2.5',
                        isActive
                          ? 'bg-white/[0.08] text-white'
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-cshub-yellow shadow-sm shadow-cshub-yellow/30" />
                      )}
                      <Icon className={cn('h-[18px] w-[18px] shrink-0 transition-colors', isActive ? item.color : 'text-slate-500 group-hover:text-slate-300')} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.key}>
                        <TooltipTrigger asChild>{btn}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }
                  return btn;
                })}
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-white/5 px-2 py-2">
          {!collapsed ? (
            <>
              <button
                onClick={() => { onTabChange('settings'); onClose(); }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                  activeTab === 'settings'
                    ? 'bg-white/[0.08] text-white'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200',
                )}
              >
                <Settings className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                <span>Settings</span>
              </button>
              <div className="mt-2 text-center text-[10px] font-medium text-slate-700">CS Hub v2.0</div>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => { onTabChange('settings'); onClose(); }}
                  className="flex w-full justify-center rounded-lg py-2.5 text-slate-400 transition-colors hover:bg-white/[0.04] hover:text-white"
                >
                  <Settings className="h-[18px] w-[18px]" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>Settings</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
