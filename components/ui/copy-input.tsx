"use client";
import React from "react";
import { Button, Input } from "@heroui/react";

interface CopyInputProps {
  value: string;
  label?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  size?: "sm" | "md" | "lg";
}

const CopyInput: React.FC<CopyInputProps> = ({
  value,
  label,
  placeholder,
  className = "",
  inputClassName = "w-64",
  size = "sm",
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className={`flex justify-between items-center text-xs ${className}`}>
      {label && <span className="text-gray-500">{label}</span>}
      <div className="flex items-center gap-2 max-w-64">
        <Input
          value={value}
          placeholder={placeholder}
          readOnly
          size={size}
          className={inputClassName}
          classNames={{
            input: "font-mono text-xs",
            inputWrapper: "h-8 min-h-8",
          }}
        />
        <Button
          isIconOnly
          size={size}
          variant="ghost"
          onPress={handleCopy}
          className="min-w-8 w-8 h-8"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default CopyInput;
