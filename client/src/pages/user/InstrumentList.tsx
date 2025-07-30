import React, { useState, useEffect } from "react";
import { Search, Clock } from "lucide-react";
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
import { instrumentsApi } from "../../lib/instruments";
import type { Instrument } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";

const InstrumentList: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};

        if (searchTerm) params.search = searchTerm;
        if (categoryFilter !== "all") params.category = categoryFilter;
        if (statusFilter !== "all") params.status = statusFilter;

        const response = await instrumentsApi.getAll(params);
        setInstruments(response.instruments || []);

        // Extract unique categories
        const instrumentData = response.instruments || [];
        const uniqueCategories = [
          ...new Set(instrumentData.map((inst) => inst.category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch instruments:", error);
        setInstruments([]); // Ensure instruments is always an array
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, categoryFilter, statusFilter]);

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

  const getAvailabilityText = (instrument: Instrument) => {
    if (instrument.status !== "available") {
      return (
        instrument.status.charAt(0).toUpperCase() + instrument.status.slice(1)
      );
    }
    // Use currentlyAvailable virtual property if available, fallback to calculation
    const currentlyUsed = (instrument.currentUsers || []).reduce(
      (sum, user) => sum + (user.quantity || 0),
      0
    );
    const currentlyAvailable =
      instrument.currentlyAvailable !== undefined
        ? instrument.currentlyAvailable
        : Math.max(0, instrument.quantity - currentlyUsed);

    return `${currentlyAvailable}/${instrument.quantity} available`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Instruments</h1>
        <p className="text-muted-foreground">
          Browse and manage laboratory instruments
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter instruments by category, status, or search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search instruments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Instruments Grid */}
      {instruments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No instruments found matching your criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {instruments.map((instrument) => (
            <Card key={instrument._id} className="overflow-hidden">
              {instrument.image && (
                <div className="aspect-video bg-muted">
                  <img
                    src={instrument.image}
                    alt={instrument.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{instrument.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {instrument.category}
                    </CardDescription>
                  </div>
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
                            const available =
                              instrument.currentlyAvailable !== undefined
                                ? instrument.currentlyAvailable
                                : Math.max(
                                    0,
                                    instrument.quantity - currentlyUsed
                                  );
                            return available > 0 ? "default" : "destructive";
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
                            const available =
                              instrument.currentlyAvailable !== undefined
                                ? instrument.currentlyAvailable
                                : Math.max(
                                    0,
                                    instrument.quantity - currentlyUsed
                                  );
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
                          const available =
                            instrument.currentlyAvailable !== undefined
                              ? instrument.currentlyAvailable
                              : Math.max(
                                  0,
                                  instrument.quantity - currentlyUsed
                                );
                          return available > 0 ? "Available" : "Fully Occupied";
                        })()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {instrument.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Availability:</span>
                    <span className="font-medium">
                      {getAvailabilityText(instrument)}
                    </span>
                  </div>
                  {instrument.location && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{instrument.location}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Usage Count:</span>
                    <span className="font-medium">{instrument.usageCount}</span>
                  </div>
                </div>

                {/* Current Users */}
                {instrument.currentUsers.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Currently used by:
                    </p>
                    <div className="space-y-1">
                      {instrument.currentUsers.map((user, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-xs"
                        >
                          <span>{user.user.name}</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(user.startTime).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link to={`/app/instruments/${instrument._id}`}>
                  <Button
                    className="w-full"
                    disabled={
                      instrument.status !== "available" ||
                      (() => {
                        const currentlyUsed = (
                          instrument.currentUsers || []
                        ).reduce((sum, user) => sum + (user.quantity || 0), 0);
                        const available =
                          instrument.currentlyAvailable !== undefined
                            ? instrument.currentlyAvailable
                            : Math.max(0, instrument.quantity - currentlyUsed);
                        return available <= 0;
                      })()
                    }
                  >
                    {instrument.status !== "available"
                      ? "Unavailable"
                      : (() => {
                          const currentlyUsed = (
                            instrument.currentUsers || []
                          ).reduce(
                            (sum, user) => sum + (user.quantity || 0),
                            0
                          );
                          const available =
                            instrument.currentlyAvailable !== undefined
                              ? instrument.currentlyAvailable
                              : Math.max(
                                  0,
                                  instrument.quantity - currentlyUsed
                                );
                          return available <= 0
                            ? "Fully Occupied"
                            : "View Details";
                        })()}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstrumentList;
