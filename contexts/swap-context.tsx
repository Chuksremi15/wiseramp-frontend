"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
} from "react";
import {
  useGetTokenEquivalent,
  PRICE_FEEDS,
} from "@/hooks/useGetTokenEquivalent";
import {
  TransactionResponse,
  useCreateTransaction,
} from "@/hooks/useCreateTransaction";
import { BankAccount } from "@/types/bank";

interface Token {
  symbol: string;
  name: string;
  icon: string;
  color?: string;
  address?: string;
  decimals?: number;
  price?: number;
  maxValue: number;
  priceFeedSymbol?: keyof typeof PRICE_FEEDS;
  chain?: string;
  isNetworkToken?: boolean;
}

interface SwapContextType {
  sellToken: Token;
  receiveToken: Token;
  sellAmount: string;
  receiveAmount: string;
  setSellToken: (token: Token) => void;
  setReceiveToken: (token: Token) => void;
  setSellAmount: (amount: string) => void;
  setReceiveAmount: (amount: string) => void;
  setDestinationAddress: (address: string) => void;
  swapTokens: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isAnimating: boolean;
  exchangeRate: number | null;
  sellTokenPrice: number | null;
  receiveTokenPrice: number | null;
  gettingTokenEquivalentLoading: boolean;
  handleCreateTransaction: () => Promise<{
    success: boolean;
    transaction?: TransactionResponse | null;
    error?: string | null;
  }>;
  isCreatingTransaction: boolean;
  transactionError: string | null;
  transactionData: TransactionResponse | null;
  destinationAddress: string;
  selectedBankAccount: BankAccount | null;
  setSelectedBankAccount: (account: BankAccount | null) => void;
  resetForm: () => void;
}

export function getPriceFeedSymbol(
  symbol: string
): keyof typeof PRICE_FEEDS | undefined {
  return symbol in PRICE_FEEDS
    ? (symbol as keyof typeof PRICE_FEEDS)
    : undefined;
}

export const chainColor: {
  ethereum: string;
  solana: string;
} = {
  ethereum: "#627eea",
  solana: "#9945ff",
};

export const tokens: Token[] = [
  {
    symbol: "NGN",
    name: "Naira",
    icon: "₦",
    color: "#008751",
    decimals: 2,
    maxValue: 1000000,
    priceFeedSymbol: getPriceFeedSymbol("NGN"),
    chain: "fiat",
    isNetworkToken: true,
  },

  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "$",
    color: "#ffffff",
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    decimals: 6,
    maxValue: 5000,
    priceFeedSymbol: getPriceFeedSymbol("USDC"),
    chain: "sepolia",
    isNetworkToken: false,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "$",
    color: "#ffffff",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
    maxValue: 5000,
    priceFeedSymbol: getPriceFeedSymbol("USDC"),
    chain: "base",
    isNetworkToken: false,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "Ξ",
    color: "#627eea",
    decimals: 18,
    maxValue: 2.5,
    priceFeedSymbol: getPriceFeedSymbol("ETH"),
    chain: "base",
    isNetworkToken: true,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    icon: "Ξ",
    color: "#627eea",
    decimals: 18,
    maxValue: 2.5,
    priceFeedSymbol: getPriceFeedSymbol("ETH"),
    chain: "sepolia",
    isNetworkToken: true,
  },
];

const SwapContext = createContext<SwapContextType | undefined>(undefined);

interface SwapProviderProps {
  children: ReactNode;
}

export const SwapProvider: React.FC<SwapProviderProps> = ({ children }) => {
  const [sellToken, setSellToken] = useState<Token>(tokens[1]);
  const [receiveToken, setReceiveToken] = useState<Token>(tokens[0]);
  const [sellAmount, setSellAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [sellTokenPrice, setSellTokenPrice] = useState<number | null>(null);
  const [receiveTokenPrice, setReceiveTokenPrice] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [selectedBankAccount, setSelectedBankAccount] =
    useState<BankAccount | null>(null);

  const numericSellAmount = useMemo(() => {
    return Number(sellAmount.replace(/,/g, "")) || 1;
  }, [sellAmount]);

  const numericRecieveAmount = useMemo(() => {
    return Number(receiveAmount.replace(/,/g, "")) || 1;
  }, [receiveAmount]);

  const {
    data: queryData,
    isLoading: gettingTokenEquivalentLoading,
    error: queryError,
  } = useGetTokenEquivalent(
    receiveToken.priceFeedSymbol as keyof typeof PRICE_FEEDS,
    sellToken.priceFeedSymbol as keyof typeof PRICE_FEEDS,
    numericSellAmount || 1,
    !!sellToken.symbol && !!receiveToken.symbol
  );

  const {
    createTransactionFromTokens,
    isLoading: isCreatingTransaction,
    error: transactionError,
    transactionData,
  } = useCreateTransaction();

  // Expose a function to handle creating a transaction
  const handleCreateTransaction = async () =>
    createTransactionFromTokens({
      sellToken,
      receiveToken,
      sellAmount: numericSellAmount.toString(),
      destinationAddress,
      bankAccountId: selectedBankAccount?.id || undefined,
    });

  // Update receive amount when query data changes
  useEffect(() => {
    if (queryData?.destinationEquivalent !== undefined) {
      //setReceiveAmount(queryData.destinationEquivalent.toString());
      setExchangeRate(queryData.exchangeRate);

      setSellTokenPrice(queryData.sourceTokenPrice * numericSellAmount);
      setReceiveTokenPrice(
        queryData.destinationTokenPrice * numericRecieveAmount
      );
    }
  }, [queryData, queryError]);

  // Recalculate amounts when tokens change (preserve the sell amount, recalculate receive amount)
  useEffect(() => {
    if (sellAmount && exchangeRate) {
      const numericSellAmount = parseFloat(sellAmount.replace(/,/g, ""));
      if (!isNaN(numericSellAmount)) {
        const rawCalculation = numericSellAmount * exchangeRate;
        const calculatedReceiveAmount = rawCalculation.toFixed(
          receiveToken.decimals || 2
        );
        setReceiveAmount(calculatedReceiveAmount);
      }
    } else if (receiveAmount && exchangeRate) {
      // If no sell amount but we have receive amount, recalculate sell amount
      const numericReceiveAmount = parseFloat(receiveAmount.replace(/,/g, ""));
      if (!isNaN(numericReceiveAmount)) {
        const rawCalculation = numericReceiveAmount / exchangeRate;
        const calculatedSellAmount = rawCalculation.toFixed(
          sellToken.decimals || 2
        );
        setSellAmount(calculatedSellAmount);
      }
    }
  }, [receiveToken, sellToken, exchangeRate]);

  // Custom setters that trigger exchange rate updates
  const handleSetSellToken = (token: Token) => {
    // If the same token is selected for both sell and receive, swap the receive token to a different one
    if (
      token.symbol === receiveToken.symbol &&
      token.chain === receiveToken.chain
    ) {
      // Find a different token to set as receive token (default to first available different token)
      const differentToken =
        tokens.find(
          (t) => t.symbol !== token.symbol || t.chain !== token.chain
        ) || tokens[0];
      setReceiveToken(differentToken);
    }
    setSellToken(token);
    // Exchange rate will be updated by the useEffect
  };

  const handleSetReceiveToken = (token: Token) => {
    // If the same token is selected for both sell and receive, swap the sell token to a different one
    if (token.symbol === sellToken.symbol && token.chain === sellToken.chain) {
      // Find a different token to set as sell token (default to first available different token)
      const differentToken =
        tokens.find(
          (t) => t.symbol !== token.symbol || t.chain !== token.chain
        ) || tokens[0];
      setSellToken(differentToken);
    }
    setReceiveToken(token);
    // Exchange rate will be updated by the useEffect
  };

  // Update receive amount when sell amount changes
  const handleSetSellAmount = (amount: string) => {
    setSellAmount(amount);

    if (exchangeRate !== null) {
      const numericAmount = parseFloat(amount.replace(/,/g, ""));
      if (!isNaN(numericAmount)) {
        const rawCalculation = numericAmount * exchangeRate;

        const calculatedReceiveAmount = rawCalculation.toFixed(
          receiveToken.decimals || 2
        );

        setReceiveAmount(calculatedReceiveAmount);
      }
    }
  };

  // Update receive amount when sell amount changes
  const handleSetReceiveAmount = (amount: string) => {
    setReceiveAmount(amount);

    if (exchangeRate !== null) {
      const numericAmount = parseFloat(amount.replace(/,/g, ""));
      if (!isNaN(numericAmount)) {
        const rawCalculation = numericAmount / exchangeRate;

        const calculatedSellAmount = rawCalculation.toFixed(
          sellToken.decimals || 2
        );
        setSellAmount(calculatedSellAmount);
      }
    }
  };

  const swapTokens = () => {
    setIsAnimating(true);

    // Start animation, then swap after a brief delay
    setTimeout(() => {
      // Swap the tokens
      const tempToken = sellToken;
      setSellToken(receiveToken);
      setReceiveToken(tempToken);

      // Swap the amounts
      const tempAmount = sellAmount;
      setSellAmount(receiveAmount);
      setReceiveAmount(tempAmount);

      // Exchange rate will be updated by the useEffect

      // End animation
      setTimeout(() => setIsAnimating(false), 300);
    }, 150);
  };

  const resetForm = () => {
    setSellAmount("");
    setReceiveAmount("");
    setDestinationAddress("");
    setSelectedBankAccount(null);
  };

  const value: SwapContextType = {
    sellToken,
    receiveToken,
    sellAmount,
    receiveAmount,
    setSellToken: handleSetSellToken,
    setReceiveToken: handleSetReceiveToken,
    setSellAmount: handleSetSellAmount,
    setReceiveAmount: handleSetReceiveAmount,
    swapTokens,
    isLoading,
    setIsLoading,
    error,
    setError,
    isAnimating,
    exchangeRate,
    sellTokenPrice,
    receiveTokenPrice,
    gettingTokenEquivalentLoading,
    // Expose transaction helpers
    handleCreateTransaction,
    isCreatingTransaction,
    transactionError,
    transactionData,
    setDestinationAddress,
    destinationAddress,
    selectedBankAccount,
    setSelectedBankAccount,
    resetForm,
  };

  return <SwapContext.Provider value={value}>{children}</SwapContext.Provider>;
};

export const useSwap = (): SwapContextType => {
  const context = useContext(SwapContext);
  if (context === undefined) {
    throw new Error("useSwap must be used within a SwapProvider");
  }
  return context;
};

export type { Token, SwapContextType };
