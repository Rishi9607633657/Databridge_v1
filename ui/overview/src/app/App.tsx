/* App shell + routes. HashRouter so it works from any static path (DataBridge serves it at /static/overview/). */
import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AppStateProvider, useApp } from './state';
import { DataProvider, useData } from './data';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { EntityDrawer } from '../components/widgets/EntityDrawer';
import { CardSkeleton, ErrorState } from '../components/ui/States';
import { boardUrl } from '../board/board';
import OverviewPage from '../pages/OverviewPage';
import { NAV } from '../components/layout/nav';
import { useMenu, workspaceSidebarWidth } from '../components/layout/menu';

const Analytics = lazy(() => import('../pages/AnalyticsPage'));
const Sources = lazy(() => import('../pages/SourcesPage'));
const Dashboards = lazy(() => import('../pages/DashboardsPage'));
const Reports = lazy(() => import('../pages/ReportsPage'));
const Insights = lazy(() => import('../pages/InsightsPage'));
const Catalog = lazy(() => import('../pages/CatalogPage'));
const Monitoring = lazy(() => import('../pages/MonitoringPage'));
const Users = lazy(() => import('../pages/UsersPage'));
const Integrations = lazy(() => import('../pages/IntegrationsPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const NotFound = lazy(() => import('../pages/NotFoundPage'));

function Shell() {
  const [menu, setMenu] = useState(false);
  const loc = useLocation();
  const { loading, overview } = useData();
  const { boardStatus, boardError, refreshBoard } = useApp();
  const shared = useMenu() !== null;
  const [sideW] = useState(workspaceSidebarWidth);
  useEffect(() => {
    const page = NAV.find((n) => (n.to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(n.to)));
    document.title = `${page?.label ?? 'DataBridge AI'} · DataBridge AI`;
    document.getElementById('main')?.scrollTo?.({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [loc.pathname]);
  return (
    <div className={`shell ${shared ? 'merged' : ''}`} style={shared ? ({ ['--side-w' as string]: `${sideW}px` }) : undefined}>
      <a className="skip" href="#main">Skip to content</a>
      <Sidebar open={menu} onClose={() => setMenu(false)} />
      <div className="main-col">
        <Header onMenu={() => setMenu(true)} />
        {loading && overview && <div className="topline" role="progressbar" aria-label="Updating" />}
        <main id="main" tabIndex={-1}>
          {boardStatus === 'error' ? (
            <div className="board-state">
              <ErrorState
                title="This board could not load its data"
                action={
                  <span className="row-gap">
                    <button type="button" className="btn primary" onClick={refreshBoard}>Try again</button>
                    <a className="btn" href={boardUrl(null)}>Show demo data</a>
                  </span>
                }
              >
                {boardError}
              </ErrorState>
            </div>
          ) : (
          <Suspense fallback={<div className="page-loading"><CardSkeleton lines={6} /></div>}>
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/sources" element={<Sources />} />
              <Route path="/dashboards" element={<Dashboards />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/users" element={<Users />} />
              <Route path="/integrations" element={<Integrations />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          )}
        </main>
      </div>
      <EntityDrawer />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppStateProvider>
        <DataProvider>
          <Shell />
        </DataProvider>
      </AppStateProvider>
    </HashRouter>
  );
}
