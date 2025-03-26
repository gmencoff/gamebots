"use client";

import { useState, useEffect, JSX } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import ts from "typescript";

export default function BotIDE(): JSX.Element {
  const [code, setCode] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [worker, setWorker] = useState<Worker | null>(null);

  useEffect(() => {
    const botWorker = new Worker(new URL("./botWorker.ts", import.meta.url), { type: "module" });
    setWorker(botWorker);

    botWorker.onmessage = (event) => {
      const { logs, error } = event.data;
      if (error) {
        setLogs([`Error: ${error}`]);
      } else {
        setLogs(logs);
      }
    };

    async function loadText(url: string): Promise<string> {
      const response = await fetch(url);
      return response.text();
    }
    
    async function loadDefaultBot() {
      const text = await loadText(new URL('./defaultCoupBot.ts', import.meta.url).href);
      setCode(text);
    }
    
    loadDefaultBot();

    return () => botWorker.terminate(); // Cleanup worker on unmount
  }, []);

  const runCode = (): void => {
    if (worker) {
      worker.postMessage(ts.transpile(code));
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
      <Button onClick={runCode} className="mt-2">Debug</Button>
      <div className="bg-black text-white p-2 mt-2 h-40 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
}
