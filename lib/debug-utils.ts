/**
 * Debug utility functions to help identify issues in the application
 */

// Track API calls with their parameters
export function trackApiCall(endpoint: string, params: any) {
  if (process.env.NODE_ENV === "development") {
    console.group(`🔍 API Call: ${endpoint}`);
    console.log("Parameters:", params);

    // Get the call stack to identify where this call is coming from
    try {
      throw new Error("API Call Stack Trace");
    } catch (e) {
      if (e instanceof Error) {
        // Format the stack trace to be more readable
        const stackLines = e.stack?.split("\n").slice(2) || [];
        console.log("Call Stack:", stackLines);
      }
    }

    console.groupEnd();
  }
}

// Check for undefined or null parameters
export function checkParams(
  params: Record<string, any> | Promise<Record<string, any>>,
  functionName: string
) {
  if (process.env.NODE_ENV === "development") {
    const checkParamsAsync = async () => {
      // Await params if it's a promise
      const resolvedParams = params instanceof Promise ? await params : params;
      const invalidParams: string[] = [];

      Object.entries(resolvedParams).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          invalidParams.push(key);
        }
      });

      if (invalidParams.length > 0) {
        console.warn(
          `⚠️ ${functionName} called with invalid parameters:`,
          invalidParams
        );

        // Get the call stack
        try {
          throw new Error("Parameter Check Stack Trace");
        } catch (e) {
          if (e instanceof Error) {
            const stackLines = e.stack?.split("\n").slice(2) || [];
            console.log("Call Stack:", stackLines);
          }
        }
      }

      return resolvedParams;
    };

    // Execute the async function but don't block
    checkParamsAsync().catch((err) =>
      console.error("Error checking params:", err)
    );

    // Return the original params for backward compatibility
    return params;
  }

  return params;
}

// Log component renders with their props
export function logComponentRender(componentName: string, props: any) {
  if (process.env.NODE_ENV === "development") {
    console.log(`🧩 Rendering ${componentName}`, props);
  }
}
