# Observability Quick Start Guide

## 🎯 What You Get

- **Prometheus**: Metrics collection and storage
- **Grafana**: Pre-built dashboards for visualization
- **OpenTelemetry**: Optional distributed tracing
- **Feature-Flagged**: Disabled by default to save costs

## 🚀 2-Minute Setup

### 1. Enable Observability

Create/edit `.env`:

```bash
OBSERVABILITY_ENABLED=true
METRICS_ENABLED=true
TRACING_ENABLED=false  # Keep disabled (expensive)
```

### 2. Start the Stack

```bash
make start-with-observability
```

### 3. Access Dashboards

```bash
make observability-dashboard  # Opens Grafana
```

- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Metrics**: http://localhost:8000/metrics

## 📊 What You'll See

The pre-built Grafana dashboard shows:

- ✅ Request rate (req/s)
- ✅ Response time (p50, p95, p99)
- ✅ Error rates (4xx, 5xx)
- ✅ Active requests
- ✅ Top endpoints
- ✅ Exception tracking

## 💰 Cost Awareness

**Resource Requirements**:
- Prometheus: ~500MB memory
- Grafana: ~200MB memory
- Total: ~700MB overhead

**Recommendations**:
- ✅ Development: Enable for testing
- ⚠️ Staging: Enable with sampling
- ❌ Production: Only if budgeted

## 🎛️ Cost Optimization

For production, use sampling:

```bash
OBSERVABILITY_ENABLED=true
METRICS_ENABLED=true
METRICS_SAMPLE_RATE=0.1  # Sample 10% of requests
TRACING_ENABLED=false     # Disable expensive tracing
```

This reduces overhead by 90% while still providing useful metrics.

## 📚 Full Documentation

See [OBSERVABILITY.md](./OBSERVABILITY.md) for:
- Complete configuration reference
- Custom metrics examples
- Distributed tracing guide
- Troubleshooting tips
- Production deployment best practices

## 🛠️ Quick Commands

```bash
# Start
make observability-start

# Stop
make observability-stop

# View logs
make observability-logs

# Clean up
make observability-clean

# Help
make observability-help
```

## 🐛 Troubleshooting

**No data in Grafana?**

1. Check Prometheus targets: http://localhost:9090/targets
2. Ensure metrics endpoint works: http://localhost:8000/metrics
3. Make some API requests to generate data
4. Wait 15-30 seconds for first scrape

**Metrics endpoint disabled?**

Ensure environment variables are set and restart:

```bash
export OBSERVABILITY_ENABLED=true
export METRICS_ENABLED=true
make stop && make start
```

---

**Need Help?** Check the full documentation in [OBSERVABILITY.md](./OBSERVABILITY.md)
