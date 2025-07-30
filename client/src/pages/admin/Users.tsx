import React, { useState, useEffect } from "react";
import { Search, Edit, Trash2, UserPlus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { authApi } from "../../lib/auth";
import { usersApi } from "../../lib/users";
import type { User } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAll();
      const usersData = response?.users || [];
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]); // Ensure users is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update user logic would go here
        console.log("Update user:", formData);
      } else {
        await authApi.register(formData);
      }
      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "user",
        isActive: true,
      });
      fetchUsers();
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        // Delete user logic would go here
        console.log("Delete user:", id);
        fetchUsers();
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      await usersApi.toggleUserStatus(user._id);
      fetchUsers();
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  const filteredUsers = (users || []).filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    return role === "admin"
      ? "bg-purple-100 text-purple-800"
      : "bg-blue-100 text-blue-800";
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Users Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingUser(null);
                setFormData({
                  name: "",
                  email: "",
                  password: "",
                  role: "user",
                  isActive: true,
                });
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Add New User"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Update the user details below."
                  : "Fill in the details to add a new user."}
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "user") =>
                    setFormData((prev) => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
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
                  {editingUser ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts and access levels
          </CardDescription>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No users found. Add some users to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Currently Using</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.isActive)}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.currentlyUsing.length > 0 ? (
                        <div className="space-y-1">
                          {user.currentlyUsing.map((usage, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {usage.instrument.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user)}
                        >
                          {user.isActive ? "Disable" : "Enable"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user._id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
