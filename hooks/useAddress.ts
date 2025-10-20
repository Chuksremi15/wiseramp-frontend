import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/utils/api";
import type {
  GetAllUserAddressesResponse,
  GetUserAddressByIdResponse,
  GetUserAddressesByChainResponse,
  CheckUserAddressesResponse,
  CreateUserAddressRequest,
  CreateUserAddressResponse,
  UpdateUserAddressRequest,
  UpdateUserAddressResponse,
  DeleteUserAddressResponse,
} from "@/types/address";
import { useAuth } from "@/contexts/auth-context";

// 1. Create User Address
export const useCreateUserAddress = () => {
  const queryClient = useQueryClient();

  return useMutation<
    CreateUserAddressResponse,
    Error,
    CreateUserAddressRequest
  >({
    mutationFn: async (addressData: CreateUserAddressRequest) => {
      const response = await api.post(`/api/user-address/`, addressData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
      queryClient.invalidateQueries({ queryKey: ["addressCheck"] });
    },
  });
};

// 2. Get All User Addresses
export const useGetAllUserAddresses = () => {
  const { token, isAuthenticated } = useAuth();
  return useQuery<GetAllUserAddressesResponse>({
    queryKey: ["userAddresses", token],
    queryFn: async () => {
      const response = await api.get(`/api/user-address/`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!token && isAuthenticated,
  });
};

// 3. Get Address by ID
export const useGetAddressById = (addressId: string) => {
  return useQuery<GetUserAddressByIdResponse>({
    queryKey: ["userAddress", addressId],
    queryFn: async () => {
      const response = await api.get(`/api/user-address/${addressId}`);
      return response.data;
    },
    enabled: !!addressId,
  });
};

// 4. Get Addresses by Chain
export const useGetAddressesByChain = (chain: string) => {
  return useQuery<GetUserAddressesByChainResponse>({
    queryKey: ["userAddressesByChain", chain],
    queryFn: async () => {
      const response = await api.get(`/api/user-address/chain/${chain}`);
      return response.data;
    },
    enabled: !!chain,
  });
};

// 5. Update User Address
export const useUpdateUserAddress = () => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateUserAddressResponse,
    Error,
    {
      addressId: string;
      updateData: UpdateUserAddressRequest;
    }
  >({
    mutationFn: async ({
      addressId,
      updateData,
    }: {
      addressId: string;
      updateData: UpdateUserAddressRequest;
    }) => {
      const response = await api.put(
        `/api/user-address/${addressId}`,
        updateData
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
      queryClient.invalidateQueries({
        queryKey: ["userAddress", variables.addressId],
      });
      queryClient.invalidateQueries({
        queryKey: ["userAddressesByChain", variables.updateData.chain],
      });
    },
  });
};

// 6. Delete User Address
export const useDeleteUserAddress = () => {
  const queryClient = useQueryClient();

  return useMutation<DeleteUserAddressResponse, Error, string>({
    mutationFn: async (addressId: string) => {
      const response = await api.delete(`/api/user-address/${addressId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAddresses"] });
      queryClient.invalidateQueries({ queryKey: ["addressCheck"] });
    },
  });
};

// 7. Check User Addresses
export const useCheckUserAddresses = () => {
  return useQuery<CheckUserAddressesResponse>({
    queryKey: ["addressCheck"],
    queryFn: async () => {
      const response = await api.get(`/api/user-address/check`);
      return response.data;
    },
  });
};
