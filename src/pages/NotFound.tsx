import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="font-display text-8xl font-bold gold-text mb-4">404</div>
        <h1 className="font-display text-xl font-bold text-white mb-2">
          页面未找到
        </h1>
        <p className="text-sm text-white/50 mb-8 max-w-xs">
          您访问的页面不存在或已被移除。请检查网址或返回首页。
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-surface-lighter text-white/70 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-surface-lighter/80 transition-all"
          >
            <ArrowLeft size={16} />
            返回上页
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 gold-gradient text-surface px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Home size={16} />
            返回首页
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
