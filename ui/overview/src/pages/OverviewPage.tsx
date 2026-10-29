/* Overview: KPI row, globe + performance, top locations + distribution + categories, health + events + insights. */
import { useApp } from '../app/state';
import { useData } from '../app/data';
import type { WidgetId } from '../domains/types';
import { KpiCard, KpiSkeleton } from '../components/kpi/KpiCard';
import { GlobalOverview } from '../components/widgets/GlobalOverview';
import { PerformanceCard } from '../components/widgets/PerformanceCard';
import { TopEntities } from '../components/widgets/TopEntities';
import { DistributionCard } from '../components/widgets/DistributionCard';
import { CategoryCard } from '../components/widgets/CategoryCard';
import { HealthCard } from '../components/widgets/HealthCard';
import { EventsCard } from '../components/widgets/EventsCard';
import { InsightsCard } from '../components/widgets/InsightsCard';
import { ErrorState } from '../components/ui/States';

export default function OverviewPage() {
  const { domain, settings, fo, resolved } = useApp();
  const { overview, error, reload } = useData();
  const show = (w: WidgetId) => domain.widgets.includes(w) && !settings.hiddenWidgets.includes(w);
  return (
    <div className="ov">
      <h1 className="sr-only">
        {domain.label} overview, {resolved.text}
      </h1>
      {error && (
        <ErrorState title="Could not load the numbers" action={<button type="button" className="btn" onClick={reload}>Try again</button>}>
          {error}
        </ErrorState>
      )}
      {show('kpis') && (
        <section className="kpi-row" aria-label="Key metrics" style={{ ['--kpi-n' as string]: Math.max(3, domain.kpis.length) }}>
          {overview ? overview.kpis.map((k) => <KpiCard key={k.def.id} k={k} fo={fo} />) : Array.from({ length: 5 }, (_, i) => <KpiSkeleton key={i} />)}
        </section>
      )}
      <div className="row row-a">
        {show('globe') && <GlobalOverview />}
        {show('performance') && <PerformanceCard />}
      </div>
      <div className="row row-b">
        {show('top') && <TopEntities limit={Math.min(8, Math.max(5, show('categories') ? domain.categories.items.length : 5))} />}
        {show('distribution') && <DistributionCard />}
        {show('categories') && <CategoryCard />}
      </div>
      <div className="row row-c">
        {show('health') && <HealthCard />}
        {show('events') && <EventsCard />}
        {show('insights') && <InsightsCard />}
      </div>
    </div>
  );
}
