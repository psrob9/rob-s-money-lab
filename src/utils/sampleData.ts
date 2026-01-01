// Sample data for demo mode
// Persona: Jamie Chen, 28-year-old software engineer in Austin, TX
// 247 transactions spanning January - December 2025

export const SAMPLE_PERSONA = {
  name: "Jamie Chen",
  description: "Software engineer in Austin, TX",
  period: "Jan 2025 - Dec 2025"
};

// Generate sample transactions with intentional "aha moments"
export const generateSampleTransactions = (): Array<{
  date: string;
  description: string;
  amount: number;
}> => {
  const transactions: Array<{ date: string; description: string; amount: number }> = [];
  
  // Helper to add transaction
  const add = (month: number, day: number, desc: string, amount: number) => {
    const dateStr = `2025-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    transactions.push({ date: dateStr, description: desc, amount });
  };

  // === INCOME (bi-weekly payroll) ===
  for (let month = 1; month <= 12; month++) {
    add(month, 1, "TECHCORP INC PAYROLL DIRECT DEP", 4200);
    add(month, 15, "TECHCORP INC PAYROLL DIRECT DEP", 4200);
  }

  // === HOUSING (monthly) ===
  for (let month = 1; month <= 12; month++) {
    add(month, 1, "AUSTIN PROPERTY MGMT RENT", -1850);
  }

  // === UTILITIES (monthly, varying) ===
  const electricBills = [118, 125, 142, 168, 198, 245, 267, 258, 232, 178, 145, 132];
  const internetBills = [79.99, 79.99, 79.99, 79.99, 79.99, 79.99, 79.99, 79.99, 79.99, 79.99, 79.99, 79.99];
  for (let month = 1; month <= 12; month++) {
    add(month, 8, "AUSTIN ENERGY ELECTRIC BILL", -electricBills[month - 1]);
    add(month, 12, "SPECTRUM INTERNET", -internetBills[month - 1]);
    add(month, 5, "AUSTIN WATER UTILITY", -(45 + Math.random() * 20));
  }

  // === STREAMING SERVICES (4 total - key "aha moment") ===
  for (let month = 1; month <= 12; month++) {
    add(month, 3, "NETFLIX.COM", -22.99);
    add(month, 7, "HULU MONTHLY", -17.99);
    add(month, 10, "HBO MAX", -15.99);
    add(month, 14, "DISNEY PLUS", -13.99);
  }

  // === OTHER SUBSCRIPTIONS ===
  for (let month = 1; month <= 12; month++) {
    add(month, 5, "SPOTIFY PREMIUM", -10.99);
    add(month, 18, "APPLE.COM/BILL ICLOUD", -2.99);
    add(month, 20, "PLANET FITNESS", -24.99);
  }

  // === ANNUAL SUBSCRIPTIONS (key hidden costs) ===
  add(1, 15, "AMAZON PRIME MEMBERSHIP", -139);
  add(3, 10, "GEICO AUTO INSURANCE", -312);
  add(6, 10, "GEICO AUTO INSURANCE", -312);
  add(9, 10, "GEICO AUTO INSURANCE", -312);
  add(12, 10, "GEICO AUTO INSURANCE", -288);

  // === FOOD & DINING (heavy on delivery - another "aha moment") ===
  for (let month = 1; month <= 12; month++) {
    // Delivery apps (expensive habit)
    add(month, 2, "DOORDASH*CHIPOTLE", -(18 + Math.random() * 8));
    add(month, 6, "UBER EATS", -(22 + Math.random() * 12));
    add(month, 9, "GRUBHUB", -(25 + Math.random() * 10));
    add(month, 13, "DOORDASH*THAI KITCHEN", -(28 + Math.random() * 8));
    add(month, 17, "UBER EATS MCDONALD", -(15 + Math.random() * 8));
    add(month, 21, "DOORDASH*PIZZA HUT", -(24 + Math.random() * 6));
    add(month, 25, "GRUBHUB SUSHI EXPRESS", -(35 + Math.random() * 10));
    
    // Restaurants
    add(month, 4, "TST*TORCHY'S TACOS", -(16 + Math.random() * 8));
    add(month, 11, "CHICK-FIL-A", -(12 + Math.random() * 5));
    add(month, 19, "STARBUCKS", -(7 + Math.random() * 4));
    add(month, 23, "STARBUCKS", -(6 + Math.random() * 5));
    add(month, 27, "TST*RAMEN TATSUYA", -(18 + Math.random() * 5));
  }

  // === GROCERIES (notably lower than dining) ===
  for (let month = 1; month <= 12; month++) {
    add(month, 8, "HEB GROCERY", -(85 + Math.random() * 30));
    add(month, 22, "TRADER JOE'S", -(65 + Math.random() * 25));
  }

  // === TRANSPORTATION ===
  for (let month = 1; month <= 12; month++) {
    add(month, 10, "SHELL OIL", -(45 + Math.random() * 15));
    add(month, 24, "CHEVRON", -(42 + Math.random() * 18));
    if (month % 2 === 0) {
      add(month, 15, "UBER TRIP", -(18 + Math.random() * 12));
    }
  }

  // === SHOPPING (sporadic) ===
  add(1, 12, "AMAZON.COM*AMZN", -67.99);
  add(2, 8, "TARGET", -89.45);
  add(2, 22, "AMAZON.COM*AMZN", -34.99);
  add(3, 5, "BEST BUY", -129.99);
  add(3, 18, "AMAZON.COM*AMZN", -52.30);
  add(4, 14, "IKEA", -245.00);
  add(5, 9, "AMAZON.COM*AMZN", -28.99);
  add(5, 25, "HOME DEPOT", -156.78);
  add(6, 7, "AMAZON.COM*AMZN", -89.99);
  add(8, 3, "AMAZON.COM*AMZN", -45.00);
  add(9, 12, "TARGET", -112.34);
  add(10, 8, "AMAZON.COM*AMZN", -78.50);

  // === JULY VACATION (San Diego - seasonal spike) ===
  add(7, 10, "SOUTHWEST AIRLINES", -289);
  add(7, 10, "SOUTHWEST AIRLINES", -289);
  add(7, 11, "AIRBNB*HMBT2K3", -856);
  add(7, 12, "SAN DIEGO ZOO", -62);
  add(7, 12, "UBER TRIP", -34);
  add(7, 13, "PHIL'S BBQ SD", -48);
  add(7, 13, "CORONADO FERRY", -12);
  add(7, 14, "THE FISH MARKET SD", -85);
  add(7, 14, "UBER TRIP", -28);
  add(7, 15, "GASLAMP QUARTER REST", -72);

  // === NOVEMBER/DECEMBER HOLIDAY SHOPPING (seasonal spike) ===
  add(11, 25, "AMAZON.COM*AMZN", -234.99);
  add(11, 26, "TARGET", -189.45);
  add(11, 27, "BEST BUY", -349.99);
  add(11, 29, "NORDSTROM", -156.00);
  add(12, 2, "AMAZON.COM*AMZN", -278.50);
  add(12, 5, "ETSY.COM", -89.99);
  add(12, 8, "REI", -145.00);
  add(12, 12, "AMAZON.COM*AMZN", -167.00);
  add(12, 15, "WILLIAMS SONOMA", -95.00);
  add(12, 18, "AMAZON.COM*AMZN", -124.99);

  // === HEALTHCARE (sporadic) ===
  add(2, 15, "CVS PHARMACY", -35.00);
  add(4, 20, "AUSTIN DENTAL GROUP", -125.00);
  add(6, 12, "CVS PHARMACY", -28.50);
  add(8, 8, "URGENT CARE AUSTIN", -75.00);
  add(10, 25, "CVS PHARMACY", -42.00);

  // === DONATIONS ===
  add(3, 1, "ACLU DONATION", -25);
  add(6, 1, "ACLU DONATION", -25);
  add(9, 1, "ACLU DONATION", -25);
  add(12, 1, "ACLU DONATION", -25);
  add(12, 20, "AUSTIN PETS ALIVE DONATION", -100);

  // === MISC TRANSFERS ===
  add(1, 5, "VENMO PAYMENT", -50);
  add(3, 12, "VENMO PAYMENT", -35);
  add(5, 18, "ZELLE TRANSFER", -100);
  add(8, 22, "VENMO PAYMENT", -75);
  add(11, 8, "ZELLE TRANSFER", -150);

  // Sort by date
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return transactions;
};

// Pre-computed insights for quick display
export const SAMPLE_INSIGHTS = {
  // Streaming total: $71/mo = $852/year
  streamingTotal: 70.96,
  streamingCount: 4,
  
  // Dining vs groceries ratio: ~2.8x more on dining
  diningMonthly: 485,
  groceriesMonthly: 175,
  diningToGroceryRatio: 2.8,
  
  // Delivery app fees
  deliveryMonthly: 280,
  
  // Savings rate
  totalIn: 100800,
  totalOut: 52847,
  net: 47953,
  savingsRate: 47.6
};

// Helper to convert sample data for Money Snapshot format
export const getSampleTransactionsForMoneySnapshot = () => {
  return generateSampleTransactions().map(t => ({
    date: t.date,
    description: t.description,
    amount: t.amount
  }));
};

// Helper to convert sample data for True Monthly Cost format (needs Date objects)
export const getSampleTransactionsForRecurring = () => {
  return generateSampleTransactions().map(t => ({
    date: new Date(t.date),
    description: t.description,
    amount: t.amount
  }));
};
