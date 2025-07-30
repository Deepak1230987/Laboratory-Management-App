import React, { useState, useEffect } from "react";
import { Users, Beaker, Activity, Clock, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { instrumentsApi } from "../../lib/instruments";
import { usageApi } from "../../lib/usage";
import type { Instrument, UsageHistory } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInstruments: 0,
    activeUsers: 0,
    currentUsage: 0,
    totalUsageHours: 0,
    availableInstruments: 0,
    maintenanceInstruments: 0,
  });
  const [recentActivity, setRecentActivity] = useState<UsageHistory[]>([]);
  const [activeUsage, setActiveUsage] = useState<UsageHistory[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [timers, setTimers] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Timer effect for real-time updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeUsage.length > 0) {
      interval = setInterval(() => {
        const newTimers: { [key: string]: number } = {};
        activeUsage.forEach((usage) => {
          const startTime = new Date(usage.startTime).getTime();
          const now = Date.now();
          newTimers[usage._id] = Math.floor((now - startTime) / 1000);
        });
        setTimers(newTimers);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeUsage]);

  // Refresh dashboard data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch instruments
      const instrumentsResponse = await instrumentsApi.getAll();
      const allInstruments = instrumentsResponse?.instruments || [];
      setInstruments(allInstruments);

      // Fetch active usage
      const activeResponse = await usageApi.getActive();
      const activeUsageData = activeResponse || [];
      setActiveUsage(activeUsageData);

      // Fetch recent usage history
      const historyResponse = await usageApi.getAllHistory({ limit: 10 });
      const historyData = historyResponse?.usageHistory || [];
      setRecentActivity(historyData);

      // Calculate stats
      const availableCount = allInstruments.filter(
        (i) => i.status === "available"
      ).length;
      const maintenanceCount = allInstruments.filter(
        (i) => i.status === "maintenance"
      ).length;
      const activeUsersCount = new Set(
        activeUsageData.map((u) => u.user?._id).filter(Boolean)
      ).size;
      const totalUsageTime = historyData.reduce(
        (total, usage) => total + (usage.duration || 0),
        0
      );

      setStats({
        totalInstruments: allInstruments.length,
        activeUsers: activeUsersCount,
        currentUsage: activeUsageData.length,
        totalUsageHours: Math.round((totalUsageTime / 3600) * 100) / 100,
        availableInstruments: availableCount,
        maintenanceInstruments: maintenanceCount,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // Set default values to prevent crashes
      setInstruments([]);
      setActiveUsage([]);
      setRecentActivity([]);
      setStats({
        totalInstruments: 0,
        activeUsers: 0,
        currentUsage: 0,
        totalUsageHours: 0,
        availableInstruments: 0,
        maintenanceInstruments: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForceStop = async (instrumentId: string, userId: string) => {
    try {
      await usageApi.forceStop(instrumentId, userId, "Force stopped by admin");
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Failed to force stop usage:", error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTimer = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "unavailable":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Laboratory management overview and analytics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Instruments
            </CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInstruments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.availableInstruments} available,{" "}
              {stats.maintenanceInstruments} in maintenance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              currently using instruments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentUsage}</div>
            <p className="text-xs text-muted-foreground">
              instruments currently in use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsageHours}h</div>
            <p className="text-xs text-muted-foreground">
              total recorded usage time
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Active Usage Monitor */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Active Usage Monitor</CardTitle>
            <CardDescription>
              Real-time monitoring of instrument usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(activeUsage || []).length === 0 ? (
              <div className="text-center py-6">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No active usage sessions
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(activeUsage || []).map((usage) => (
                  <div
                    key={usage._id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{usage.instrument.name}</p>
                      <p className="text-sm text-muted-foreground">
                        User: {usage.user.name} ({usage.user.email})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Started: {new Date(usage.startTime).toLocaleString()}
                      </p>
                      <Badge variant="outline">
                        Quantity: {usage.quantity}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-lg font-mono font-bold text-blue-900">
                          {formatTimer(
                            timers[usage._id] ||
                              Math.floor(
                                (Date.now() -
                                  new Date(usage.startTime).getTime()) /
                                  1000
                              )
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Active Time
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleForceStop(usage.instrument._id, usage.user._id)
                        }
                      >
                        Force Stop
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/admin/instruments">
                <Button variant="outline" className="w-full justify-start">
                  <Beaker className="h-4 w-4 mr-2" />
                  Manage Instruments
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/usage">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Usage Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instrument Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Instrument Status Overview</CardTitle>
          <CardDescription>
            Current status of all laboratory instruments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(instruments || []).length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                No instruments registered yet.
              </p>
              <Link to="/admin/instruments">
                <Button className="mt-2">Add Instruments</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instrument</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Current Users</TableHead>
                  <TableHead>Usage Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(instruments || []).slice(0, 10).map((instrument) => (
                  <TableRow key={instrument._id}>
                    <TableCell className="font-medium">
                      {instrument.name}
                    </TableCell>
                    <TableCell>{instrument.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          instrument.status !== "available"
                            ? "secondary"
                            : (() => {
                                const currentlyUsed = (
                                  instrument.currentUsers || []
                                ).reduce(
                                  (sum, user) => sum + (user.quantity || 0),
                                  0
                                );

                                let available;
                                if (
                                  instrument.currentlyAvailable !== undefined
                                ) {
                                  available = Math.max(
                                    0,
                                    instrument.currentlyAvailable
                                  );
                                } else {
                                  const totalQuantity =
                                    instrument.quantity || 0;
                                  available = Math.max(
                                    0,
                                    totalQuantity - currentlyUsed
                                  );
                                }

                                return available > 0
                                  ? "default"
                                  : "destructive";
                              })()
                        }
                        className={
                          instrument.status !== "available"
                            ? getStatusColor(instrument.status)
                            : (() => {
                                const currentlyUsed = (
                                  instrument.currentUsers || []
                                ).reduce(
                                  (sum, user) => sum + (user.quantity || 0),
                                  0
                                );

                                let available;
                                if (
                                  instrument.currentlyAvailable !== undefined
                                ) {
                                  available = Math.max(
                                    0,
                                    instrument.currentlyAvailable
                                  );
                                } else {
                                  const totalQuantity =
                                    instrument.quantity || 0;
                                  available = Math.max(
                                    0,
                                    totalQuantity - currentlyUsed
                                  );
                                }

                                return available > 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800";
                              })()
                        }
                      >
                        {instrument.status !== "available"
                          ? instrument.status
                          : (() => {
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

                              return available > 0
                                ? "Available"
                                : "Fully Occupied";
                            })()}
                      </Badge>
                    </TableCell>
                    <TableCell>
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

                        return `${available}/${instrument.quantity}`;
                      })()}
                    </TableCell>
                    <TableCell>
                      {(instrument.currentUsers || []).length > 0 ? (
                        <div className="space-y-1">
                          {(instrument.currentUsers || []).map(
                            (user, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {user.user.name}
                              </Badge>
                            )
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>{instrument.usageCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest usage history across all instruments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(recentActivity || []).length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(recentActivity || []).map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{activity.instrument.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Used by {activity.user.name} • Duration:{" "}
                      {formatDuration(activity.duration * 60)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.startTime).toLocaleDateString()} at{" "}
                      {new Date(activity.startTime).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge
                    className={
                      activity.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : activity.status === "active"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {activity.status}
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

export default AdminDashboard;
