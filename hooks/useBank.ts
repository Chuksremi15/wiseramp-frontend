import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";
import { useAuth } from "@/contexts/auth-context";
import { GetAllBankAccountsResponse } from "@/types/bank";

export const useBank = () => {
  return useQuery({
    queryKey: ["bank_lists"],
    queryFn: async () => {
      const res = await api.get("https://api.paystack.co/bank");
      return res.data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

// 1. Create Bank Account
export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountData: {
      accountName: string;
      bankName: string;
      accountNumber: string;
      bankCode: string;
    }) => {
      const response = await api.post(`/api/bank-account/`, accountData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
    },
  });
};

// 2. Get All Bank Accounts
export const useGetAllBankAccounts = () => {
  const { token, isAuthenticated } = useAuth();
  return useQuery<GetAllBankAccountsResponse>({
    queryKey: ["bankAccounts"],
    queryFn: async () => {
      const response = await api.get(`/api/bank-account/`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!token && isAuthenticated,
  });
};

// 3. Get Bank Account by ID
export const useGetBankAccountById = (accountId: string) => {
  return useQuery({
    queryKey: ["bankAccount", accountId],
    queryFn: async () => {
      const response = await api.get(`/api/bank-account/${accountId}`);
      return response.data;
    },
    enabled: !!accountId,
  });
};

// 4. Get Bank Account by Account Number
export const useGetBankAccountByNumber = (accountNumber: string) => {
  return useQuery({
    queryKey: ["bankAccountByNumber", accountNumber],
    queryFn: async () => {
      const response = await api.get(
        `/api/bank-account/number/${accountNumber}`
      );
      return response.data;
    },
    enabled: !!accountNumber,
  });
};

// 5. Update Bank Account
export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      updateData,
    }: {
      accountId: string;
      updateData: {
        accountName?: string;
        bankName?: string;
        accountNumber?: string;
      };
    }) => {
      const response = await api.put(
        `/api/bank-account/${accountId}`,
        updateData
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      queryClient.invalidateQueries({
        queryKey: ["bankAccount", variables.accountId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bankAccountByNumber", variables.updateData.accountNumber],
      });
    },
  });
};

// 6. Delete Bank Account
export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      const response = await api.delete(`/api/bank-account/${accountId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
    },
  });
};

// 7. Check User Bank Accounts
export const useCheckUserBankAccounts = () => {
  return useQuery({
    queryKey: ["bankAccountCheck"],
    queryFn: async () => {
      const response = await api.get(`/api/bank-account/check`);
      return response.data;
    },
  });
};
