import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
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

const AdminInstruments: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<Instrument | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 1,
    category: "",
    location: "",
    status: "available" as "available" | "unavailable" | "maintenance",
  });

  useEffect(() => {
    fetchInstruments();
  }, []);

  const fetchInstruments = async () => {
    try {
      setLoading(true);
      console.log("Fetching instruments...");
      const response = await instrumentsApi.getAll();
      console.log("Instruments response:", response);
      const instrumentsData = response?.instruments || [];
      console.log("Instruments data:", instrumentsData);
      setInstruments(instrumentsData);
    } catch (error) {
      console.error("Failed to fetch instruments:", error);
      setInstruments([]); // Ensure instruments is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("quantity", formData.quantity.toString());
      form.append("category", formData.category);
      form.append("location", formData.location);
      form.append("status", formData.status);

      if (editingInstrument) {
        await instrumentsApi.update(editingInstrument._id, form);
      } else {
        await instrumentsApi.create(form);
      }
      setIsDialogOpen(false);
      setEditingInstrument(null);
      setFormData({
        name: "",
        description: "",
        quantity: 1,
        category: "",
        location: "",
        status: "available",
      });
      fetchInstruments();
    } catch (error) {
      console.error("Failed to save instrument:", error);
    }
  };

  const handleEdit = (instrument: Instrument) => {
    setEditingInstrument(instrument);
    setFormData({
      name: instrument.name,
      description: instrument.description,
      quantity: instrument.quantity,
      category: instrument.category,
      location: instrument.location || "",
      status: instrument.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this instrument?")) {
      try {
        await instrumentsApi.delete(id);
        fetchInstruments();
      } catch (error) {
        console.error("Failed to delete instrument:", error);
      }
    }
  };

  const filteredInstruments = (instruments || []).filter(
    (instrument) =>
      instrument.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instrument.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Instruments Management
          </h1>
          <p className="text-muted-foreground">
            Manage laboratory instruments and equipment
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingInstrument(null);
                setFormData({
                  name: "",
                  description: "",
                  quantity: 1,
                  category: "",
                  location: "",
                  status: "available",
                });
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Instrument
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingInstrument ? "Edit Instrument" : "Add New Instrument"}
              </DialogTitle>
              <DialogDescription>
                {editingInstrument
                  ? "Update the instrument details below."
                  : "Fill in the details to add a new instrument."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: parseInt(e.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(
                    value: "available" | "unavailable" | "maintenance"
                  ) => setFormData((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingInstrument ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instruments</CardTitle>
          <CardDescription>Manage your laboratory instruments</CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search instruments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstruments.map((instrument) => (
                <TableRow key={instrument._id}>
                  <TableCell className="font-medium">
                    {instrument.name}
                  </TableCell>
                  <TableCell>{instrument.category}</TableCell>
                  <TableCell>{instrument.quantity}</TableCell>
                  <TableCell>
                    {(() => {
                      const currentlyUsed = (
                        instrument.currentUsers || []
                      ).reduce((sum, user) => sum + (user.quantity || 0), 0);

                      // Use virtual property if available, otherwise calculate
                      if (instrument.currentlyAvailable !== undefined) {
                        return Math.max(0, instrument.currentlyAvailable);
                      }

                      // Fallback: calculate based on total quantity minus used
                      const totalQuantity = instrument.quantity || 0;
                      const available = Math.max(
                        0,
                        totalQuantity - currentlyUsed
                      );
                      return available;
                    })()}
                  </TableCell>
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
                  <TableCell>{instrument.location || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(instrument)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(instrument._id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInstruments;
