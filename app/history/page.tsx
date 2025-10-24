"use client";
import React, { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Button,
  Input,
  Pagination,
  Modal,
  ModalContent,
  ModalBody,
  Skeleton,
} from "@heroui/react";
import AuthModal from "@/components/modal/auth-modal";
import { SearchIcon } from "lucide-react";
import { useGetUserHistory } from "@/hooks/useGetUserHistory";
import { formatNumber, formatTransactionHashString } from "@/utils/helpers";
import { useRouter } from "next/navigation";
import CopyInput from "@/components/ui/copy-input";
import TransactionDetail from "@/components/ui/transaction-detail";
import { TransactionResponse } from "@/hooks/useCreateTransaction";
import { TokenIconWrapper } from "@/components/ui/token-icon";

const Page = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: userHistory,
    isLoading,
    error,
  } = useGetUserHistory(currentPage.toString());

  const filteredTransactions = useMemo(() => {
    if (!userHistory?.transactions) return [];

    return userHistory.transactions.filter(
      (transaction: TransactionResponse) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          transaction.transactionId?.toLowerCase().includes(searchLower) ||
          transaction.sourceCurrency?.toLowerCase().includes(searchLower) ||
          transaction.destinationCurrency
            ?.toLowerCase()
            .includes(searchLower) ||
          transaction.sourceAddress?.toLowerCase().includes(searchLower) ||
          transaction.destinationAddress?.toLowerCase().includes(searchLower) ||
          transaction.sourceTransactionHash
            ?.toLowerCase()
            .includes(searchLower) ||
          transaction.destinationTransactionHash
            ?.toLowerCase()
            .includes(searchLower)
        );
      }
    );
  }, [userHistory?.transactions, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Pending", color: "#F0AD4E" };
      case "completed":
        return { label: "Completed", color: "#25C26E" };
      case "expired":
        return { label: "Expired", color: "#FF554A" };
      default:
        return { label: status, color: "#7D7D7D" };
    }
  };

  // Group transactions by date
  const groupTransactionsByDate = () => {
    if (!filteredTransactions) return {};

    const grouped: { [key: string]: TransactionResponse[] } = {};

    // Sort transactions by date (newest first)
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    sortedTransactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt);
      const dateString = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!grouped[dateString]) {
        grouped[dateString] = [];
      }
      grouped[dateString].push(transaction);
    });

    return grouped;
  };

  const groupedTransactions = groupTransactionsByDate();

  // Format time correctly
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${formattedMinutes} ${ampm}`;
  };

  const formatModalDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openTransactionModal = (transaction: TransactionResponse) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  // Loading skeleton
  const renderSkeleton = () => {
    return Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="px-[15px] py-[15px] mt-[20px]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-[10px]">
            <Skeleton className="w-[40px] h-[40px] rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-[120px] rounded-md" />
              <Skeleton className="h-3 w-[80px] rounded-md" />
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Skeleton className="h-4 w-[100px] rounded-md" />
            <Skeleton className="h-3 w-[60px] rounded-md" />
          </div>
        </div>
      </div>
    ));
  };

  console.log("selectedTransaction", selectedTransaction);

  return (
    <>
      {!isAuthenticated && (
        <div className="min-h-screen p-4 bg-gray-100 dark:bg-section-backround pt-22 text-gray-900 dark:text-white transition-colors duration-300">
          <div className="max-w-md mx-auto bg-section-backround rounded-lg border overflow-hidden flex flex-col justify-center">
            <p className="text-center text-2xl font-bold md:mt-[40px]">
              Sign in to view your history.
            </p>
            <p className="text-base text-gray-600 mt-3 mb-6 text-center">
              Please sign in to access this content.
            </p>
            <div className="mb-[20px] md:mb-[40px] mx-auto">
              <AuthModal />
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && (
        <div className="bg-gray-100 dark:bg-section-backround font-body  min-h-screen justify-center pt-22 p-4">
          <p className="text-xl w-[490px] max-w-lg mx-auto font-medium font-head pb-2">
            History
          </p>
          <div className="w-[490px] mx-auto max-w-lg bg-white dark:bg-section-backround  rounded-2xl pt-6 relative  space-y-5 border ">
            <div className="px-4 ">
              <Input
                isDisabled={!userHistory?.transactions?.length || isLoading}
                classNames={{
                  base: "max-w-full max-md:max-w-[10rem] h-10",
                  mainWrapper: "h-full",
                  input: "text-small",
                  inputWrapper: "h-full font-normal text-default-500 bg-input",
                }}
                placeholder="Search by ID, currency or address..."
                size="sm"
                startContent={<SearchIcon size={18} />}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading && renderSkeleton()}

            {error && (
              <div className="p-4 text-center text-red-500">
                Error loading transactions. Please try again later.
              </div>
            )}

            {!isLoading &&
              !error &&
              userHistory?.transactions?.length === 0 && (
                <div className="p-8 text-center font-body">
                  <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="w-12 h-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    No Transactions Yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    You haven&apos;t made any transactions yet. Start trading to
                    see your history here.
                  </p>
                  <Button color="primary" className="mt-4">
                    Make Your First Transaction
                  </Button>
                </div>
              )}

            {!isLoading &&
              !error &&
              userHistory &&
              userHistory?.transactions?.length > 0 && (
                <>
                  {/* Grouped transactions */}
                  {Object.entries(groupedTransactions).map(
                    ([date, transactions]) => (
                      <div key={date} className="font-body">
                        <div className="mt-[30px]  px-4">
                          <p className="text-sm font-medium">{date}</p>
                        </div>
                        {transactions.map((history, index) => (
                          <div
                            key={history.id}
                            className={` ${
                              index !== transactions.length - 1
                                ? "border-b-[0.5px] border-gray-200 dark:border-gray-800"
                                : ""
                            }`}
                          >
                            <div
                              className="px-[15px] flex justify-between items-center py-[15px] hover:bg-[#e8eaeb63] dark:hover:bg-[#2b313950] cursor-pointer"
                              onClick={() => openTransactionModal(history)}
                            >
                              <div className="flex items-center gap-[10px]">
                                <div className="m-0.5">
                                  <TokenIconWrapper
                                    symbol={history.destinationCurrency?.toLowerCase()}
                                    size={35}
                                  />
                                </div>
                                <div className="flex flex-col items-start gap-[4px]">
                                  <p className="text-base font-medium">
                                    {/* {formatTransactionHashString(
                                      history.destinationAddress
                                    )} */}

                                    {/* {history.destinationCurrency === "NGN"
                                      ? `${history?.destinationAccountName}/${history?.destinationBankAccountNumber}`
                                      : formatTransactionHashString(
                                          history.destinationAddress
                                        )} */}

                                    {history.destinationCurrency === "NGN"
                                      ? `${history?.destinationAccountName?.slice(
                                          0,
                                          4
                                        )}${
                                          history?.destinationAccountName
                                            ?.length > 4
                                            ? "..."
                                            : ""
                                        }/${
                                          history?.destinationBankAccountNumber
                                        }`
                                      : formatTransactionHashString(
                                          history.destinationAddress
                                        )}
                                  </p>
                                  <p className="text-sm font-medium text-[#7D7D7D] dark:text-slate-400">
                                    {formatTime(
                                      history.completedAt || history.createdAt
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-[4px]">
                                <p className="text-base font-medium">
                                  {formatNumber(history.destinationAmount, 4)}{" "}
                                  {history.destinationCurrency}
                                </p>
                                <p className="text-sm font-medium text-[#7D7D7D] dark:text-gray-400 capitalize">
                                  <span className="flex items-center gap-1">
                                    <span
                                      className="inline-block w-1.5 h-1.5 rounded-full"
                                      style={{
                                        backgroundColor: getStatusColor(
                                          history.status
                                        ).color,
                                      }}
                                    />
                                    {getStatusColor(history.status).label}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {/* Show no results message if search returns empty */}
                  {searchQuery &&
                    Object.keys(groupedTransactions).length === 0 && (
                      <div className="p-8 text-center">
                        <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium mb-2">
                          No Matching Transactions
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          No transactions found matching your search.
                        </p>
                      </div>
                    )}

                  {/* Pagination - only show if not searching */}
                  {!searchQuery &&
                    userHistory &&
                    userHistory?.totalPages > 1 && (
                      <div className="p-4 flex justify-center mt-[20px]">
                        <Pagination
                          loop
                          showControls
                          color="success"
                          page={currentPage}
                          onChange={setCurrentPage}
                          total={userHistory.totalPages}
                        />
                      </div>
                    )}
                </>
              )}
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        className="w-[490px] font-body"
        size="lg"
        classNames={{
          backdrop: "modal-backdrop-gradient",
        }}
      >
        <ModalContent>
          <ModalBody>
            {selectedTransaction && (
              <div className="space-y-4 pt-8 pb-4">
                <div className="bg-gray-100 dark:bg-[#3a3a3a] p-4 rounded-lg flex flex-col items-center">
                  <span className="text-sm font-medium">
                    Swap {selectedTransaction?.sourceAmount}{" "}
                    {selectedTransaction?.sourceCurrency} for{" "}
                  </span>
                  <div className="flex justify-center items-center gap-x-1">
                    <div className="  p-1 ">
                      <TokenIconWrapper
                        symbol={selectedTransaction?.destinationCurrency?.toLowerCase()}
                        size={38}
                      />
                    </div>
                    <p className="text-xl font-bold">
                      {formatNumber(selectedTransaction.destinationAmount, 6)}{" "}
                      {selectedTransaction.destinationCurrency}
                    </p>
                  </div>
                </div>

                <div className="space-y-8 my-[30px]">
                  <TransactionDetail
                    label="ID"
                    value={selectedTransaction.transactionId}
                    valueClassName="font-mono"
                  />

                  <TransactionDetail
                    label="Rate"
                    value={`${formatNumber(
                      selectedTransaction.exchangeRate,
                      4
                    )} ${selectedTransaction.destinationCurrency}/${
                      selectedTransaction.sourceCurrency
                    }`}
                  />

                  <TransactionDetail
                    label="Chain"
                    value={`${selectedTransaction.sourceChain} - (${selectedTransaction.sourceCurrency})`}
                  />

                  <TransactionDetail
                    label="Date"
                    value={formatModalDate(selectedTransaction.createdAt)}
                  />

                  <TransactionDetail
                    label="Receiver"
                    value={
                      selectedTransaction.destinationCurrency === "NGN"
                        ? `${selectedTransaction?.destinationAccountName}/${selectedTransaction?.destinationBankAccountNumber}`
                        : formatTransactionHashString(
                            selectedTransaction.destinationAddress
                          )
                    }
                    valueClassName="font-mono text-right break-all"
                  />

                  <TransactionDetail
                    label="Status"
                    value={
                      <span className="flex items-center gap-1 text-[#7D7D7D] dark:text-slate-400 capitalize">
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: getStatusColor(
                              selectedTransaction.status
                            ).color,
                          }}
                        />
                        {getStatusColor(selectedTransaction.status).label}
                      </span>
                    }
                    valueClassName="font-medium"
                  />
                </div>
                {selectedTransaction.status === "pending" && (
                  <Button
                    onPress={() =>
                      router.push(
                        ` active-transaction/${selectedTransaction.transactionId}`
                      )
                    }
                    className="w-full font-medium rounded-full"
                    color="primary"
                  >
                    View progress
                  </Button>
                )}
                <div className="pt-4">
                  <h4 className="font-medium mb-2">Transaction Details</h4>
                  <div className="space-y-2">
                    {selectedTransaction.sourceTransactionHash && (
                      <CopyInput
                        value={selectedTransaction.sourceTransactionHash}
                        label="Source TX Hash:"
                      />
                    )}
                    {selectedTransaction.destinationTransactionHash && (
                      <CopyInput
                        value={selectedTransaction.destinationTransactionHash}
                        label="Destination TX Hash:"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Page;
