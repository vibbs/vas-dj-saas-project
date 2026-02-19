from django.urls import path

from .views import (
    DashboardStatsView,
    RecentActivityView,
    TeamOverviewView,
    UsageMetricsView,
)

urlpatterns = [
    path("stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("activity/", RecentActivityView.as_view(), name="dashboard-activity"),
    path("team/", TeamOverviewView.as_view(), name="dashboard-team"),
    path("usage/", UsageMetricsView.as_view(), name="dashboard-usage"),
]

app_name = "dashboard"
