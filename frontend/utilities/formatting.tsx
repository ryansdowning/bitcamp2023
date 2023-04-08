export function formatDollars(dollars: number) {
  let formatted = `$${Math.abs(dollars).toFixed(2)}`;
  return dollars >= 0 ? formatted : `-${formatted}`;
}

export function formatPercentage(decimal: number) {
  return `${(decimal * 100).toFixed(2)}%`;
}

export function wrapFormatWithDefault<T>(formatFunc: (arg: T) => string, defaultString: string) {
  return (arg: T) => (arg ? formatFunc(arg) : defaultString);
}
