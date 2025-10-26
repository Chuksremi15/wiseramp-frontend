import { tokens, useSwap } from "@/contexts/swap-context";
import { TokenCard } from "./token-card";
import { TokenSelector } from "./modal/token-selector";

export const ReceiveCard = ({
  label = "Receive",
  showSearch = true,
  isBackground = true,
}: {
  label?: string;
  showSearch?: boolean;
  isBackground?: boolean;
}) => {
  const {
    receiveToken,
    receiveAmount,
    setReceiveAmount,
    setError,
    receiveTokenPrice,
    setReceiveToken,
    gettingTokenEquivalentLoading,
  } = useSwap();

  const handleValidationChange = (isValid: boolean, error?: string) => {
    setError(isValid ? null : error || null);
  };

  return (
    <TokenCard
      label={label}
      token={receiveToken}
      amount={receiveAmount}
      onAmountChange={setReceiveAmount}
      onValidationChange={handleValidationChange}
      tokenPrice={receiveTokenPrice}
      isBackground={isBackground}
      gettingTokenEquivalentLoading={gettingTokenEquivalentLoading}
    >
      <TokenSelector
        selectedToken={receiveToken}
        availableTokens={tokens}
        onTokenSelect={setReceiveToken}
        showSearch={showSearch}
        placeholder="Search tokens..."
      />
    </TokenCard>
  );
};
