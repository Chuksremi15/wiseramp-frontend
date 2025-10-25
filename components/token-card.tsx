import React from "react";
import { AmountInput } from "./amount-input";
import { Token } from "@/contexts/swap-context";
import { formatNumber } from "@/utils/helpers";

interface TokenCardProps {
  label: string;
  token: Token;
  amount: string;
  onAmountChange: (amount: string) => void;
  onTokenSelect?: () => void;
  disabled?: boolean;
  maxDecimals?: number;
  showBalance?: boolean;
  tokenPrice?: number | null;
  children?: React.ReactNode;
  onValidationChange?: (isValid: boolean, error?: string) => void;
  isBackground?: boolean;
  gettingTokenEquivalentLoading: boolean;
}

export const TokenCard: React.FC<TokenCardProps> = ({
  label,
  token,
  amount,
  onAmountChange,
  onTokenSelect,
  disabled = false,
  maxDecimals,
  showBalance = true,
  tokenPrice,
  children,
  onValidationChange,
  isBackground = true,
  gettingTokenEquivalentLoading,
}) => {
  return (
    <div
      className={` ${
        isBackground ? "bg-input" : "border"
      }   flex justify-between items-center p-4 rounded-xl space-y-2`}
    >
      <div className="text-sm flex-1">
        <span className="">{label}</span>
        <div>
          <AmountInput
            value={amount}
            onChange={onAmountChange}
            maxDecimals={maxDecimals || token.decimals || 6}
            maxValue={
              label.toLowerCase() === "sell" ||
              label.toLowerCase() === "supply" ||
              label.toLocaleLowerCase() === "withdraw" ||
              label.toLocaleLowerCase() === "collateral"
                ? token.maxValue
                : undefined
            }
            disabled={disabled}
            onValidationChange={onValidationChange}
          />
          {showBalance ? (
            gettingTokenEquivalentLoading ? (
              <p className="opacity-0">Loading...</p>
            ) : (
              <p>$ {(tokenPrice && formatNumber(tokenPrice)) || 0} </p>
            )
          ) : (
            <></>
          )}
        </div>
      </div>

      <div>
        {children || (
          <button
            onClick={onTokenSelect}
            className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-lg">{token.icon}</span>
            <span className="font-medium">{token.symbol}</span>
          </button>
        )}
      </div>
    </div>
  );
};
