"use client";

import { useState } from "react";
import axios from "axios";
import { Token } from "../contexts/swap-context";
import { useAuth } from "../contexts/auth-context";
import api from "@/utils/api";

export type TransactionResponse = {
  id: string;
  transactionId: string;
  userId: string;
  transactionType: string;
  status: string;
  cryptoStatus: string;
  sourceAddress: string;
  sourceAmount: number;
  sourceChain: string;
  sourceCurrency: string;
  destinationAddress: string;
  destinationAmount: number;
  destinationChain: string;
  destinationCurrency: string;
  exchangeRate: number;
  feeAmount: number;
  feePercentage: number;
  netAmount: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  expiredAt: string; // ISO date string
  sourceTransactionHash: string;
  destinationTransactionHash: string;
  completedAt: string;
  sourceBankName: string;
  sourceBankAccountName: string;
  sourceBankAccountNumber: string;
  destinationAccountName: string;
  destinationBankAccountNumber: string;
  destinationBankName: string;
};

interface CreateTransactionPayload {
  sourceAmount: string;
  sourceCurrency: string;
  destinationCurrency: string;
  destinationAddress: string;
  sourceChain: string;
  destinationChain: string;
  tokenMint?: string;
  bankAccountId?: string;
}

// interface TransactionResponse {
//   id: string;
//   status: string;
//   // Add other fields from the API response as needed
// }

export const useCreateTransaction = () => {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionData, setTransactionData] =
    useState<TransactionResponse | null>(null);

  const createTransaction = async ({
    sourceAmount,
    sourceCurrency,
    destinationCurrency,
    destinationAddress,
    sourceChain,
    destinationChain,
    tokenMint,
    bankAccountId,
  }: CreateTransactionPayload): Promise<{
    success: boolean;
    transaction?: TransactionResponse | null;
    error?: string | null;
  }> => {
    if (!token) {
      setError("Authentication required. Please log in.");
      return { success: true, error: "Authentication required. Please log in" };
    }

    setIsLoading(true);
    setError(null);

    try {
      const createTransactionPayload = {
        sourceAmount,
        sourceCurrency,
        destinationCurrency,
        destinationAddress,
        sourceChain,
        destinationChain,
        tokenMint,
        bankAccountId,
      };

      // Determine transaction type based on currency types
      const getTransactionEndpoint = (
        source: string,
        destination: string
      ): string => {
        const isSourceFiat = source === "NGN";
        const isDestinationFiat = destination === "NGN";

        if (isSourceFiat && !isDestinationFiat)
          return "/transaction/fiat-to-crypto";
        if (!isSourceFiat && isDestinationFiat)
          return "/transaction/crypto-to-fiat";
        return "/transaction/crypto-to-crypto";
      };

      const endpoint = getTransactionEndpoint(
        sourceCurrency,
        destinationCurrency
      );

      const { data } = await api.post(endpoint, createTransactionPayload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      setTransactionData(data.transaction);

      return { success: true, transaction: data.transaction };
    } catch (err) {
      console.log("err", err);
      let errorMessage = "Create Transaction failed";

      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      return { success: true, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to create transaction from swap context tokens
  const createTransactionFromTokens = async ({
    sellToken,
    receiveToken,
    sellAmount,
    destinationAddress,
    bankAccountId,
  }: {
    sellToken: Token;
    receiveToken: Token;
    sellAmount: string;
    destinationAddress: string;
    bankAccountId?: string;
  }) => {
    return createTransaction({
      sourceAmount: sellAmount,
      sourceCurrency: sellToken.symbol,
      destinationCurrency: receiveToken.symbol,
      destinationAddress,
      sourceChain: sellToken.chain || "",
      destinationChain: receiveToken.chain || "",
      bankAccountId,
    });
  };

  return {
    createTransaction,
    createTransactionFromTokens,
    isLoading,
    error,
    transactionData,
  };
};
