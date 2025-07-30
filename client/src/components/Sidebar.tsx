import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { useAuth } from "../hooks/useAuth";
import {
  LayoutDashboard,
  TestTube,
  Users,
  History,
  User,
  FlaskConical,
} from "lucide-react";

const Sidebar: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const userNavItems = [
    {
      title: "Dashboard",
      href: "/app/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Instruments",
      href: "/app/instruments",
      icon: TestTube,
    },
    {
      title: "Profile",
      href: "/app/profile",
      icon: User,
    },
  ];

  const adminNavItems = [
    {
      title: "Dashboard",
      href: "/app/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Instruments",
      href: "/app/admin/instruments",
      icon: TestTube,
    },
    {
      title: "Users",
      href: "/app/admin/users",
      icon: Users,
    },
    {
      title: "Usage History",
      href: "/app/admin/usage",
      icon: History,
    },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <FlaskConical className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lab Manager</h1>
            <p className="text-sm text-gray-500 capitalize">
              {user?.role} Panel
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
