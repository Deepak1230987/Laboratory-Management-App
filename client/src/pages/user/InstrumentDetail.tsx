import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  Users,
  MapPin,
  Play,
  Square,
  ArrowLeft,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { instrumentsApi } from "../../lib/instruments";
import { usageApi } from "../../lib/usage";
import { useAuth } from "../../hooks/useAuth";
import type { Instrument, UsageHistory } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";

const InstrumentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  console.log("InstrumentDetail - ID from useParams:", id);
  console.log("InstrumentDetail - Current pathname:", window.location.pathname);

  const [instrument, setInstrument] = useState<Instrument | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false);
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [currentUsage, setCurrentUsage] = useState<UsageHistory | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (id) {
          const response = await instrumentsApi.getById(id);
          setInstrument(response);
        }
      } catch (error) {
        console.error("Failed to fetch instrument:", error);
      } finally {
        setLoading(false);
      }
    };

    const checkUsage = async () => {
      try {
        const activeUsage = await usageApi.getMyActive();
        const userUsage = activeUsage.find(
          (usage) => usage.instrument._id === id
        );
        setCurrentUsage(userUsage || null);
      } catch (error) {
        console.error("Failed to check current usage:", error);
      }
    };

    if (id) {
      loadData();
      checkUsage();
    }
  }, [id, user?._id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentUsage) {
      interval = setInterval(() => {
        const startTime = new Date(currentUsage.startTime).getTime();
        const now = Date.now();
        setTimer(Math.floor((now - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentUsage]);

  const fetchInstrument = async () => {
    try {
      setLoading(true);
      if (id) {
        const response = await instrumentsApi.getById(id);
        setInstrument(response);
      }
    } catch (error) {
      console.error("Failed to fetch instrument:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentUsage = async () => {
    try {
      const activeUsage = await usageApi.getMyActive();
      const userUsage = activeUsage.find(
        (usage) => usage.instrument._id === id
      );
      setCurrentUsage(userUsage || null);
    } catch (error) {
      console.error("Failed to check current usage:", error);
    }
  };

  const handleStartUsage = async () => {
    try {
      if (!id) return;

      await usageApi.start(id, quantity);
      setIsUsageDialogOpen(false);
      setQuantity(1);

      // Refresh data
      await fetchInstrument();
      await checkCurrentUsage();
    } catch (error) {
      console.error("Failed to start usage:", error);
    }
  };

  const handleStopUsage = async () => {
    try {
      if (!id) return;

      await usageApi.stop(id, notes);
      setIsStopDialogOpen(false);
      setNotes("");
      setCurrentUsage(null);
      setTimer(0);

      // Refresh data
      await fetchInstrument();
    } catch (error) {
      console.error("Failed to stop usage:", error);
    }
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

  if (!instrument) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Instrument not found</p>
          <Button onClick={() => navigate("/app/instruments")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Instruments
          </Button>
        </div>
      </div>
    );
  }

  const canStartUsage =
    !currentUsage &&
    instrument.status === "available" &&
    (() => {
      const currentlyUsed = (instrument.currentUsers || []).reduce(
        (sum, user) => sum + (user.quantity || 0),
        0
      );
      const available =
        instrument.currentlyAvailable !== undefined
          ? instrument.currentlyAvailable
          : Math.max(0, instrument.quantity - currentlyUsed);
      return available > 0;
    })();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/app/instruments")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Instruments
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {instrument.name}
          </h1>
          <p className="text-muted-foreground">{instrument.category}</p>
        </div>
        <Badge
          variant={
            instrument.status !== "available"
              ? "secondary"
              : (() => {
                  const currentlyUsed = (instrument.currentUsers || []).reduce(
                    (sum, user) => sum + (user.quantity || 0),
                    0
                  );
                  const available =
                    instrument.currentlyAvailable !== undefined
                      ? instrument.currentlyAvailable
                      : Math.max(0, instrument.quantity - currentlyUsed);
                  return available > 0 ? "default" : "destructive";
                })()
          }
          className={
            instrument.status !== "available"
              ? getStatusColor(instrument.status)
              : (() => {
                  const currentlyUsed = (instrument.currentUsers || []).reduce(
                    (sum, user) => sum + (user.quantity || 0),
                    0
                  );
                  const available =
                    instrument.currentlyAvailable !== undefined
                      ? instrument.currentlyAvailable
                      : Math.max(0, instrument.quantity - currentlyUsed);
                  return available > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800";
                })()
          }
        >
          {instrument.status !== "available"
            ? instrument.status
            : (() => {
                const currentlyUsed = (instrument.currentUsers || []).reduce(
                  (sum, user) => sum + (user.quantity || 0),
                  0
                );
                const available =
                  instrument.currentlyAvailable !== undefined
                    ? instrument.currentlyAvailable
                    : Math.max(0, instrument.quantity - currentlyUsed);
                return available > 0 ? "Available" : "Fully Occupied";
              })()}
        </Badge>
      </div>

      {/* Active Usage Timer */}
      {currentUsage && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Clock className="h-5 w-5 mr-2" />
              Active Usage Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-blue-900 mb-2">
                {formatTimer(timer)}
              </div>
              <p className="text-sm text-blue-700 mb-4">
                Started: {new Date(currentUsage.startTime).toLocaleString()}
              </p>
              <Dialog
                open={isStopDialogOpen}
                onOpenChange={setIsStopDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <Square className="h-4 w-4 mr-2" />
                    Stop Usage
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Stop Usage Session</DialogTitle>
                    <DialogDescription>
                      End your current usage session for {instrument.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes about your usage session..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsStopDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleStopUsage}>
                        Stop Usage
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Instrument Info */}
        <Card>
          <CardHeader>
            <CardTitle>Instrument Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {instrument.image && (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={instrument.image}
                  alt={instrument.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {instrument.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Total Quantity</Label>
                  <p className="text-sm">{instrument.quantity}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Available</Label>
                  <p className="text-sm">
                    {(() => {
                      const currentlyUsed = (
                        instrument.currentUsers || []
                      ).reduce((sum, user) => sum + (user.quantity || 0), 0);
                      return instrument.currentlyAvailable !== undefined
                        ? instrument.currentlyAvailable
                        : Math.max(0, instrument.quantity - currentlyUsed);
                    })()}
                  </p>
                </div>
              </div>

              {instrument.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{instrument.location}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Used {instrument.usageCount} times
                </span>
              </div>

              {instrument.manualGuide && (
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Manual
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Control */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Control</CardTitle>
            <CardDescription>
              Start or manage your usage session
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentUsage ? (
              <div className="text-center py-6">
                <Clock className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <p className="text-lg font-medium mb-2">Session Active</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Using {currentUsage.quantity} units since{" "}
                  {new Date(currentUsage.startTime).toLocaleTimeString()}
                </p>
                <p className="text-muted-foreground text-xs">
                  Use the timer above to stop your session
                </p>
              </div>
            ) : canStartUsage ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">Ready to Use</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {(() => {
                      const currentlyUsed = (
                        instrument.currentUsers || []
                      ).reduce((sum, user) => sum + (user.quantity || 0), 0);
                      return instrument.currentlyAvailable !== undefined
                        ? instrument.currentlyAvailable
                        : Math.max(0, instrument.quantity - currentlyUsed);
                    })()}{" "}
                    units available
                  </p>
                </div>

                <Dialog
                  open={isUsageDialogOpen}
                  onOpenChange={setIsUsageDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Start Usage
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start Usage Session</DialogTitle>
                      <DialogDescription>
                        Begin using {instrument.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="quantity">Quantity to Use</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max={(() => {
                            const currentlyUsed = (
                              instrument.currentUsers || []
                            ).reduce(
                              (sum, user) => sum + (user.quantity || 0),
                              0
                            );
                            return instrument.currentlyAvailable !== undefined
                              ? instrument.currentlyAvailable
                              : Math.max(
                                  0,
                                  instrument.quantity - currentlyUsed
                                );
                          })()}
                          value={quantity}
                          onChange={(e) =>
                            setQuantity(parseInt(e.target.value) || 1)
                          }
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum:{" "}
                          {(() => {
                            const currentlyUsed = (
                              instrument.currentUsers || []
                            ).reduce(
                              (sum, user) => sum + (user.quantity || 0),
                              0
                            );
                            return instrument.currentlyAvailable !== undefined
                              ? instrument.currentlyAvailable
                              : Math.max(
                                  0,
                                  instrument.quantity - currentlyUsed
                                );
                          })()}{" "}
                          units
                        </p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsUsageDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleStartUsage}>
                          Start Session
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-muted-foreground">
                  {instrument.status !== "available" ? (
                    <p>Instrument is currently {instrument.status}</p>
                  ) : (() => {
                      const currentlyUsed = (
                        instrument.currentUsers || []
                      ).reduce((sum, user) => sum + (user.quantity || 0), 0);
                      const available =
                        instrument.currentlyAvailable !== undefined
                          ? instrument.currentlyAvailable
                          : Math.max(0, instrument.quantity - currentlyUsed);
                      return available <= 0;
                    })() ? (
                    <p>All units are currently in use</p>
                  ) : (
                    <p>Unable to start usage session</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Users */}
      {instrument.currentUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Users</CardTitle>
            <CardDescription>
              Other users currently using this instrument
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {instrument.currentUsers.map((usage, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{usage.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {usage.user.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Quantity: {usage.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Since: {new Date(usage.startTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specifications */}
      {Object.keys(instrument.specifications).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(instrument.specifications).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-sm font-medium text-muted-foreground">
                    {key}
                  </dt>
                  <dd className="text-sm">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InstrumentDetail;
