import React from "react";

interface TransactionDetailProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({
  label,
  value,
  className = "",
  labelClassName = "",
  valueClassName = "",
}) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <span className={`text-gray-500 text-sm ${labelClassName}`}>{label}</span>
      <span className={`font-medium text-sm ${valueClassName}`}>{value}</span>
    </div>
  );
};

export default TransactionDetail;
