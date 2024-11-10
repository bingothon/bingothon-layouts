const CURRENCY_SYMBOL = '€';
export function formatAmount(amount: number, showCents = true) {
    if (showCents) {
        return `${amount.toFixed(2)}${CURRENCY_SYMBOL}`;
    } else {
        return `${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}${CURRENCY_SYMBOL}`;
    }
}
