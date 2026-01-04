import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { apiBaseURL, shouldLogApi } from "../services/api";

type HealthStatus = "idle" | "ok" | "error";

const ApiHealthCheck = () => {
  const [status, setStatus] = useState<HealthStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkHealth = async () => {
      if (shouldLogApi) {
        // eslint-disable-next-line no-console
        console.info("[api] healthcheck baseURL:", apiBaseURL);
      }

      try {
        await apiRequest({ url: "/api/health", method: "GET" });
        if (!cancelled) {
          setStatus("ok");
          setMessage(null);
        }
      } catch (err) {
        const friendly = "API indisponivel ou VITE_API_URL incorreto";
        if (!cancelled) {
          setStatus("error");
          setMessage(friendly);
        }
        if (shouldLogApi) {
          // eslint-disable-next-line no-console
          console.error("[api] healthcheck failed:", err);
        }
      }
    };

    checkHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status !== "error" || !message) {
    return null;
  }

  return (
    <div className="bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white">
      {message}
    </div>
  );
};

export default ApiHealthCheck;
