// Bank Account Types
export interface BankAccount {
  id: string;
  userId: number;
  accountName: string;
  bankName: string;
  accountNumber: number;
  createdAt: string;
  updatedAt: string;
}

// Generic API Response Types
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiResponseWithMessage<T> extends ApiResponse<T> {
  message: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
}

// Bank Account API Response Types
export type GetAllBankAccountsResponse = PaginatedResponse<BankAccount>;
export type GetBankAccountByIdResponse = ApiResponse<BankAccount>;
export type CheckUserBankAccountsResponse = ApiResponse<{
  hasBankAccounts: boolean;
  accountCount: number;
}>;

// Bank Account Request Types
export interface CreateBankAccountRequest {
  accountName: string;
  bankName: string;
  accountNumber: string;
}

export type UpdateBankAccountRequest = Partial<CreateBankAccountRequest>;

// Bank Account Response Types
export type CreateBankAccountResponse = ApiResponseWithMessage<BankAccount>;
export type UpdateBankAccountResponse = ApiResponseWithMessage<BankAccount>;
export type DeleteBankAccountResponse = Omit<
  ApiResponseWithMessage<never>,
  "data"
>;
