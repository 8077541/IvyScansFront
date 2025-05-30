/**
 * API Debug Utility
 *
 * This utility helps diagnose API-related issues by providing
 * tools to inspect and debug API calls.
 */

// Check if the mock API flag is properly set
import { USE_MOCK_API, API_BASE_URL } from "./config"

// Declare chrome if it's not already defined
declare var chrome: any

export function checkApiConfig() {
  console.group("🔍 API Configuration Check")
  console.log("USE_MOCK_API:", USE_MOCK_API)
  console.log("API_BASE_URL:", API_BASE_URL)

  // Check if we're in development or production
  console.log("Environment:", process.env.NODE_ENV)

  // Check if localStorage is available
  let localStorageAvailable = false
  try {
    localStorageAvailable = typeof window !== "undefined" && !!window.localStorage
  } catch (e) {
    // In some environments, even checking localStorage can throw
  }
  console.log("localStorage available:", localStorageAvailable)

  // Check if there's a token in localStorage
  if (localStorageAvailable) {
    const token = localStorage.getItem("token")
    console.log("Token in localStorage:", token ? "Yes (length: " + token.length + ")" : "No")
  }

  console.groupEnd()

  return {
    mockApi: USE_MOCK_API,
    apiBaseUrl: API_BASE_URL,
    environment: process.env.NODE_ENV,
    localStorageAvailable,
    hasToken: localStorageAvailable ? !!localStorage.getItem("token") : false,
  }
}

// Test a fetch request to see if it works
export async function testFetch(url = "https://httpbin.org/get") {
  console.group("🔍 Fetch Test")
  console.log("Testing fetch to URL:", url)

  try {
    const response = await fetch(url)
    const success = response.ok
    console.log("Fetch successful:", success)
    console.log("Status:", response.status)
    console.log("Status text:", response.statusText)

    try {
      const data = await response.json()
      console.log("Response data:", data)
    } catch (e) {
      console.log("Could not parse response as JSON")
    }

    console.groupEnd()
    return { success, status: response.status, statusText: response.statusText }
  } catch (error) {
    console.error("Fetch error:", error)
    console.groupEnd()
    return { success: false, error }
  }
}

// Check if the browser has any extensions that might be interfering with fetch
export function checkForInterference() {
  console.group("🔍 Interference Check")

  // Check for service workers
  const hasServiceWorker = "serviceWorker" in navigator
  console.log("Service Worker API available:", hasServiceWorker)

  if (hasServiceWorker) {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        console.log("Active Service Workers:", registrations.length)
        registrations.forEach((registration) => {
          console.log("- Service Worker scope:", registration.scope)
        })
      })
      .catch((err) => {
        console.error("Error checking service workers:", err)
      })
  }

  // Check for extensions that might modify fetch
  console.log("Chrome extension interference possible:", typeof chrome !== "undefined" && !!chrome.runtime)

  // Check for Content-Security-Policy
  const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
  console.log("CSP meta tag present:", !!metaCSP)
  if (metaCSP) {
    console.log("CSP content:", metaCSP.getAttribute("content"))
  }

  console.groupEnd()

  return {
    hasServiceWorker,
    possibleExtensionInterference: typeof chrome !== "undefined" && !!chrome.runtime,
    hasCSPMetaTag: !!metaCSP,
  }
}

// Run all checks
export function runApiDiagnostics() {
  console.group("📊 API Diagnostics")

  const configCheck = checkApiConfig()
  checkForInterference()

  // Only test fetch if we're not using mock API
  if (!configCheck.mockApi) {
    testFetch(`${API_BASE_URL}/health`).then((result) => {
      console.log("API health check result:", result)
    })
  } else {
    console.log("Skipping fetch test because mock API is enabled")
  }

  console.groupEnd()
}
