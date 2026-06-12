import { Home, Calendar, Users, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'home', icon: Home, label: '首页', path: '/' },
  { id: 'schedule', icon: Calendar, label: '赛程', path: '/schedule' },
  { id: 'teams', icon: Users, label: '球队', path: '/teams' },
  { id: 'dashboard', icon: BarChart3, label: '看板', path: '/dashboard' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeTab, setActiveTab } = useAppStore();

  const currentTab = tabs.find((t) => t.path === location.pathname)?.id || activeTab;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-lg border-t border-white/5 safe-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                navigate(tab.path);
              }}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-1 transition-colors',
                isActive ? 'text-primary' : 'text-white/40'
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
