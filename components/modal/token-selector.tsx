"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Input,
} from "@heroui/react";
import { LuChevronDown, LuSearch } from "react-icons/lu";
import { NetworkIcon } from "@web3icons/react";
import { chainColor, Token } from "../../contexts/swap-context";
import { Check } from "lucide-react";
import { TokenIconWrapper } from "../ui/token-icon";

interface TokenSelectorProps {
  selectedToken: Token;
  availableTokens: Token[];
  onTokenSelect: (token: Token) => void;
  showSearch?: boolean;
  placeholder?: string;
}

const TokenIconCom = ({
  token,
}: {
  token: Token;
  isSelectedToken?: boolean;
}) => {
  return (
    <div className="relative">
      <TokenIconWrapper symbol={token.symbol} size={28} />
      {token.chain !== "fiat" && (
        <div
          className="rounded h-4 w-4 border-2 border-background  absolute right-0 top-4  flex items-center justify-center"
          style={{
            backgroundColor:
              token.chain && token.chain in chainColor
                ? chainColor[token.chain as keyof typeof chainColor]
                : "#6b7280",
          }}
        >
          <NetworkIcon
            id={
              token.chain === "sepolia" ? "ethereum" : token.chain || "ethereum"
            }
            variant="branded"
            size={34}
            className="h-4 w-4 rounded-xl"
          />
        </div>
      )}
    </div>
  );
};

export function TokenSelector({
  selectedToken,
  availableTokens,
  onTokenSelect,
  showSearch = true,
  placeholder = "Search tokens...",
}: TokenSelectorProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTokens = availableTokens.filter(
    (token) =>
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token);
    onOpenChange();
  };

  return (
    <>
      <button
        onClick={onOpen}
        className="flex font-body border items-center justify-between px-2 gap-1 w-28 py-[0.3rem] rounded-full bg-card hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
      >
        <TokenIconCom token={selectedToken} isSelectedToken={true} />
        <span className="text-accent-foreground font-medium text-sm">
          {selectedToken.symbol}
        </span>
        <LuChevronDown className="w-4 h-4" />
      </button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="w-[490px] font-body"
        size="lg"
        // backdrop="blur"
        classNames={{
          backdrop: "modal-backdrop-gradient",
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">Select Token</h3>
              </ModalHeader>
              <ModalBody className="pb-6">
                {showSearch && (
                  <Input
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    startContent={
                      <LuSearch className="w-4 h-4 text-gray-400" />
                    }
                    className="mb-4"
                  />
                )}

                <div className="space-y-0 max-h-80 overflow-y-auto">
                  {filteredTokens.map((token) => (
                    <button
                      key={token.symbol + token.chain}
                      onClick={() => handleTokenSelect(token)}
                      className={`w-full flex items-center gap-3 p-3 hover:rounded-lg  hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b ${
                        selectedToken.symbol === token.symbol &&
                        selectedToken.chain === token.chain
                          ? ""
                          : "rounded-none"
                      }`}
                    >
                      <TokenIconCom token={token} />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-sm text-gray-500">
                          {token.symbol} on {token.chain}
                        </div>
                      </div>
                      {selectedToken.symbol === token.symbol &&
                        selectedToken.chain === token.chain && <Check />}
                    </button>
                  ))}

                  {filteredTokens.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {searchQuery
                        ? `No tokens found matching: ${searchQuery}`
                        : "No tokens available"}
                    </div>
                  )}
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
