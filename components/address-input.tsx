import React, { useMemo, useState, useEffect } from "react";
import { LuX, LuPencil } from "react-icons/lu";
import { useRouter } from "next/navigation";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Input,
  useDisclosure,
  Button,
  Skeleton,
} from "@heroui/react";
import { toast } from "sonner";

interface Token {
  symbol: string;
  name: string;
  icon: string;
  color?: string;
  address?: string;
  decimals?: number;
  price?: number;
  maxValue: number;

  chain?: string;
  isNetworkToken?: boolean;
}

interface AddressInputProps {
  address: string;
  setAddress: (address: string) => void;
  addressError: string;
  setAddressError: (error: string) => void;
  receiveToken?: Token;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  address,
  setAddress,
  addressError,
  setAddressError,
  receiveToken,
}) => {
  // Validation functions
  const validateEthAddress = (addr: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  const validateAddress = (addr: string): string | null => {
    if (!addr) return null;
    if (!receiveToken?.chain) return null;

    const chain = receiveToken.chain.toLowerCase();

    switch (chain) {
      case "ethereum":
      case "eth":
      case "binance":
      case "bsc":
      case "polygon":
      case "matic":
      case "arbitrum":
      case "optimism":
        return validateEthAddress(addr)
          ? null
          : "Please enter a valid Ethereum address (0x...)";
      default:
        return null;
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    if (!newAddress) {
      setAddressError("");
      return;
    }
    const error = validateAddress(newAddress);
    setAddressError(error || "");
  };

  useEffect(() => {
    const error = validateAddress(address);
    setAddressError(error || "");
  }, [receiveToken]);

  const renderSkeleton = () => {
    return (
      <>
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
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <>
      <div className="relative">
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="Receiving Address"
          className={`w-full bg-card border rounded-lg p-3.5 pr-10  placeholder-slate-400 focus:outline-none focus:ring-1 ${
            addressError ? "ring-2 ring-red-500" : "focus:ring-foreground/80"
          } transition-shadow`}
        />
        <button
          className="absolute right-3 top-7 -translate-y-1/2 "
          aria-label="Edit address"
          onClick={() => {
            setAddress("");
          }}
        ></button>
        {addressError && (
          <p className="text-red-500 text-xs mt-1">{addressError}</p>
        )}
      </div>

      {/* Address Modal */}
    </>
  );
};
