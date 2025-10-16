import React, { useState, useEffect, useCallback } from "react";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxDecimals?: number;
  maxValue?: number;
  className?: string;
  disabled?: boolean;
  onValidationChange?: (isValid: boolean, error?: string) => void;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  placeholder = "0.00",
  maxDecimals = 6,
  maxValue,
  className = "",
  disabled = false,
  onValidationChange,
}) => {
  const [error, setError] = useState<string>("");

  const validateInput = useCallback(
    (inputValue: string): { isValid: boolean; error?: string } => {
      // Allow empty input
      if (!inputValue || inputValue === "") {
        return { isValid: true };
      }

      // Remove commas for validation
      const cleanValue = inputValue.replace(/,/g, "");

      // Check if it's a valid number
      if (!/^\d*\.?\d*$/.test(cleanValue)) {
        return { isValid: false, error: "Please enter a valid number" };
      }

      // Check decimal places
      const decimalParts = cleanValue.split(".");
      if (decimalParts.length > 2) {
        return { isValid: false, error: "Invalid number format" };
      }

      if (decimalParts[1] && decimalParts[1].length > maxDecimals) {
        return {
          isValid: false,
          error: `Maximum ${maxDecimals} decimal places allowed`,
        };
      }

      // Check maximum value
      const numericValue = parseFloat(cleanValue);
      if (maxValue && numericValue > maxValue) {
        return {
          isValid: false,
          error: `Maximum value is ${maxValue.toLocaleString()}`,
        };
      }

      // Check for negative values
      if (numericValue < 0) {
        return { isValid: false, error: "Amount cannot be negative" };
      }

      return { isValid: true };
    },
    [maxDecimals, maxValue]
  );

  const formatNumber = (num: string): string => {
    if (!num || num === "") return "";

    const cleanValue = num.replace(/,/g, "");
    const parts = cleanValue.split(".");

    // Format the integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return parts.join(".");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow backspace/delete to work properly
    if (inputValue === "") {
      onChange("");
      setError("");
      onValidationChange?.(true);
      return;
    }

    const validation = validateInput(inputValue);

    if (validation.isValid) {
      const formattedValue = formatNumber(inputValue);
      onChange(formattedValue);
      setError("");
      onValidationChange?.(true);
    } else {
      // Still update the value but show error
      onChange(inputValue);
      setError(validation.error || "");
      onValidationChange?.(false, validation.error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, period, and numbers
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "Period",
      "NumpadDecimal",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (
      allowedKeys.includes(e.key) ||
      (e.ctrlKey && ["a", "c", "v", "x"].includes(e.key.toLowerCase()))
    ) {
      return;
    }

    // Allow numbers (0-9)
    if (/^[0-9]$/.test(e.key)) {
      return;
    }

    // Allow decimal point (but only one)
    if (e.key === "." && !e.currentTarget.value.includes(".")) {
      return;
    }

    // Block all other keys
    e.preventDefault();
  };

  useEffect(() => {
    const validation = validateInput(value);
    if (!validation.isValid) {
      setError(validation.error || "");
      onValidationChange?.(false, validation.error);
    } else {
      setError("");
      onValidationChange?.(true);
    }
  }, [value, maxDecimals, maxValue, onValidationChange, validateInput]);

  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={`text-2xl font-semibold  tracking-tight bg-transparent w-full focus:outline-none ${
          error ? "text-red-500" : ""
        } ${className}`}
        placeholder={placeholder}
        disabled={disabled}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
