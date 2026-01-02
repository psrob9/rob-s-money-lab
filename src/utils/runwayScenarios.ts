export interface RunwayScenario {
  id: string;
  name: string;
  emoji: string;
  subtext: string;
  data: {
    savings: number;
    // Simple mode expense
    simpleExpenses: number;
    // Itemized expenses
    useItemized: boolean;
    essentials: {
      rentMortgage: number;
      utilities: number;
      internet: number;
      carPayment: number;
      carInsurance: number;
      gasTransportation: number;
      groceries: number;
      phone: number;
      healthInsurance: number;
      minimumDebtPayments: number;
      otherEssential: number;
    };
    discretionary: {
      streaming: number;
      diningOut: number;
      subscriptions: number;
      entertainment: number;
      otherDiscretionary: number;
    };
    // Income
    partnerIncome: number;
    includeUnemployment: boolean;
    previousMonthlyIncome: number;
    // Buffer
    buffer: 'none' | '10' | '20';
  };
}

export const RUNWAY_SCENARIOS: RunwayScenario[] = [
  {
    id: 'tight-squeeze',
    name: 'The Tight Squeeze',
    emoji: '⭐',
    subtext: 'Dual income household, primary earner laid off, limited savings',
    data: {
      savings: 15000,
      simpleExpenses: 0,
      useItemized: true,
      essentials: {
        rentMortgage: 2200,
        utilities: 180,
        internet: 75,
        carPayment: 450,
        carInsurance: 140,
        gasTransportation: 200,
        groceries: 650,
        phone: 120,
        healthInsurance: 350,
        minimumDebtPayments: 200,
        otherEssential: 100,
      },
      discretionary: {
        streaming: 55,
        diningOut: 150,
        subscriptions: 40,
        entertainment: 100,
        otherDiscretionary: 50,
      },
      partnerIncome: 1800,
      includeUnemployment: true,
      previousMonthlyIncome: 5500,
      buffer: 'none',
    },
  },
  {
    id: 'tech-layoff',
    name: 'The Tech Layoff',
    emoji: '💻',
    subtext: 'Single professional in high-cost area, caught in layoffs',
    data: {
      savings: 42000,
      simpleExpenses: 0,
      useItemized: true,
      essentials: {
        rentMortgage: 2800,
        utilities: 120,
        internet: 80,
        carPayment: 0,
        carInsurance: 0,
        gasTransportation: 150,
        groceries: 500,
        phone: 85,
        healthInsurance: 650,
        minimumDebtPayments: 0,
        otherEssential: 100,
      },
      discretionary: {
        streaming: 65,
        diningOut: 400,
        subscriptions: 120,
        entertainment: 200,
        otherDiscretionary: 150,
      },
      partnerIncome: 0,
      includeUnemployment: true,
      previousMonthlyIncome: 12000,
      buffer: '10',
    },
  },
  {
    id: 'single-income-family',
    name: 'The Single Income Family',
    emoji: '👨‍👩‍👧',
    subtext: 'Stay-at-home parent household, breadwinner laid off',
    data: {
      savings: 28000,
      simpleExpenses: 0,
      useItemized: true,
      essentials: {
        rentMortgage: 1800,
        utilities: 220,
        internet: 65,
        carPayment: 380,
        carInsurance: 180,
        gasTransportation: 250,
        groceries: 900,
        phone: 140,
        healthInsurance: 450,
        minimumDebtPayments: 150,
        otherEssential: 200,
      },
      discretionary: {
        streaming: 45,
        diningOut: 100,
        subscriptions: 25,
        entertainment: 80,
        otherDiscretionary: 100,
      },
      partnerIncome: 0,
      includeUnemployment: true,
      previousMonthlyIncome: 6500,
      buffer: '20',
    },
  },
];

export const DEFAULT_FORM_STATE: RunwayScenario['data'] = {
  savings: 0,
  simpleExpenses: 0,
  useItemized: false,
  essentials: {
    rentMortgage: 0,
    utilities: 0,
    internet: 0,
    carPayment: 0,
    carInsurance: 0,
    gasTransportation: 0,
    groceries: 0,
    phone: 0,
    healthInsurance: 0,
    minimumDebtPayments: 0,
    otherEssential: 0,
  },
  discretionary: {
    streaming: 0,
    diningOut: 0,
    subscriptions: 0,
    entertainment: 0,
    otherDiscretionary: 0,
  },
  partnerIncome: 0,
  includeUnemployment: false,
  previousMonthlyIncome: 0,
  buffer: 'none',
};

// Calculate estimated unemployment benefit (~25% of previous income, capped at $2500)
export function estimateUnemploymentBenefit(previousMonthlyIncome: number): number {
  const estimate = previousMonthlyIncome * 0.25;
  return Math.min(estimate, 2500);
}

// Calculate totals from form data
export function calculateTotals(data: RunwayScenario['data']) {
  const essentialsTotal = Object.values(data.essentials).reduce((a, b) => a + b, 0);
  const discretionaryTotal = Object.values(data.discretionary).reduce((a, b) => a + b, 0);
  
  const baseExpenses = data.useItemized 
    ? essentialsTotal + discretionaryTotal 
    : data.simpleExpenses;
  
  const bufferMultiplier = data.buffer === '10' ? 1.1 : data.buffer === '20' ? 1.2 : 1;
  const totalExpenses = baseExpenses * bufferMultiplier;
  
  const bareBonesExpenses = data.useItemized 
    ? essentialsTotal * bufferMultiplier 
    : totalExpenses * 0.9; // Assume 10% is discretionary if using simple mode
  
  const unemploymentBenefit = data.includeUnemployment 
    ? estimateUnemploymentBenefit(data.previousMonthlyIncome) 
    : 0;
  
  const totalIncome = data.partnerIncome + unemploymentBenefit;
  
  return {
    essentialsTotal,
    discretionaryTotal,
    baseExpenses,
    totalExpenses,
    bareBonesExpenses,
    unemploymentBenefit,
    totalIncome,
  };
}

export interface RunwayResult {
  // Current lifestyle
  currentMonthlyBurn: number;
  currentRunwayMonths: number;
  // Bare bones
  bareBonesMonthlyBurn: number;
  bareBonesRunwayMonths: number;
  // With unemployment
  withUIMonthlyBurn: number;
  withUIRunwayMonths: number;
  // Cash flow positive check
  isCashFlowPositive: boolean;
  monthlySurplus: number;
  // Status
  status: 'survival' | 'urgent' | 'moderate' | 'strong' | 'positive';
  // Totals for display
  totals: ReturnType<typeof calculateTotals>;
}

export function calculateRunway(data: RunwayScenario['data']): RunwayResult {
  const totals = calculateTotals(data);
  
  // Current lifestyle (no unemployment)
  const currentMonthlyBurn = Math.max(0, totals.totalExpenses - data.partnerIncome);
  const currentRunwayMonths = currentMonthlyBurn > 0 
    ? data.savings / currentMonthlyBurn 
    : Infinity;
  
  // Bare bones (essentials only, no unemployment)
  const bareBonesMonthlyBurn = Math.max(0, totals.bareBonesExpenses - data.partnerIncome);
  const bareBonesRunwayMonths = bareBonesMonthlyBurn > 0 
    ? data.savings / bareBonesMonthlyBurn 
    : Infinity;
  
  // With unemployment
  const withUIMonthlyBurn = Math.max(0, totals.bareBonesExpenses - totals.totalIncome);
  const withUIRunwayMonths = withUIMonthlyBurn > 0 
    ? data.savings / withUIMonthlyBurn 
    : Infinity;
  
  // Cash flow check
  const isCashFlowPositive = totals.totalIncome >= totals.bareBonesExpenses;
  const monthlySurplus = totals.totalIncome - totals.bareBonesExpenses;
  
  // Determine status
  let status: RunwayResult['status'];
  if (data.savings < totals.totalExpenses && data.partnerIncome === 0 && !data.includeUnemployment) {
    status = 'survival';
  } else if (isCashFlowPositive) {
    status = 'positive';
  } else if (bareBonesRunwayMonths >= 12) {
    status = 'strong';
  } else if (bareBonesRunwayMonths >= 3) {
    status = 'moderate';
  } else {
    status = 'urgent';
  }
  
  return {
    currentMonthlyBurn,
    currentRunwayMonths,
    bareBonesMonthlyBurn,
    bareBonesRunwayMonths,
    withUIMonthlyBurn,
    withUIRunwayMonths,
    isCashFlowPositive,
    monthlySurplus,
    status,
    totals,
  };
}
