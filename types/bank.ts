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

export interface GetAllBankAccountsResponse {
  success: true;
  data: BankAccount[];
  total: number;
}

export interface GetBankAccountByIdResponse {
  success: true;
  data: BankAccount;
}

export interface CheckUserBankAccountsResponse {
  success: true;
  data: {
    hasBankAccounts: boolean;
    accountCount: number;
  };
}

export interface CreateBankAccountRequest {
  accountName: string;
  bankName: string;
  accountNumber: string;
}

export interface CreateBankAccountResponse {
  success: true;
  message: string;
  data: BankAccount;
}

export interface UpdateBankAccountRequest {
  accountName?: string;
  bankName?: string;
  accountNumber?: string;
}

export interface UpdateBankAccountResponse {
  success: true;
  message: string;
  data: BankAccount;
}

export interface DeleteBankAccountResponse {
  success: true;
  message: string;
}
