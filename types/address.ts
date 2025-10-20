import type {
  ApiResponse,
  ApiResponseWithMessage,
  PaginatedResponse,
} from "./bank";

// User Address Types
export interface UserAddress {
  id: string;
  userId: number;
  chain?: string;
  addressName?: string;
  userAddress: string;
  createdAt: string;
  updatedAt: string;
}

// User Address API Response Types
export type GetAllUserAddressesResponse = PaginatedResponse<UserAddress>;
export type GetUserAddressByIdResponse = ApiResponse<UserAddress>;
export type GetUserAddressesByChainResponse = PaginatedResponse<UserAddress>;
export type CheckUserAddressesResponse = ApiResponse<{
  hasAddresses: boolean;
  addressCount: number;
}>;

// User Address Request Types
export interface CreateUserAddressRequest {
  chain?: string;
  addressName?: string;
  userAddress: string;
}

export type UpdateUserAddressRequest = Omit<
  Partial<CreateUserAddressRequest>,
  "userAddress"
>;

// User Address Response Types
export type CreateUserAddressResponse = ApiResponseWithMessage<UserAddress>;
export type UpdateUserAddressResponse = ApiResponseWithMessage<UserAddress>;
export type DeleteUserAddressResponse = Omit<
  ApiResponseWithMessage<never>,
  "data"
>;
