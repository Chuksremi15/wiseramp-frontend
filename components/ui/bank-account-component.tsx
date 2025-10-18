"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface BankAccountDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  currency?: string;
}

interface BankAccountComponentProps {
  bankDetails: BankAccountDetails;
  showWarning?: boolean;
  warningMessage?: string;
}

export default function BankAccountComponent({
  bankDetails,
  showWarning = true,
  warningMessage = "Please ensure you send funds with an account you have added to your coinbox account, otherwise your funds may be lost.",
}: BankAccountComponentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bankDetails.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="">
      <div className="text-center md:text-left mt-2 mb-8">
        <h2 className="text-2xl font-medium font-head text-gray-900 dark:text-white mb-2">
          Deposit Account
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Send your {bankDetails.currency || "naira"} to the account number
          provided below.
        </p>
      </div>

      {/* Bank Details */}
      <div className="space-y-4 mb-6">
        {/* Bank Name */}
        <div className="flex justify-between items-center px-4 py-3  bg-gray-100 dark:bg-[#3a3a3a]/30 rounded-lg">
          <span className="text-gray-600 dark:text-gray-300 text-sm">
            Bank:
          </span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">
              {bankDetails.bankName}
            </span>
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Account Name */}
        <div className="flex justify-between items-center px-4 py-3  bg-gray-100 dark:bg-[#3a3a3a]/30 rounded-lg">
          <span className="text-gray-600 dark:text-gray-300 text-sm">
            Account Name:
          </span>
          <span className="font-medium text-gray-900 dark:text-white text-right max-w-[200px] truncate">
            {bankDetails.accountName}
          </span>
        </div>

        {/* Account Number */}
        <div className="flex justify-between items-center px-4 py-3  bg-gray-100 dark:bg-[#3a3a3a]/30 rounded-lg">
          <span className="text-gray-600 dark:text-gray-300 text-sm">
            Account Number:
          </span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">
              {bankDetails.accountNumber}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Copy account number"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Warning */}
      {showWarning && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 px-4 py-3 rounded-r-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {warningMessage}
          </p>
        </div>
      )}
    </div>
  );
}
