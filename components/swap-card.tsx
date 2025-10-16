"use client";

import { useState } from "react";
import { LuArrowUpDown, LuInfo } from "react-icons/lu";
import { AddressInput } from "./address-input";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { AmountInput } from "./amount-input";
import { FaQuestion } from "react-icons/fa";

/**
 * The main Swap component replicating the UI from the image.
 */
const SwapCard = () => {
  const [addressError, setAddressError] = useState("");

  return (
    // Outer container to center the widget on the page
    <div className="bg-gray-100 dark:bg-section-backround flex flex-col font-body min-h-screen items-center  pt-22 p-4">
      {/* <div className="absolute inset-0 swap-background"></div> */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-medium font-head mb-2">Buy, Sell, Swap</h1>
        <p className="text-muted-foreground text-sm">Fast, Seamless swap</p>
      </div>

      <div className="w-[480px] max-w-2xl bg-white dark:bg-section-backround  rounded-2xl p-3 relative  space-y-5 border">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            className="w-6 h-6 flex items-center justify-center bg-yellow-400/10 rounded-full text-yellow-400"
            aria-label="Help"
          >
            <FaQuestion size={10} />
          </button>
        </div>

        {/* Main Swap Area */}
        <div className="relative">
          {/* Cards Container with Animation */}
          <div className={`transition-transform duration-500 ease-in-out`}>
            {/* "Sell" Input Card */}
            <div className={`transition-all duration-300 `}>
              <div
                className={` ${"border"}   flex justify-between items-center p-4 rounded-xl space-y-2`}
              >
                <div className="text-sm flex-1">
                  <span className="">Sell</span>
                  <div>
                    <AmountInput value={"344"} onChange={() => {}} />

                    <p className="">$ 5693</p>
                  </div>
                </div>

                <div>
                  <button className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <span className="text-lg">Icon</span>
                    <span className="font-medium">symbol</span>
                  </button>
                </div>
              </div>
            </div>

            {/* "Receive" Input Card */}
            <div
              className={`transition-all duration-300 mt-1 ${
                false ? "transform translate-y-2 scale-95" : ""
              }`}
            >
              {/* "Sell" Input Card */}
              <div className={`transition-all duration-300 `}>
                <div
                  className={` ${"border"}   flex justify-between items-center p-4 rounded-xl space-y-2`}
                >
                  <div className="text-sm flex-1">
                    <span className="">Recieve</span>
                    <div>
                      <AmountInput value={"344"} onChange={() => {}} />

                      <p className="">$ 5693</p>
                    </div>
                  </div>

                  <div>
                    <button className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                      <span className="text-lg">Icon</span>
                      <span className="font-medium">symbol</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Swap Icon Button */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-[-100px]  ">
            <LuArrowUpDown className="text-foreground" size={16} />
          </div>
        </div>

        {/* Receiving Address Input */}

        <AddressInput
          address={"0xDAADf6f9B33a1e01Be2A48765D77B116A2d5DF77"}
          setAddress={() => {}}
          addressError={addressError}
          setAddressError={setAddressError}
        />

        {/* Call to Action Button */}
        <div className="flex flex-col items-center">
          <Button
            className={`w-full bg-primary text-black font-medium font-body rounded-xl text-base transition-all duration-300 `}
            size="lg"
          >
            Swap
          </Button>
        </div>

        {/* Info Section */}
        <div className="space-y-2 text-sm pt-2">
          <div className="font-body flex justify-between items-center text-foreground">
            <span className="text-gray-400  dark:text-slate-400">Rate</span>
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
              <LuArrowUpDown size={12} />
              <span>1 ETH = 16,000,000 NGN</span>
            </div>
          </div>
          <div className="font-body flex justify-between items-center text-foreground">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">LP Fee</span>
              <button aria-label="Liquidity Provider Fee information">
                <LuInfo
                  size={14}
                  className="text-slate-500 hover:text-slate-300"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        {/* <div className="text-center pt-2">
          <button className="text-slate-400 text-sm font-semibold flex items-center justify-center w-full gap-2 transition-colors">
            <span>Additional Information</span>
            <LuChevronDown />
          </button>
        </div> */}
      </div>
    </div>
  );
};

export { SwapCard };
