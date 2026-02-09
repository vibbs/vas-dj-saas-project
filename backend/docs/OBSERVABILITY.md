# Observability Stack - Prometheus + Grafana

Production-grade observability for the VAS-DJ SaaS Django backend with **cost-optimization** built-in.

## 🎯 Overview

This observability stack provides:

- **Prometheus**: Metrics collection and time-series storage
- **Grafana**: Beautiful dashboards for metrics visualization
- **OpenTelemetry**: Distributed tracing (optional, expensive)
- **Django Metrics**: Automatic HTTP request instrumentation
- **Custom Business Metrics**: Track user registrations, API usage, etc.

### 💰 Cost Considerations

**IMPORTANT**: Observability infrastructure has real costs:

| Component | Memory | Disk | Network | Notes |
|-----------|--------|------|---------|-------|
| Prometheus | ~500MB | ~10GB/month | High | Scales with metric cardinality |
| Grafana | ~200MB | Minimal | Low | Mostly reads from Prometheus |
| **Total** | **~700MB** | **~10GB/month** | **Medium** | Plus application overhead |

**Recommendation**: Start with observability **disabled** in production. Enable only when:
- You have monitoring budget allocated
- You need to debug performance issues
- You're preparing for scale and need baseline metrics

---

## 🚀 Quick Start

### 1. Enable Observability

Edit your `.env` file:

```bash
# Minimal setup (metrics only, no tracing)
OBSERVABILITY_ENABLED=true
METRICS_ENABLED=true
TRACING_ENABLED=false  # Keep disabled to save costs
```

### 2. Start the Stack

```bash
# Option 1: Start everything together
make start-with-observability

# Option 2: Start separately (if backend already running)
make observability-start
```

### 3. Access Dashboards

```bash
# Open Grafana dashboard
make observability-dashboard
# URL: http://localhost:3001 (admin/admin)

# Open Prometheus UI
make observability-prometheus
# URL: http://localhost:9090
```

### 4. View Metrics

- **Metrics Endpoint**: http://localhost:8000/metrics
- **Grafana Dashboard**: http://localhost:3001 → "VAS-DJ SaaS - Django Overview"
- **Prometheus Targets**: http://localhost:9090/targets

---

## 📊 Available Metrics

### HTTP Request Metrics (Automatic)

Collected by `MetricsMiddleware`:

- **Request Rate**: `django_http_requests_total` - Total requests by method, endpoint, status
- **Request Duration**: `django_http_request_duration_seconds` - Latency histogram (p50, p95, p99)
- **Active Requests**: `django_http_requests_active` - Current in-flight requests
- **Response Size**: `django_http_response_size_bytes` - Response payload sizes
- **Exceptions**: `django_http_exceptions_total` - Exception counts by type

### Business Metrics (Custom)

Track domain-specific events using helper functions:

```python
from apps.core.observability.metrics import (
    record_user_registration,
    record_login_attempt,
    record_organization_operation,
    record_cache_operation,
)

# In your views or services
record_user_registration(status="success")
record_login_attempt(status="success", method="email")
record_organization_operation(operation="create", status="success")
record_cache_operation(operation="get", hit=True)
```

Available business metrics:
- `app_user_registrations_total` - User registrations
- `app_login_attempts_total` - Login attempts
- `app_organization_operations_total` - Organization CRUD ops
- `app_cache_operations_total` - Cache hit/miss rates
- `app_feature_flag_evaluations_total` - Feature flag usage
- `app_rate_limit_hits_total` - Rate limiting enforcement

### Celery Task Metrics

Track background task performance:

```python
from apps.core.observability.metrics import track_celery_task

@track_celery_task
@celery_app.task
def send_welcome_email(user_id):
    # Task implementation
    pass
```

Metrics:
- `app_celery_task_duration_seconds` - Task execution time
- `app_celery_tasks_total` - Task counts by status

---

## 🎛️ Configuration Reference

### Environment Variables

| Variable | Default | Description | Cost Impact |
|----------|---------|-------------|-------------|
| `OBSERVABILITY_ENABLED` | `false` | Master switch | None when `false` |
| `METRICS_ENABLED` | `false` | Enable Prometheus metrics | Low |
| `TRACING_ENABLED` | `false` | Enable distributed tracing | **HIGH** ⚠️ |
| `DETAILED_METRICS_ENABLED` | `false` | Per-user/org metrics | **Medium-High** ⚠️ |
| `METRICS_SAMPLE_RATE` | `1.0` | Request sampling (0.0-1.0) | Scales inversely |
| `TRACING_SAMPLE_RATE` | `0.01` | Trace sampling (0.0-1.0) | Scales with rate |
| `METRICS_RETENTION_DAYS` | `7` | Days to keep metrics | Scales linearly |

### Cost Optimization Strategies

#### 1. Sampling (Recommended for Production)

Reduce data volume by sampling requests:

```bash
# Development: Track everything
METRICS_SAMPLE_RATE=1.0  # 100% of requests

# Production: Sample 10% of requests
METRICS_SAMPLE_RATE=0.1  # Reduces volume by 90%

# High-traffic production: Sample 1%
METRICS_SAMPLE_RATE=0.01  # Minimal overhead
```

#### 2. Disable Expensive Features

```bash
# Tracing is the most expensive feature
TRACING_ENABLED=false  # Recommended for production

# Detailed metrics create high cardinality
DETAILED_METRICS_ENABLED=false  # Avoid unless needed
```

#### 3. Reduce Retention

```bash
# Default: 7 days
METRICS_RETENTION_DAYS=7

# Cost-optimized: 3 days
METRICS_RETENTION_DAYS=3

# Debugging mode: 1 day
METRICS_RETENTION_DAYS=1
```

#### 4. Cardinality Limits

The system automatically limits:
- Max 10 labels per metric
- Max 100 unique values per label
- Endpoint patterns normalized (e.g., `/users/123` → `/users/{id}`)

---

## 📈 Grafana Dashboard

Pre-built dashboard: **VAS-DJ SaaS - Django Overview**

### Panels

1. **Request Rate (req/s)** - Requests per second by method and status
2. **Response Time Latency (ms)** - p50, p95, p99 percentiles
3. **Error Rate (%)** - 4xx and 5xx error percentages
4. **Active Requests** - Currently in-flight requests
5. **Top 10 Endpoints** - Most frequently hit endpoints
6. **Exceptions Rate** - Exception counts by type
7. **Response Size** - Payload size distribution
8. **Total Request Rate** - Overall throughput gauge

### Customizing Dashboards

1. Open Grafana: http://localhost:3001
2. Navigate to dashboard
3. Click "⚙️ Dashboard settings" → "Make editable copy"
4. Add panels using Prometheus data source
5. Export JSON to `docker/grafana/dashboards/`

---

## 🔍 Distributed Tracing (Advanced)

**⚠️ WARNING**: Tracing is expensive. Only enable when actively debugging.

### Enable Tracing

```bash
OBSERVABILITY_ENABLED=true
METRICS_ENABLED=true
TRACING_ENABLED=true
TRACING_SAMPLE_RATE=0.01  # Only trace 1% of requests
```

### Using Trace Decorators

```python
from apps.core.observability.tracing import trace_function, TraceContext

# Automatic function tracing
@trace_function(span_name="process_payment")
def process_payment(amount, user_id):
    # Function is automatically traced
    return charge_stripe(amount)

# Manual trace context
with TraceContext("complex_operation") as span:
    span.set_attribute("user_id", user_id)
    span.set_attribute("amount", amount)
    # Your code here
```

### Database Operation Tracing

```python
from apps.core.observability.tracing import trace_database_operation

@trace_database_operation("select", table="users")
def get_active_users():
    return User.objects.filter(is_active=True)
```

### Cache Operation Tracing

```python
from apps.core.observability.tracing import trace_cache_operation

@trace_cache_operation("get", key="user:123")
def get_user_from_cache(user_id):
    return cache.get(f"user:{user_id}")
```

---

## 🛠️ Makefile Commands

```bash
# Start/Stop
make observability-start          # Start Prometheus + Grafana
make observability-stop           # Stop observability stack
make start-with-observability     # Start app + observability together

# Access
make observability-dashboard      # Open Grafana
make observability-prometheus     # Open Prometheus

# Maintenance
make observability-logs           # View logs
make observability-clean          # Remove all data (volumes)

# Help
make observability-help           # Show detailed help
```

---

## 🐛 Troubleshooting

### Metrics Endpoint Returns 503

**Problem**: http://localhost:8000/metrics shows "Metrics endpoint is disabled"

**Solution**:
```bash
# Ensure environment variables are set
export OBSERVABILITY_ENABLED=true
export METRICS_ENABLED=true

# Restart containers
make stop
make start
```

### No Data in Grafana

**Problem**: Dashboard shows "No data"

**Checklist**:
1. ✅ Prometheus is running: http://localhost:9090
2. ✅ Prometheus can scrape Django: http://localhost:9090/targets (should be UP)
3. ✅ Metrics endpoint works: http://localhost:8000/metrics
4. ✅ Application is receiving traffic (make some API requests)
5. ✅ Wait 15-30 seconds for first scrape

**Debug Prometheus Target**:
```bash
# Check if Prometheus can reach Django
docker exec -it vas-dj-prometheus wget -O- http://web:8000/metrics
```

### High Memory Usage

**Problem**: Prometheus using too much memory

**Solutions**:

1. **Reduce retention**:
```bash
METRICS_RETENTION_DAYS=3  # Instead of 7
```

2. **Increase sampling**:
```bash
METRICS_SAMPLE_RATE=0.1  # Sample only 10%
```

3. **Disable detailed metrics**:
```bash
DETAILED_METRICS_ENABLED=false
```

### Tracing Not Working

**Problem**: No traces appearing

**Checklist**:
1. ✅ `TRACING_ENABLED=true`
2. ✅ `TRACING_SAMPLE_RATE` > 0 (try 1.0 for testing)
3. ✅ Application restarted after changing settings
4. ✅ Making requests to generate traces

---

## 📚 Production Deployment

### Recommended Production Configuration

```bash
# Cost-optimized production settings
OBSERVABILITY_ENABLED=true
METRICS_ENABLED=true
TRACING_ENABLED=false              # Disable unless debugging
DETAILED_METRICS_ENABLED=false     # Disable high-cardinality metrics
METRICS_SAMPLE_RATE=0.1            # Sample 10% of requests
TRACING_SAMPLE_RATE=0.01           # If tracing enabled, sample 1%
METRICS_RETENTION_DAYS=7           # 7 days retention
```

### Security Considerations

1. **Protect metrics endpoint** (production):
```python
# In config/urls/__init__.py
# Add authentication or IP whitelist to metrics_view
```

2. **Change Grafana credentials**:
```bash
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=secure-password-here  # Change default!
```

3. **Use SSL/TLS** for Grafana in production

### External Prometheus/Grafana

If using managed Prometheus/Grafana (e.g., Grafana Cloud):

1. **Expose metrics endpoint** with authentication
2. **Configure remote write** in Prometheus:
```yaml
remote_write:
  - url: https://your-prometheus-endpoint.com/api/prom/push
    basic_auth:
      username: your-username
      password: your-password
```

---

## 🔗 Resources

### Documentation
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [OpenTelemetry Python](https://opentelemetry.io/docs/instrumentation/python/)

### Grafana Cloud (Managed Solution)
- [Grafana Cloud Free Tier](https://grafana.com/products/cloud/) - 10K series, 50GB logs/month

### Metrics Best Practices
- [Prometheus Naming Conventions](https://prometheus.io/docs/practices/naming/)
- [Cardinality Best Practices](https://grafana.com/blog/2022/02/15/what-are-cardinality-spikes-and-why-do-they-matter/)

---

## 🤝 Contributing

### Adding Custom Metrics

1. **Define metric** in `apps/core/observability/metrics.py`:
```python
_custom_metrics["my_new_metric"] = Counter(
    "app_my_new_metric_total",
    "Description of what this tracks",
    labelnames=["label1", "label2"],
)
```

2. **Create helper function**:
```python
def record_my_event(label1: str, label2: str) -> None:
    if not is_metrics_enabled():
        return
    _initialize_custom_metrics()
    if _custom_metrics.get("my_new_metric"):
        _custom_metrics["my_new_metric"].labels(
            label1=label1, label2=label2
        ).inc()
```

3. **Use in application code**:
```python
from apps.core.observability.metrics import record_my_event

record_my_event(label1="value1", label2="value2")
```

### Adding Grafana Panels

Edit `docker/grafana/dashboards/django-overview.json` or create new dashboard JSON files.

---

## 📝 License

This observability stack configuration is part of the VAS-DJ SaaS project.

---

## ❓ Support

- **Issues**: Check troubleshooting section above
- **Questions**: Open an issue in the project repository
- **Costs**: Review cost optimization strategies before enabling in production
