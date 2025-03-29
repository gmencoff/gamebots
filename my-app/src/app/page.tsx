"use client";

import { useState, useEffect, JSX } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { BotRunner } from "./botRunner";
import ts from "typescript";
import { CoupBot } from "./coupBot";

declare global {
  interface Window {
    MyCoupBot: CoupBot;
  }
}

export default function BotIDE(): JSX.Element {
  const [code, setCode] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [worker, setWorker] = useState<BotRunner | null>(null);
  const [testingBot, setTestingBot] = useState<boolean>(false);

  useEffect(() => {
    async function loadText(url: string): Promise<string> {
      const response = await fetch(url);
      return response.text();
    }
    
    async function loadDefaultBot() {
      const fulltext = await loadText(new URL('./coupBot.ts', import.meta.url).href);
      const text = fulltext.replaceAll('export ', '');
      setCode(text);
    }
    
    loadDefaultBot();
  }, []);

  const setDebugLogs = (logs: string): void => {
    setLogs((prevLogs) => [...prevLogs, logs]);
  };

  const runCode = async (): Promise<void> => {
    const url = prompt("Enter WebSocket URL:", "ws://localhost:8080");
    if (url) {
      const exportcode = code.concat(`\nwindow.MyCoupBot = new MyCoupBot();`)
      const result = ts.transpileModule(exportcode, {
          compilerOptions: {
              target: ts.ScriptTarget.ESNext,
              module: ts.ModuleKind.ESNext, // Use ES Modules
              sourceMap: true
          }
      });
      
      const jsCode = result.outputText;
      const sourceMap = result.sourceMapText;

    //   const logMessages: string[] = [];
    //   const originalConsoleLog = console.log;
    //   console.log = (...args) => {
    //     logMessages.push(args.map(a => JSON.stringify(a)).join(" "));
    //     setLogs([...logMessages]); // Update UI
    //     originalConsoleLog(...args); // Keep default behavior
    // };
      
      // Create a Blob URL for the JS code and source map
      const blob = new Blob([jsCode + `\n//# sourceMappingURL=data:application/json;base64,${btoa(sourceMap!)}`], { type: "application/javascript" });
      const bloburl = URL.createObjectURL(blob);

      // Create a script tag to load the Blob
      const script = document.createElement("script");
      script.src = bloburl;

      script.onload = () => {
          // Once loaded, you can now access the class via the global window object
          const bot = window.MyCoupBot;
          setWorker(new BotRunner(url, bot, setDebugLogs));
          setTestingBot(true);
      };

      script.onerror = (error) => {
          console.error("Script loading error:", error);
      };

      document.body.appendChild(script);
    }
  };

  const stopRunning = (): void => {
    if (worker) {
      worker.killGame();
      setWorker(null);
      setLogs([]);
      setTestingBot(false);
    }
  };

  const sendResponse = (): void => {
    if (worker) {
      worker.runNextAction();
    }
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <h1 className="text-xl font-bold">Bot IDE</h1>
      <Editor
        height="60vh"
        defaultLanguage="typescript"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || "")}
      />
      {!testingBot ? (
        <div className="flex space-x-2 mt-2">
          <Button onClick={runCode} className="mt-2">Test Bot</Button>
        </div>
      ) : (
        <>
          <div className="flex space-x-2 mt-2">
            <Button onClick={sendResponse}>Send Response</Button>
            <Button onClick={stopRunning}>Stop Testing</Button>
          </div>
          <div className="bg-black text-white p-2 mt-2 h-40 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}