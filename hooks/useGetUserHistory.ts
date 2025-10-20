import api from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { TransactionResponse } from "./useCreateTransaction";

interface UserHistoryResponse {
  transactions: TransactionResponse[];
  totalPages: number;
}
export function useGetUserHistory(pageNumber: string) {
  return useQuery<UserHistoryResponse>({
    queryKey: ["userHistory", pageNumber],
    queryFn: async () => {
      try {
        const response = await api.get("/transaction/user", {
          params: { page: pageNumber },
        });

        return response.data;
      } catch (error: any) {
        console.error("Error fetching user history:", error);

        // Throw a more user-friendly error message
        throw new Error(
          error.response?.data?.message || "Failed to fetch user history"
        );
      }
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
