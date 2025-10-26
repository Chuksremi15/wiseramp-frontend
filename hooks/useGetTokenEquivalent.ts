import { Contract, JsonRpcProvider } from "ethers";
import { useQuery } from "@tanstack/react-query";

const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

const baseProvider = new JsonRpcProvider(process.env.NEXT_PUBLIC_BASE_RPC_URL);

// Chainlink AggregatorV3 ABI (simplified)
const aggregatorV3InterfaceABI = [
  "function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)",
  "function decimals() view returns (uint8)",
];

// Mainnet price feed addresses as an object
export const PRICE_FEEDS = {
  ETH: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
  USDC: "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6",
  PYUSD: "0x8f1dF6D7F2db73eECE86a18b4381F4707b918FB1",
  NGN: "0xdfbb5Cbc88E382de007bfe6CE99C388176ED80aD",
} as const;

export async function getLatestPrice(
  feedAddress: string,
  provider: JsonRpcProvider
): Promise<number> {
  const priceFeed = new Contract(
    feedAddress,
    aggregatorV3InterfaceABI,
    provider
  );

  const [, answer] = await priceFeed.latestRoundData();
  const decimals: number = await priceFeed.decimals();
  return Number(answer) / 10 ** Number(decimals);
}

// Helper method to convert source token amount to destination token equivalent
async function getTokenEquivalent(
  destinationToken: keyof typeof PRICE_FEEDS,
  sourceToken: keyof typeof PRICE_FEEDS,
  sourceAmount: number
): Promise<{
  destinationEquivalent: number;
  exchangeRate: number;
  sourceTokenPrice: number;
  destinationTokenPrice: number;
}> {
  const sourceTokenPrice = await getLatestPrice(
    PRICE_FEEDS[sourceToken],
    sourceToken === "NGN" ? baseProvider : provider
  );
  const destinationTokenPrice = await getLatestPrice(
    PRICE_FEEDS[destinationToken],
    destinationToken === "NGN" ? baseProvider : provider
  );

  console.log("destinationTokenPrice", destinationTokenPrice);

  const usdValueOfSourceAmount = sourceAmount * sourceTokenPrice;
  const destinationEquivalent = usdValueOfSourceAmount / destinationTokenPrice;
  const exchangeRate = sourceTokenPrice / destinationTokenPrice;
  return {
    destinationEquivalent,
    exchangeRate,
    sourceTokenPrice,
    destinationTokenPrice,
  };
}

// React Query hook to get token equivalent
export function useGetTokenEquivalent(
  destinationToken: keyof typeof PRICE_FEEDS,
  sourceToken: keyof typeof PRICE_FEEDS,
  sourceAmount: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["tokenEquivalent", destinationToken, sourceToken],
    queryFn: () =>
      getTokenEquivalent(destinationToken, sourceToken, sourceAmount),
    enabled: enabled && sourceAmount > 0,
    staleTime: 12000, // 30 seconds
    refetchInterval: 12000, // Refetch every minute
  });
}

export async function getTokenValue(
  token: keyof typeof PRICE_FEEDS,
  amount: number
): Promise<{ tokenValue: number }> {
  const tokenPrice = await getLatestPrice(
    PRICE_FEEDS[token],
    token === "NGN" ? baseProvider : provider
  );

  const tokenValue = tokenPrice * amount;
  return { tokenValue };
}

// React Query hook to get token equivalent
export function useGetTokenValue(
  token: keyof typeof PRICE_FEEDS,
  amount: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["tokenEquivalent", token, amount],
    queryFn: () => getTokenValue(token, amount),
    enabled: enabled && amount > 0,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}
