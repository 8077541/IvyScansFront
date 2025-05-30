"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { checkApiConfig, testFetch, checkForInterference, runApiDiagnostics } from "@/lib/api-debug"

export default function DebugPage() {
  const [configInfo, setConfigInfo] = useState<any>(null)
  const [fetchTestResult, setFetchTestResult] = useState<any>(null)
  const [interferenceInfo, setInterferenceInfo] = useState<any>(null)
  const [isRunningTests, setIsRunningTests] = useState(false)

  useEffect(() => {
    // Run initial diagnostics
    const config = checkApiConfig()
    setConfigInfo(config)

    const interference = checkForInterference()
    setInterferenceInfo(interference)
  }, [])

  const runFetchTest = async () => {
    setIsRunningTests(true)
    try {
      const result = await testFetch("https://httpbin.org/get")
      setFetchTestResult(result)
    } finally {
      setIsRunningTests(false)
    }
  }

  const runAllTests = async () => {
    setIsRunningTests(true)
    try {
      const config = checkApiConfig()
      setConfigInfo(config)

      const interference = checkForInterference()
      setInterferenceInfo(interference)

      const result = await testFetch("https://httpbin.org/get")
      setFetchTestResult(result)

      runApiDiagnostics()
    } finally {
      setIsRunningTests(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">API Debug Page</h1>
      <p className="text-muted-foreground mb-6">
        This page helps diagnose API-related issues by providing tools to inspect and debug API calls.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Current API configuration settings</CardDescription>
          </CardHeader>
          <CardContent>
            {configInfo ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Mock API:</span>
                  <Badge
                    variant={configInfo.mockApi ? "default" : "outline"}
                    className={configInfo.mockApi ? "bg-green-500" : ""}
                  >
                    {configInfo.mockApi ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>API Base URL:</span>
                  <code className="bg-secondary p-1 rounded text-xs">{configInfo.apiBaseUrl}</code>
                </div>
                <div className="flex justify-between items-center">
                  <span>Environment:</span>
                  <Badge>{configInfo.environment}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>localStorage Available:</span>
                  {configInfo.localStorageAvailable ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span>Auth Token Present:</span>
                  {configInfo.hasToken ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            ) : (
              <p>Loading configuration information...</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={() => setConfigInfo(checkApiConfig())}>Refresh Config Info</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fetch Test</CardTitle>
            <CardDescription>Test if fetch requests are working properly</CardDescription>
          </CardHeader>
          <CardContent>
            {fetchTestResult ? (
              <div className="space-y-4">
                <Alert variant={fetchTestResult.success ? "default" : "destructive"}>
                  {fetchTestResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>{fetchTestResult.success ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription>
                    {fetchTestResult.success
                      ? `Fetch request succeeded with status ${fetchTestResult.status}`
                      : `Fetch request failed: ${fetchTestResult.error?.message || "Unknown error"}`}
                  </AlertDescription>
                </Alert>

                {fetchTestResult.success && (
                  <div className="bg-secondary p-3 rounded">
                    <p className="text-sm font-medium mb-1">
                      Status: {fetchTestResult.status} {fetchTestResult.statusText}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p>No fetch test has been run yet.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={runFetchTest} disabled={isRunningTests}>
              {isRunningTests ? "Running Test..." : "Run Fetch Test"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Potential Interference</CardTitle>
          <CardDescription>Check for browser features that might interfere with API calls</CardDescription>
        </CardHeader>
        <CardContent>
          {interferenceInfo ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Service Worker API Available:</span>
                {interferenceInfo.hasServiceWorker ? (
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500">
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="outline">No</Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span>Possible Extension Interference:</span>
                {interferenceInfo.possibleExtensionInterference ? (
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500">
                    Possible
                  </Badge>
                ) : (
                  <Badge variant="outline">Unlikely</Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span>Content Security Policy Meta Tag:</span>
                {interferenceInfo.hasCSPMetaTag ? (
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500">
                    Present
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Present</Badge>
                )}
              </div>
            </div>
          ) : (
            <p>Loading interference information...</p>
          )}
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <div className="flex justify-center">
        <Button size="lg" onClick={runAllTests} disabled={isRunningTests} className="bg-green-500 hover:bg-green-600">
          {isRunningTests ? "Running All Tests..." : "Run All Diagnostics"}
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Troubleshooting Tips</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Failed to Fetch Errors</h3>
            <p className="text-sm text-muted-foreground">
              If you're seeing "Failed to fetch" errors, it could be due to:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground ml-4 mt-2">
              <li>Network connectivity issues</li>
              <li>CORS restrictions</li>
              <li>The API server being down</li>
              <li>Browser extensions interfering with requests</li>
              <li>Content Security Policy restrictions</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium">Using Mock API</h3>
            <p className="text-sm text-muted-foreground">
              If you're using the mock API (USE_MOCK_API = true), you shouldn't be seeing any network requests. If you
              are, there might be a bug in the code that's not respecting the mock API flag.
            </p>
          </div>

          <div>
            <h3 className="font-medium">Browser Extensions</h3>
            <p className="text-sm text-muted-foreground">
              Try disabling browser extensions, especially ad blockers, privacy tools, or developer tools that might be
              interfering with network requests.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
