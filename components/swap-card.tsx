"use client";

import { useState, useEffect } from "react";
import { LuArrowUpDown, LuChevronDown, LuInfo } from "react-icons/lu";

import { AddressInput } from "./address-input";

import { Button } from "@heroui/react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTokenValue } from "@/hooks/useGetTokenEquivalent";

import { formatLPFee, formatNumber } from "@/utils/helpers";

import { FetchingRatesIndicator } from "@/components/ui/fetching-rates-indicator";

import { SellCard } from "./sell-card";
import { useSwap } from "@/contexts/swap-context";
import { ReceiveCard } from "./receive-card";
import { BankAccountSelector } from "./modal/bank-account-selector";

/**
 * The main Swap component replicating the UI from the image.
 */
const SwapCard = () => {
  const {
    sellToken,
    receiveToken,
    sellAmount,
    receiveAmount,
    swapTokens,
    isLoading,
    isAnimating,
    exchangeRate,
    gettingTokenEquivalentLoading,
    setDestinationAddress,
    destinationAddress,
    handleCreateTransaction,
    isCreatingTransaction,
    selectedBankAccount,
    setSelectedBankAccount,
    resetForm,
  } = useSwap();

  const [addressError, setAddressError] = useState("");
  const [shouldPrefetch, setShouldPrefetch] = useState(false);
  const [navigationTimingId, setNavigationTimingId] = useState<string | null>(
    null
  );
  const router = useRouter();

  // Determine if swap is allowed
  const isSwapDisabled =
    !sellAmount ||
    !receiveAmount ||
    (receiveToken.symbol === "NGN"
      ? !selectedBankAccount
      : !destinationAddress) ||
    !!addressError ||
    isLoading ||
    isAnimating;

  const handleSwap = async () => {
    // Start performance timing measurement

    try {
      const {
        transaction: transactionData,
        error: transactionError,
        success,
      } = await handleCreateTransaction();

      if (success && transactionData) {
        // Success! Show success toast, redirect, etc.
        toast.success("Transaction created successfully!");

        // Reset form fields
        resetForm();

        // Navigate to the preloaded page
        router.push(`/active-transaction/${transactionData.transactionId}`);
      } else {
        console.log("transaction error", transactionError);

        // Failure! Show error toast, etc.
        toast.error(
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 shadow-lg">
            <AlertTriangle
              className="text-yellow-400 flex-shrink-0 "
              size={16}
            />
            <span className="text-sm">{transactionError}</span>
          </div>,
          {
            unstyled: true,
            icon: null,
          }
        );
      }
    } catch (error) {
      console.error("Unexpected error in handleSwap:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    // Outer container to center the widget on the page
    <div className="bg-gray-100 dark:bg-section-backround flex flex-col font-body min-h-screen items-center  pt-22 p-4">
      {/* <div className="absolute inset-0 swap-background"></div> */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-medium font-head mb-2">
          Buy, Sell - Crypto
        </h1>
        <p className="text-muted-foreground text-sm">
          Seamless exchange using Bank transfer{" "}
        </p>
      </div>

      <div className="w-[480px] max-w-2xl bg-white dark:bg-section-backround  rounded-2xl p-3 relative  space-y-5 border">
        {/* Header */}
        {/* <div className="flex justify-between items-center">
          <button
            className="w-6 h-6 flex items-center justify-center bg-yellow-400/10 rounded-full text-yellow-400"
            aria-label="Help"
          >
            <FaQuestion size={10} />
          </button>
        </div> */}

        {/* Main Swap Area */}
        <div className="relative">
          {/* Cards Container with Animation */}
          <div
            className={`transition-transform duration-500 ease-in-out ${
              isAnimating ? "animate-flip" : ""
            }`}
          >
            {/* "Sell" Input Card */}
            <div
              className={`transition-all duration-300 ${
                isAnimating ? "transform -translate-y-2 scale-95" : ""
              }`}
            >
              <SellCard />
            </div>

            <FetchingRatesIndicator isVisible={gettingTokenEquivalentLoading} />

            {/* "Receive" Input Card */}
            <div
              className={`transition-all duration-300 mt-1 ${
                isAnimating ? "transform translate-y-2 scale-95" : ""
              }`}
            >
              <ReceiveCard />
            </div>
          </div>

          {/* Swap Icon Button */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-[-100px]">
            <button
              onClick={swapTokens}
              className={`bg-card hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-300 rounded-lg p-2 border-4 border-card ${
                isAnimating ? "rotate-180 scale-110" : ""
              }`}
              aria-label="Swap currencies"
              disabled={isLoading || isAnimating}
            >
              <LuArrowUpDown className="text-foreground" size={16} />
            </button>
          </div>
        </div>

        {/* Receiving Address Input */}

        {receiveToken.symbol !== "NGN" ? (
          <AddressInput
            address={destinationAddress}
            setAddress={setDestinationAddress}
            addressError={addressError}
            setAddressError={setAddressError}
            receiveToken={receiveToken}
          />
        ) : (
          <BankAccountSelector
            selectedAccount={selectedBankAccount}
            onAccountSelect={setSelectedBankAccount}
          />
        )}

        {/* Call to Action Button */}
        <div className="flex flex-col items-center">
          <Button
            className={`w-full bg-primary text-black font-medium font-body rounded-full text-base transition-all duration-300 ${
              isSwapDisabled ? "cursor-not-allowed" : ""
            }`}
            onPress={() => handleSwap()}
            disabled={isSwapDisabled}
            isLoading={isCreatingTransaction}
            size="lg"
          >
            {!sellAmount
              ? "Enter an amount to sell"
              : !receiveAmount
              ? "Enter an amount to receive"
              : receiveToken.symbol === "NGN" && !selectedBankAccount
              ? "Select a bank account"
              : receiveToken.symbol !== "NGN" && !destinationAddress
              ? "Enter a receiving address"
              : addressError
              ? addressError
              : "Swap"}
          </Button>
        </div>

        {/* Info Section */}
        <div className="space-y-2 text-sm pt-2">
          <div className="font-body flex justify-between items-center text-foreground">
            <span className="text-gray-400  dark:text-slate-400">Rate</span>
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
              <LuArrowUpDown size={12} />
              <span>
                1 {sellToken.symbol} ={" "}
                {receiveToken.symbol === "NGN"
                  ? formatNumber(exchangeRate)
                  : exchangeRate}{" "}
                {receiveToken.symbol}
              </span>
            </div>
          </div>
          <div className="font-body flex justify-between items-center text-foreground">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">LP Fee</span>
              <button aria-label="Liquidity Provider Fee information">
                <LuInfo
                  size={14}
                  className="text-slate-500 hover:text-slate-300"
                />
              </button>
            </div>
            <span
              onClick={async () => await getTokenValue("NGN", 34)}
              className="font-mono text-xs sm:text-sm"
            >
              {formatLPFee(receiveAmount, 0.015, receiveToken.decimals || 2)}{" "}
              {receiveToken.symbol}
            </span>
          </div>
        </div>

        {/* Footer Link */}
        {/* <div className="text-center pt-2">
          <button className="text-slate-400 text-sm font-semibold flex items-center justify-center w-full gap-2 transition-colors">
            <span>Additional Information</span>
            <LuChevronDown />
          </button>
        </div> */}
      </div>

      {/* Invisible Link component for prefetching active-transaction route */}
      {shouldPrefetch && (
        <Link
          href="/active-transaction/placeholder"
          prefetch={true}
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          {/* Hidden prefetch link */}
        </Link>
      )}
    </div>
  );
};

export { SwapCard };
