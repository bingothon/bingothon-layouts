const CURRENCY_SYMBOL = '$';
export function formatAmount(amount: number, showCents = true) {
    if (showCents) {
        return `${CURRENCY_SYMBOL} ${amount.toFixed(2)}`;
    } else {
        return `${CURRENCY_SYMBOL} ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }
}
