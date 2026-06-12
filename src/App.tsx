import { lazy, Suspense, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useResultsStore } from '@/store/resultsStore';

// Route-level code splitting with lazy loading
const Home = lazy(() => import('@/pages/Home'));
const Schedule = lazy(() => import('@/pages/Schedule'));
const MatchDetail = lazy(() => import('@/pages/MatchDetail'));
const Teams = lazy(() => import('@/pages/Teams'));
const TeamDetail = lazy(() => import('@/pages/TeamDetail'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-xs text-white/40 font-mono">加载中...</span>
      </div>
    </div>
  );
}

export default function App() {
  const loadLiveData = useResultsStore((s) => s.loadLiveData);

  useEffect(() => {
    loadLiveData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/match/:id" element={<MatchDetail />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/team/:id" element={<TeamDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}
