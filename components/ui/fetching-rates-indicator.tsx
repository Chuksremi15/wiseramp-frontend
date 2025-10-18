import { Spinner } from "@heroui/react";

interface FetchingRatesIndicatorProps {
  isVisible: boolean;
  text?: string;
  className?: string;
}

export function FetchingRatesIndicator({
  isVisible,
  text = "fetching rates",
  className = "flex gap-x-2 text-sm absolute top-2 right-10 ",
}: FetchingRatesIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className={className}>
      <Spinner size="sm" />
      {text}
    </div>
  );
}
