import { TokenIcon } from "@web3icons/react";

type TVariant = "background" | "branded" | "mono";

interface TokenIconProps {
  size?: number;
  symbol: string;
  variant?: TVariant;
}

interface TokenIconFallbackProps {
  size?: number;
  className?: string;
}

export const TokenIconWrapper: React.FC<TokenIconProps> = ({
  size = 32,
  symbol,
  variant = "background",
}) => {
  const TokenIconFallback = ({ size = 40, className = "" }) => {
    return (
      <div
        className={`flex rounded-full overflow-hidden ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="flex-1 bg-green-500"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-green-500"></div>
      </div>
    );
  };

  const iconProps = {
    symbol,
    size,
    variant,
    fallback: <TokenIconFallback size={size} />,
  };

  return (
    <div className="rounded-full overflow-hidden flex items-center justify-center bg-black">
      <TokenIcon key={symbol} {...iconProps} />
    </div>
  );
};
