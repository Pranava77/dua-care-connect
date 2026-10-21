const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

/** £15,000 (amounts are whole pounds in the demo data). */
export const formatGBP = (amount: number) => gbp.format(amount);
