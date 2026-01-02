import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Shield, 
  ChevronDown, 
  Check, 
  X, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle2,
  Wallet,
  PiggyBank,
  DollarSign,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FeedbackModal } from "@/components/FeedbackModal";
import { EmailSignup } from "@/components/EmailSignup";
import {
  RUNWAY_SCENARIOS,
  DEFAULT_FORM_STATE,
  estimateUnemploymentBenefit,
  calculateTotals,
  calculateRunway,
  type RunwayScenario,
  type RunwayResult,
} from "@/utils/runwayScenarios";

const formatCurrency = (value: number): string => {
  return value.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const formatMonths = (months: number): string => {
  if (!isFinite(months)) return '∞';
  if (months < 1) return '< 1 month';
  const rounded = Math.round(months * 10) / 10;
  return `${rounded} month${rounded !== 1 ? 's' : ''}`;
};

const RunwayCalculator = () => {
  const [formData, setFormData] = useState<RunwayScenario['data']>(DEFAULT_FORM_STATE);
  const [showResults, setShowResults] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  
  // What-if toggles
  const [whatIfUI, setWhatIfUI] = useState(true);
  const [whatIfCutDiscretionary, setWhatIfCutDiscretionary] = useState(false);
  const [whatIfSeverance, setWhatIfSeverance] = useState(0);
  const [whatIfGigIncome, setWhatIfGigIncome] = useState(0);

  const loadScenario = (scenario: RunwayScenario) => {
    setFormData(scenario.data);
    setActiveScenario(scenario.id);
    setShowResults(false);
  };

  const clearScenario = () => {
    setFormData(DEFAULT_FORM_STATE);
    setActiveScenario(null);
    setShowResults(false);
  };

  const updateField = <K extends keyof RunwayScenario['data']>(
    field: K, 
    value: RunwayScenario['data'][K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateEssential = (field: keyof RunwayScenario['data']['essentials'], value: number) => {
    setFormData(prev => ({
      ...prev,
      essentials: { ...prev.essentials, [field]: value },
    }));
  };

  const updateDiscretionary = (field: keyof RunwayScenario['data']['discretionary'], value: number) => {
    setFormData(prev => ({
      ...prev,
      discretionary: { ...prev.discretionary, [field]: value },
    }));
  };

  const totals = useMemo(() => calculateTotals(formData), [formData]);
  
  // Calculate results with what-if adjustments
  const results = useMemo((): RunwayResult | null => {
    if (!showResults) return null;
    
    // Apply what-if adjustments
    const adjustedData = { ...formData };
    
    // Apply severance to savings
    const adjustedSavings = formData.savings + whatIfSeverance;
    
    // Apply gig income to partner income (as additional income)
    const adjustedPartnerIncome = formData.partnerIncome + whatIfGigIncome;
    
    // Apply discretionary cut
    const adjustedDiscretionary = whatIfCutDiscretionary 
      ? { streaming: 0, diningOut: 0, subscriptions: 0, entertainment: 0, otherDiscretionary: 0 }
      : formData.discretionary;
    
    // Override UI setting based on what-if toggle
    adjustedData.includeUnemployment = whatIfUI;
    adjustedData.discretionary = adjustedDiscretionary;
    
    const modifiedData = {
      ...adjustedData,
      savings: adjustedSavings,
      partnerIncome: adjustedPartnerIncome,
    };
    
    return calculateRunway(modifiedData);
  }, [showResults, formData, whatIfUI, whatIfCutDiscretionary, whatIfSeverance, whatIfGigIncome]);

  const handleCalculate = () => {
    // Reset what-if toggles to match form
    setWhatIfUI(formData.includeUnemployment);
    setWhatIfCutDiscretionary(false);
    setWhatIfSeverance(0);
    setWhatIfGigIncome(0);
    setShowResults(true);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const scrollToForm = () => {
    document.getElementById('calculator-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scenarioName = activeScenario 
    ? RUNWAY_SCENARIOS.find(s => s.id === activeScenario)?.name 
    : null;

  const unemploymentEstimate = estimateUnemploymentBenefit(formData.previousMonthlyIncome);
  const bufferAmount = formData.buffer === '10' 
    ? totals.baseExpenses * 0.1 
    : formData.buffer === '20' 
      ? totals.baseExpenses * 0.2 
      : 0;

  const isFormValid = formData.savings > 0 && (
    formData.useItemized ? totals.essentialsTotal > 0 : formData.simpleExpenses > 0
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-lab-warm-cream to-lab-peach">
        {/* Sample Data Banner */}
        {activeScenario && (
          <div className="bg-lab-teal/10 border-b border-lab-teal/20 py-3">
            <div className="container mx-auto px-4 text-center">
              <span className="text-sm text-lab-navy">
                📊 Viewing sample data: <strong>{scenarioName}</strong>
              </span>
              <button 
                onClick={clearScenario}
                className="ml-4 text-sm text-lab-teal hover:underline"
              >
                Clear & use my own numbers
              </button>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
            <div className="text-4xl mb-4">🛡️</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-lab-navy mb-4">
              Layoff Runway Calculator
            </h1>
            <p className="text-xl text-lab-warm-gray mb-2">
              Are you prepared for a layoff?
            </p>
            <p className="text-xl text-lab-warm-gray mb-6">
              Find out — and see your options.
            </p>
            <p className="text-lab-warm-gray mb-8">
              Calculate your runway in 60 seconds.<br />
              No account needed. Your numbers never leave your browser.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={scrollToForm}
                className="bg-lab-teal hover:bg-lab-teal/90 text-white px-8"
                size="lg"
              >
                Start Calculator
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg">
                    Try Sample Scenario <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-80">
                  {RUNWAY_SCENARIOS.map(scenario => (
                    <DropdownMenuItem 
                      key={scenario.id}
                      onClick={() => loadScenario(scenario)}
                      className="flex flex-col items-start p-4 cursor-pointer"
                    >
                      <div className="font-medium">
                        {scenario.emoji} {scenario.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {scenario.subtext}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>

        {/* Who This Is For (Collapsible) */}
        <section className="pb-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <Accordion type="single" collapsible>
              <AccordionItem value="who-for" className="border rounded-xl bg-card shadow-sm">
                <AccordionTrigger className="px-6 hover:no-underline">
                  <span className="text-lab-navy font-medium">Who is this for?</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="font-medium text-lab-navy mb-3">This tool is for you if:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-lab-warm-gray">
                          <Check className="h-4 w-4 text-lab-sage mt-0.5 shrink-0" />
                          You have some savings and want to know how long it lasts
                        </li>
                        <li className="flex items-start gap-2 text-sm text-lab-warm-gray">
                          <Check className="h-4 w-4 text-lab-sage mt-0.5 shrink-0" />
                          You're facing a potential layoff and want to prepare
                        </li>
                        <li className="flex items-start gap-2 text-sm text-lab-warm-gray">
                          <Check className="h-4 w-4 text-lab-sage mt-0.5 shrink-0" />
                          You want to see different scenarios and options
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-lab-navy mb-3">This tool may not be right if:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-lab-warm-gray">
                          <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                          You have no savings (you need income first, not planning)
                        </li>
                        <li className="flex items-start gap-2 text-sm text-lab-warm-gray">
                          <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                          You're comparing job offers (that's a different calculation)
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Calculator Form */}
        <section id="calculator-form" className="pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-6">
            
            {/* Section A: Your Safety Net */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <PiggyBank className="h-5 w-5 text-lab-teal" />
                <h2 className="text-lg font-semibold text-lab-navy">Your Safety Net</h2>
              </div>
              
              <Label className="text-sm text-lab-warm-gray mb-2 block">
                How much do you have in savings?
              </Label>
              <p className="text-xs text-muted-foreground mb-3">
                Checking, savings, HYSA, money market
              </p>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={formData.savings || ''}
                  onChange={(e) => updateField('savings', Number(e.target.value))}
                  className="pl-7"
                  placeholder="0"
                />
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                ℹ️ Don't include retirement accounts unless you plan to withdraw from them.
              </p>
            </Card>

            {/* Section B: Monthly Expenses */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="h-5 w-5 text-lab-teal" />
                <h2 className="text-lg font-semibold text-lab-navy">Monthly Expenses</h2>
              </div>
              
              {!formData.useItemized ? (
                <>
                  <Label className="text-sm text-lab-warm-gray mb-2 block">
                    What do you spend each month on essentials?
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Housing, utilities, insurance, groceries, transportation
                  </p>
                  
                  <div className="relative mb-4">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={formData.simpleExpenses || ''}
                      onChange={(e) => updateField('simpleExpenses', Number(e.target.value))}
                      className="pl-7"
                      placeholder="0"
                    />
                  </div>
                  
                  <button
                    onClick={() => updateField('useItemized', true)}
                    className="text-sm text-lab-teal hover:underline"
                  >
                    + I want to itemize my expenses
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => updateField('useItemized', false)}
                    className="text-sm text-lab-teal hover:underline mb-4 block"
                  >
                    ← Use simple mode
                  </button>

                  {/* Essential Expenses */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-lab-navy mb-3">Essential Expenses:</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'rentMortgage', label: 'Rent/Mortgage' },
                        { key: 'utilities', label: 'Utilities' },
                        { key: 'internet', label: 'Internet' },
                        { key: 'carPayment', label: 'Car Payment' },
                        { key: 'carInsurance', label: 'Car Insurance' },
                        { key: 'gasTransportation', label: 'Gas/Transportation' },
                        { key: 'groceries', label: 'Groceries' },
                        { key: 'phone', label: 'Phone' },
                        { key: 'healthInsurance', label: 'Health Insurance' },
                        { key: 'minimumDebtPayments', label: 'Minimum Debt Payments' },
                        { key: 'otherEssential', label: 'Other Essential' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between gap-4">
                          <Label className="text-sm text-lab-warm-gray w-40">{label}</Label>
                          <div className="relative flex-1 max-w-[150px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input
                              type="number"
                              value={formData.essentials[key as keyof typeof formData.essentials] || ''}
                              onChange={(e) => updateEssential(key as keyof typeof formData.essentials, Number(e.target.value))}
                              className="pl-7 h-9"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t flex justify-between">
                      <span className="text-sm font-medium text-lab-navy">Subtotal Essentials:</span>
                      <span className="text-sm font-semibold text-lab-navy">{formatCurrency(totals.essentialsTotal)}</span>
                    </div>
                  </div>

                  {/* Discretionary Expenses */}
                  <div>
                    <h3 className="text-sm font-medium text-lab-navy mb-3">Discretionary (Could Cut):</h3>
                    <div className="space-y-3">
                      {[
                        { key: 'streaming', label: 'Streaming Services' },
                        { key: 'diningOut', label: 'Dining Out' },
                        { key: 'subscriptions', label: 'Subscriptions' },
                        { key: 'entertainment', label: 'Entertainment' },
                        { key: 'otherDiscretionary', label: 'Other Discretionary' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between gap-4">
                          <Label className="text-sm text-lab-warm-gray w-40">{label}</Label>
                          <div className="relative flex-1 max-w-[150px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input
                              type="number"
                              value={formData.discretionary[key as keyof typeof formData.discretionary] || ''}
                              onChange={(e) => updateDiscretionary(key as keyof typeof formData.discretionary, Number(e.target.value))}
                              className="pl-7 h-9"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t flex justify-between">
                      <span className="text-sm font-medium text-lab-navy">Subtotal Discretionary:</span>
                      <span className="text-sm font-semibold text-lab-navy">{formatCurrency(totals.discretionaryTotal)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t flex justify-between">
                    <span className="text-base font-bold text-lab-navy">TOTAL MONTHLY:</span>
                    <span className="text-base font-bold text-lab-teal">{formatCurrency(totals.baseExpenses)}</span>
                  </div>
                </>
              )}
            </Card>

            {/* Section C: Income That Continues */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-lab-teal" />
                <h2 className="text-lg font-semibold text-lab-navy">Income That Continues</h2>
              </div>
              <p className="text-sm text-lab-warm-gray mb-4">
                If you lose your job, what income still comes in?
              </p>
              
              <div className="mb-6">
                <Label className="text-sm text-lab-warm-gray mb-2 block">
                  Partner/spouse income (monthly, after tax)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={formData.partnerIncome || ''}
                    onChange={(e) => updateField('partnerIncome', Number(e.target.value))}
                    className="pl-7"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">/month</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Checkbox 
                  id="include-ui"
                  checked={formData.includeUnemployment}
                  onCheckedChange={(checked) => updateField('includeUnemployment', !!checked)}
                />
                <Label htmlFor="include-ui" className="text-sm text-lab-warm-gray cursor-pointer">
                  Include unemployment benefits
                </Label>
              </div>

              {formData.includeUnemployment && (
                <div className="ml-6 p-4 bg-muted/50 rounded-lg">
                  <Label className="text-sm text-lab-warm-gray mb-2 block">
                    Your previous monthly income (before layoff):
                  </Label>
                  <div className="relative mb-3">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={formData.previousMonthlyIncome || ''}
                      onChange={(e) => updateField('previousMonthlyIncome', Number(e.target.value))}
                      className="pl-7"
                      placeholder="0"
                    />
                  </div>
                  
                  {formData.previousMonthlyIncome > 0 && (
                    <p className="text-sm text-lab-navy">
                      Estimated monthly UI benefit: <strong>~{formatCurrency(unemploymentEstimate)}</strong>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    ℹ️ Estimate only. Actual benefits vary by state.
                  </p>
                </div>
              )}
            </Card>

            {/* Section D: Reality Check */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-lab-amber" />
                <h2 className="text-lg font-semibold text-lab-navy">Quick Reality Check</h2>
              </div>
              
              <p className="text-sm text-lab-warm-gray mb-4">
                People often forget these expenses:
              </p>
              <ul className="text-sm text-muted-foreground mb-6 space-y-1">
                <li>• Subscriptions (streaming, gym, apps)</li>
                <li>• Pet expenses</li>
                <li>• Car maintenance / registration</li>
                <li>• Seasonal costs (heating, holidays)</li>
              </ul>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="buffer" 
                    checked={formData.buffer === '10'}
                    onChange={() => updateField('buffer', '10')}
                    className="w-4 h-4 text-lab-teal"
                  />
                  <span className="text-sm text-lab-warm-gray">
                    Add 10% buffer for "life happens" 
                    {totals.baseExpenses > 0 && (
                      <span className="text-muted-foreground"> (+{formatCurrency(totals.baseExpenses * 0.1)}/month)</span>
                    )}
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="buffer" 
                    checked={formData.buffer === '20'}
                    onChange={() => updateField('buffer', '20')}
                    className="w-4 h-4 text-lab-teal"
                  />
                  <span className="text-sm text-lab-warm-gray">
                    Add 20% buffer
                    {totals.baseExpenses > 0 && (
                      <span className="text-muted-foreground"> (+{formatCurrency(totals.baseExpenses * 0.2)}/month)</span>
                    )}
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="buffer" 
                    checked={formData.buffer === 'none'}
                    onChange={() => updateField('buffer', 'none')}
                    className="w-4 h-4 text-lab-teal"
                  />
                  <span className="text-sm text-lab-warm-gray">I'm confident in my numbers</span>
                </label>
              </div>
            </Card>

            {/* Calculate Button */}
            <div className="text-center">
              <Button
                onClick={handleCalculate}
                disabled={!isFormValid}
                className="bg-lab-teal hover:bg-lab-teal/90 text-white px-12"
                size="lg"
              >
                Calculate My Runway
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Privacy: Your numbers are calculated in your browser. Nothing is sent to any server.
              </p>
            </div>
          </div>
        </section>

        {/* Results Section */}
        {showResults && results && (
          <section id="results-section" className="pb-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-6">
              
              {/* Main Result Card */}
              <Card className="p-6 sm:p-8">
                {results.status === 'survival' ? (
                  <div className="text-center">
                    <div className="text-3xl mb-4">🚨</div>
                    <h2 className="text-xl font-bold text-lab-navy mb-4">You're in survival mode.</h2>
                    <p className="text-lab-warm-gray mb-6">
                      Our runway calculator works best when you have some buffer. Right now, you need income — not planning.
                    </p>
                    <div className="bg-destructive/10 rounded-lg p-6 text-left">
                      <h3 className="font-medium text-lab-navy mb-3">Priority actions:</h3>
                      <ol className="space-y-2 text-sm text-lab-warm-gray list-decimal list-inside">
                        <li>File for unemployment TODAY</li>
                        <li>Any income is good income (gig work, retail, temp)</li>
                        <li>Check state assistance programs</li>
                        <li>Call creditors about hardship programs</li>
                      </ol>
                      
                      <h3 className="font-medium text-lab-navy mt-6 mb-3">Resources:</h3>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <a href="https://www.211.org" target="_blank" rel="noopener noreferrer" className="text-lab-teal hover:underline flex items-center gap-1">
                            211.org — local assistance finder <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                        <li>
                          <a href="https://www.reddit.com/r/povertyfinance" target="_blank" rel="noopener noreferrer" className="text-lab-teal hover:underline flex items-center gap-1">
                            r/povertyfinance — community support <ExternalLink className="h-3 w-3" />
                          </a>
                        </li>
                      </ul>
                      
                      <p className="text-sm text-muted-foreground mt-6">
                        Come back when you have some breathing room. We'll be here.
                      </p>
                    </div>
                  </div>
                ) : results.status === 'positive' ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="h-6 w-6 text-lab-sage" />
                      <h2 className="text-xl font-bold text-lab-navy">Good news: You'd actually be cash-flow positive.</h2>
                    </div>
                    
                    <div className="bg-lab-sage/10 rounded-lg p-6 mb-6">
                      <p className="text-sm text-lab-warm-gray mb-4">
                        With partner income {whatIfUI && "and unemployment benefits"}:
                      </p>
                      <div className="space-y-2 text-lg">
                        <div className="flex justify-between">
                          <span className="text-lab-warm-gray">Monthly income:</span>
                          <span className="font-semibold text-lab-navy">{formatCurrency(results.totals.totalIncome + whatIfGigIncome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-lab-warm-gray">Monthly expenses:</span>
                          <span className="font-semibold text-lab-navy">{formatCurrency(results.totals.bareBonesExpenses)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-lab-warm-gray">Monthly surplus:</span>
                          <span className="font-bold text-lab-sage">+{formatCurrency(results.monthlySurplus + whatIfGigIncome)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-lab-warm-gray">
                      Your savings aren't survival money — they're a safety buffer. You can be selective about your next opportunity.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      {results.status === 'strong' ? (
                        <>
                          <CheckCircle2 className="h-6 w-6 text-lab-sage" />
                          <h2 className="text-xl font-bold text-lab-navy">You're more prepared than you might think.</h2>
                        </>
                      ) : results.status === 'moderate' ? (
                        <>
                          <AlertTriangle className="h-6 w-6 text-lab-amber" />
                          <h2 className="text-xl font-bold text-lab-navy">You have some runway. Let's maximize it.</h2>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-6 w-6 text-destructive" />
                          <h2 className="text-xl font-bold text-lab-navy">Your runway is short. Let's find every option.</h2>
                        </>
                      )}
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-6">
                      <div className="text-center mb-4">
                        <div className="text-4xl font-bold text-lab-teal mb-1">
                          {formatMonths(results.bareBonesRunwayMonths)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          at bare-bones spending
                        </div>
                      </div>
                      
                      {results.currentRunwayMonths !== results.bareBonesRunwayMonths && (
                        <div className="text-sm text-center text-lab-warm-gray">
                          At current spending: {formatMonths(results.currentRunwayMonths)}
                        </div>
                      )}
                      
                      {whatIfUI && results.withUIRunwayMonths > results.bareBonesRunwayMonths && (
                        <div className="text-sm text-center text-lab-sage mt-2">
                          With unemployment: {formatMonths(results.withUIRunwayMonths)}
                        </div>
                      )}
                    </div>
                    
                    {results.status === 'strong' && (
                      <p className="text-lab-warm-gray mt-4">
                        {whatIfUI 
                          ? "With unemployment benefits, your runway extends even further — giving you time to find the RIGHT job."
                          : "You have a solid buffer to find the right opportunity."
                        }
                      </p>
                    )}
                  </div>
                )}
              </Card>

              {/* Scenario Comparison Table */}
              {results.status !== 'survival' && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-lab-navy mb-4 flex items-center gap-2">
                    📊 Your Scenarios Compared
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Scenario</TableHead>
                          <TableHead className="text-right">Monthly Expenses</TableHead>
                          <TableHead className="text-right">Income</TableHead>
                          <TableHead className="text-right">Net Burn</TableHead>
                          <TableHead className="text-right">Runway</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Current lifestyle</TableCell>
                          <TableCell className="text-right">{formatCurrency(results.totals.totalExpenses)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(formData.partnerIncome)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(results.currentMonthlyBurn)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatMonths(results.currentRunwayMonths)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Bare bones<br /><span className="text-xs text-muted-foreground">(essentials only)</span></TableCell>
                          <TableCell className="text-right">{formatCurrency(results.totals.bareBonesExpenses)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(formData.partnerIncome)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(results.bareBonesMonthlyBurn)}</TableCell>
                          <TableCell className="text-right font-semibold">{formatMonths(results.bareBonesRunwayMonths)}</TableCell>
                        </TableRow>
                        {formData.includeUnemployment && (
                          <TableRow className="bg-lab-teal/5">
                            <TableCell className="font-medium">+ Unemployment<br /><span className="text-xs text-muted-foreground">benefits</span></TableCell>
                            <TableCell className="text-right">{formatCurrency(results.totals.bareBonesExpenses)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(results.totals.totalIncome)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(results.withUIMonthlyBurn)}</TableCell>
                            <TableCell className="text-right font-semibold text-lab-teal">{formatMonths(results.withUIRunwayMonths)}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              )}

              {/* What-If Toggles */}
              {results.status !== 'survival' && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-lab-navy mb-4 flex items-center gap-2">
                    🎛️ Adjust Your Scenario
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={whatIfUI}
                          onCheckedChange={setWhatIfUI}
                        />
                        <div>
                          <span className="text-sm text-lab-warm-gray">
                            Include unemployment benefits (~{formatCurrency(unemploymentEstimate)}/mo)
                          </span>
                        </div>
                      </div>
                    </div>

                    {formData.useItemized && totals.discretionaryTotal > 0 && (
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Switch 
                            checked={whatIfCutDiscretionary}
                            onCheckedChange={setWhatIfCutDiscretionary}
                          />
                          <div>
                            <span className="text-sm text-lab-warm-gray">
                              Cut all discretionary spending ({formatCurrency(totals.discretionaryTotal)}/mo)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between gap-4">
                        <Label className="text-sm text-lab-warm-gray">Add severance:</Label>
                        <div className="relative w-36">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={whatIfSeverance || ''}
                            onChange={(e) => setWhatIfSeverance(Number(e.target.value))}
                            className="pl-7 h-9"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between gap-4">
                        <Label className="text-sm text-lab-warm-gray">Add part-time/gig income:</Label>
                        <div className="relative w-36">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={whatIfGigIncome || ''}
                            onChange={(e) => setWhatIfGigIncome(Number(e.target.value))}
                            className="pl-7 h-9"
                            placeholder="0"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Action Items */}
              {results.status !== 'survival' && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-lab-navy mb-4 flex items-center gap-2">
                    📋 Your Next Steps
                  </h3>
                  
                  {results.status === 'strong' || results.status === 'positive' ? (
                    <ol className="space-y-4">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-lab-teal/10 rounded-full flex items-center justify-center text-sm font-medium text-lab-teal">1</span>
                        <div>
                          <strong className="text-lab-navy">FILE FOR UNEMPLOYMENT if laid off</strong>
                          <p className="text-sm text-muted-foreground">Even with strong runway, this is free money you've paid into.</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-lab-teal/10 rounded-full flex items-center justify-center text-sm font-medium text-lab-teal">2</span>
                        <div>
                          <strong className="text-lab-navy">BE SELECTIVE about your next role</strong>
                          <p className="text-sm text-muted-foreground">You have time to find the RIGHT opportunity.</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-lab-teal/10 rounded-full flex items-center justify-center text-sm font-medium text-lab-teal">3</span>
                        <div>
                          <strong className="text-lab-navy">USE THIS TIME strategically</strong>
                          <p className="text-sm text-muted-foreground">Consider upskilling, networking, or exploring new directions.</p>
                        </div>
                      </li>
                    </ol>
                  ) : (
                    <ol className="space-y-4">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-lab-teal/10 rounded-full flex items-center justify-center text-sm font-medium text-lab-teal">1</span>
                        <div>
                          <strong className="text-lab-navy">FILE FOR UNEMPLOYMENT the day you're laid off</strong>
                          <p className="text-sm text-muted-foreground">
                            This is what extends your runway from {formatMonths(results.bareBonesRunwayMonths)} to {formatMonths(results.withUIRunwayMonths)}.
                          </p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-lab-teal/10 rounded-full flex items-center justify-center text-sm font-medium text-lab-teal">2</span>
                        <div>
                          <strong className="text-lab-navy">CUT DISCRETIONARY spending immediately</strong>
                          <p className="text-sm text-muted-foreground">Streaming, dining out, subscriptions — know what you can pause.</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-lab-teal/10 rounded-full flex items-center justify-center text-sm font-medium text-lab-teal">3</span>
                        <div>
                          <strong className="text-lab-navy">JOB SEARCH should be your full-time job</strong>
                          <p className="text-sm text-muted-foreground">{formatMonths(results.withUIRunwayMonths)} is a buffer, not a vacation.</p>
                        </div>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-lab-teal/10 rounded-full flex items-center justify-center text-sm font-medium text-lab-teal">4</span>
                        <div>
                          <strong className="text-lab-navy">CONSIDER gig or part-time income</strong>
                          <p className="text-sm text-muted-foreground">Even $500/month adds significant runway.</p>
                        </div>
                      </li>
                    </ol>
                  )}
                </Card>
              )}

              {/* Privacy Section */}
              <Accordion type="single" collapsible>
                <AccordionItem value="privacy" className="border rounded-xl bg-card shadow-sm">
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <span className="flex items-center gap-2 text-lab-navy font-medium">
                      <Shield className="h-4 w-4" />
                      Privacy
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <p className="text-sm text-lab-warm-gray mb-4">Your privacy is protected:</p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-lab-sage mt-0.5 shrink-0" />
                        All calculations happen in your browser
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-lab-sage mt-0.5 shrink-0" />
                        Your numbers are never sent to any server
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-lab-sage mt-0.5 shrink-0" />
                        We don't store any of your financial data
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-lab-sage mt-0.5 shrink-0" />
                        No account required, no tracking
                      </li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-4">
                      This tool is part of Rob's Money Lab — privacy-first financial tools.{" "}
                      <Link to="/about#privacy" className="text-lab-teal hover:underline">
                        Learn more about our approach →
                      </Link>
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Don't take our word for it —{" "}
                      <a
                        href="https://github.com/psrob9/rob-s-money-lab"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lab-teal hover:underline"
                      >
                        view the source code
                      </a>.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* What's Next */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-lab-navy mb-4">What's Next?</h3>
                
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <Link
                    to="/tools/money-snapshot"
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-lab-teal/30 hover:bg-lab-teal/5 transition-colors"
                  >
                    <span className="text-2xl">📊</span>
                    <div>
                      <div className="font-medium text-lab-navy">Try Money Snapshot</div>
                      <div className="text-sm text-muted-foreground">See where your money goes</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-lab-teal ml-auto" />
                  </Link>
                  
                  <Link
                    to="/tools/true-monthly-cost"
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-lab-teal/30 hover:bg-lab-teal/5 transition-colors"
                  >
                    <span className="text-2xl">💰</span>
                    <div>
                      <div className="font-medium text-lab-navy">True Monthly Cost</div>
                      <div className="text-sm text-muted-foreground">Find hidden recurring costs</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-lab-teal ml-auto" />
                  </Link>
                </div>

                <button
                  onClick={() => setFeedbackOpen(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-lg border border-border hover:border-lab-teal/30 hover:bg-lab-teal/5 transition-colors"
                >
                  <span className="text-lg">📝</span>
                  <span className="font-medium text-lab-navy">Share Feedback</span>
                  <span className="text-sm text-muted-foreground">Help us improve this tool</span>
                </button>
              </Card>

              {/* Email Signup */}
              <EmailSignup
                heading="Want to know when I build more tools?"
                variant="compact"
              />
            </div>
          </section>
        )}

        <FeedbackModal
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          context="runway-calculator"
        />
      </div>
    </Layout>
  );
};

export default RunwayCalculator;
