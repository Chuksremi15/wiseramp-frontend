import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Button,
} from "@heroui/react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

interface AuthModalProps {
  openModal?: boolean;
  buttonStyle?: string;
  loginText?: string;
  buttonSize?: "lg" | "sm" | "md" | undefined;
  onOpenChange?: () => void;
}

const AuthModal = ({
  openModal,
  buttonStyle,
  loginText,
  buttonSize,
}: AuthModalProps) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const { login, isLoading, register, loginWithGoogleToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const { success, error } = await login({ email, password });

      if (success) {
        toast.success("Login successful!");
        onOpenChange();
      } else {
        error && toast.error(<span className="text-red-500">{error}</span>);
      }
    } else {
      const { success, error } = await register({
        email,
        password,
        name,
      });

      if (success) {
        toast.success("Registration successful!");
        onOpenChange();
      } else {
        error && toast.error(<span className="text-red-500">{error}</span>);
      }
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <>
      <Button
        size={buttonSize ? buttonSize : "sm"}
        type="button"
        onPress={openModal ? onOpen : onOpen}
        className={
          buttonStyle
            ? buttonStyle
            : "bg-primary w-18 font-medium rounded-xl h-10 text-[16px] text-black font-body"
        }
      >
        {loginText ? loginText : "Log in"}
      </Button>

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="w-[490px]"
        size="lg"
        classNames={{
          backdrop: "modal-backdrop-gradient",
        }}
      >
        <ModalContent className=" ">
          {() => (
            <div className="">
              <ModalHeader className="flex flex-col gap-1 ">
                <h3 className="text-xl font-semibold font-head">
                  {isLogin ? "Login" : "Register"}
                </h3>
              </ModalHeader>
              <ModalBody className="pb-6 ">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div>
                        <label
                          className="block text-sm font-medium mb-1 "
                          htmlFor="name"
                        >
                          Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          placeholder="Enter your name"
                          className="text-sm custom-input w-full px-4 py-3 border  border-[#37474F] rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:border-0  focus:outline-[1.5px] focus:outline-primary hover:shadow-lg dark:bg-[#]  "
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label
                      className="block text-sm font-medium mb-1 "
                      htmlFor="email"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="text-sm custom-input w-full px-4 py-3 border  border-[#37474F] rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:border-0  focus:outline-[1.5px] focus:outline-primary  hover:shadow-lg dark:bg-[#]  "
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium mb-1 "
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="text-sm custom-input w-full px-4 py-3 border  border-[#37474F] rounded-lg shadow-sm transition duration-300 ease-in-out transform focus:border-0  focus:outline-[1.5px] focus:outline-primary  hover:shadow-lg dark:bg-[#]  "
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value.replace(/\s/g, ""))
                      }
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      isLoading={isLoading}
                      color="primary"
                      type="submit"
                      className="rounded-full px-6 text-base  text-black"
                    >
                      {isLogin ? "Login" : "Register"}
                    </Button>
                    <Button
                      variant="light"
                      type="button"
                      onPress={toggleForm}
                      className="rounded-full"
                    >
                      {isLogin
                        ? "Need to register?"
                        : "Already have an account?"}
                    </Button>
                  </div>
                </form>
              </ModalBody>
            </div>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AuthModal;
