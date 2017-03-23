class CurrencyHelper {
  format(amount, decimals, locale, currency) {
    if (amount === undefined) {
      return;
    }

    return parseFloat(amount).toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }
}

export default new CurrencyHelper();
