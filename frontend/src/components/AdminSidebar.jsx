import { useState } from 'react';
import {
  LayoutDashboard, Ticket, Users, MessageSquare,
  Mail, UserCheck, Lightbulb, ShieldCheck,
  Star, Calendar, Newspaper, BookOpen,
  Video, Settings, ChevronLeft, ChevronRight,
  LogOut, CreditCard, Bot,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const NAV_SECTIONS = [
  {
    label: 'AI Learning',
    items: [
      { key: 'ai-learning', href: '/ai-dashboard', icon: Bot, label: 'AI Learning' },
    ],
  },
  {
    label: 'Overview',
    items: [
      { key: 'analytics', icon: LayoutDashboard, label: 'Dashboard' },
      { key: 'tickets', icon: Ticket, label: 'Tickets' },
      { key: 'users', icon: Users, label: 'Users' },
      { key: 'chat', icon: MessageSquare, label: 'Chat' },
    ],
  },
  {
    label: 'Management',
    items: [
      { key: 'contacts', icon: Mail, label: 'Contacts' },
      { key: 'teams', icon: UserCheck, label: 'Applications' },
      { key: 'suggestions', icon: Lightbulb, label: 'Suggestions' },
      { key: 'beneficiaries', icon: ShieldCheck, label: 'Beneficiaries' },
      { key: 'testimonials', icon: Star, label: 'Testimonials' },
      { key: 'invites', icon: Calendar, label: 'Session Invites' },
    ],
  },
  {
    label: 'Content',
    items: [
      { key: 'news', icon: Newspaper, label: 'News' },
      { key: 'courses', icon: BookOpen, label: 'Courses' },
      { key: 'live-sessions', icon: Video, label: 'Live Sessions' },
      { key: 'payments', icon: CreditCard, label: 'Payments' },
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
          collapsed ? 'w-[60px]' : 'w-[224px]',
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
                  <div className="px-3 pt-2.5 pb-1 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600">
                    {section.label}
                  </div>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;
                  const inner = (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-cshub-blue" />
                      )}
                      <Icon className={cn('h-[18px] w-[18px] shrink-0 transition-colors', isActive ? 'text-cshub-blue' : 'text-slate-500 group-hover:text-slate-300')} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </>
                  );
                  const cls = cn(
                    'group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-all duration-150',
                    collapsed && 'justify-center px-0 py-2',
                    isActive
                      ? 'bg-cshub-blue/10 text-white'
                      : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200',
                  );
                  const btn = item.href ? (
                    <a key={item.key} href={item.href} className={cls}>
                      {inner}
                    </a>
                  ) : (
                    <button
                      key={item.key}
                      onClick={() => { onTabChange(item.key); onClose(); }}
                      className={cls}
                    >
                      {inner}
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
                  'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-all duration-150',
                  activeTab === 'settings'
                    ? 'bg-cshub-blue/10 text-white'
                    : 'text-slate-400 hover:bg-white/[0.06] hover:text-slate-200',
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
