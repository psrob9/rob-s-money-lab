import { useState, useMemo, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X, Check, AlertCircle, Loader2, Calendar, DollarSign, TrendingUp, Sparkles, ChevronDown, ChevronUp, Filter, SlidersHorizontal, Eye, EyeOff, Beaker, Info, ArrowRight, Download, Lightbulb, Lock, MessageSquare, RefreshCw, Shield } from "lucide-react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import {
  findRecurringTransactionsWithDebug,
  recalculateMonthlyEquivalent,
  calculateRecurringSummary,
  RecurringTransaction,
  RecurringSummary,
  Transaction,
  Frequency,
  Confidence,
  DetectionDebug
} from "@/utils/recurringDetection";
import { SAMPLE_PERSONA, getSampleTransactionsForRecurring } from "@/utils/sampleData";
import { useTransactionContext } from "@/contexts/TransactionContext";
import { EmailSignup } from "@/components/EmailSignup";
import { FeedbackModal } from "@/components/FeedbackModal";

interface UploadedFile {
  file: File;
  status: 'pending' | 'parsing' | 'ready' | 'error';
  transactions: Transaction[];
  error?: string;
}

type SortOption = 'monthly-desc' | 'monthly-asc' | 'merchant-asc' | 'occurrences-desc' | 'confidence-desc';

const FREQUENCY_OPTIONS: Frequency[] = ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'annual', 'irregular'];
const CONFIDENCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'high', label: 'High only' },
  { value: 'high-medium', label: 'High + Medium' },
  { value: 'low', label: 'Low only' }
];

const TrueMonthlyCost = () => {
  const { toast } = useToast();
  const { sharedTransactions, sharedFiles, hasSharedData, clearSharedData } = useTransactionContext();
  
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recurringItems, setRecurringItems] = useState<RecurringTransaction[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [detectionDebug, setDetectionDebug] = useState<DetectionDebug | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);
  
  // Shared data banner state
  const [showSharedDataBanner, setShowSharedDataBanner] = useState(false);
  
  // Filter state
  const [selectedFrequencies, setSelectedFrequencies] = useState<Set<Frequency>>(new Set(FREQUENCY_OPTIONS));
  const [confidenceFilter, setConfidenceFilter] = useState<string>('high-medium'); // Default to high + medium
  const [sortBy, setSortBy] = useState<SortOption>('monthly-desc');
  const [showExcluded, setShowExcluded] = useState(false);
  
  // AI insights state
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  
  // Sample data state
  const [isSampleData, setIsSampleData] = useState(false);
  
  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  // Check for shared data on mount
  useEffect(() => {
    if (hasSharedData && !hasAnalyzed && uploadedFiles.length === 0) {
      setShowSharedDataBanner(true);
    }
  }, [hasSharedData, hasAnalyzed, uploadedFiles.length]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let items = [...recurringItems];
    
    // Filter by frequency
    items = items.filter(item => selectedFrequencies.has(item.frequency));
    
    // Filter by confidence
    switch (confidenceFilter) {
      case 'high':
        items = items.filter(item => item.confidence === 'high');
        break;
      case 'high-medium':
        items = items.filter(item => item.confidence === 'high' || item.confidence === 'medium');
        break;
      case 'low':
        items = items.filter(item => item.confidence === 'low');
        break;
      // 'all' shows everything
    }
    
    // Filter excluded
    if (!showExcluded) {
      items = items.filter(item => !item.isExcluded);
    }
    
    // Sort
    switch (sortBy) {
      case 'monthly-desc':
        items.sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent);
        break;
      case 'monthly-asc':
        items.sort((a, b) => a.monthlyEquivalent - b.monthlyEquivalent);
        break;
      case 'merchant-asc':
        items.sort((a, b) => a.merchant.localeCompare(b.merchant));
        break;
      case 'occurrences-desc':
        items.sort((a, b) => b.occurrences - a.occurrences);
        break;
      case 'confidence-desc':
        const confidenceOrder: Record<Confidence, number> = { high: 3, medium: 2, low: 1 };
        items.sort((a, b) => confidenceOrder[b.confidence] - confidenceOrder[a.confidence]);
        break;
    }
    
    return items;
  }, [recurringItems, selectedFrequencies, confidenceFilter, sortBy, showExcluded]);

  // Calculate summary from current items (only included items with at least low confidence)
  const summary: RecurringSummary = useMemo(() => {
    return calculateRecurringSummary(recurringItems);
  }, [recurringItems]);

  // Parse a single CSV file
  const parseFile = useCallback((uploadedFile: UploadedFile): Promise<Transaction[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(uploadedFile.file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const transactions: Transaction[] = [];
            
            for (const row of results.data as Record<string, string>[]) {
              const dateValue = row['Date'] || row['date'] || row['Transaction Date'] || row['Posted Date'] || row['Posting Date'];
              const description = row['Description'] || row['description'] || row['Merchant'] || row['Name'] || row['Payee'] || row['DESCRIPTION'];
              let amount = parseFloat(row['Amount'] || row['amount'] || row['AMOUNT'] || '0');
              
              if (row['Debit'] && !isNaN(parseFloat(row['Debit']))) {
                amount = -Math.abs(parseFloat(row['Debit']));
              } else if (row['Credit'] && !isNaN(parseFloat(row['Credit']))) {
                amount = Math.abs(parseFloat(row['Credit']));
              }
              
              if (!dateValue || !description) continue;
              
              const date = new Date(dateValue);
              if (isNaN(date.getTime())) continue;
              
              transactions.push({ date, description, amount });
            }
            
            resolve(transactions);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => reject(error)
      });
    });
  }, []);

  // Handle file drop/select
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const csvFiles = Array.from(files).filter(f => 
      f.type === 'text/csv' || f.name.endsWith('.csv')
    );
    
    if (csvFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload CSV files only.",
        variant: "destructive"
      });
      return;
    }
    
    const newFiles: UploadedFile[] = csvFiles.map(file => ({
      file,
      status: 'pending' as const,
      transactions: []
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    for (const uploadedFile of newFiles) {
      setUploadedFiles(prev => prev.map(f => 
        f.file === uploadedFile.file ? { ...f, status: 'parsing' } : f
      ));
      
      try {
        const transactions = await parseFile(uploadedFile);
        setUploadedFiles(prev => prev.map(f =>
          f.file === uploadedFile.file 
            ? { ...f, status: 'ready', transactions }
            : f
        ));
      } catch (error) {
        setUploadedFiles(prev => prev.map(f =>
          f.file === uploadedFile.file 
            ? { ...f, status: 'error', error: 'Failed to parse file' }
            : f
        ));
      }
    }
  }, [parseFile, toast]);

  const removeFile = useCallback((file: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== file));
  }, []);

  const runAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    
    const allTransactions = uploadedFiles
      .filter(f => f.status === 'ready')
      .flatMap(f => f.transactions);
    
    const { items: recurring, debug } = findRecurringTransactionsWithDebug(allTransactions);
    
    setRecurringItems(recurring);
    setDetectionDebug(debug);
    setHasAnalyzed(true);
    setShowAiPrompt(true);
    setShowSharedDataBanner(false);
    setIsAnalyzing(false);
    
    toast({
      title: "Analysis complete",
      description: `Found ${recurring.length} recurring expenses.`
    });
  }, [uploadedFiles, toast]);
  
  // Use shared transactions from Money Snapshot
  const useSharedTransactions = useCallback(() => {
    const { items: recurring, debug } = findRecurringTransactionsWithDebug(sharedTransactions);
    
    setRecurringItems(recurring);
    setDetectionDebug(debug);
    setHasAnalyzed(true);
    setShowAiPrompt(true);
    setShowSharedDataBanner(false);
    
    toast({
      title: "Using transactions from Money Snapshot",
      description: `Analyzing ${sharedTransactions.length} transactions.`
    });
  }, [sharedTransactions, toast]);

  const updateFrequency = useCallback((id: string, frequency: Frequency) => {
    setRecurringItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      return recalculateMonthlyEquivalent({ ...item, frequency });
    }));
  }, []);

  const toggleExclude = useCallback((id: string) => {
    setRecurringItems(prev => prev.map(item => 
      item.id === id ? { ...item, isExcluded: !item.isExcluded } : item
    ));
  }, []);

  const toggleRowExpansion = useCallback((id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleFrequencyFilter = useCallback((freq: Frequency) => {
    setSelectedFrequencies(prev => {
      const next = new Set(prev);
      if (next.has(freq)) {
        next.delete(freq);
      } else {
        next.add(freq);
      }
      return next;
    });
  }, []);

  const getAiInsights = useCallback(async () => {
    setIsLoadingInsights(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-recurring-insights', {
        body: {
          summary: {
            totalMonthly: summary.totalMonthly,
            itemCount: summary.itemCount,
            annualSubscriptionCount: summary.annualSubscriptionCount,
            quarterlySubscriptionCount: summary.quarterlySubscriptionCount,
            weeklyContribution: summary.weeklyContribution,
            monthlyContribution: summary.monthlyContribution,
            quarterlyContribution: summary.quarterlyContribution,
            annualContribution: summary.annualContribution
          },
          items: recurringItems
            .filter(i => !i.isExcluded)
            .map(i => ({
              merchant: i.merchant,
              frequency: i.frequency,
              amount: i.averageAmount,
              monthlyEquivalent: i.monthlyEquivalent
            }))
        }
      });
      
      if (error) throw error;
      
      setAiInsights(data.insights);
      setShowAiPrompt(false);
    } catch (error) {
      console.error('Error getting AI insights:', error);
      toast({
        title: "Couldn't get AI insights",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingInsights(false);
    }
  }, [summary, recurringItems, toast]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatFrequency = (freq: Frequency): string => {
    switch (freq) {
      case 'weekly': return 'Weekly';
      case 'bi-weekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'annual': return 'Annual';
      case 'irregular': return 'Irregular';
      case 'one-time': return 'One-time';
    }
  };

  // Download results as CSV
  const handleDownloadResults = useCallback(() => {
    if (recurringItems.length === 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    const filename = `recurring-costs-${today}.csv`;
    
    // Build CSV content
    const headers = ['Merchant', 'Frequency', 'Average Amount', 'Monthly Equivalent', 'Confidence', 'Included'];
    const rows = recurringItems.map(item => [
      `"${item.merchant.replace(/"/g, '""')}"`,
      formatFrequency(item.frequency),
      item.averageAmount.toFixed(2),
      item.monthlyEquivalent.toFixed(2),
      item.confidence,
      item.isExcluded ? 'No' : 'Yes'
    ].join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    
    toast({
      title: 'Results downloaded!',
      description: `Saved as ${filename}`
    });
  }, [recurringItems, toast]);

  const readyFiles = uploadedFiles.filter(f => f.status === 'ready');
  const canAnalyze = readyFiles.length > 0;
  const totalTransactions = readyFiles.reduce((sum, f) => sum + f.transactions.length, 0);

  const handleLoadSampleData = useCallback(() => {
    const sampleTxns = getSampleTransactionsForRecurring();
    
    // Create synthetic file entry
    const sampleFile: UploadedFile = {
      file: new File([], `Sample Data: ${SAMPLE_PERSONA.name}`),
      status: 'ready',
      transactions: sampleTxns
    };
    
    setUploadedFiles([sampleFile]);
    setIsSampleData(true);
    
    // Run analysis immediately
    const { items: recurring, debug } = findRecurringTransactionsWithDebug(sampleTxns);
    setRecurringItems(recurring);
    setDetectionDebug(debug);
    setHasAnalyzed(true);
    setShowAiPrompt(true);
    
    toast({
      title: "Sample data loaded",
      description: `Analyzing ${sampleTxns.length} sample transactions for ${SAMPLE_PERSONA.name}.`
    });
  }, [toast]);

  const handleReset = useCallback(() => {
    setUploadedFiles([]);
    setRecurringItems([]);
    setDetectionDebug(null);
    setHasAnalyzed(false);
    setShowAiPrompt(false);
    setAiInsights(null);
    setExpandedRows(new Set());
    setSelectedFrequencies(new Set(FREQUENCY_OPTIONS));
    setConfidenceFilter('high-medium');
    setSortBy('monthly-desc');
    setShowExcluded(false);
    setIsSampleData(false);
    setShowSharedDataBanner(hasSharedData);
  }, [hasSharedData]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const getConfidenceBadge = (confidence: Confidence) => {
    switch (confidence) {
      case 'high':
        return <Badge variant="outline" className="bg-lab-sage/10 text-lab-sage border-lab-sage/30">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-lab-amber/10 text-lab-amber border-lab-amber/30">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Low</Badge>;
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <div className="text-4xl mb-4">💰</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-lab-navy mb-4">
            True Monthly Cost Calculator
          </h1>
          <p className="text-xl text-lab-warm-gray mb-2">
            What do you really spend each month?
          </p>
          <p className="text-xl text-lab-warm-gray mb-6">
            Find hidden recurring costs.
          </p>
          <p className="text-lab-warm-gray mb-8">
            No account needed. Your files never leave your browser.
          </p>

          {!hasAnalyzed && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => document.getElementById('hero-file-input')?.click()}
                className="bg-lab-sage hover:bg-lab-sage/90 text-white px-8"
                size="lg"
              >
                Upload CSV
              </Button>
              <input
                id="hero-file-input"
                type="file"
                accept=".csv"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <Button
                variant="outline"
                size="lg"
                onClick={handleLoadSampleData}
              >
                <Beaker size={18} className="mr-2" />
                Try Sample Data
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Who This Is For (Collapsible) */}
      {!hasAnalyzed && (
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
                          You have subscriptions hiding in your bank statements
                        </li>
                        <li className="flex items-start gap-2 text-sm text-lab-warm-gray">
                          <Check className="h-4 w-4 text-lab-sage mt-0.5 shrink-0" />
                          You want to find recurring costs you've forgotten about
                        </li>
                        <li className="flex items-start gap-2 text-sm text-lab-warm-gray">
                          <Check className="h-4 w-4 text-lab-sage mt-0.5 shrink-0" />
                          You want to see what you're actually committed to each month
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-lab-navy mb-3">This tool may not be right if:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-lab-warm-gray">
                          <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                          You already track all your subscriptions manually
                        </li>
                        <li className="flex items-start gap-2 text-sm text-lab-warm-gray">
                          <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                          You need ongoing subscription tracking (this is one-time analysis)
                        </li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Privacy Section */}
            <Accordion type="single" collapsible className="mt-4">
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
                      Your CSV files are processed entirely in your browser
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-lab-sage mt-0.5 shrink-0" />
                      Transaction details never leave your device
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-lab-sage mt-0.5 shrink-0" />
                      AI insights are opt-in — only category totals are shared, never transactions
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-lab-sage mt-0.5 shrink-0" />
                      No account required, no tracking
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    This tool is part of Rob's Money Lab — privacy-first financial tools.{" "}
                    <Link to="/about#privacy" className="text-lab-sage hover:underline">
                      Learn more about our approach →
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Don't take our word for it —{" "}
                    <a
                      href="https://github.com/psrob9/rob-s-money-lab"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lab-sage hover:underline"
                    >
                      view the source code
                    </a>.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Shared Data Banner */}
          {showSharedDataBanner && !hasAnalyzed && (
            <Card className="mb-4 bg-lab-teal/5 border-lab-teal/30">
              <CardContent className="py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <ArrowRight size={18} className="text-lab-teal" />
                    <p className="text-sm text-lab-navy">
                      Use the <span className="font-medium">{sharedTransactions.length.toLocaleString()} transactions</span> you already uploaded in Money Snapshot?
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSharedDataBanner(false)}
                      className="text-muted-foreground"
                    >
                      No thanks
                    </Button>
                    <Button
                      size="sm"
                      onClick={useSharedTransactions}
                      className="bg-lab-teal hover:bg-lab-teal/90"
                    >
                      Yes, use them
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Upload Section */}
          {!hasAnalyzed && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload size={20} className="text-lab-teal" />
                  Upload Your Bank Statements
                </CardTitle>
                <CardDescription>
                  Upload CSV files from your bank or credit card. We'll find all your recurring costs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                    ${isDragging 
                      ? 'border-lab-teal bg-lab-teal/5' 
                      : 'border-border hover:border-lab-teal/50 hover:bg-muted/30'
                    }
                  `}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    accept=".csv"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-lab-navy font-medium mb-1">
                    Drop CSV files here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports multiple files from different accounts
                  </p>
                </div>

                {/* Sample Data Option */}
                {uploadedFiles.length === 0 && (
                  <>
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <div className="h-px bg-border flex-1" />
                      <span className="text-sm text-muted-foreground">or</span>
                      <div className="h-px bg-border flex-1" />
                    </div>
                    
                    <button
                      onClick={handleLoadSampleData}
                      className="w-full mt-4 p-4 rounded-lg border-2 border-dashed border-lab-amber/30 bg-lab-amber/5 hover:bg-lab-amber/10 hover:border-lab-amber/50 transition-colors text-center group"
                    >
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Beaker size={18} className="text-lab-amber" />
                        <span className="font-medium text-lab-navy">Try with sample data</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        See how it works without uploading anything personal
                      </p>
                    </button>
                  </>
                )}

                {/* Bank Export Instructions */}
                {uploadedFiles.length === 0 && (
                  <Collapsible className="mt-4">
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm text-lab-teal hover:underline">
                      <ChevronDown size={16} className="transition-transform [[data-state=open]_&]:rotate-180" />
                      How do I get a CSV from my bank?
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-4 p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-lab-warm-gray mb-3">
                        Most banks let you export transactions as CSV from their website:
                      </p>
                      <ul className="text-sm text-lab-warm-gray space-y-2">
                        <li><span className="font-medium text-lab-navy">Chase:</span> Accounts → Download account activity → CSV</li>
                        <li><span className="font-medium text-lab-navy">Bank of America:</span> Statements & Documents → Download → Spreadsheet (CSV)</li>
                        <li><span className="font-medium text-lab-navy">Capital One:</span> Account → Download Transactions → CSV</li>
                        <li><span className="font-medium text-lab-navy">Wells Fargo:</span> Account → Download → Comma Delimited</li>
                        <li><span className="font-medium text-lab-navy">Other banks:</span> Look for 'Export', 'Download', or 'Statements' in your online banking</li>
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* File List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-6 space-y-2">
                    {uploadedFiles.map((uf, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-lab-navy">{uf.file.name}</p>
                            {uf.status === 'ready' && (
                              <p className="text-xs text-muted-foreground">
                                {uf.transactions.length} transactions
                              </p>
                            )}
                            {uf.status === 'error' && (
                              <p className="text-xs text-destructive">{uf.error}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {uf.status === 'parsing' && (
                            <Loader2 size={16} className="animate-spin text-lab-teal" />
                          )}
                          {uf.status === 'ready' && (
                            <Check size={16} className="text-lab-sage" />
                          )}
                          {uf.status === 'error' && (
                            <AlertCircle size={16} className="text-destructive" />
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFile(uf.file); }}
                            className="p-1 hover:bg-muted rounded"
                          >
                            <X size={16} className="text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Analyze Button */}
                {canAnalyze && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Ready to analyze {totalTransactions.toLocaleString()} transactions from {readyFiles.length} file{readyFiles.length !== 1 ? 's' : ''}
                    </p>
                    <Button 
                      onClick={runAnalysis}
                      disabled={isAnalyzing}
                      className="bg-lab-teal hover:bg-lab-teal/90"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <TrendingUp size={16} className="mr-2" />
                          Find My Recurring Costs
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Results Section */}
          {hasAnalyzed && (
            <>
              {/* Sample Data Banner */}
              {isSampleData && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 mb-4 bg-lab-amber/10 border border-lab-amber/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Beaker size={18} className="text-lab-amber" />
                    <p className="text-sm text-lab-navy">
                      Viewing sample data for <span className="font-medium">{SAMPLE_PERSONA.name}</span> — this isn't your real spending
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="text-sm font-medium text-lab-amber hover:text-lab-amber/80 whitespace-nowrap"
                  >
                    Upload your own files →
                  </button>
                </div>
              )}

              {/* Debug info */}
              {detectionDebug && (
                <Collapsible open={debugOpen} onOpenChange={setDebugOpen} className="mb-4">
                  <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-lab-navy transition-colors mx-auto">
                    <Info size={14} />
                    <span>
                      Analyzed {detectionDebug.totalTransactionsAnalyzed.toLocaleString()} transactions • 
                      Found {detectionDebug.uniqueMerchantsAfterMerging} unique merchants • 
                      {recurringItems.length} recurring patterns
                    </span>
                    {debugOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-3 p-4 bg-muted/30 rounded-lg text-xs text-muted-foreground space-y-2">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span>Total transactions:</span><span className="font-medium text-lab-navy">{detectionDebug.totalTransactionsAnalyzed}</span>
                        <span>After cleaning:</span><span className="font-medium text-lab-navy">{detectionDebug.uniqueMerchantsAfterCleaning} merchants</span>
                        <span>After fuzzy merging:</span><span className="font-medium text-lab-navy">{detectionDebug.uniqueMerchantsAfterMerging} merchants</span>
                        <span>Potentially recurring:</span><span className="font-medium text-lab-navy">{detectionDebug.potentiallyRecurring}</span>
                        <span>Passed threshold:</span><span className="font-medium text-lab-navy">{detectionDebug.passedConfidenceThreshold}</span>
                      </div>
                      <div className="pt-2 border-t border-border/50">
                        <p className="font-medium text-lab-navy mb-1">Filtered out:</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <span>Too few occurrences:</span><span>{detectionDebug.filteredReasons.tooFewOccurrences}</span>
                          <span>Too short span:</span><span>{detectionDebug.filteredReasons.tooShortSpan}</span>
                          <span>Clustered buying:</span><span>{detectionDebug.filteredReasons.clusteredBuying}</span>
                          <span>High variance:</span><span>{detectionDebug.filteredReasons.highVariance}</span>
                          <span>Inconsistent intervals:</span><span>{detectionDebug.filteredReasons.inconsistentIntervals}</span>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
              {/* Summary Card */}
              <Card className="mb-8 border-lab-teal/30 bg-gradient-to-br from-lab-teal/5 to-transparent">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center">
                    <p className="text-sm font-medium text-lab-warm-gray uppercase tracking-wide mb-2">
                      Your True Monthly Recurring Costs
                    </p>
                    <p className="text-5xl sm:text-6xl font-bold text-lab-navy mb-6">
                      {formatCurrency(summary.totalMonthly)}
                      <span className="text-2xl text-muted-foreground font-normal">/mo</span>
                    </p>
                    
                    <div className="text-sm text-muted-foreground mb-6">
                      Based on {summary.itemCount} recurring items
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-3xl mx-auto text-sm">
                      {summary.monthlySubscriptionCount > 0 && (
                        <div className="bg-background/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">{summary.monthlySubscriptionCount} monthly</p>
                          <p className="text-base font-semibold text-lab-navy">{formatCurrency(summary.monthlyContribution)}</p>
                        </div>
                      )}
                      {summary.annualSubscriptionCount > 0 && (
                        <div className="bg-background/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">{summary.annualSubscriptionCount} annual (÷12)</p>
                          <p className="text-base font-semibold text-lab-navy">{formatCurrency(summary.annualContribution)}</p>
                        </div>
                      )}
                      {summary.quarterlySubscriptionCount > 0 && (
                        <div className="bg-background/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">{summary.quarterlySubscriptionCount} quarterly (÷3)</p>
                          <p className="text-base font-semibold text-lab-navy">{formatCurrency(summary.quarterlyContribution)}</p>
                        </div>
                      )}
                      {summary.weeklyCount > 0 && (
                        <div className="bg-background/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">{summary.weeklyCount} weekly (×4.33)</p>
                          <p className="text-base font-semibold text-lab-navy">{formatCurrency(summary.weeklyContribution)}</p>
                        </div>
                      )}
                      {summary.biWeeklyCount > 0 && (
                        <div className="bg-background/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">{summary.biWeeklyCount} bi-weekly (×2.17)</p>
                          <p className="text-base font-semibold text-lab-navy">{formatCurrency(summary.biWeeklyContribution)}</p>
                        </div>
                      )}
                      {summary.irregularCount > 0 && (
                        <div className="bg-background/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">{summary.irregularCount} irregular</p>
                          <p className="text-base font-semibold text-lab-navy">{formatCurrency(summary.irregularContribution)}</p>
                        </div>
                      )}
                    </div>
                    
                    {summary.excludedCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-4">
                        Excluded: {summary.excludedCount} item{summary.excludedCount !== 1 ? 's' : ''} 
                        {!showExcluded && ' (toggle "Show excluded" to review)'}
                      </p>
                    )}
                    
                    {/* Download Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-6"
                      onClick={handleDownloadResults}
                    >
                      <Download size={16} className="mr-2" />
                      Download Results
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* What to Do With This */}
              <Card className="mb-8 bg-lab-sage/5 border-lab-sage/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="text-lab-sage mt-0.5" size={20} />
                    <div>
                      <h3 className="font-semibold text-lab-navy mb-3">What to Do With This</h3>
                      <ul className="text-sm text-lab-warm-gray space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-lab-sage">•</span>
                          <span>Review the "Hidden Costs" below — these are easy to forget when budgeting</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-lab-sage">•</span>
                          <span>Toggle off anything that's not actually recurring (one-time purchases the algorithm caught)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-lab-sage">•</span>
                          <span>Use your True Monthly Cost (<span className="font-medium text-lab-navy">{formatCurrency(summary.totalMonthly)}</span>) as your baseline for budgeting recurring expenses</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-lab-sage">•</span>
                          <span>Consider if any subscriptions could be canceled or downgraded</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hidden Costs You Might Forget */}
              {(summary.annualSubscriptionCount > 0 || summary.quarterlySubscriptionCount > 0) && (
                <Card className="mb-8 bg-lab-amber/5 border-lab-amber/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Calendar className="text-lab-amber mt-0.5" size={20} />
                      <div>
                        <h3 className="font-semibold text-lab-navy mb-2">Hidden Costs You Might Forget</h3>
                        <ul className="text-sm text-lab-warm-gray space-y-1">
                          {summary.annualSubscriptionCount > 0 && (
                            <li>
                              You have <span className="font-medium text-lab-navy">{summary.annualSubscriptionCount} annual subscription{summary.annualSubscriptionCount !== 1 ? 's' : ''}</span> totaling{" "}
                              <span className="font-medium text-lab-navy">{formatCurrency(summary.annualContribution * 12)}/year</span>{" "}
                              ({formatCurrency(summary.annualContribution)}/month)
                            </li>
                          )}
                          {summary.quarterlySubscriptionCount > 0 && (
                            <li>
                              Your <span className="font-medium text-lab-navy">{summary.quarterlySubscriptionCount} quarterly expense{summary.quarterlySubscriptionCount !== 1 ? 's' : ''}</span> add{" "}
                              <span className="font-medium text-lab-navy">{formatCurrency(summary.quarterlyContribution)}/month</span> that's easy to overlook
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recurring Items Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign size={20} className="text-lab-teal" />
                    Your Recurring Costs
                  </CardTitle>
                  <CardDescription>
                    Review and adjust detected recurring expenses. Change frequency if we got it wrong.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Filter Bar */}
                  <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Filter size={16} />
                      <span>Filters:</span>
                    </div>
                    
                    {/* Frequency Filter */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          Frequency
                          <ChevronDown size={14} className="ml-1" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2" align="start">
                        {FREQUENCY_OPTIONS.map((freq) => (
                          <label key={freq} className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded cursor-pointer">
                            <Checkbox
                              checked={selectedFrequencies.has(freq)}
                              onCheckedChange={() => toggleFrequencyFilter(freq)}
                            />
                            <span className="text-sm">{formatFrequency(freq)}</span>
                          </label>
                        ))}
                      </PopoverContent>
                    </Popover>
                    
                    {/* Confidence Filter */}
                    <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue placeholder="Confidence" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONFIDENCE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Sort By */}
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                      <SelectTrigger className="w-[180px] h-8">
                        <SlidersHorizontal size={14} className="mr-1" />
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly-desc">Monthly cost (high→low)</SelectItem>
                        <SelectItem value="monthly-asc">Monthly cost (low→high)</SelectItem>
                        <SelectItem value="merchant-asc">Merchant name (A-Z)</SelectItem>
                        <SelectItem value="occurrences-desc">Occurrences (most first)</SelectItem>
                        <SelectItem value="confidence-desc">Confidence (high first)</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Show Excluded Toggle */}
                    <Button
                      variant={showExcluded ? "secondary" : "ghost"}
                      size="sm"
                      className="h-8 ml-auto"
                      onClick={() => setShowExcluded(!showExcluded)}
                    >
                      {showExcluded ? <Eye size={14} className="mr-1" /> : <EyeOff size={14} className="mr-1" />}
                      {showExcluded ? 'Showing excluded' : 'Show excluded'}
                    </Button>
                  </div>
                  
                  {/* Results count */}
                  <p className="text-sm text-muted-foreground mb-4">
                    Showing {filteredItems.length} of {recurringItems.length} items
                  </p>

                  {filteredItems.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No items match your current filters. Try adjusting the filters above.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40%]">Merchant</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Monthly</TableHead>
                            <TableHead className="text-center">Include</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredItems.map((item) => (
                            <>
                              <TableRow 
                                key={item.id}
                                className={`${item.isExcluded ? 'opacity-50 bg-muted/20' : ''} cursor-pointer hover:bg-muted/50`}
                                onClick={() => toggleRowExpansion(item.id)}
                              >
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {expandedRows.has(item.id) ? (
                                      <ChevronUp size={14} className="text-muted-foreground flex-shrink-0" />
                                    ) : (
                                      <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />
                                    )}
                                    <div>
                                      <p className="font-medium text-lab-navy">{item.merchant}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        {getConfidenceBadge(item.confidence)}
                                        <span className="text-xs text-muted-foreground">
                                          {item.occurrences} occurrence{item.occurrences !== 1 ? 's' : ''} over {Math.round(item.dateSpanDays)} days
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <Select
                                    value={item.frequency}
                                    onValueChange={(val) => updateFrequency(item.id, val as Frequency)}
                                  >
                                    <SelectTrigger className="w-[130px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="weekly">Weekly</SelectItem>
                                      <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                      <SelectItem value="monthly">Monthly</SelectItem>
                                      <SelectItem value="quarterly">Quarterly</SelectItem>
                                      <SelectItem value="annual">Annual</SelectItem>
                                      <SelectItem value="irregular">Irregular</SelectItem>
                                      <SelectItem value="one-time">One-time</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  {formatCurrency(item.averageAmount)}
                                </TableCell>
                                <TableCell className="text-right font-mono font-medium text-lab-teal">
                                  {item.frequency === 'one-time' ? '—' : formatCurrency(item.monthlyEquivalent)}
                                </TableCell>
                                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                  <Switch
                                    checked={!item.isExcluded}
                                    onCheckedChange={() => toggleExclude(item.id)}
                                  />
                                </TableCell>
                              </TableRow>
                              {/* Expanded Row - Transaction Details */}
                              {expandedRows.has(item.id) && (
                                <TableRow key={`${item.id}-expanded`}>
                                  <TableCell colSpan={5} className="bg-muted/30 p-0">
                                    <div className="p-4">
                                      <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                                        <span>Avg interval: {Math.round(item.avgIntervalDays)} days</span>
                                        <span>Interval variation: ±{Math.round(item.intervalStdDev)} days</span>
                                      </div>
                                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                        Recent Transactions
                                      </p>
                                      <div className="space-y-1 max-h-40 overflow-y-auto">
                                        {item.transactions.slice(0, 10).map((txn, idx) => (
                                          <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{formatDate(txn.date)}</span>
                                            <span className="font-mono">{formatCurrency(Math.abs(txn.amount))}</span>
                                          </div>
                                        ))}
                                        {item.transactions.length > 10 && (
                                          <p className="text-xs text-muted-foreground pt-1">
                                            + {item.transactions.length - 10} more transactions
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Insights Prompt */}
              {showAiPrompt && !aiInsights && (
                <Card className="mb-8 bg-gradient-to-br from-purple-50 to-transparent border-purple-200/50">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="text-purple-500 mt-0.5" size={20} />
                        <div>
                          <h3 className="font-semibold text-lab-navy mb-1">Want AI insights about your recurring costs?</h3>
                          <p className="text-sm text-muted-foreground">
                            AI can spot overlapping subscriptions and potential savings.
                          </p>
                        </div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200/50 rounded-lg p-3">
                        <p className="text-xs text-purple-700">
                          <span className="font-medium">What's shared:</span> Only category totals and merchant names (e.g., "Netflix - $15.99/mo"). 
                          Your individual transactions are never sent.
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Link to="/about#privacy" className="text-xs text-muted-foreground hover:text-purple-600 transition-colors">
                          Learn more about privacy
                        </Link>
                        <Button 
                          onClick={getAiInsights}
                          disabled={isLoadingInsights}
                          variant="outline"
                          className="border-purple-300 hover:bg-purple-50"
                        >
                          {isLoadingInsights ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            "I understand, get insights"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Insights Display */}
              {aiInsights && (
                <Card className="mb-8 bg-gradient-to-br from-purple-50 to-transparent border-purple-200/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="text-purple-500" size={18} />
                      AI Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lab-warm-gray whitespace-pre-wrap">{aiInsights}</p>
                  </CardContent>
                </Card>
              )}

              {/* What's Next */}
              <Card className="mt-8">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-lab-navy">What's Next?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Button
                      variant="outline"
                      className="flex flex-col items-center gap-1 h-auto py-3 px-3"
                      onClick={handleReset}
                    >
                      <RefreshCw size={18} className="text-lab-sage" />
                      <span className="text-xs font-medium">Start Over</span>
                      <span className="text-[10px] text-muted-foreground">Analyze new files</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="flex flex-col items-center gap-1 h-auto py-3 px-3"
                      asChild
                    >
                      <Link to="/tools/money-snapshot">
                        <span className="text-lg">📊</span>
                        <span className="text-xs font-medium">Money Snapshot</span>
                        <span className="text-[10px] text-muted-foreground">See spending breakdown</span>
                      </Link>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Button
                      variant="outline"
                      className="flex flex-col items-center gap-1 h-auto py-3 px-3"
                      asChild
                    >
                      <Link to="/tools/runway-calculator">
                        <span className="text-lg">🛡️</span>
                        <span className="text-xs font-medium">Layoff Runway</span>
                        <span className="text-[10px] text-muted-foreground">How long will savings last?</span>
                      </Link>
                    </Button>

                    <FeedbackModal
                      context="true-monthly-cost"
                      variant="tool-feedback"
                      trigger={
                        <Button
                          variant="outline"
                          className="flex flex-col items-center gap-1 h-auto py-3 px-3 w-full"
                        >
                          <MessageSquare size={18} className="text-lab-sage" />
                          <span className="text-xs font-medium">Share Feedback</span>
                          <span className="text-[10px] text-muted-foreground">Help us improve</span>
                        </Button>
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Email Signup */}
              <div className="mt-8 border-t border-border pt-8">
                <EmailSignup
                  heading="Want to know when I build more tools?"
                  variant="compact"
                />
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default TrueMonthlyCost;
