"use client";
import React, { useMemo, useState, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  Button,
  Skeleton,
} from "@heroui/react";
import AuthModal from "@/components/modal/auth-modal";
import { useAuth } from "@/contexts/auth-context";
import {
  Landmark,
  BookOpenText,
  SearchIcon,
  Trash2,
  Clipboard,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { NetworkIcon, TokenIcon } from "@web3icons/react";
import {
  useBank,
  useCreateBankAccount,
  useDeleteBankAccount,
  useGetAllBankAccounts,
} from "@/hooks/useBank";
import {
  useCreateUserAddress,
  useDeleteUserAddress,
  useGetAllUserAddresses,
} from "@/hooks/useAddress";
import type { BankAccount } from "@/types/bank";
import { UserAddress } from "@/types/address";
import { getBankByName } from "@/utils/bank-data";
import { LuPlus } from "react-icons/lu";

interface TransformedBank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string;
  pay_with_bank: boolean;
  supports_transfer: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  label: string;
  value: string;
}

const Page = () => {
  const { isAuthenticated } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isBankModalOpen,
    onOpen: onOpenBankModal,
    onClose: onCloseBankModal,
    onOpenChange: onOpenChangeBankModal,
  } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
    onOpenChange: onOpenChangeDeleteModal,
  } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQueryAccount, setSearchQueryAccount] = useState("");
  const [currentView, setCurrentView] = useState("account");
  const [addressName, setAddressName] = useState("");
  const [selectedChain, setSelectedChain] = useState("");

  const { data, isLoading } = useBank();
  const [selectedBank, setSelectedBank] = useState<TransformedBank | null>(
    null
  );
  const [accountName, setAccountName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    type: "account" | "address";
    name: string;
  } | null>(null);

  // Hooks for bank accounts
  const {
    data: bankAccounts,
    isLoading: isLoadingBankAccounts,
    error: errorAccount,
  } = useGetAllBankAccounts();
  const createBankAccount = useCreateBankAccount();
  const deleteBankAccount = useDeleteBankAccount();

  // Hooks for user addresses
  const {
    data: userAddresses,
    isLoading: isLoadingUserAddresses,
    error: errorAddress,
  } = useGetAllUserAddresses();
  const createUserAddress = useCreateUserAddress();
  const deleteUserAddress = useDeleteUserAddress();

  const formattedBank = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((bank: { name: string }) => ({
      label: bank.name,
      value: bank.name,
      ...bank,
    }));
  }, [data]);

  const filteredBank = useMemo(() => {
    if (!formattedBank) return [];
    return formattedBank.filter((bank: { name: string }) => {
      const searchLower = searchQuery.toLowerCase();
      return bank.name.toLowerCase().includes(searchLower);
    });
  }, [formattedBank, searchQuery]);

  const filteredAddress = useMemo(() => {
    if (!userAddresses?.data) return [];

    return userAddresses?.data.filter((address: UserAddress) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        address.chain?.toLowerCase().includes(searchLower) ||
        address.addressName?.toLowerCase().includes(searchLower) ||
        address.userAddress?.toLowerCase().includes(searchLower)
      );
    });
  }, [userAddresses?.data, searchQuery]);
  const filteredAccount = useMemo(() => {
    if (!bankAccounts?.data) return [];

    return bankAccounts?.data.filter((account: BankAccount) => {
      const searchLower = searchQueryAccount.toLowerCase();
      return (
        account.accountName?.toLowerCase().includes(searchLower) ||
        account.bankName?.toLowerCase().includes(searchLower) ||
        account.accountNumber?.toString().toLowerCase().includes(searchLower)
      );
    });
  }, [bankAccounts?.data, searchQueryAccount]);

  const handlePasteAddress = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddressInput(text);
      toast.success("Address pasted from clipboard");
    } catch {
      toast.error("Failed to read from clipboard");
    }
  };

  const handleAddBankAccount = () => {
    if (!selectedBank || !accountNumber || !accountName) {
      toast.error("Please fill all required fields");
      return;
    }

    createBankAccount.mutate(
      {
        accountName,
        bankName: selectedBank.name,
        accountNumber,
        bankCode: getBankByName(selectedBank.name)?.code || "",
      },
      {
        onSuccess: () => {
          toast.success("Bank account added successfully");
          onOpenChange();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to add bank account");
        },
      }
    );
  };

  const handleAddUserAddress = () => {
    if (!addressInput || !selectedChain) {
      toast.error("Please fill all required fields");
      return;
    }

    createUserAddress.mutate(
      {
        chain: selectedChain,
        addressName: addressName || "Unnamed Address",
        userAddress: addressInput,
      },
      {
        onSuccess: () => {
          toast.success("Address added successfully");
          setAddressInput("");
          setAddressName("");
          setSelectedChain("");
          onOpenChange();
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to add address");
        },
      }
    );
  };

  const handleDeleteBankAccount = (accountId: string) => {
    deleteBankAccount.mutate(accountId, {
      onSuccess: () => {
        toast.success("Bank account deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete bank account");
      },
    });
  };

  const handleDeleteUserAddress = (addressId: string) => {
    deleteUserAddress.mutate(addressId, {
      onSuccess: () => {
        toast.success("Address deleted successfully");
      },
      onError: (error: Error) => {
        toast.error(error.message || "Failed to delete address");
      },
    });
  };

  const openDeleteModal = (
    id: string,
    type: "account" | "address",
    name: string
  ) => {
    setItemToDelete({ id, type, name });
    onOpenDeleteModal();
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === "account") {
      handleDeleteBankAccount(itemToDelete.id);
    } else {
      handleDeleteUserAddress(itemToDelete.id);
    }

    onCloseDeleteModal();
    setItemToDelete(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen font-body p-4 bg-gray-100  dark:bg-section-backround pt-22 text-gray-900 dark:text-white transition-colors duration-300">
        <div className="max-w-md mx-auto dark:bg-section-background rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col justify-center">
          <p className="text-center text-2xl font-medium md:mt-[40px]">
            Sign in to view your Account.
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-3 mb-6 text-center">
            Please sign in to access this content.
          </p>
          <div className="mb-[20px] md:mb-[40px] mx-auto">
            <AuthModal />
          </div>
        </div>
      </div>
    );
  }

  const renderSkeleton = () => {
    return (
      <>
        {" "}
        <Input
          disabled
          classNames={{
            base: "max-w-full h-10 mb-4 px-4 mt-6",
            mainWrapper: "h-full",
            input: "text-small",
            inputWrapper: "h-full font-normal text-default-500 bg-input",
          }}
          placeholder="Search account..."
          size="sm"
          startContent={<SearchIcon size={18} />}
          type="search"
        />
        {Array.from({ length: 3 }).map((_, index) => (
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
                {/* <Skeleton className='h-4 w-[100px] rounded-md' /> */}
                <Skeleton className="h-5 w-[10px] rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </>
    );
  };
  return (
    <>
      {/*  */}
      <div className="bg-gray-100 font-body dark:bg-section-backround min-h-screen justify-center pt-22 p-4">
        <div>
          <div className="md:w-[490px] mx-auto flex flex-wrap items-center justify-between">
            <div className="w-fit gap-2 bg-white dark:bg-black rounded-full">
              <Button
                onPress={() => setCurrentView("account")}
                className={`px-6 py-4 rounded-full text-sm font-medium border-5 border-white dark:border-black  ${
                  currentView === "account"
                    ? "bg-black dark:bg-white   text-white  dark:text-black"
                    : "bg-transparent text-gray-600 dark:text-gray-400  hover:text-black dark:hover:text-white"
                }`}
              >
                Account
              </Button>
              <Button
                onPress={() => setCurrentView("addresses")}
                className={`px-6 py-4 rounded-full text-sm font-medium border-5 border-white dark:border-black  ${
                  currentView === "addresses"
                    ? "bg-black dark:bg-white   text-white dark:text-black"
                    : "bg-transparent text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                }`}
              >
                Addresses
              </Button>
            </div>

            <Button
              onPress={() => {
                onOpen();
              }}
              className="rounded-full bg-primary/40 py-3"
              startContent={<LuPlus className="w-4 h-4" />}
            >
              {currentView === "account" ? "Add Account" : "Add Address"}
            </Button>
          </div>

          <div className="md:w-[490px] mx-auto max-w-lg bg-white dark:bg-section-backround rounded-2xl relative mt-5 pb-7 space-y-5 border">
            {currentView === "account" && (
              <>
                {!isLoadingBankAccounts && (
                  <Input
                    classNames={{
                      base: "max-w-full h-10 px-4 mt-6 mb-4",
                      mainWrapper: "h-full",
                      input: "text-small",
                      inputWrapper:
                        "h-full font-normal text-default-500 bg-input",
                    }}
                    placeholder="Search account..."
                    size="sm"
                    startContent={<SearchIcon size={18} />}
                    type="search"
                    value={searchQueryAccount}
                    onChange={(e) => setSearchQueryAccount(e.target.value)}
                  />
                )}
                {isLoadingBankAccounts ? (
                  renderSkeleton()
                ) : bankAccounts?.data?.length === 0 ? (
                  <div className="flex flex-col gap-4 items-center justify-center px-8 pt-12">
                    <Landmark size={100} strokeWidth={1.25} />
                    <p className="font-bold font-head text-xl">
                      No Bank Accounts
                    </p>
                    <p className="w-[70%] mx-auto text-center text-base mb-8 font-medium">
                      You haven&apos;t added any bank accounts. Add a bank
                      account to receive payments
                    </p>
                    <Button
                      onPress={() => {
                        setCurrentView("account");
                        onOpen();
                      }}
                      className={`h-11 w-full rounded-lg text-base font-medium transition-colors text-black bg-primary`}
                    >
                      Add New Account
                    </Button>
                  </div>
                ) : searchQueryAccount ? (
                  filteredAccount.length !== 0 ? (
                    filteredAccount?.map((account: BankAccount) => (
                      <div
                        key={account.id}
                        className="flex items-center gap-2 justify-between hover:bg-[#e8eaeb63] dark:hover:bg-[#2b313950] py-[15px] mb-0 px-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <TokenIcon
                            symbol="usdc"
                            variant="mono"
                            size="44"
                            color="#FFFFFF"
                          />
                          <div>
                            <p className="text-base font-medium">
                              {account.accountName}
                            </p>
                            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                              {account.bankName} - {account.accountNumber}
                            </p>
                          </div>
                        </div>
                        <Button
                          isIconOnly
                          variant="light"
                          className="text-foreground hover:bg-red-50 dark:hover:bg-red-900/20"
                          onPress={() =>
                            openDeleteModal(
                              account.id,
                              "account",
                              account.accountName
                            )
                          }
                        >
                          <Trash2 size={20} />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No search data &quot;{searchQueryAccount}&quot;
                      </div>
                    </>
                  )
                ) : (
                  <div className="flex flex-col">
                    {bankAccounts?.data
                      ?.sort(
                        (a: BankAccount, b: BankAccount) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .map((account: BankAccount) => (
                        <div
                          key={account.id}
                          className="flex items-center gap-2 justify-between hover:bg-[#e8eaeb63] dark:hover:bg-[#2b313950] py-[15px] px-4 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
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
                            <div>
                              <p className="text-base font-medium">
                                {account.accountName}
                              </p>
                              <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                {account.bankName} - {account.accountNumber}
                              </p>
                            </div>
                          </div>
                          <Button
                            isIconOnly
                            variant="light"
                            className="text-foreground hover:bg-red-50 dark:hover:bg-red-900/20"
                            onPress={() =>
                              openDeleteModal(
                                account.id,
                                "account",
                                account.accountName
                              )
                            }
                          >
                            <Trash2 size={20} />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
                {errorAccount && (
                  <div className="p-4 text-center text-red-500">
                    Error loading Account. Please try again later.
                  </div>
                )}
              </>
            )}

            {currentView === "addresses" && (
              <>
                {!isLoadingUserAddresses && (
                  <Input
                    classNames={{
                      base: "max-w-full h-10 px-4 mt-6 mb-4",
                      mainWrapper: "h-full",
                      input: "text-small",
                      inputWrapper:
                        "h-full font-normal text-default-500 bg-input",
                    }}
                    placeholder="Search address..."
                    size="sm"
                    startContent={<SearchIcon size={18} />}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                )}
                {isLoadingUserAddresses ? (
                  renderSkeleton()
                ) : userAddresses?.data?.length === 0 ? (
                  <div className="flex flex-col gap-4 items-center justify-center px-8 pt-12">
                    <BookOpenText size={100} strokeWidth={1.25} />
                    <p className="font-bold font-head text-xl">No Addresses</p>
                    <p className="w-[70%] mx-auto text-center text-base mb-8 font-medium">
                      You need to add your addresses to view them here
                    </p>
                    <Button
                      onPress={() => {
                        setCurrentView("addresses");
                        onOpen();
                      }}
                      className={`h-11 w-full rounded-lg text-base font-medium transition-colors text-black bg-primary`}
                    >
                      Add New Address
                    </Button>
                  </div>
                ) : searchQuery ? (
                  filteredAddress.length !== 0 ? (
                    filteredAddress?.map((address: UserAddress) => (
                      <div
                        key={address.id}
                        className="flex items-center gap-2 justify-between hover:bg-[#e8eaeb63] dark:hover:bg-[#2b313950] py-[15px] mb-0 px-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div className="rounded-full overflow-hidden">
                            <NetworkIcon
                              name={address.chain!}
                              variant="background"
                              size="34"
                              color="#FFFFFF"
                            />
                          </div>
                          <div>
                            <p className="text-base font-medium">
                              {address.addressName || "Unnamed Address"}
                            </p>
                            <p className="text-sm font-normal text-gray-500 dark:text-gray-400 text-ellipsis overflow-hidden w-80 whitespace-nowrap">
                              {address.chain || "Unknown chain"} -{" "}
                              {address.userAddress || "None"}
                            </p>
                          </div>
                        </div>
                        <Button
                          isIconOnly
                          variant="light"
                          className="text-foreground hover:bg-red-50 dark:hover:bg-red-900/20"
                          onPress={() =>
                            openDeleteModal(
                              address.id,
                              "address",
                              address.addressName || "Unnamed Address"
                            )
                          }
                        >
                          <Trash2 size={20} />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No search data &quot;{searchQuery}&quot;
                    </div>
                  )
                ) : (
                  <div className="flex flex-col">
                    {userAddresses?.data
                      ?.sort(
                        (a: UserAddress, b: UserAddress) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime()
                      )
                      .map((address: UserAddress) => (
                        <div
                          key={address.id}
                          className="flex items-center gap-2 justify-between hover:bg-[#e8eaeb63] dark:hover:bg-[#2b313950] py-[15px] px-4 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="rounded-full overflow-hidden">
                              <NetworkIcon
                                name={address.chain!}
                                variant="background"
                                size="34"
                                color="#FFFFFF"
                              />
                            </div>
                            <div>
                              <p className="text-base font-medium">
                                {address.addressName || "Unnamed Address"}
                              </p>
                              <p className="text-sm font-normal text-gray-500 dark:text-gray-400 text-ellipsis overflow-hidden w-80 whitespace-nowrap">
                                {address.chain || "Unknown chain"} -{" "}
                                {address.userAddress || "None"}
                              </p>
                            </div>
                          </div>
                          <Button
                            isIconOnly
                            variant="light"
                            className="text-foreground hover:bg-red-50 dark:hover:bg-red-900/20"
                            onPress={() =>
                              openDeleteModal(
                                address.id,
                                "address",
                                address.addressName || "Unnamed Address"
                              )
                            }
                          >
                            <Trash2 size={20} />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
                {errorAddress && (
                  <div className="p-4 text-center text-red-500">
                    Error loading Address. Please try again later.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="max-w-md mx-auto"
        size="lg"
        classNames={{
          backdrop: "modal-backdrop-gradient",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1 pb-1">
                <h3 className="text-lg font-semibold font-head tracking-tight ">
                  {currentView === "account"
                    ? "Add New Account"
                    : "Add New Address"}
                </h3>
              </ModalHeader>
              <ModalBody className="pb-6 pt-0 pr-3">
                {currentView === "account" ? (
                  <div className="space-y-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Add a bank account to receive naira
                    </p>
                    {/* Add your account form components here */}
                    <div className="w-full flex flex-col">
                      <Select
                        // isDisabled
                        className="pr-0 placeholder:text-sm mb-4"
                        aria-label="Select bank"
                        placeholder={
                          selectedBank ? selectedBank.name : "Select bank"
                        }
                        size="lg"
                        isOpen={false}
                        onClick={() => onOpenBankModal()}
                      >
                        <SelectItem key="placeholder">Select bank</SelectItem>
                      </Select>
                      <Input
                        size="lg"
                        placeholder="Account Number"
                        type="number"
                        value={accountNumber}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers and limit to 10 digits
                          if (value.length <= 10 && /^\d*$/.test(value)) {
                            setAccountNumber(value);
                          }
                        }}
                      />
                      <div className="flex items-center gap-x-1 bg-yellow-500/10 mb-8 mt-3 p-2">
                        <AiOutlineExclamationCircle size={14} />
                        <p className="text-xs">Only personal account allowed</p>
                      </div>
                      <Input
                        size="lg"
                        placeholder="Account Name(AutoFilled)"
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                      />
                      <Button
                        onPress={handleAddBankAccount}
                        isLoading={createBankAccount.isPending}
                        className={`h-11 w-full rounded-lg text-base font-medium transition-colors text-black bg-primary mt-8`}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Access your address more easily by adding them here
                    </p>

                    <Input
                      type="text"
                      value={addressName}
                      onChange={(e) => setAddressName(e.target.value)}
                      placeholder="Address Name"
                      size="lg"
                      className="w-full"
                    />
                    <Input
                      ref={addressInputRef}
                      type="text"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="Enter wallet address"
                      className="w-full"
                      size="lg"
                      endContent={
                        <div
                          onClick={handlePasteAddress}
                          className="h-8 w-8 flex items-center justify-center rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Clipboard size={18} />
                        </div>
                      }
                    />
                    <Select
                      className="mt-4"
                      placeholder="Select Chain"
                      size="lg"
                      aria-label="Select blockchain network"
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0] as string;
                        setSelectedChain(selectedKey);
                      }}
                    >
                      <SelectItem key="ethereum">Ethereum</SelectItem>
                      <SelectItem key="bitcoin">Bitcoin</SelectItem>
                      <SelectItem key="solana">Solana</SelectItem>
                    </Select>
                    <Button
                      onPress={handleAddUserAddress}
                      isLoading={createUserAddress.isPending}
                      className={`h-11 w-full rounded-lg text-base font-medium transition-colors text-black bg-primary mt-8`}
                    >
                      Continue
                    </Button>
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      {/* Bank Selection Modal */}
      <Modal
        isOpen={isBankModalOpen}
        onOpenChange={onOpenChangeBankModal}
        className="max-w-md mx-auto"
        size="lg"
        classNames={{
          backdrop: "modal-backdrop-gradient",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">Select Bank</h3>
              </ModalHeader>
              <ModalBody className="pb-6">
                <Input
                  placeholder="Search banks..."
                  startContent={<SearchIcon size={18} />}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    Fetching data...
                  </div>
                ) : (
                  !searchQuery && (
                    <div className="max-h-[300px] overflow-y-auto">
                      {formattedBank.map(
                        (bank: TransformedBank, index: number) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-md"
                            onClick={() => {
                              setSelectedBank(bank);
                              onCloseBankModal();
                            }}
                          >
                            {bank.name}
                          </div>
                        )
                      )}
                    </div>
                  )
                )}
                {searchQuery && (
                  <div className="max-h-[300px] overflow-y-auto">
                    {filteredBank.length !== 0 ? (
                      filteredBank.map(
                        (bank: TransformedBank, index: number) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-md"
                            onClick={() => {
                              setSelectedBank(bank);
                              onCloseBankModal();
                            }}
                          >
                            {bank.name}
                          </div>
                        )
                      )
                    ) : (
                      <div>`{searchQuery}` not found</div>
                    )}
                  </div>
                )}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onOpenChange={onOpenChangeDeleteModal}
        className="max-w-md mx-auto"
        size="sm"
        classNames={{
          backdrop: "modal-backdrop-gradient",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 pb-2">
                <h3 className="text-lg font-medium">
                  Delete{" "}
                  {itemToDelete?.type === "account" ? "Account" : "Address"}
                </h3>
              </ModalHeader>
              <ModalBody className="pb-6 pt-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete &quot;{itemToDelete?.name}
                  &quot;? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button variant="light" onPress={onClose} className="px-6">
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    onPress={confirmDelete}
                    className="px-6 text-foreground"
                  >
                    Delete
                  </Button>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default Page;
