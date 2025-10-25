import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
} from "@heroui/react";
import { CheckCircle } from "lucide-react";
import type { TransactionResponse } from "@/hooks/useCreateTransaction";
import { FC } from "react";

interface TransactionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionResponse | null;
}

const TransactionSuccessModal: FC<TransactionSuccessModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!transaction) return null;
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onClose}
      size="md"
      classNames={{
        backdrop: "modal-backdrop-gradient",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col items-center gap-2">
          <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
          <span className="text-xl font-bold">Swap Successful!</span>
        </ModalHeader>
        <ModalBody className="flex flex-col items-center gap-4 pb-6">
          <div className="text-center">
            <div className="text-2xl font-bold mb-1">
              {Number(transaction.destinationAmount).toFixed(6)}{" "}
              {transaction.destinationCurrency}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              sent to
            </div>
            <div className="font-mono text-sm break-all bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 mt-1">
              {transaction?.destinationAddress ||
                transaction?.destinationAccountName}{" "}
              - {transaction?.destinationBankAccountNumber}
            </div>
          </div>
          <Button
            color="primary"
            className="mt-4 w-full rounded-full"
            onPress={onClose}
          >
            Close
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TransactionSuccessModal;
