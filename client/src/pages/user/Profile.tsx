import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useAuth } from "../../hooks/useAuth";
import { Badge } from "../../components/ui/badge";
import { usageApi } from "../../lib/usage";
import type { UsageHistory } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Clock, Calendar } from "lucide-react";

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsageTime, setTotalUsageTime] = useState(0);

  useEffect(() => {
    const fetchUsageHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await usageApi.getMyHistory();
        setUsageHistory(response.usageHistory);
        setTotalUsageTime(response.totalUsageTime);
      } catch (err) {
        console.error("Error fetching usage history:", err);
        setError("Failed to load usage history");
      } finally {
        setLoading(false);
      }
    };

    fetchUsageHistory();
  }, []);

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Your account information and usage history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Name</p>
              <p className="text-muted-foreground">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Role</p>
              <Badge variant="outline" className="capitalize">
                {user?.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium">Member Since</p>
              <p className="text-muted-foreground">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usage History</CardTitle>
          <CardDescription>
            Your recent instrument usage sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-blue-500 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : usageHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No usage history yet. Start using instruments to see your history
              here.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Total Usage Time Summary */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Total Usage Time: {Math.floor(totalUsageTime / 60)}h{" "}
                  {totalUsageTime % 60}m
                </div>
              </div>

              {/* Usage History List */}
              <div className="space-y-3">
                {usageHistory.map((usage) => (
                  <div
                    key={usage._id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{usage.instrument.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {usage.instrument.category}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(usage.startTime)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(usage.startTime, usage.endTime)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge
                          variant={
                            usage.status === "completed"
                              ? "default"
                              : usage.status === "active"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {usage.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Qty: {usage.quantity}
                        </p>
                      </div>
                    </div>
                    {usage.notes && (
                      <div className="mt-2 p-2 bg-muted/30 rounded text-sm">
                        <strong>Notes:</strong> {usage.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
