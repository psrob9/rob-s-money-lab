import { useState, useCallback } from "react";
import { Layout } from "@/components/Layout";
import { Upload, FileText, Lock, ChevronDown, ChevronUp, RefreshCw, Download, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Papa from "papaparse";

interface Transaction {
  date: string;
  description: string;
  amount: number;
}

interface AnalysisResult {
  totalIn: number;
  totalOut: number;
  net: number;
  transactionCount: number;
  startDate: string;
  endDate: string;
  monthsSpan: number;
}

type ToolStep = "upload" | "processing" | "results";

const MoneySnapshot = () => {
  const [step, setStep] = useState<ToolStep>("upload");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formatHelpOpen, setFormatHelpOpen] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const parseAmount = (value: string | number): number => {
    if (typeof value === "number") return value;
    // Remove currency symbols, commas, and whitespace
    const cleaned = value.replace(/[$,\s]/g, "").trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const parseDate = (value: string): Date | null => {
    if (!value) return null;
    // Try common date formats
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;
    
    // Try MM/DD/YYYY
    const parts = value.split(/[\/\-]/);
    if (parts.length === 3) {
      const [a, b, c] = parts.map(p => parseInt(p, 10));
      // Assume MM/DD/YYYY or DD/MM/YYYY based on values
      if (a > 12) {
        return new Date(c, b - 1, a); // DD/MM/YYYY
      }
      return new Date(c, a - 1, b); // MM/DD/YYYY
    }
    return null;
  };

  const analyzeTransactions = (txns: Transaction[]): AnalysisResult => {
    let totalIn = 0;
    let totalOut = 0;
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    txns.forEach(txn => {
      if (txn.amount > 0) {
        totalIn += txn.amount;
      } else {
        totalOut += Math.abs(txn.amount);
      }

      const date = parseDate(txn.date);
      if (date) {
        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      }
    });

    const monthsSpan = minDate && maxDate 
      ? Math.max(1, Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
      : 1;

    return {
      totalIn,
      totalOut,
      net: totalIn - totalOut,
      transactionCount: txns.length,
      startDate: minDate ? minDate.toLocaleDateString() : "Unknown",
      endDate: maxDate ? maxDate.toLocaleDateString() : "Unknown",
      monthsSpan,
    };
  };

  const findColumn = (headers: string[], patterns: string[]): number => {
    const lowerHeaders = headers.map(h => h.toLowerCase().trim());
    for (const pattern of patterns) {
      const index = lowerHeaders.findIndex(h => h.includes(pattern.toLowerCase()));
      if (index !== -1) return index;
    }
    return -1;
  };

  const processCSV = (file: File) => {
    setStep("processing");
    setFileName(file.name);

    Papa.parse(file, {
      complete: (results) => {
        const rows = results.data as string[][];
        if (rows.length < 2) {
          // Not enough data
          setStep("upload");
          return;
        }

        // Find header row (first non-empty row)
        let headerIndex = 0;
        for (let i = 0; i < rows.length; i++) {
          if (rows[i].some(cell => cell && cell.trim())) {
            headerIndex = i;
            break;
          }
        }

        const headers = rows[headerIndex];
        const dataRows = rows.slice(headerIndex + 1);

        // Find relevant columns
        const dateCol = findColumn(headers, ["date", "posted", "transaction date"]);
        const descCol = findColumn(headers, ["description", "memo", "payee", "name", "merchant"]);
        const amountCol = findColumn(headers, ["amount", "sum", "total"]);
        const debitCol = findColumn(headers, ["debit", "withdrawal", "expense"]);
        const creditCol = findColumn(headers, ["credit", "deposit", "income"]);

        const parsedTransactions: Transaction[] = [];

        dataRows.forEach(row => {
          if (!row || row.length === 0 || !row.some(cell => cell && cell.trim())) return;

          let amount = 0;
          if (amountCol !== -1) {
            amount = parseAmount(row[amountCol] || "0");
          } else if (debitCol !== -1 || creditCol !== -1) {
            const debit = debitCol !== -1 ? parseAmount(row[debitCol] || "0") : 0;
            const credit = creditCol !== -1 ? parseAmount(row[creditCol] || "0") : 0;
            amount = credit - debit;
          }

          const date = dateCol !== -1 ? row[dateCol] || "" : "";
          const description = descCol !== -1 ? row[descCol] || "" : row[1] || "";

          if (date || description || amount !== 0) {
            parsedTransactions.push({ date, description, amount });
          }
        });

        if (parsedTransactions.length === 0) {
          setStep("upload");
          return;
        }

        setTransactions(parsedTransactions);
        setAnalysis(analyzeTransactions(parsedTransactions));
        setStep("results");
      },
      error: () => {
        setStep("upload");
      },
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      processCSV(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processCSV(file);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setTransactions([]);
    setAnalysis(null);
    setFileName("");
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Layout>
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-lab-navy mb-3">
              Money Snapshot
            </h1>
            <p className="text-xl text-lab-teal font-semibold mb-4">
              See where your money actually goes in 60 seconds
            </p>
            <p className="text-lab-warm-gray">
              Upload a bank statement CSV. Everything runs in your browser—your data never leaves your device.
            </p>
          </div>

          {/* Step 1: Upload */}
          {step === "upload" && (
            <div className="space-y-6">
              {/* Upload Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                  isDragging
                    ? "border-lab-teal bg-lab-teal/5"
                    : "border-border hover:border-lab-teal/50 hover:bg-secondary/30"
                }`}
              >
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload 
                  size={48} 
                  className={`mx-auto mb-4 transition-colors ${
                    isDragging ? "text-lab-teal" : "text-muted-foreground"
                  }`} 
                />
                <p className="text-lg font-medium text-lab-navy mb-2">
                  Drop your CSV here or click to browse
                </p>
                <p className="text-sm text-lab-warm-gray">
                  Most banks let you export transactions as CSV from your online banking.
                </p>
              </div>

              {/* Privacy Note */}
              <div className="flex items-start gap-3 p-4 bg-lab-teal/5 rounded-lg border border-lab-teal/20">
                <Lock size={20} className="text-lab-teal mt-0.5 flex-shrink-0" />
                <p className="text-sm text-lab-warm-gray">
                  <span className="font-medium text-lab-navy">Privacy first:</span> Your file is processed entirely in your browser. Nothing is uploaded to any server.
                </p>
              </div>

              {/* Format Help */}
              <Collapsible open={formatHelpOpen} onOpenChange={setFormatHelpOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm text-lab-teal hover:underline">
                  {formatHelpOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  What format do I need?
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-lab-warm-gray mb-3">
                    We look for these common columns in your CSV:
                  </p>
                  <ul className="text-sm text-lab-warm-gray space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Date</span>
                      <span>When the transaction happened</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Description</span>
                      <span>What/who the transaction was with</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">Amount</span>
                      <span>The dollar amount (negative = expense)</span>
                    </li>
                  </ul>
                  <p className="text-sm text-lab-warm-gray mt-3">
                    Most bank exports work automatically. We handle separate debit/credit columns too.
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}

          {/* Step 2: Processing */}
          {step === "processing" && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lab-teal/10 mb-6">
                <RefreshCw size={32} className="text-lab-teal animate-spin" />
              </div>
              <p className="text-lg font-medium text-lab-navy mb-2">Analyzing your transactions...</p>
              <p className="text-sm text-lab-warm-gray">{fileName}</p>
            </div>
          )}

          {/* Step 3: Results */}
          {step === "results" && analysis && (
            <div className="space-y-6">
              {/* File indicator */}
              <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <FileText size={16} className="text-lab-teal" />
                  <span className="text-lab-warm-gray">{fileName}</span>
                  <span className="text-muted-foreground">• {transactions.length} transactions</span>
                </div>
              </div>

              {/* The Big Picture */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-lab-navy flex items-center gap-2">
                    <DollarSign size={20} className="text-lab-teal" />
                    The Big Picture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-lab-sage/10 rounded-lg">
                      <div className="flex items-center gap-1 text-lab-sage mb-1">
                        <TrendingUp size={14} />
                        <span className="text-xs font-medium">Money In</span>
                      </div>
                      <p className="text-xl font-bold text-lab-navy">{formatCurrency(analysis.totalIn)}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-1 text-red-500 mb-1">
                        <TrendingDown size={14} />
                        <span className="text-xs font-medium">Money Out</span>
                      </div>
                      <p className="text-xl font-bold text-lab-navy">{formatCurrency(analysis.totalOut)}</p>
                    </div>
                    <div className={`p-4 rounded-lg ${analysis.net >= 0 ? "bg-lab-sage/10" : "bg-lab-amber/10"}`}>
                      <p className="text-xs font-medium text-lab-warm-gray mb-1">Net</p>
                      <p className={`text-xl font-bold ${analysis.net >= 0 ? "text-lab-sage" : "text-lab-amber"}`}>
                        {analysis.net >= 0 ? "+" : ""}{formatCurrency(analysis.net)}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-1 text-lab-warm-gray mb-1">
                        <Calendar size={14} />
                        <span className="text-xs font-medium">Period</span>
                      </div>
                      <p className="text-xl font-bold text-lab-navy">{analysis.monthsSpan} mo</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    {analysis.startDate} – {analysis.endDate}
                  </p>
                </CardContent>
              </Card>

              {/* Where It Goes */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-lab-navy">Where It Goes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center">
                    <p className="text-lab-warm-gray text-sm">Category breakdown coming soon</p>
                    <p className="text-muted-foreground text-xs mt-1">We're working on smart categorization</p>
                  </div>
                </CardContent>
              </Card>

              {/* Patterns */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-lab-navy">Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center">
                    <p className="text-lab-warm-gray text-sm">AI-powered insights coming soon</p>
                    <p className="text-muted-foreground text-xs mt-1">Get personalized observations about your spending</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  disabled
                >
                  <Download size={16} className="mr-2" />
                  Download summary
                </Button>
                <Button 
                  onClick={handleReset}
                  className="flex-1 bg-lab-teal hover:bg-lab-teal/90 text-white"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Start over
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default MoneySnapshot;
