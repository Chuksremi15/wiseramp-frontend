"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Copy, Clock } from "lucide-react";
import { Button } from "@heroui/react";
import { QRCodeSVG } from "qrcode.react";
import { useSwap } from "@/contexts/swap-context";
import { useParams } from "next/navigation";
import { useGetActiveTransaction } from "../../../hooks/useGetActiveTransaction";

import { TransactionResponse } from "@/hooks/useCreateTransaction";

import BankAccountComponent from "@/components/ui/bank-account-component";
import { TokenIconWrapper } from "@/components/ui/token-icon";
import { formatNumber } from "@/utils/helpers";
import TransactionSuccessModal from "@/components/modal/transaction-success-modal";

// Memoized component for transaction details to prevent unnecessary re-renders
const TransactionDetails = memo(
  ({
    feeAmount,
    sourceCurrency,
    destinationAmount,
    destinationCurrency,
    sourceChain,
    bankAccountDisplay,
    truncatedDestinationAddress,
    transactionStatusDisplay,
  }: {
    feeAmount: string;
    sourceCurrency: string;
    destinationAmount: string;
    destinationCurrency: string;
    sourceChain?: string;
    bankAccountDisplay?: string | null;
    truncatedDestinationAddress?: string;
    transactionStatusDisplay: string;
  }) => (
    <div className="space-y-4 mb-6 font-body">
      <div className="flex justify-between">
        <span className="text-gray-600 dark:text-gray-400">LP Fee:</span>
        <span className="font-medium">
          {feeAmount} {sourceCurrency}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-600 dark:text-gray-400">You Receive:</span>
        <span className="font-medium">
          {destinationAmount} {destinationCurrency}
        </span>
      </div>

      {sourceCurrency !== "NGN" && (
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Chain:</span>
          <span className="font-medium">
            {sourceChain} - ({sourceCurrency})
          </span>
        </div>
      )}

      <div className="flex justify-between">
        <span className="text-gray-600 dark:text-gray-400">
          {destinationCurrency === "NGN" ? "Account Details:" : "Your Address:"}
        </span>
        <span className="font-medium">
          {destinationCurrency === "NGN"
            ? bankAccountDisplay
            : truncatedDestinationAddress}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-gray-600 dark:text-gray-400">Status:</span>
        <span className="font-medium capitalize">
          {transactionStatusDisplay}
        </span>
      </div>
    </div>
  )
);

TransactionDetails.displayName = "TransactionDetails";

// Memoized component for timer display
const TimerDisplay = memo(
  ({
    activeTransaction,
    transaction,
    formattedTimeLeft,
    completionTimeDisplay,
    timeLeft,
  }: {
    activeTransaction: TransactionResponse | null;
    transaction: TransactionResponse | null;
    formattedTimeLeft: string;
    completionTimeDisplay: string;
    timeLeft: number;
  }) => {
    const currentTransaction = activeTransaction || transaction;
    const isCompleted =
      currentTransaction?.status === "completed" ||
      currentTransaction?.status === "failed";
    const hasTimeLeft = timeLeft > 0;

    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-green-500" />
        {isCompleted ? (
          <>
            <span className="text-sm">Transaction Completed At</span>
            <span>{completionTimeDisplay}</span>
          </>
        ) : hasTimeLeft ? (
          <>
            <span className="text-sm">Expires in</span>
            <span className="text-green-500 font-mono">
              {formattedTimeLeft}
            </span>
          </>
        ) : (
          <>
            <span className="text-sm">Transaction Expired At</span>
            <span>{completionTimeDisplay}</span>
          </>
        )}
      </div>
    );
  }
);

TimerDisplay.displayName = "TimerDisplay";

// Memoized component for warning message
const WarningMessage = memo(
  ({
    destinationAmount,
    destinationCurrency,
  }: {
    destinationAmount: string;
    destinationCurrency: string;
  }) => (
    <div className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-500 border-l-4 p-4 mb-6">
      <p className="text-sm">
        We will complete your transaction of{" "}
        <span className="font-bold">
          {destinationAmount} {destinationCurrency}
        </span>{" "}
        after we confirm receipt of your deposit
      </p>
    </div>
  )
);

WarningMessage.displayName = "WarningMessage";

// Memoized component for QR code section
const QRCodeSection = memo(
  ({
    sourceAddress,
    sourceCurrency,
    sourceChain,
    onCopy,
    copied,
  }: {
    sourceAddress: string;
    sourceCurrency: string;
    sourceChain: string;
    onCopy: () => void;
    copied: boolean;
  }) => (
    <div>
      {/* Deposit Address Title */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Deposit Address</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Send your crypto to the deposit address provided below.
        </p>
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-6">
        <div className="w-48 h-48 bg-white rounded-lg p-4 flex items-center justify-center">
          <QRCodeSVG
            value={sourceAddress}
            size={180}
            bgColor="#fff"
            fgColor="#000"
            level="H"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>

      {/* Address */}
      <div className="bg-gray-100 dark:bg-[#3a3a3a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 rounded-lg p-2 mb-6 flex items-center gap-3 relative">
        <TokenIconWrapper
          symbol={sourceCurrency.toLowerCase()}
          variant="background"
          size={40}
        />

        <input
          type="text"
          value={sourceAddress}
          className="font-mono text-sm flex-1 pr-8 bg-transparent border-none outline-none"
          readOnly
        />

        <Copy
          className="w-5 h-5 cursor-pointer hover:opacity-70 absolute right-3"
          onClick={onCopy}
        />

        {copied && (
          <span className="absolute -top-8 right-0 bg-section-backround transition-all duration-500 text-xs rounded px-2 py-1 shadow-lg animate-fade-in-out z-10">
            Copied!
          </span>
        )}
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-500 border-l-4 p-4">
        <p className="text-sm">
          Please ensure you send your funds to the{" "}
          <span className="font-bold">
            {sourceChain} - ({sourceCurrency})
          </span>{" "}
          network. If you send your funds to the wrong network, your funds may
          be lost.
        </p>
      </div>
    </div>
  )
);

QRCodeSection.displayName = "QRCodeSection";

const CryptoSwapInterface = () => {
  const params = useParams();

  const { transactionData } = useSwap();
  const transactionId = params.id as string;

  // Initialize with cached data if available, otherwise use context data
  const [transaction, setTransaction] = useState<TransactionResponse | null>(
    () => {
      return transactionData || null;
    }
  );

  // Only fetch from API if we don't have cached data

  const { data: activeTransaction, error } = useGetActiveTransaction(
    transactionId,
    true
  );

  // Update transaction state when context data changes
  useEffect(() => {
    if (transactionData) {
      setTransaction(transactionData);
    }
  }, [transactionData]);

  // Update transaction state when API data is fetched (background loading)
  useEffect(() => {
    if (activeTransaction) {
      setTransaction(activeTransaction);

      if (activeTransaction?.status === "completed") {
        setShowSuccessModal(true);
      }
    }
  }, [activeTransaction]);

  const [currentView, setCurrentView] = useState("summary");
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Track if we're loading fresh data in background
  const isLoadingFreshData = !activeTransaction;

  // Memoized calculations for expensive operations
  const memoizedAmounts = useMemo(() => {
    if (!transaction) return null;

    return {
      formattedSourceAmount: Number(transaction.sourceAmount)?.toFixed(6),
      formattedFeeAmount: formatNumber(
        transaction.feeAmount,
        transaction.sourceCurrency === "NGN" ? 2 : 6
      ),
      formattedDestinationAmount: formatNumber(
        transaction.destinationAmount,
        transaction.destinationCurrency === "NGN" ? 2 : 6
      ),
      truncatedDestinationAddress: transaction.destinationAddress
        ? `${transaction.destinationAddress.slice(
            0,
            6
          )}...${transaction.destinationAddress.slice(-4)}`
        : "",
      bankAccountDisplay:
        transaction.destinationCurrency === "NGN"
          ? `${transaction.destinationAccountName} - ${transaction.destinationBankAccountNumber}/${transaction.destinationBankName}`
          : null,
    };
  }, [transaction]);

  // Memoized transaction status display
  const transactionStatusDisplay = useMemo(() => {
    return (
      activeTransaction?.status?.replace(/_/g, " ") ||
      transaction?.status?.replace(/_/g, " ") ||
      ""
    );
  }, [activeTransaction?.status, transaction?.status]);

  // Memoized completion time display
  const completionTimeDisplay = useMemo(() => {
    if (activeTransaction?.completedAt) {
      return new Date(activeTransaction.completedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    if (transaction?.expiredAt) {
      return new Date(transaction.expiredAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    return "";
  }, [activeTransaction?.completedAt, transaction?.expiredAt]);

  // Wallet and send funds hooks
  // Calculate time left from expiredAt and manage timer
  useEffect(() => {
    const expiredAtTime =
      activeTransaction?.expiredAt || transaction?.expiredAt;

    console.log("Timer effect triggered:", {
      expiredAtTime,
      activeTransactionExpiry: activeTransaction?.expiredAt,
      transactionExpiry: transaction?.expiredAt,
    });

    if (!expiredAtTime) {
      console.log("No expiry time found, setting timeLeft to 0");
      setTimeLeft(0);
      return;
    }

    const expiredAt = new Date(expiredAtTime).getTime();

    // Function to calculate current time left
    const calculateTimeLeft = () => {
      const now = Date.now();
      if (expiredAt <= now) {
        return 0;
      }
      return Math.floor((expiredAt - now) / 1000);
    };

    // Set initial time
    const initialTimeLeft = calculateTimeLeft();
    console.log("Initial time left calculated:", initialTimeLeft);
    setTimeLeft(initialTimeLeft);

    // If already expired, don't start timer
    if (initialTimeLeft <= 0) {
      console.log("Transaction already expired, not starting timer");
      return;
    }

    console.log("Starting timer...");
    // Start timer that recalculates from the actual expiry time
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Clear timer when expired
      if (newTimeLeft <= 0) {
        console.log("Timer expired, clearing interval");
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      console.log("Cleaning up timer");
      clearInterval(timer);
    };
  }, [activeTransaction?.expiredAt, transaction?.expiredAt]);

  // Memoized time formatting function
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Memoized formatted time display
  const formattedTimeLeft = useMemo(() => {
    const formatted = formatTime(timeLeft);
    return formatted;
  }, [timeLeft, formatTime]);

  // Memoized copy handler to prevent unnecessary re-renders
  const handleCopyAddress = useCallback(() => {
    if (transaction?.sourceAddress) {
      navigator.clipboard.writeText(transaction.sourceAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [transaction?.sourceAddress]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-section-backround transition-colors duration-300">
        <div className="w-[490px] max-w-lg  mx-auto bg-section-backround/80 backdrop-blur-md rounded-xl border border-red-300 dark:border-red-700 shadow-2xl overflow-hidden flex flex-col items-center p-8">
          <svg
            className="h-10 w-10 text-red-500 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M12 8v4m0 4h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-lg font-semibold mb-1 text-red-600">
            Error loading transaction
          </p>
          <p className="text-red-500 text-sm mb-2">{error || String(error)}</p>
          <p className="text-gray-500 text-sm">
            Please check your connection or try again later.
          </p>
        </div>
      </div>
    );
  }

  // Only show loading if we have no transaction data at all (no cache, no context)
  if (!transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-section-backround transition-colors duration-300">
        <div className="max-w-md w-full mx-auto bg-section-backround/80 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden flex flex-col items-center p-8">
          <svg
            className="animate-spin h-10 w-10 text-primary mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <p className="text-lg font-semibold mb-1">Loading transaction...</p>
          <p className=" text-sm">
            Please wait while we fetch your transaction details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-100 dark:bg-section-backround pt-22  text-gray-900 dark:text-white transition-colors duration-300">
      {/* Main Modal */}
      <TransactionSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        transaction={transaction}
      />

      <div className="w-[490px] max-w-lg mx-auto bg-section-backround rounded-lg border  overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4">
          {/* Background loading indicator */}
          {isLoadingFreshData && (
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <span>Updating transaction status...</span>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-2 font-body ">
            <Button
              onPress={() => setCurrentView("summary")}
              className={`px-4 rounded-full text-sm font-medium transition-colors text-black ${
                currentView === "summary"
                  ? " bg-green-400 text-black  dark:text-black dark:bg-white"
                  : "bg-gray-200 dark:bg-[#3a3a3a] text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#4a4a4a]"
              }`}
            >
              Summary
            </Button>
            <Button
              onPress={() => setCurrentView("deposit")}
              className={`px-4 rounded-full text-sm font-medium transition-colors text-black ${
                currentView === "deposit"
                  ? " bg-green-400 text-black  dark:text-black dark:bg-white"
                  : "bg-gray-200 dark:bg-[#3a3a3a] text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#4a4a4a]"
              }`}
            >
              Deposit Details
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="relative w-full overflow-hidden font-body">
          <div
            className="flex transition-transform duration-500 ease-in-out w-[200%]"
            style={{
              transform:
                currentView === "summary"
                  ? "translateX(0%)"
                  : "translateX(-50%)",
            }}
          >
            <div className="w-1/2 min-w-0 px-6 pb-6">
              {/* You're Sending */}
              <div className="bg-gray-100 dark:bg-[#3a3a3a] rounded-lg py-2 px-2 mb-3">
                <h3 className="text-center  font-medium">
                  You&apos;re Sending
                </h3>
                <div className="flex items-center justify-center relative  gap-3">
                  <TokenIconWrapper
                    size={40}
                    symbol={transaction?.sourceCurrency?.toLowerCase() || ""}
                  />

                  <span className="text-xl font-bold">
                    {memoizedAmounts?.formattedSourceAmount}{" "}
                    {transaction?.sourceCurrency}
                  </span>
                  <Copy className="w-5 h-5 cursor-pointer hover:opacity-70" />
                </div>
              </div>

              {/* Transaction Details */}
              {memoizedAmounts && transaction && (
                <TransactionDetails
                  feeAmount={memoizedAmounts.formattedFeeAmount}
                  sourceCurrency={transaction.sourceCurrency}
                  destinationAmount={memoizedAmounts.formattedDestinationAmount}
                  destinationCurrency={transaction.destinationCurrency}
                  sourceChain={transaction.sourceChain}
                  bankAccountDisplay={memoizedAmounts.bankAccountDisplay}
                  truncatedDestinationAddress={
                    memoizedAmounts.truncatedDestinationAddress
                  }
                  transactionStatusDisplay={transactionStatusDisplay}
                />
              )}

              {/* Timer */}
              <TimerDisplay
                activeTransaction={activeTransaction}
                transaction={transaction}
                formattedTimeLeft={formattedTimeLeft}
                completionTimeDisplay={completionTimeDisplay}
                timeLeft={timeLeft}
              />

              {/* Warning */}
              {memoizedAmounts && transaction && (
                <WarningMessage
                  destinationAmount={memoizedAmounts.formattedDestinationAmount}
                  destinationCurrency={transaction.destinationCurrency}
                />
              )}

              {/* Button */}
            </div>

            <div className="w-1/2 min-w-0 px-6 pb-6">
              {/* for Crypto */}

              {transaction?.sourceCurrency !== "NGN" ? (
                <QRCodeSection
                  sourceAddress={transaction?.sourceAddress || ""}
                  sourceCurrency={transaction?.sourceCurrency || ""}
                  sourceChain={transaction?.sourceChain || ""}
                  onCopy={handleCopyAddress}
                  copied={copied}
                />
              ) : (
                transaction && (
                  <BankAccountComponent
                    bankDetails={{
                      bankName: transaction.sourceBankName,
                      accountName: transaction.sourceBankAccountName,
                      accountNumber: transaction.sourceBankAccountNumber,
                    }}
                  />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoSwapInterface;
