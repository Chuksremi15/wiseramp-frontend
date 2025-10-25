import { tokens, useSwap } from "@/contexts/swap-context";
import { TokenCard } from "./token-card";
import { TokenSelector } from "./modal/token-selector";

export const SellCard = ({
  label = "Sell",
  showSearch = true,
  isBackground = true,
}: {
  label?: string;
  showSearch?: boolean;
  isBackground?: boolean;
}) => {
  const {
    sellToken,
    sellAmount,
    setSellAmount,
    setError,
    sellTokenPrice,
    setSellToken,
    gettingTokenEquivalentLoading,
  } = useSwap();

  const handleValidationChange = (isValid: boolean, error?: string) => {
    setError(isValid ? null : error || null);
  };

  return (
    <TokenCard
      label={label}
      token={sellToken}
      amount={sellAmount}
      onAmountChange={setSellAmount}
      onValidationChange={handleValidationChange}
      tokenPrice={sellTokenPrice}
      isBackground={isBackground}
      gettingTokenEquivalentLoading={gettingTokenEquivalentLoading}
    >
      <TokenSelector
        selectedToken={sellToken}
        availableTokens={tokens}
        onTokenSelect={setSellToken}
        showSearch={showSearch}
        placeholder="Search tokens..."
      />
    </TokenCard>
  );
};
