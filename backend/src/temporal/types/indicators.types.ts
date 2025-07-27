
export const MovingAverageMethods: { value: string; description: string }[] = [
  { value: "SMA", description: "Simple Moving Average" },
  { value: "EMA", description: "Exponential Moving Average" },
  { value: "WMA", description: "Weighted Moving Average" },
  { value: "VWMA", description: "Volume Weighted Moving Average" },
  { value: "SMMA", description: "Smoothed Moving Average" },
  { value: "DEMA", description: "Double Exponential Moving Average" },
  { value: "TEMA", description: "Triple Exponential Moving Average" },
] as const;

export const ApplyToOptions: { value: string; description: string }[] = [
  { value: "Open", description: "Use the open price of each bar" },
  { value: "High", description: "Use the high price of each bar" },
  { value: "Low", description: "Use the low price of each bar" },
  { value: "Close", description: "Use the close price of each bar" },
  { value: "MedianPrice", description: "Average of high and low prices" },
  { value: "TypicalPrice", description: "Average of high, low, and close prices" },
  { value: "WeightedClose", description: "Weighted average of high, low, and close" },
  { value: "PreviousIndicatorsData", description: "Use previous indicators' output values. FOr example if the user had the rsi indicator, we use the rsi values as the dataset to calculate" },
] as const;
