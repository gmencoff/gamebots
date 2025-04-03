import { useEffect, useRef } from "react";

interface ConsoleProps {
  logs: string[];
}

const LogConsole: React.FC<ConsoleProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
      {logs.map((log, index) => (
        <div key={index}>{log}</div>
      ))}
      <div ref={logEndRef} />
    </div>
  );
};

export default LogConsole;