import React, { useState, useEffect } from "react";
import { Clock, Beaker, TrendingUp, Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../hooks/useAuth";
import { usageApi } from "../../lib/usage";
import { instrumentsApi } from "../../lib/instruments";
import type { UsageHistory, Instrument } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeUsage, setActiveUsage] = useState<UsageHistory[]>([]);
  const [recentHistory, setRecentHistory] = useState<UsageHistory[]>([]);
  const [availableInstruments, setAvailableInstruments] = useState<
    Instrument[]
  >([]);
  const [stats, setStats] = useState({
    totalUsageTime: 0,
    instrumentsUsed: 0,
    currentlyUsing: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch active usage
        const activeResponse = await usageApi.getMyActive();
        setActiveUsage(activeResponse);

        // Fetch recent history
        const historyResponse = await usageApi.getMyHistory({ limit: 5 });
        setRecentHistory(historyResponse.usageHistory);

        // Fetch available instruments
        const instrumentsResponse = await instrumentsApi.getAll({
          limit: 6,
          status: "available",
        });
        setAvailableInstruments(instrumentsResponse.instruments);

        // Set stats
        setStats({
          totalUsageTime: historyResponse.totalUsageTime || 0,
          instrumentsUsed: new Set(
            (historyResponse.usageHistory || []).map((h) => h.instrument._id)
          ).size,
          currentlyUsing: (activeResponse || []).length,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Set default values to prevent crashes
        setActiveUsage([]);
        setRecentHistory([]);
        setAvailableInstruments([]);
        setStats({
          totalUsageTime: 0,
          instrumentsUsed: 0,
          currentlyUsing: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?._id]);

  // Auto-refresh dashboard data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Timer effect for active usage
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeUsage.length > 0) {
        const newTimers: Record<string, number> = {};
        activeUsage.forEach((usage) => {
          const startTime = new Date(usage.startTime).getTime();
          const now = Date.now();
          newTimers[usage._id] = Math.floor((now - startTime) / 1000);
        });
        setTimers(newTimers);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeUsage]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch active usage
      const activeResponse = await usageApi.getMyActive();
      setActiveUsage(activeResponse);

      // Fetch recent history
      const historyResponse = await usageApi.getMyHistory({ limit: 5 });
      setRecentHistory(historyResponse.usageHistory);

      // Fetch available instruments
      const instrumentsResponse = await instrumentsApi.getAll({
        limit: 6,
        status: "available",
      });
      setAvailableInstruments(instrumentsResponse.instruments);

      // Set stats
      setStats({
        totalUsageTime: historyResponse.totalUsageTime || 0,
        instrumentsUsed: new Set(
          (historyResponse.usageHistory || []).map((h) => h.instrument._id)
        ).size,
        currentlyUsing: (activeResponse || []).length,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStopUsage = async (instrumentId: string) => {
    try {
      await usageApi.stop(instrumentId);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Failed to stop usage:", error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your laboratory activity
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Currently Using
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentlyUsing}</div>
            <p className="text-xs text-muted-foreground">Active sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Usage Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(stats.totalUsageTime * 60)}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Instruments Used
            </CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.instrumentsUsed}</div>
            <p className="text-xs text-muted-foreground">
              Different instruments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                (recentHistory || []).filter((h) => {
                  const date = new Date(h.createdAt);
                  const now = new Date();
                  return (
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Active Usage */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>
              Instruments you're currently using
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(activeUsage || []).length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No active sessions</p>
                <Link to="/app/instruments">
                  <Button className="mt-2">Browse Instruments</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {(activeUsage || []).map((usage) => (
                  <div
                    key={usage._id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <Link
                      to={`/app/instruments/${usage.instrument._id}`}
                      className="flex-1"
                    >
                      <div className="space-y-1 cursor-pointer">
                        <p className="font-medium hover:text-blue-600 transition-colors">
                          {usage.instrument.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Started: {new Date(usage.startTime).toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            Quantity: {usage.quantity}
                          </Badge>
                          <Badge variant="secondary" className="font-mono">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDuration(timers[usage._id] || 0)}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                    <Button
                      variant="destructive"
                      onClick={() => handleStopUsage(usage.instrument._id)}
                      className="ml-4 "
                    >
                      Stop Usage
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Instruments */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Available Instruments</CardTitle>
            <CardDescription>
              Quick access to available equipment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(availableInstruments || []).map((instrument) => (
                <Link
                  key={instrument._id}
                  to={`/app/instruments/${instrument._id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{instrument.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(() => {
                          const currentlyUsed = (
                            instrument.currentUsers || []
                          ).reduce(
                            (sum, user) => sum + (user.quantity || 0),
                            0
                          );

                          let available;
                          if (instrument.currentlyAvailable !== undefined) {
                            available = Math.max(
                              0,
                              instrument.currentlyAvailable
                            );
                          } else {
                            const totalQuantity = instrument.quantity || 0;
                            available = Math.max(
                              0,
                              totalQuantity - currentlyUsed
                            );
                          }

                          return available;
                        })()}
                        /{instrument.quantity} available
                      </p>
                    </div>
                    <Badge
                      variant={(() => {
                        const currentlyUsed = (
                          instrument.currentUsers || []
                        ).reduce((sum, user) => sum + (user.quantity || 0), 0);

                        let available;
                        if (instrument.currentlyAvailable !== undefined) {
                          available = Math.max(
                            0,
                            instrument.currentlyAvailable
                          );
                        } else {
                          const totalQuantity = instrument.quantity || 0;
                          available = Math.max(
                            0,
                            totalQuantity - currentlyUsed
                          );
                        }

                        return available > 0 ? "default" : "destructive";
                      })()}
                      className={(() => {
                        const currentlyUsed = (
                          instrument.currentUsers || []
                        ).reduce((sum, user) => sum + (user.quantity || 0), 0);

                        let available;
                        if (instrument.currentlyAvailable !== undefined) {
                          available = Math.max(
                            0,
                            instrument.currentlyAvailable
                          );
                        } else {
                          const totalQuantity = instrument.quantity || 0;
                          available = Math.max(
                            0,
                            totalQuantity - currentlyUsed
                          );
                        }

                        return available > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800";
                      })()}
                    >
                      {(() => {
                        const currentlyUsed = (
                          instrument.currentUsers || []
                        ).reduce((sum, user) => sum + (user.quantity || 0), 0);

                        let available;
                        if (instrument.currentlyAvailable !== undefined) {
                          available = Math.max(
                            0,
                            instrument.currentlyAvailable
                          );
                        } else {
                          const totalQuantity = instrument.quantity || 0;
                          available = Math.max(
                            0,
                            totalQuantity - currentlyUsed
                          );
                        }

                        return available > 0 ? "Available" : "Fully Occupied";
                      })()}
                    </Badge>
                  </div>
                </Link>
              ))}
              <Link to="/instruments">
                <Button variant="outline" className="w-full">
                  View All Instruments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest instrument usage history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(recentHistory || []).length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(recentHistory || []).map((history) => (
                <div
                  key={history._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{history.instrument.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(history.startTime).toLocaleDateString()} -
                      Duration: {formatDuration(history.duration * 60)}
                    </p>
                  </div>
                  <Badge
                    className={
                      history.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : history.status === "active"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {history.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
