self.onmessage = async (event) => {
  const code = event.data;
  const logCollector: string[] = [];

  // Override console.log to capture output
  const originalConsoleLog = console.log;
  console.log = (...args: unknown[]) => logCollector.push(args.join(" "));

  try {
    // Create an execution context with predefined imports
    const sandbox = {
      console: console, // Allow console logging
    };

    // Wrap the user's code in an async function with injected sandbox
    const wrappedCode = `(async ({ importModule, console }) => { ${code} })`;
    const userFunction = new Function("sandbox", `return ${wrappedCode};`);
    
    await userFunction(sandbox)(sandbox);

    // Send logs back to the main thread
    self.postMessage({ logs: logCollector, error: null });
  } catch (error) {
    self.postMessage({ logs: [], error: error instanceof Error ? error.message : "Unknown error" });
  } finally {
    console.log = originalConsoleLog;
  }
};
