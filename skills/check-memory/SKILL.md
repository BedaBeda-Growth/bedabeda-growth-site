---
name: Check Memory
description: Check OpenViking local memory health — verifies ChromaDB is running, all corpora are ingested, query latency is acceptable, and surfaces any alerts. Use when Nick says "check memory", "is ChromaDB up?", "memory health", "check the DB", "is local memory live?", or any time you need to confirm the semantic memory layer is operational before a planning session.
---

# Check Memory

Verify that ChromaDB (OpenViking local memory) is fully operational and ready for semantic search.

## Workflow

### 1. Run the health check script

```bash
cd ~/scceo-1 && python3 openviking/scripts/memory_health.py 2>&1
```

### 2. Interpret results

Parse the JSON output and report:

| Field | Green | Yellow | Red |
|-------|-------|--------|-----|
| `status` | `healthy` | `stale` | `degraded` / `stopped` |
| `service_up` | `true` | — | `false` |
| `query_latency_ms` | `< 500` | `500–2000` | `> 2000` or `-1` |
| `alerts` | `[]` | — | any entries |

**If `service_up: false`** — ChromaDB is down. Start it:
```bash
cd ~/scceo-1/openviking && bash start.sh
```
Then re-run ingest if any new exports exist:
```bash
cd ~/scceo-1 && python3 openviking/scripts/ingest.py --corpus all
```
Then re-run the health check.

**If corpus `ingested < exported`** — new artifacts have not been embedded yet. Run ingest:
```bash
cd ~/scceo-1 && python3 openviking/scripts/ingest.py --corpus all
```

**If `status: healthy` and `alerts: []`** — memory is fully operational. Report clearly: memory is live, N docs embedded across 4 collections, latency Xms.

### 3. Quick sanity query (optional, run when status is healthy)

Test that semantic search is actually returning results:
```bash
cd ~/scceo-1 && python3 openviking/scripts/pre_plan_memory.py --domain general --title "test query" --format json 2>&1 | head -20
```

If `search_method` in results shows `chromadb_vector` then real vector search is active. If it shows `file_fallback` then ChromaDB is reachable but the collection may be empty.

## Key Paths

| Purpose | Path |
|---------|------|
| Start ChromaDB | `~/scceo-1/openviking/start.sh` |
| Stop ChromaDB | `~/scceo-1/openviking/stop.sh` |
| Health check script | `~/scceo-1/openviking/scripts/memory_health.py` |
| Ingest script | `~/scceo-1/openviking/scripts/ingest.py` |
| Chroma data dir | `~/scceo-1/openviking/data/chroma/` |
| Health log | `~/scceo-1/openviking/logs/health-latest.json` |
| ChromaDB port | `7080` (localhost only) |

## Corpus Map

| Collection | Source exports |
|------------|---------------|
| `megafix` | `exports/openviking/megafix/` — incidents, postmortems |
| `daily` | `exports/openviking/daily/` — session overviews, reds |
| `outcomes` | `exports/openviking/outcomes/` — resolved work outcomes |
| `rules` | `exports/openviking/rules/` — rule heatmap, patterns |

---

## Variants / Absorbed Modes

### --startup
Runs automatically during the system boot sequence to verify semantic constraints before morning planning.
*(absorbed: startup-memory)*
