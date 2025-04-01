"use client";

import { useState, useEffect, JSX } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { BotRunner } from "./botRunner";
import ts from "typescript";
import { CoupBot } from "./coupBot";
import LogConsole from "./Console";

declare global {
  interface Window {
    MyCoupBots: CoupBot[] | undefined;
  }
}

export default function BotIDE(): JSX.Element {
  const [code, setCode] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [worker, setWorker] = useState<BotRunner | null>(null);
  const [testingBot, setTestingBot] = useState<boolean>(false);

  // Capture console.log messages to the app log
  const logMessages: string[] = [];
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    logMessages.push(args.map(a => a).join(" "));
    setLogs([...logMessages]); // Update UI
    originalConsoleLog(...args); // Keep default behavior
  };

  useEffect(() => {
    if (typeof window.MyCoupBots === "undefined") {
      window.MyCoupBots = [];
    }

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

  const getUserBot = async (botFunction: (bot: CoupBot) => void): Promise<void> => {
    const script = await getUserBotScript();
    script.onload = () => {
      const bot = window.MyCoupBots?.pop();
      if (bot) {
        botFunction(bot);
      }
    };

    script.onerror = (error) => {
      console.error("Script loading error:", error);
    };

    document.body.appendChild(script);
  };

  const getUserBotScript = async (): Promise<HTMLScriptElement> => {
    const exportcode = `
      (() => {\n
        ${code}\n
        window.MyCoupBots.push(new MyCoupBot());
      })()
    `;
    const result = ts.transpileModule(exportcode, {
        compilerOptions: {
            target: ts.ScriptTarget.ESNext,
            module: ts.ModuleKind.ESNext, // Use ES Modules
            sourceMap: true
        }
    });
      
    const jsCode = result.outputText;
    const sourceMap = result.sourceMapText;

    // Remove previous script if exists
    document.querySelectorAll("script[data-bot-script]").forEach(script => script.remove());
      
    // Create a Blob URL for the JS code and source map
    const blob = new Blob([jsCode + `\n//# sourceMappingURL=data:application/json;base64,${btoa(sourceMap!)}`], { type: "application/javascript" });
    const bloburl = URL.createObjectURL(blob);

    // Create a script tag to load the Blob
    const script = document.createElement("script");
    script.setAttribute("data-bot-script", "true"); // Tag to identify for future cleanup
    script.src = bloburl;

    return script
  }

  const runCode = async (): Promise<void> => {
    const url = prompt("Enter WebSocket URL:", "ws://localhost:8080");
    if (url) {
      getUserBot((bot: CoupBot) => {
        setWorker(new BotRunner(url, bot));
        setTestingBot(true);
      });
    }
  };

  const updateBot = (): void => {
    if (worker) {
      setLogs([""]);
      getUserBot((bot: CoupBot) => {
        worker.updateBot(bot);
      })
    }
  };

  const stopRunning = (): void => {
    if (worker) {
      setLogs([""]);
      worker.killGame();
      setWorker(null);
      setLogs([""]);
      setTestingBot(false);
    }
  };

  const sendResponse = (): void => {
    if (worker) {
      worker.sendResponse();
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
            <Button onClick={updateBot}>Update Bot</Button>
            <Button onClick={stopRunning}>Stop Testing</Button>
          </div>
          <LogConsole logs={logs}/>
        </>
      )}
    </div>
  );
}