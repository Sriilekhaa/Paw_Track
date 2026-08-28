"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PawPrint, Shield, Lock, Mail, ArrowRight, UserCheck, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, setDemoUser } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      // Determine where to redirect based on email/role
      if (email.includes("admin")) {
        router.push("/dashboard/admin");
      } else if (email.includes("field") || email.includes("officer")) {
        router.push("/dashboard/field-worker");
      } else {
        router.push("/dashboard/citizen");
      }
    } else {
      setError(result.message || "Invalid email or password.");
    }
  };

  const handleQuickDemo = (role: "citizen" | "field_worker" | "admin") => {
    setDemoUser(role);
    if (role === "admin") router.push("/dashboard/admin");
    else if (role === "field_worker") router.push("/dashboard/field-worker");
    else router.push("/dashboard/citizen");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-md">
            <PawPrint className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl text-teal-900 tracking-tight">
            Civic<span className="text-teal-600">Paws</span>
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Access your animal welfare reporting or operations dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Quick Demo Switcher Card for instant evaluation */}
        <div className="mb-6 bg-teal-50 border border-teal-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
              Quick Role Preview (One-Click)
            </span>
          </div>
          <p className="text-xs text-teal-900/80 mb-3">
            Switch between authenticated stakeholder personas instantly:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo("citizen")}
              className="py-2 px-2.5 bg-white border border-teal-200 hover:border-teal-400 rounded-lg text-xs font-semibold text-teal-800 text-center shadow-xs hover:bg-teal-100/50 transition-all"
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("field_worker")}
              className="py-2 px-2.5 bg-white border border-teal-200 hover:border-teal-400 rounded-lg text-xs font-semibold text-amber-800 text-center shadow-xs hover:bg-amber-100/50 transition-all"
            >
              Field Worker
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo("admin")}
              className="py-2 px-2.5 bg-white border border-teal-200 hover:border-teal-400 rounded-lg text-xs font-semibold text-emerald-800 text-center shadow-xs hover:bg-emerald-100/50 transition-all"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Standard Credentials Form */}
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-medium">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@civicpaws.org"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-bold text-teal-700 hover:text-teal-800"
              >
                Create a free account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
