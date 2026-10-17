# DataBridge dashboard AI performance tuning

## Changes in this build

- AI table profiles are cached in each backend process (default TTL 60 seconds) so repeated dashboard builds do not repeatedly run expensive profiling queries over the same Delta tables.
- Concurrent requests for the same table share one profiling job (single-flight).
- Independent table profiles run concurrently, capped at three by default. Set `DASH_AI_PROFILE_CONCURRENCY` to tune this against Spark capacity.
- Dashboard validation no longer runs a full `COUNT(*)` over every planned dataset merely to estimate output rows. It still validates the query shape with a limited result query.
- Identical simultaneous dashboard queries share one in-flight Spark query within each backend process.
- Query result cache capacity is configurable with `DASH_QUERY_CACHE_LIMIT` (default 1000 entries per process).

## Environment variables

```dotenv
# Set to 0 to disable profile caching. Keep this short for near-real-time schemas/data.
DASH_AI_PROFILE_CACHE_SECONDS=60
DASH_AI_PROFILE_CACHE_MAX=256
DASH_AI_PROFILE_CONCURRENCY=3
DASH_QUERY_CACHE_LIMIT=1000
```

## Delta/Spark recommendations for 10M+ rows

1. Make the AI builder choose aggregate datasets for charts and KPI widgets, not raw-row datasets. Keep detail previews bounded and paginated.
2. Partition Delta tables by useful low-cardinality/date dimensions only when query patterns justify it; avoid high-cardinality partitioning.
3. Run `OPTIMIZE` on fragmented Delta tables where supported and consider `ZORDER BY` on frequently filtered columns (e.g. date, region/customer key) after reviewing workload. These are operational commands and must be run in the target environment, not automatically by this app.
4. Keep frequently used summaries in incrementally refreshed Delta aggregate tables. This is the largest likely win for repeated near-real-time dashboard queries, but requires a data-specific refresh strategy.
5. Inspect Spark UI/query plans for full scans, shuffles, skew, and small files before adjusting executor memory or shuffle partitions.
6. For multi-process/multi-replica deployments, the Python in-memory caches are per process. Use a shared cache or distributed request coalescing if duplicate jobs across replicas remain a problem.

## Benchmark status

The source archive can be syntax-checked locally, but no live Spark/Delta cluster or Airflow installation is available in this execution environment. Therefore, no before/after latency numbers or 10x/100x claim is reported. Benchmark with representative Delta tables and concurrency in the deployment environment. Compare cold and warm AI build latency, Spark job count, query scan bytes, shuffle read/write, and p50/p95 latency at 1, 10, and 50 concurrent users.
