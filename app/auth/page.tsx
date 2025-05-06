"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/logo";
import { useAuth } from "@/contexts/auth-context";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [callbackUrl, setCallbackUrl] = useState("/");

  // Get auth context
  const {
    login,
    register,
    error,
    clearError,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  // Form state
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setMounted(true);

    // Get callback URL from query params
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const callback = params.get("callbackUrl") || "/";
      setCallbackUrl(callback);
    }

    // If user is already authenticated, redirect to callback URL or homepage
    if (isAuthenticated && !authLoading) {
      console.log(
        "[Auth Page] User is authenticated, redirecting to:",
        callbackUrl
      );
      window.location.href = callbackUrl;
    }
  }, [isAuthenticated, authLoading, callbackUrl]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mounted) return;

    setIsLoading(true);
    setFormError(null);
    clearError();

    try {
      await login(loginData.email, loginData.password);
      console.log("[Auth Page] Login successful, redirecting to:", callbackUrl);
      // Force navigation to callback URL or homepage
      window.location.href = callbackUrl;
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mounted) return;

    setIsLoading(true);
    setFormError(null);
    clearError();

    // Check if passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setFormError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Check password length
    if (registerData.password.length < 8) {
      setFormError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      // Register the user
      await register(
        registerData.username,
        registerData.email,
        registerData.password
      );
      console.log(
        "[Auth Page] Registration successful, redirecting to:",
        callbackUrl
      );
      // Force navigation to callback URL or homepage
      window.location.href = callbackUrl;
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create account"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Return a simpler version during SSR
  if (!mounted) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-16rem)] py-12">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-500 rounded-full"></div>
              <span className="ml-2 font-bold text-2xl">Ivy Scans</span>
            </div>
          </div>
          <div className="border rounded-lg p-8">
            <div className="h-6 w-1/2 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-3/4 bg-gray-700 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="h-10 bg-green-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If already authenticated, show loading state
  if (isAuthenticated) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-16rem)] py-12">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Already Signed In</CardTitle>
              <CardDescription>Redirecting you...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="h-8 w-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-16rem)] py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Logo size="lg" />
          </Link>
        </div>

        {(formError || error) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError || error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10"
                        required
                        value={loginData.email}
                        onChange={(e) =>
                          setLoginData({ ...loginData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/auth/reset-password"
                        className="text-xs text-green-400 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        required
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm">
                      Remember me
                    </Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-green-400 hover:bg-green-500 glow-green"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                  Enter your details to create a new account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="coolreader123"
                        className="pl-10"
                        required
                        value={registerData.username}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            username: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="name@example.com"
                        className="pl-10"
                        required
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        required
                        value={registerData.password}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            password: e.target.value,
                          })
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        required
                        value={registerData.confirmPassword}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            confirmPassword: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-green-400 hover:underline"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-green-400 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-green-400 hover:bg-green-500 glow-green"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-green-400 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-green-400 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
