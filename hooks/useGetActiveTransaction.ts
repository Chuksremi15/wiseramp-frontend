import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { TransactionResponse } from "./useCreateTransaction";

interface ApiTransactionResponse {
  transaction: TransactionResponse;
}

export function useGetActiveTransaction(
  transactionId: string | undefined,
  enabled = true
) {
  const query = useQuery<ApiTransactionResponse>({
    queryKey: ["activeTransaction", transactionId],
    queryFn: async () => {
      const res = await api.get(`/transaction/${transactionId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return res.data;
    },
    enabled: Boolean(transactionId) && enabled,
    refetchInterval: (query) => {
      // Stop polling if transaction is in a final state
      const data = query.state.data;
      if (data?.transaction) {
        const isCompleted =
          data.transaction.status === "completed" ||
          data.transaction.status === "expired" ||
          data.transaction.status === "failed";

        if (isCompleted) {
          console.log("Stopping polling - transaction completed");
          return false; // Stop polling
        }
      }
      return 5000; // Continue polling every 5 seconds
    },
    refetchIntervalInBackground: true,
    staleTime: 0, // Always consider data stale to ensure fresh polling
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes after unmount
    retry: (failureCount, error: any) => {
      // Retry up to 3 times for network errors, but not for 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    data: query.data?.transaction || null,
    isLoading: query.isLoading,
    error: query.error
      ? (query.error as any)?.response?.data?.message ||
        (query.error as any)?.message ||
        "Failed to fetch transaction"
      : null,
  };
}
