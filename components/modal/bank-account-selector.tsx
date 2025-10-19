"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Input,
  Spinner,
  Button,
} from "@heroui/react";
import { LuChevronDown, LuSearch, LuPlus } from "react-icons/lu";
import { Check, Landmark } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGetAllBankAccounts } from "@/hooks/useBank";
import { BankAccount } from "@/types/bank";
import { getBankByName } from "@/utils/bank-data";

interface BankAccountSelectorProps {
  selectedAccount: BankAccount | null;
  onAccountSelect: (account: BankAccount) => void;
}

export function BankAccountSelector({
  selectedAccount,
  onAccountSelect,
}: BankAccountSelectorProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const {
    data: bankAccountsResponse,
    isLoading,
    error,
  } = useGetAllBankAccounts();

  const bankAccounts = bankAccountsResponse?.data || [];

  const filteredAccounts = bankAccounts.filter(
    (account) =>
      account.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.accountNumber.toString().includes(searchQuery)
  );

  const handleAccountSelect = (account: BankAccount) => {
    onAccountSelect(account);
    onOpenChange();
  };

  const handleAddAccount = () => {
    onOpenChange();
    router.push("/account");
  };

  return (
    <>
      <button
        onClick={onOpen}
        className="flex font-body items-center justify-between px-4 py-3 w-full rounded-lg bg-card hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors border"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            {selectedAccount ? (
              (() => {
                const bankData = getBankByName(selectedAccount.bankName);
                return bankData?.logo ? (
                  <Image
                    src={bankData.logo}
                    alt={selectedAccount.bankName}
                    width={32}
                    height={32}
                    className="rounded-full bg-white object-cover"
                  />
                ) : (
                  <Landmark size={16} color="#FFFFFF" />
                );
              })()
            ) : (
              <Landmark size={16} />
            )}
          </div>
          <div className="text-left">
            {selectedAccount ? (
              <>
                <div className="font-medium text-sm">
                  {selectedAccount.accountName}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedAccount.bankName} • {selectedAccount.accountNumber}
                </div>
              </>
            ) : (
              <div className="text-sm">Select Bank Account</div>
            )}
          </div>
        </div>
        <LuChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="w-[490px] font-body"
        size="lg"
        classNames={{
          backdrop: "modal-backdrop-gradient",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg ">Select Bank Account</h3>
              </ModalHeader>
              <ModalBody className="pb-6">
                <Input
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startContent={<LuSearch className="w-4 h-4 text-gray-400" />}
                  className="mb-4"
                />

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="md" />
                    <span className="ml-2">Loading bank accounts...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500">
                    Failed to load bank accounts
                  </div>
                ) : (
                  <div className="space-y-0 max-h-80 overflow-y-auto">
                    {filteredAccounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => handleAccountSelect(account)}
                        className="w-full flex items-center gap-3 p-3 hover:rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {(() => {
                            const bankData = getBankByName(account.bankName);
                            return bankData?.logo ? (
                              <Image
                                src={bankData.logo}
                                alt={account.bankName}
                                width={44}
                                height={44}
                                className="rounded-full bg-white object-cover"
                              />
                            ) : (
                              <Landmark size={38} color="#FFFFFF" />
                            );
                          })()}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">
                            {account.accountName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {account.bankName} • {account.accountNumber}
                          </div>
                        </div>
                        {selectedAccount?.id === account.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </button>
                    ))}

                    {filteredAccounts.length === 0 && !isLoading && (
                      <div className="text-center py-8">
                        <div className="text-gray-500 mb-4">
                          {searchQuery
                            ? `No accounts found matching: ${searchQuery}`
                            : "No bank accounts found"}
                        </div>
                        {!searchQuery && (
                          <Button
                            variant="flat"
                            startContent={<LuPlus className="w-4 h-4" />}
                            onPress={handleAddAccount}
                          >
                            Add Account
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
