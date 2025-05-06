"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { API_BASE_URL, USE_MOCK_API } from "@/lib/config";
import { comicService, authService, userService } from "@/lib/api";

export default function ApiDiagnosticsPage() {
  const [results, setResults] = useState<
    Array<{ name: string; status: "success" | "error"; message: string }>
  >([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTest, setActiveTest] = useState<string | null>(null);

  const runTest = async (name: string, testFn: () => Promise<any>) => {
    setActiveTest(name);
    try {
      await testFn();
      setResults((prev) => [
        ...prev,
        { name, status: "success", message: "Test passed successfully" },
      ]);
    } catch (error) {
      setResults((prev) => [
        ...prev,
        {
          name,
          status: "error",
          message: error instanceof Error ? error.message : String(error),
        },
      ]);
    }
    setActiveTest(null);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    // Test comic endpoints
    await runTest("Get All Comics", () => comicService.getAllComics());
    await runTest("Get Featured Comics", () =>
      comicService.getFeaturedComics()
    );
    await runTest("Get Latest Comics", () => comicService.getLatestComics());
    await runTest("Get Comic Details", () => comicService.getComicById("1"));
    await runTest("Get Comic Chapters", () =>
      comicService.getComicChapters("1")
    );
    await runTest("Get Chapter", () => comicService.getChapter("1", 1));
    await runTest("Get Genres", () => comicService.getGenres());
    await runTest("Search Comics", () => comicService.searchComics("dragon"));

    // Test auth endpoints (only if not using mock API)
    if (!USE_MOCK_API) {
      await runTest("Get Current User", () => authService.getCurrentUser());
    }

    // Test user endpoints
    await runTest("Get Bookmarks", () => userService.getBookmarks());
    await runTest("Get Ratings", () => userService.getRatings());
    await runTest("Get Reading History", () => userService.getReadingHistory());
    await runTest("Get Profile", () => userService.getProfile());

    setIsRunning(false);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">API Diagnostics</h1>
      <p className="text-muted-foreground mb-6">
        Test the API endpoints to ensure they are working correctly and diagnose
        any issues.
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Current API configuration settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">API Base URL</p>
              <p className="text-sm text-muted-foreground">{API_BASE_URL}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Mock API</p>
              <Badge
                variant={USE_MOCK_API ? "default" : "outline"}
                className={USE_MOCK_API ? "bg-green-500" : ""}
              >
                {USE_MOCK_API ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={runAllTests} disabled={isRunning}>
            {isRunning ? "Running Tests..." : "Run All Tests"}
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Test Results</h2>
        {activeTest && (
          <div className="p-4 border rounded-md bg-secondary">
            <p className="flex items-center">
              <span className="mr-2 h-4 w-4 rounded-full bg-blue-500 animate-pulse"></span>
              Running: {activeTest}
            </p>
          </div>
        )}
        {results.length === 0 && !activeTest ? (
          <p className="text-muted-foreground">No tests have been run yet.</p>
        ) : (
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 border rounded-md ${
                  result.status === "success"
                    ? "bg-green-500/10 border-green-500/50"
                    : "bg-red-500/10 border-red-500/50"
                }`}
              >
                <div className="flex justify-between">
                  <h3 className="font-medium">{result.name}</h3>
                  <Badge
                    variant="outline"
                    className={
                      result.status === "success"
                        ? "bg-green-500/20 text-green-500 border-green-500/50"
                        : "bg-red-500/20 text-red-500 border-red-500/50"
                    }
                  >
                    {result.status === "success" ? "Success" : "Error"}
                  </Badge>
                </div>
                <p
                  className={`text-sm mt-1 ${
                    result.status === "success"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {result.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator className="my-8" />

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Troubleshooting Guide</h2>
        <Card>
          <CardHeader>
            <CardTitle>Common Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">CORS Errors</h3>
              <p className="text-sm text-muted-foreground">
                If you see CORS errors in the console, ensure your backend has
                proper CORS headers set up. The backend should allow requests
                from your frontend domain.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Authentication Errors</h3>
              <p className="text-sm text-muted-foreground">
                If you see 401 or 403 errors, check that your authentication
                token is being properly sent and that it hasn't expired.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Network Errors</h3>
              <p className="text-sm text-muted-foreground">
                If you see "Failed to fetch" errors, check that your backend
                server is running and accessible from your frontend.
              </p>
            </div>
            <div>
              <h3 className="font-medium">Data Format Errors</h3>
              <p className="text-sm text-muted-foreground">
                If you see errors about unexpected token or invalid JSON, check
                that your backend is returning data in the expected format.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
