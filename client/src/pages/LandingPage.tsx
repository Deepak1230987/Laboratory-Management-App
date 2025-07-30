import React from "react";
import { Link } from "react-router-dom";
import {
  FlaskConical,
  TestTube,
  Users,
  Clock,
  Shield,
  Zap,
} from "lucide-react";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Lab Manager
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Modern Laboratory
            <span className="text-blue-600"> Management System</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your laboratory operations with our comprehensive
            instrument management platform. Track usage, manage resources, and
            optimize productivity with real-time monitoring.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              to="/login"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 font-semibold text-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to manage your lab
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools necessary for efficient
              laboratory management and instrument tracking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TestTube className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Instrument Management
              </h3>
              <p className="text-gray-600">
                Add, edit, and organize all your laboratory instruments with
                detailed specifications and availability tracking.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Usage Tracking
              </h3>
              <p className="text-gray-600">
                Monitor instrument usage in real-time with built-in timers and
                comprehensive usage history analytics.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                User Management
              </h3>
              <p className="text-gray-600">
                Manage user access, roles, and permissions with comprehensive
                admin controls and user activity monitoring.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure Access
              </h3>
              <p className="text-gray-600">
                Role-based authentication ensures secure access with separate
                admin and user interfaces for optimal security.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Real-time Monitoring
              </h3>
              <p className="text-gray-600">
                Get instant updates on instrument status, active sessions, and
                system alerts with live dashboard monitoring.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FlaskConical className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Laboratory Analytics
              </h3>
              <p className="text-gray-600">
                Generate comprehensive reports and analytics to optimize lab
                efficiency and resource utilization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to modernize your laboratory?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of laboratories already using our platform to
            streamline their operations and improve efficiency.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-50 font-semibold text-lg transition-colors"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FlaskConical className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-semibold text-white">
              Lab Manager
            </span>
          </div>
          <p className="text-sm">
            © 2025 Lab Manager. All rights reserved. Modern laboratory
            management made simple.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
