export const formattedDate = (date: string | null): string => {
  if (!date) return "";
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dateSplit = date?.split("T");
  const dates = new Date(dateSplit[0]);
  const year = dates.getFullYear();
  const day = dates.getDate();
  const month = dates.getMonth();

  return `${months[month]} ${day}, ${year}`;
};

export const formattedDate4 = (date: string): string => {
  const currentDate = new Date();
  const inputDate = new Date(date);

  const elapsedMilliseconds = currentDate.getTime() - inputDate.getTime();
  const elapsedSeconds = elapsedMilliseconds / 1000;
  const elapsedMinutes = elapsedSeconds / 60;
  const elapsedHours = elapsedMinutes / 60;

  if (elapsedHours < 24) {
    if (elapsedHours >= 1) {
      return `${Math.floor(elapsedHours)} hour${
        Math.floor(elapsedHours) > 1 ? "s" : ""
      } ago`;
    } else if (elapsedMinutes >= 1) {
      return `${Math.floor(elapsedMinutes)} minute${
        Math.floor(elapsedMinutes) > 1 ? "s" : ""
      } ago`;
    } else {
      return "Just now";
    }
  } else {
    let hours = inputDate.getHours();
    const minutes = inputDate.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedMinutes = minutes > 9 ? minutes : `0${minutes}`;
    return `${hours}:${formattedMinutes} ${ampm}`;
  }
};

export const formatTransactionHashString = (str: string) => {
  const first5 = str?.slice(0, 5);
  const last5 = str?.slice(-5);
  return `${first5}...${last5}`;
};

export const removeAlpha = (str: any) => {
  if (str && typeof str === "string") {
    return str.replace(/[^0-9.]/g, "");
  }

  return str;
};
export function checkForReallySmallNumbers(num: any, decimalPlaces = 6) {
  const _num = `${num}`;
  const _isReallySmall = _num.includes("e-");
  // return same number if not really small
  if (!_isReallySmall) return _num;

  const _numSeperated = _num.split(".");
  const _newnum = _numSeperated[0]; // whole part of number
  const _hasSuffix = _numSeperated.length > 1;

  // return first part of number if there are no numbers after '.'
  if (!_hasSuffix) return _newnum;

  const _expSplit = _num.split("e-");
  const _exponential = parseInt(_expSplit[1], 10);
  let eValue = "0.";

  if (_exponential < decimalPlaces) {
    for (let j = _exponential - 1; j > 0; j -= 1) {
      eValue += "0";
    }
    return eValue + _newnum + _expSplit[0].substring(0, decimalPlaces);
  }

  for (let j = decimalPlaces - 1; j > 0; j -= 1) {
    eValue += "0";
  }

  return eValue;
}
//
const _formatNumberOutput = (prefix: any, suffix: any, decimalPlaces: any) => {
  if (decimalPlaces === 0) {
    return prefix;
  }

  if (suffix) {
    // Truncate or pad the suffix to match decimalPlaces
    let formattedSuffix = suffix.substring(0, decimalPlaces);
    // Pad with zeros if suffix is shorter than decimalPlaces
    while (formattedSuffix.length < decimalPlaces) {
      formattedSuffix += "0";
    }
    return `${prefix}.${formattedSuffix}`;
  } else {
    // No decimal part, create one with zeros
    let withoutSuffix = ".";
    for (let j = decimalPlaces; j > 0; j -= 1) {
      withoutSuffix += "0";
    }
    return `${prefix}${withoutSuffix}`;
  }
};

export const formatNumber = (
  val: any,
  decimalPlaces = 2,
  formatComma = true
) => {
  // Check if the value is a number
  if (Number.isNaN(val)) return val;

  if (typeof val === "string") {
    val = removeAlpha(val);
  }

  const newnum = `${val}`;
  let integerAndDecimal;
  let integerPart;
  let decimalPart;

  integerAndDecimal = newnum.split(".");
  integerPart = integerAndDecimal[0];
  decimalPart = integerAndDecimal[1];

  const hasDecimalFraction = integerAndDecimal.length > 1;

  if (hasDecimalFraction && integerAndDecimal[1].includes("e-")) {
    return checkForReallySmallNumbers(val);
  }

  // if (integerPart !== '0' && integerPart.length > 1) {
  //   return _formatNumberOutput(integerPart, hasDecimalFraction ? decimalPart : '', 2);
  // }

  if (integerPart === "0" || integerPart.length <= 3 || !formatComma) {
    // Check if length of string is less than three
    return _formatNumberOutput(
      integerPart,
      hasDecimalFraction ? decimalPart : "",
      decimalPlaces
    ); // Less than three, no need to format
  }

  if (formatComma) {
    // Greater than three
    let count = 1;
    let newstr;
    let str = "";

    for (let i = integerPart.length - 1; i >= 0; i -= 1) {
      //
      if (count === 3) {
        newstr = integerPart.slice(i, i + 3);
        str = newstr + str;
        if (i > 0) {
          str = `,${str}`;
        }
        count = 0;
      } else if (count !== 3 && i === 0) {
        newstr = integerPart.slice(i, i + count);
        str = newstr + str;
      }
      count += 1;
    }
    return _formatNumberOutput(
      str,
      hasDecimalFraction ? decimalPart : "",
      decimalPlaces
    );
  }
};

export const formatAddress = (
  address: string,
  startChars = 6,
  endChars = 4
) => {
  if (!address) {
    return "";
  }

  const start = address.substring(0, startChars);
  const end = address.substring(address.length - endChars);

  return `${start}...${end}`;
};

/**
 * Calculates the liquidity provider fee for a given amount
 * @param amount - The amount as a string (may contain commas)
 * @param feeRate - The fee rate as a decimal (default: 0.006 for 0.6%)
 * @param decimals - Number of decimal places to round to (default: 2)
 * @returns The calculated fee as a number
 */
export const calculateLPFee = (
  amount: string,
  feeRate: number = 0.006,
  decimals: number = 2
): number => {
  const cleanAmount = parseFloat(amount.replace(/,/g, "") || "0");
  const fee = cleanAmount * feeRate;
  return parseFloat(fee.toFixed(decimals));
};

/**
 * Formats the LP fee for display
 * @param amount - The amount as a string (may contain commas)
 * @param feeRate - The fee rate as a decimal (default: 0.006 for 0.6%)
 * @param decimals - Number of decimal places to round to (default: 2)
 * @returns The formatted fee as a string
 */
export const formatLPFee = (
  amount: string,
  feeRate: number = 0.006,
  decimals: number = 2
): string => {
  return calculateLPFee(amount, feeRate, decimals).toFixed(decimals);
};
