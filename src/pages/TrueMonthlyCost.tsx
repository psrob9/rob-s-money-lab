import { useState, useMemo, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X, Check, AlertCircle, Loader2, Calendar, DollarSign, TrendingUp, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import {
  findRecurringTransactions,
  recalculateMonthlyEquivalent,
  calculateRecurringSummary,
  RecurringTransaction,
  RecurringSummary,
  Transaction
} from "@/utils/recurringDetection";

interface UploadedFile {
  file: File;
  status: 'pending' | 'parsing' | 'ready' | 'error';
  transactions: Transaction[];
  error?: string;
}

const TrueMonthlyCost = () => {
  const { toast } = useToast();
  
  // File upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recurringItems, setRecurringItems] = useState<RecurringTransaction[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  
  // AI insights state
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  
  // Expanded rows state
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Calculate summary from current items
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
              // Try to find date column
              const dateValue = row['Date'] || row['date'] || row['Transaction Date'] || row['Posted Date'] || row['Posting Date'];
              // Try to find description column
              const description = row['Description'] || row['description'] || row['Merchant'] || row['Name'] || row['Payee'] || row['DESCRIPTION'];
              // Try to find amount column
              let amount = parseFloat(row['Amount'] || row['amount'] || row['AMOUNT'] || '0');
              
              // Handle debit/credit columns
              if (row['Debit'] && !isNaN(parseFloat(row['Debit']))) {
                amount = -Math.abs(parseFloat(row['Debit']));
              } else if (row['Credit'] && !isNaN(parseFloat(row['Credit']))) {
                amount = Math.abs(parseFloat(row['Credit']));
              }
              
              if (!dateValue || !description) continue;
              
              // Parse date
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
    
    // Add files with pending status
    const newFiles: UploadedFile[] = csvFiles.map(file => ({
      file,
      status: 'pending' as const,
      transactions: []
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Parse each file
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

  // Remove a file
  const removeFile = useCallback((file: File) => {
    setUploadedFiles(prev => prev.filter(f => f.file !== file));
  }, []);

  // Run analysis on all uploaded transactions
  const runAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    
    // Combine all transactions
    const allTransactions = uploadedFiles
      .filter(f => f.status === 'ready')
      .flatMap(f => f.transactions);
    
    // Find recurring transactions
    const recurring = findRecurringTransactions(allTransactions);
    
    setRecurringItems(recurring);
    setHasAnalyzed(true);
    setShowAiPrompt(true);
    setIsAnalyzing(false);
    
    toast({
      title: "Analysis complete",
      description: `Found ${recurring.length} recurring expenses.`
    });
  }, [uploadedFiles, toast]);

  // Update frequency for an item
  const updateFrequency = useCallback((id: string, frequency: RecurringTransaction['frequency']) => {
    setRecurringItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      return recalculateMonthlyEquivalent({ ...item, frequency });
    }));
  }, []);

  // Toggle exclude for an item
  const toggleExclude = useCallback((id: string) => {
    setRecurringItems(prev => prev.map(item => 
      item.id === id ? { ...item, isExcluded: !item.isExcluded } : item
    ));
  }, []);

  // Toggle row expansion
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

  // Get AI insights
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

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Check if ready to analyze
  const readyFiles = uploadedFiles.filter(f => f.status === 'ready');
  const canAnalyze = readyFiles.length > 0;
  const totalTransactions = readyFiles.reduce((sum, f) => sum + f.transactions.length, 0);

  // Drag and drop handlers
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

  // Confidence badge color
  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
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
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-lab-navy mb-3">
              True Monthly Cost Calculator
            </h1>
            <p className="text-xl text-lab-teal font-medium mb-4">
              What you ACTUALLY spend each month
            </p>
            <p className="text-lab-warm-gray max-w-xl mx-auto">
              That Amazon Prime subscription? That's $12.50/month you might not be counting. 
              Let's find all your recurring costs and calculate what you really spend.
            </p>
          </div>

          {/* Privacy Note */}
          <div className="bg-lab-sage/5 border border-lab-sage/20 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm text-lab-warm-gray">
              <span className="font-medium text-lab-sage">🔒 Your data stays private.</span>{" "}
              All analysis happens in your browser. Nothing is uploaded or stored.
            </p>
          </div>

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
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                      {summary.monthlyContribution > 0 && (
                        <div className="bg-background/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Monthly bills</p>
                          <p className="text-lg font-semibold text-lab-navy">{formatCurrency(summary.monthlyContribution)}</p>
                        </div>
                      )}
                      {summary.annualContribution > 0 && (
                        <div className="bg-background/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Annual (÷12)</p>
                          <p className="text-lg font-semibold text-lab-navy">{formatCurrency(summary.annualContribution)}</p>
                        </div>
                      )}
                      {summary.quarterlyContribution > 0 && (
                        <div className="bg-background/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Quarterly (÷3)</p>
                          <p className="text-lg font-semibold text-lab-navy">{formatCurrency(summary.quarterlyContribution)}</p>
                        </div>
                      )}
                      {summary.weeklyContribution > 0 && (
                        <div className="bg-background/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground">Weekly (×4.33)</p>
                          <p className="text-lg font-semibold text-lab-navy">{formatCurrency(summary.weeklyContribution)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hidden Costs Insights */}
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

              {/* AI Insights Prompt */}
              {showAiPrompt && !aiInsights && (
                <Card className="mb-8 bg-gradient-to-br from-purple-50 to-transparent border-purple-200/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <Sparkles className="text-purple-500 mt-0.5" size={20} />
                        <div>
                          <h3 className="font-semibold text-lab-navy mb-1">Want AI insights about your recurring costs?</h3>
                          <p className="text-sm text-muted-foreground">
                            Claude AI can spot overlapping subscriptions and potential savings.
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={getAiInsights}
                        disabled={isLoadingInsights}
                        variant="outline"
                        className="border-purple-300 hover:bg-purple-50"
                      >
                        {isLoadingInsights ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          "Get Insights"
                        )}
                      </Button>
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
                  {recurringItems.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No recurring expenses detected. Try uploading more transaction history.
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
                          {recurringItems.map((item) => (
                            <>
                              <TableRow 
                                key={item.id}
                                className={`${item.isExcluded ? 'opacity-50' : ''} cursor-pointer hover:bg-muted/50`}
                                onClick={() => toggleRowExpansion(item.id)}
                              >
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {expandedRows.has(item.id) ? (
                                      <ChevronUp size={14} className="text-muted-foreground" />
                                    ) : (
                                      <ChevronDown size={14} className="text-muted-foreground" />
                                    )}
                                    <div>
                                      <p className="font-medium text-lab-navy">{item.merchant}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        {getConfidenceBadge(item.confidence)}
                                        <span className="text-xs text-muted-foreground">
                                          {item.occurrences} occurrence{item.occurrences !== 1 ? 's' : ''}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                  <Select
                                    value={item.frequency}
                                    onValueChange={(val) => updateFrequency(item.id, val as RecurringTransaction['frequency'])}
                                  >
                                    <SelectTrigger className="w-[130px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="weekly">Weekly</SelectItem>
                                      <SelectItem value="monthly">Monthly</SelectItem>
                                      <SelectItem value="quarterly">Quarterly</SelectItem>
                                      <SelectItem value="annual">Annual</SelectItem>
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
                                <TableRow>
                                  <TableCell colSpan={5} className="bg-muted/30 p-0">
                                    <div className="p-4">
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

              {/* Start Over */}
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadedFiles([]);
                    setRecurringItems([]);
                    setHasAnalyzed(false);
                    setShowAiPrompt(false);
                    setAiInsights(null);
                    setExpandedRows(new Set());
                  }}
                >
                  Start Over with New Files
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default TrueMonthlyCost;
