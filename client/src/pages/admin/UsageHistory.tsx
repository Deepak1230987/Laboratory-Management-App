import React, { useState, useEffect } from "react";
import {
  Calendar,
  Download,
  Filter,
  Search,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { usageApi } from "../../lib/usage";
import { instrumentsApi } from "../../lib/instruments";
import type { UsageHistory, Instrument } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";

const AdminUsageHistory: React.FC = () => {
  const [usage, setUsage] = useState<UsageHistory[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [instrumentFilter, setInstrumentFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [analytics, setAnalytics] = useState({
    totalSessions: 0,
    totalUsageTime: 0,
    averageSessionTime: 0,
    mostUsedInstrument: "",
    activeUsers: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: Record<string, string | number> = {
          page: pagination.page,
          limit: pagination.limit,
        };

        if (statusFilter !== "all") params.status = statusFilter;
        if (instrumentFilter !== "all") params.instrumentId = instrumentFilter;
        if (searchTerm) params.search = searchTerm;

        const response = await usageApi.getAllHistory(params);
        const responseData = response?.usageHistory || [];
        setUsage(responseData);
        setPagination((prev) => ({
          ...prev,
          total: response?.pagination?.total || 0,
          pages: response?.pagination?.pages || 0,
        }));

        // Calculate analytics
        const totalTime = responseData.reduce(
          (sum, item) => sum + (item.duration || 0),
          0
        );
        const activeUsers = new Set(
          responseData.map((item) => item.user?._id).filter(Boolean)
        ).size;
        const instrumentUsage = responseData.reduce((acc, item) => {
          if (item.instrument?.name) {
            acc[item.instrument.name] = (acc[item.instrument.name] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const mostUsed = Object.entries(instrumentUsage).sort(
          ([, a], [, b]) => b - a
        )[0];

        setAnalytics({
          totalSessions: response?.pagination?.total || 0,
          totalUsageTime: totalTime,
          averageSessionTime:
            responseData.length > 0
              ? Math.round(totalTime / responseData.length)
              : 0,
          mostUsedInstrument: mostUsed ? mostUsed[0] : "N/A",
          activeUsers,
        });
      } catch (error) {
        console.error("Failed to fetch usage data:", error);
        // Set default values to prevent crashes
        setUsage([]);
        setPagination({ page: 1, limit: 10, total: 0, pages: 0 });
        setAnalytics({
          totalSessions: 0,
          totalUsageTime: 0,
          averageSessionTime: 0,
          mostUsedInstrument: "N/A",
          activeUsers: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchInsts = async () => {
      try {
        const response = await instrumentsApi.getAll();
        setInstruments(response?.instruments || []);
      } catch (error) {
        console.error("Failed to fetch instruments:", error);
        setInstruments([]); // Ensure instruments is always an array
      }
    };

    fetchData();
    fetchInsts();
  }, [
    pagination.page,
    pagination.limit,
    statusFilter,
    instrumentFilter,
    searchTerm,
  ]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      case "terminated":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportData = () => {
    // Create CSV content
    const headers = [
      "Date",
      "User",
      "Instrument",
      "Duration",
      "Status",
      "Notes",
    ];
    const csvContent = [
      headers.join(","),
      ...(usage || []).map((item) =>
        [
          new Date(item.startTime).toLocaleDateString(),
          item.user.name,
          item.instrument.name,
          formatDuration(item.duration * 60),
          item.status,
          item.notes || "",
        ]
          .map((field) => `"${field}"`)
          .join(",")
      ),
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usage_history_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && (usage || []).length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usage Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive usage history and analytics
          </p>
        </div>
        <Button onClick={exportData} disabled={(usage || []).length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sessions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSessions}</div>
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
              {formatDuration(analytics.totalUsageTime * 60)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Session
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(analytics.averageSessionTime * 60)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {analytics.mostUsedInstrument}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter usage history by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={instrumentFilter}
              onValueChange={setInstrumentFilter}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Instrument" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Instruments</SelectItem>
                {(instruments || []).map((instrument) => (
                  <SelectItem key={instrument._id} value={instrument._id}>
                    {instrument.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Usage History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
          <CardDescription>
            Detailed usage records with pagination
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(usage || []).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No usage history found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Instrument</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(usage || []).map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {new Date(item.startTime).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(item.startTime).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {item.instrument.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.instrument.category}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono">
                          {formatDuration(item.duration * 60)}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate text-sm">
                          {item.notes || "-"}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.pages}
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsageHistory;
