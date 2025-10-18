import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/utils/api";

export function useGetActiveTransaction(
  transactionId: string | undefined,
  address?: string,
  sourceChain?: string,
  enabled = true,
  useWebSocket = true
) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!transactionId || !enabled) return;
    let isMounted = true;

    const fetchTransaction = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.get(`/transaction/${transactionId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (isMounted) {
          setData(res.data.transaction);

          if (
            res.data.transaction.status === "completed" ||
            res.data.transaction.status === "expired" ||
            res.data.transaction.status === "failed"
          )
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
        }
      } catch (err: any) {
        if (isMounted)
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to fetch transaction"
          );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Start polling by default
    pollIntervalRef.current = setInterval(fetchTransaction, 5000);
    fetchTransaction();

    // If using WebSocket, set up connection
    if (useWebSocket && address) {
      // Replace with your actual WebSocket URL and protocol as needed

      const ws = new WebSocket(`ws://localhost:4000`);

      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected!");

        // Stop polling when WebSocket is open
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        // Subscribe to the address
        ws.send(
          JSON.stringify({
            type: "subscribe",
            address: address,
            chain: sourceChain,
          })
        );
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "transaction_update") {
          console.log("msg data", msg);

          console.log("msg", msg);
          console.log("prev.transactionId", data);

          if (isMounted) {
            setData((prev: any) =>
              prev && prev.transactionId === msg.transactionId
                ? { ...prev, status: msg.status, completedAt: msg.completedAt }
                : prev
            );

            // Unsubscribe after receiving the update
            if (msg.status === "completed") {
              if (
                wsRef.current &&
                wsRef.current.readyState === WebSocket.OPEN
              ) {
                wsRef.current.send(
                  JSON.stringify({
                    type: "unsubscribe",
                    address: address,
                  })
                );
              }

              // Stop polling when transaction is completed
              if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
              }
            }
          }
        } else if (msg.type === "subscribed") {
          console.log(`Subscribed to updates for address: ${msg.address}`);
        } else if (msg.error) {
          console.error("WebSocket error:", msg.error);
        }
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
      };

      ws.onclose = () => {
        // Resume polling if WebSocket closes
        if (!pollIntervalRef.current) {
          pollIntervalRef.current = setInterval(fetchTransaction, 5000);
        }
      };
    }

    return () => {
      isMounted = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [transactionId, address, enabled, useWebSocket]);

  // Unsubscribe function (if needed)
  const unsubscribeFromAddress = useCallback((addressToUnsub: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "unsubscribe",
          address: addressToUnsub,
        })
      );
    }
  }, []);

  return { data, isLoading, error, unsubscribeFromAddress };
}
