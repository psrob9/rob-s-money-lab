import { useState, useCallback, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTransactionContext } from "@/contexts/TransactionContext";
import { Layout } from "@/components/Layout";
import { Upload, FileText, Lock, ChevronDown, ChevronUp, RefreshCw, Download, TrendingUp, TrendingDown, DollarSign, Calendar, ChevronRight, Sparkles, Loader2, Check, AlertCircle, Plus, X, Settings, CheckCircle2, Beaker, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Papa from "papaparse";
import { 
  getLearnedCategories, 
  addLearnedCategory, 
  removeLearnedCategory, 
  clearLearnedCategories, 
  matchLearnedCategory, 
  extractPattern,
  type LearnedCategory 
} from "@/utils/categoryLearning";
import { HeadlineInsightCard, QuickStatsBar, QuickWinsCard, SummaryCard, WhatsNextCard } from "@/components/money-snapshot";
import { EmailSignup } from "@/components/EmailSignup";
import { SAMPLE_PERSONA, getSampleTransactionsForMoneySnapshot } from "@/utils/sampleData";

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

interface CategoryBreakdown {
  name: string;
  total: number;
  percentage: number;
  color: string;
}

interface CategoryConfig {
  name: string;
  keywords: string[];
  color: string;
}

interface UploadedFile {
  id: string;
  name: string;
  transactions: Transaction[];
  dateRange: { start: string; end: string };
  status: 'parsing' | 'ready' | 'error';
  errorMessage?: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    name: "Housing",
    keywords: ["rent", "mortgage", "hoa", "property", "insurance", "home", "apartment", "lease", "wells fargo home", "chase home", "bank of america home", "citi mortgage", "quicken loans", "rocket mortgage", "guaranteed rate", "loandepot", "caliber home", "pennymac", "mr cooper", "nationstar", "loancare", "newrez", "carrington", "guild mortgage", "fairway", "freedom mortgage"],
    color: "bg-amber-500",
  },
  {
    name: "Food & Dining",
    keywords: ["restaurant", "doordash", "uber eats", "grubhub", "chipotle", "mcdonald", "starbucks", "dunkin", "pizza", "sushi", "thai", "chinese", "mexican", "burger", "cafe", "coffee", "diner", "grill", "kitchen", "bistro", "taco", "wing", "sub", "sandwich", "bakery", "deli", "bar & grill", "chick-fil-a", "wendy", "panera", "five guys", "sweetgreen", "cava", "oats overnight", "daily harvest", "factor", "hello fresh", "blue apron", "freshly", "smoothie", "juice", "acai", "poke", "panda express", "kfc", "popeyes", "sonic", "arby", "jack in the box", "in-n-out", "whataburger", "culver", "wingstop", "buffalo wild", "applebee", "chili", "olive garden", "red lobster", "outback", "longhorn", "texas roadhouse", "cracker barrel", "ihop", "waffle house", "denny", "golden corral", "pizza hut", "domino", "papa john", "little caesar", "blaze pizza", "mod pizza", "just salad", "dig", "honeygrow", "chopd", "chopt", "mendocino", "true food", "flower child", "native grill", "first watch", "snooze", "another broken egg", "wild eggs", "hash house", "original pancake house", "olo", "toast tab", "square meal", "resy"],
    color: "bg-orange-500",
  },
  {
    name: "Groceries",
    keywords: ["walmart", "kroger", "safeway", "trader joe", "whole foods", "aldi", "costco", "target", "publix", "heb", "wegmans", "giant", "food lion", "stop & shop", "sprouts", "grocery", "market", "supermarket", "albertsons", "vons", "ralphs", "meijer", "winco", "harris teeter", "shoprite", "acme", "giant eagle", "jewel", "schnucks", "hy-vee", "hyvee", "cub foods", "lidl", "fresh market", "erewhon", "gelson", "raley", "lucky", "foodmaxx", "save mart", "price chopper"],
    color: "bg-green-500",
  },
  {
    name: "Transportation",
    keywords: ["uber", "lyft", "gas", "shell", "chevron", "exxon", "bp", "mobil", "speedway", "wawa", "parking", "toll", "metro", "transit", "amtrak", "airline", "united", "delta", "american air", "southwest", "spirit", "frontier", "swa", "jetblue", "alaska air", "united air", "delta air", "ev charge", "chargepoint", "electrify", "evgo", "plugshare", "tesla supercharger", "hertz", "enterprise", "avis", "budget rental", "national car", "turo", "luggage", "bag fee", "excs_bag", "blink charging", "volta", "rivian", "zipcar", "bird", "lime", "spin", "veo", "citibike", "citi bike", "capital bikeshare", "divvy", "bay wheels"],
    color: "bg-blue-500",
  },
  {
    name: "Shopping",
    keywords: ["amazon", "ebay", "etsy", "best buy", "home depot", "lowes", "ikea", "wayfair", "tj maxx", "marshalls", "ross", "nordstrom", "macy", "kohls", "old navy", "gap", "nike", "adidas", "apple store", "mack weldon", "bonobos", "untuckit", "bombas", "allbirds", "everlane", "simply to impress", "push pin", "rockdoodles", "foggy dog", "chewy", "barkbox", "pet", "depop", "poshmark", "mercari", "offerup", "fb marketplace", "thredup", "realreal", "vestiaire", "stockx", "goat", "grailed", "vuori", "lululemon", "athleta", "fabletics", "gymshark", "alo", "beyond yoga", "outdoor voices", "girlfriend collective", "prana", "patagonia", "rei", "north face", "columbia", "carhartt", "dickies", "duluth", "ll bean", "lands end", "eddie bauer", "orvis", "fjallraven", "herschel", "away", "calpak", "samsonite", "tumi", "rimowa", "coach", "kate spade", "michael kors", "tory burch", "marc jacobs", "reformation", "sezane"],
    color: "bg-purple-500",
  },
  {
    name: "Subscriptions & Entertainment",
    keywords: ["netflix", "spotify", "hulu", "disney+", "hbo", "youtube", "apple music", "amazon prime", "audible", "kindle", "patreon", "twitch", "playstation", "xbox", "steam", "nintendo", "movie", "cinema", "theater", "amc", "regal", "onlyfans", "ccbill", "nytimes", "new york times", "wsj", "wall street", "washington post", "wapo", "reuters", "prime video", "peacock", "paramount+", "max", "discovery+", "showtime", "starz", "crunchyroll", "claude", "anthropic", "openai", "chatgpt", "lovable", "github", "figma", "notion", "canva", "substack", "medium", "icloud", "dropbox", "google one", "google storage", "adobe", "creative cloud", "nyt cooking", "nyt games", "apple.com/bill", "apple one", "apple tv", "apple arcade", "apple fitness", "apple storage", "google play", "play store", "youtube music", "youtube premium", "youtube tv", "espn+", "dazn", "fubo", "sling", "philo", "nyt", "economist", "atlantic", "new yorker", "npm", "vercel", "netlify", "heroku", "aws", "azure", "digitalocean", "supabase", "firebase", "mongodb", "planetscale", "cursor", "replit", "1password", "lastpass", "nordvpn", "expressvpn", "protonvpn", "backblaze", "zoom", "slack", "microsoft 365", "office 365", "google workspace", "evernote", "todoist", "discord nitro"],
    color: "bg-pink-500",
  },
  {
    name: "Travel & Entertainment",
    keywords: ["vacaya", "atlantis events", "rsvp vacations", "cruise", "hotel", "airbnb", "vrbo", "marriott", "hilton", "hyatt", "resort", "travel", "booking.com", "expedia", "kayak", "tripadvisor", "hotwire", "travelzoo", "going", "lonely planet", "opentable", "tock"],
    color: "bg-cyan-500",
  },
  {
    name: "Utilities & Bills",
    keywords: ["electric", "water", "gas bill", "internet", "comcast", "verizon", "at&t", "t-mobile", "sprint", "xfinity", "spectrum", "cox", "power", "utility", "sewage", "trash", "waste", "att", "fios", "centurylink", "hughesnet", "starlink", "mint mobile", "visible", "us mobile", "cricket", "metro by t-mobile", "boost", "straight talk", "google fi", "geico", "progressive", "state farm", "allstate", "farmers", "usaa", "liberty mutual", "nationwide", "travelers", "lemonade", "hippo", "metromile", "root"],
    color: "bg-slate-500",
  },
  {
    name: "Healthcare",
    keywords: ["pharmacy", "cvs", "walgreens", "doctor", "hospital", "medical", "dental", "vision", "health", "urgent care", "clinic", "lab", "prescription", "rx", "caremark", "optumrx", "express scripts", "cigna pharmacy", "humana pharmacy", "flexcard", "otc card", "flex card", "fsa", "hsa", "hra", "healthequity", "wageworks"],
    color: "bg-red-500",
  },
  {
    name: "Donations & Memberships",
    keywords: ["donation", "donate", "charity", "church", "temple", "mosque", "synagogue", "chorus", "orchestra", "symphony", "museum", "zoo", "npr", "pbs", "aclu", "hrc", "planned parenthood", "united way", "red cross", "gofundme", "spca", "humane", "shelter", "animal rescue", "pet rescue", "dog rescue", "cat rescue", "wildlife", "conservation", "nature", "sierra", "audubon", "wwf", "greenpeace", "earthjustice", "nrdc", "naacp", "splc", "girl scouts", "boy scouts", "big brothers", "big sisters", "volunteer", "rotary", "kiwanis", "lions club", "vfw", "american legion"],
    color: "bg-violet-500",
  },
  {
    name: "Transfers & Payments",
    keywords: ["transfer", "payment", "paypal", "venmo", "zelle", "cash app", "wire", "ach", "direct deposit"],
    color: "bg-gray-400",
  },
  {
    name: "Income",
    keywords: ["payroll", "direct deposit", "salary", "deposit", "refund", "reimbursement"],
    color: "bg-emerald-500",
  },
];

// Clean description by stripping common payment processor prefixes
const cleanDescription = (description: string): string => {
  let cleaned = description;
  
  // Strip common prefixes
  const prefixes = ["GOOGLE *", "SQ *", "SQC*", "PAYPAL *", "PP*"];
  for (const prefix of prefixes) {
    if (cleaned.toUpperCase().startsWith(prefix)) {
      cleaned = cleaned.substring(prefix.length);
      break;
    }
  }
  
  return cleaned;
};

const categorizeTransaction = (description: string, amount: number): { category: string; color: string } => {
  const originalDesc = description.toLowerCase();
  const upperDesc = description.toUpperCase();
  const cleanedDesc = cleanDescription(description).toLowerCase();
  
  // === USER-TAUGHT CATEGORIES (check FIRST - highest priority) ===
  const learnedCategory = matchLearnedCategory(description);
  if (learnedCategory) {
    const cat = CATEGORIES.find(c => c.name === learnedCategory);
    if (cat) return { category: cat.name, color: cat.color };
  }
  
  // === PATTERN-BASED RULES (check BEFORE keywords) ===
  
  // 1. AMZN patterns → Shopping
  if (upperDesc.includes("AMZN") || upperDesc.includes("AMAZON")) {
    const cat = CATEGORIES.find(c => c.name === "Shopping");
    return { category: cat!.name, color: cat!.color };
  }
  
  // 2. Toast/Restaurant POS → Food & Dining
  if (upperDesc.startsWith("TST*") || upperDesc.startsWith("TST ") || upperDesc.includes("TOAST TAB")) {
    const cat = CATEGORIES.find(c => c.name === "Food & Dining");
    return { category: cat!.name, color: cat!.color };
  }
  
  // 3. Apple billing → Subscriptions
  if (upperDesc.includes("APPLE.COM/BILL") || upperDesc.includes("APPLE.COM BILL") || 
      upperDesc.includes("APPLE MUSIC") || upperDesc.includes("APPLE TV") || upperDesc.includes("APPLE ONE")) {
    const cat = CATEGORIES.find(c => c.name === "Subscriptions & Entertainment");
    return { category: cat!.name, color: cat!.color };
  }
  
  // 4. Fee patterns → Utilities & Bills
  if (upperDesc.includes("SERVICE FEE") || upperDesc.includes("MONTHLY FEE") || 
      upperDesc.includes("MAINTENANCE FEE") || upperDesc.includes("SERVICE CHG") || upperDesc.includes("ACCOUNT FEE")) {
    const cat = CATEGORIES.find(c => c.name === "Utilities & Bills");
    return { category: cat!.name, color: cat!.color };
  }
  
  // 5. ATM/Cash → Transfers
  if (upperDesc.includes("ATM") || upperDesc.includes("CASH WITHDRAWAL") || 
      upperDesc.includes("CASH BACK") || upperDesc.startsWith("CHECK ") || upperDesc.startsWith("CHK ")) {
    const cat = CATEGORIES.find(c => c.name === "Transfers & Payments");
    return { category: cat!.name, color: cat!.color };
  }
  
  // 6. Payroll/Income patterns (with positive amount) → Income
  if (amount > 0) {
    if (upperDesc.includes("PAYROLL") || upperDesc.includes("DIRECT DEP") || 
        upperDesc.includes("DIR DEP") || upperDesc.includes("ACH DEPOSIT") || upperDesc.includes("SALARY")) {
      const cat = CATEGORIES.find(c => c.name === "Income");
      return { category: cat!.name, color: cat!.color };
    }
    // Also check keyword-based income
    const incomeCategory = CATEGORIES.find(c => c.name === "Income");
    if (incomeCategory && incomeCategory.keywords.some(k => cleanedDesc.includes(k) || originalDesc.includes(k))) {
      return { category: incomeCategory.name, color: incomeCategory.color };
    }
  }
  
  // === KEYWORD MATCHING ===
  for (const cat of CATEGORIES) {
    if (cat.name === "Income") continue; // Skip income for expenses
    if (cat.keywords.some(keyword => cleanedDesc.includes(keyword) || originalDesc.includes(keyword))) {
      return { category: cat.name, color: cat.color };
    }
  }
  
  // === FALLBACK PATTERNS (after keyword matching fails) ===
  
  // Square/Shopify fallbacks → Shopping
  if (upperDesc.startsWith("SQ *") || upperDesc.startsWith("SQU*") || 
      upperDesc.startsWith("SP ") || upperDesc.startsWith("SHP*") || upperDesc.includes("SHOPIFY")) {
    // Only if not already matched by keywords (and not spotify)
    if (!originalDesc.includes("spotify")) {
      const cat = CATEGORIES.find(c => c.name === "Shopping");
      return { category: cat!.name, color: cat!.color };
    }
  }
  
  return { category: "Needs Review", color: "bg-amber-400" };
};

const calculateCategoryBreakdown = (txns: Transaction[]): CategoryBreakdown[] => {
  const categoryTotals: Record<string, { total: number; color: string }> = {};
  
  // Only process expenses (negative amounts), exclude transfers
  txns.forEach(txn => {
    if (txn.amount >= 0) return; // Skip income
    
    const { category, color } = categorizeTransaction(txn.description, txn.amount);
    if (category === "Transfers & Payments" || category === "Income") return; // Skip transfers from spending
    
    const absAmount = Math.abs(txn.amount);
    if (!categoryTotals[category]) {
      categoryTotals[category] = { total: 0, color };
    }
    categoryTotals[category].total += absAmount;
  });
  
  // Calculate total spending
  const totalSpending = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.total, 0);
  
  // Convert to array and sort by total (highest first)
  let breakdown = Object.entries(categoryTotals)
    .map(([name, { total, color }]) => ({
      name,
      total,
      percentage: totalSpending > 0 ? (total / totalSpending) * 100 : 0,
      color,
    }))
    .sort((a, b) => b.total - a.total);
  
  // If more than 8 categories, group the rest as "Other"
  if (breakdown.length > 8) {
    const top8 = breakdown.slice(0, 8);
    const rest = breakdown.slice(8);
    const otherTotal = rest.reduce((sum, cat) => sum + cat.total, 0);
    const otherPercentage = rest.reduce((sum, cat) => sum + cat.percentage, 0);
    
    breakdown = [
      ...top8,
      { name: "Other", total: otherTotal, percentage: otherPercentage, color: "bg-neutral-300" },
    ];
  }
  
  return breakdown;
};

type ToolStep = "upload" | "managing" | "results";

const MoneySnapshot = () => {
  const { setSharedData } = useTransactionContext();
  const [step, setStep] = useState<ToolStep>("upload");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [formatHelpOpen, setFormatHelpOpen] = useState(false);
  const [uncategorizedOpen, setUncategorizedOpen] = useState(false);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [filesExpanded, setFilesExpanded] = useState(false);
  
  // Sample data state
  const [isSampleData, setIsSampleData] = useState(false);
  
  // Category teaching state
  const [teachingTransaction, setTeachingTransaction] = useState<Transaction | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [learnedCategories, setLearnedCategories] = useState<LearnedCategory[]>([]);
  const [learnedRulesOpen, setLearnedRulesOpen] = useState(false);

  // Load learned categories on mount
  useEffect(() => {
    setLearnedCategories(getLearnedCategories());
  }, []);

  // Computed values from files
  const allTransactions = useMemo(() => {
    return files
      .filter(f => f.status === 'ready')
      .flatMap(f => f.transactions);
  }, [files]);

  const readyFiles = useMemo(() => files.filter(f => f.status === 'ready'), [files]);

  const combinedDateRange = useMemo(() => {
    if (readyFiles.length === 0) return null;
    
    let earliest: Date | null = null;
    let latest: Date | null = null;
    
    readyFiles.forEach(file => {
      const start = new Date(file.dateRange.start);
      const end = new Date(file.dateRange.end);
      
      if (!isNaN(start.getTime()) && (!earliest || start < earliest)) {
        earliest = start;
      }
      if (!isNaN(end.getTime()) && (!latest || end > latest)) {
        latest = end;
      }
    });
    
    if (!earliest || !latest) return null;
    
    return {
      start: earliest.toLocaleDateString(),
      end: latest.toLocaleDateString()
    };
  }, [readyFiles]);

  const totalTransactionCount = useMemo(() => {
    return readyFiles.reduce((sum, f) => sum + f.transactions.length, 0);
  }, [readyFiles]);

  // Get first 20 uncategorized transactions for debug view
  const uncategorizedTransactions = useMemo(() => {
    return allTransactions
      .filter(txn => {
        if (txn.amount >= 0) return false; // Skip income
        const { category } = categorizeTransaction(txn.description, txn.amount);
        return category === "Needs Review";
      })
      .slice(0, 20);
  }, [allTransactions, learnedCategories]);

  // Count all uncategorized transactions
  const uncategorizedCount = useMemo(() => {
    return allTransactions.filter(txn => {
      if (txn.amount >= 0) return false;
      const { category } = categorizeTransaction(txn.description, txn.amount);
      return category === "Needs Review";
    }).length;
  }, [allTransactions, learnedCategories]);

  // Refresh category breakdown when learned categories change
  const refreshAnalysis = useCallback(() => {
    if (allTransactions.length > 0) {
      const breakdown = calculateCategoryBreakdown(allTransactions);
      setCategoryBreakdown(breakdown);
    }
  }, [allTransactions]);

  // Available categories for teaching (exclude Income, Transfers, Uncategorized)
  const teachableCategories = useMemo(() => {
    return CATEGORIES.filter(c => 
      c.name !== "Income" && 
      c.name !== "Transfers & Payments" && 
      c.name !== "Uncategorized"
    );
  }, []);

  // Handle teaching a category
  const handleTeachCategory = useCallback(() => {
    if (!teachingTransaction || !selectedCategory) return;
    
    const pattern = extractPattern(teachingTransaction.description);
    addLearnedCategory(pattern, selectedCategory);
    
    // Update local state
    setLearnedCategories(getLearnedCategories());
    
    // Refresh the analysis
    refreshAnalysis();
    
    // Show feedback
    toast.success(`Got it! Future transactions like "${pattern}" will be categorized as ${selectedCategory}.`);
    
    // Close dialog
    setTeachingTransaction(null);
    setSelectedCategory("");
  }, [teachingTransaction, selectedCategory, refreshAnalysis]);

  // Handle removing a learned category
  const handleRemoveLearnedCategory = useCallback((pattern: string) => {
    removeLearnedCategory(pattern);
    setLearnedCategories(getLearnedCategories());
    refreshAnalysis();
    toast.success("Rule removed");
  }, [refreshAnalysis]);

  // Handle clearing all learned categories
  const handleClearAllLearned = useCallback(() => {
    clearLearnedCategories();
    setLearnedCategories([]);
    refreshAnalysis();
    toast.success("All custom rules cleared");
    setLearnedRulesOpen(false);
  }, [refreshAnalysis]);

  const fetchInsights = useCallback(async () => {
    if (!analysis || categoryBreakdown.length === 0) return;
    
    setInsightsLoading(true);
    setInsightsError(null);
    
    try {
      const response = await fetch(
        "https://kjshbagskpzfbpfpucvq.supabase.co/functions/v1/generate-insights",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            totalIn: analysis.totalIn,
            totalOut: analysis.totalOut,
            net: analysis.net,
            monthsSpan: analysis.monthsSpan,
            categories: categoryBreakdown.map(cat => ({
              name: cat.name,
              total: cat.total,
              percentage: cat.percentage,
            })),
            uncategorizedCount,
            transactionCount: allTransactions.length,
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to get insights");
      }
      
      setInsights(data.insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      setInsightsError("Couldn't get insights right now. Want to try again?");
    } finally {
      setInsightsLoading(false);
    }
  }, [analysis, categoryBreakdown, uncategorizedCount, allTransactions.length]);

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

  const calculateDateRange = (txns: Transaction[]): { start: string; end: string } => {
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    txns.forEach(txn => {
      const date = parseDate(txn.date);
      if (date) {
        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      }
    });

    return {
      start: minDate ? minDate.toLocaleDateString() : "Unknown",
      end: maxDate ? maxDate.toLocaleDateString() : "Unknown"
    };
  };

  const parseCSVFile = (file: File, fileId: string) => {
    Papa.parse(file, {
      complete: (results) => {
        const rows = results.data as string[][];
        if (rows.length < 2) {
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'error' as const, errorMessage: 'Not enough data' }
              : f
          ));
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
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, status: 'error' as const, errorMessage: 'No transactions found' }
              : f
          ));
          return;
        }

        const dateRange = calculateDateRange(parsedTransactions);

        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'ready' as const, transactions: parsedTransactions, dateRange }
            : f
        ));
      },
      error: () => {
        setFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error' as const, errorMessage: 'Failed to parse file' }
            : f
        ));
      },
    });
  };

  const addFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = [];
    const filesToParse: { file: File; id: string }[] = [];
    
    Array.from(fileList).forEach(file => {
      // Case-insensitive check for .csv extension
      if (!file.name.toLowerCase().endsWith('.csv')) return;
      
      const fileId = crypto.randomUUID();
      newFiles.push({
        id: fileId,
        name: file.name,
        transactions: [],
        dateRange: { start: '', end: '' },
        status: 'parsing'
      });
      filesToParse.push({ file, id: fileId });
    });
    
    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      setStep("managing");
      
      // Parse files after state update is scheduled
      filesToParse.forEach(({ file, id }) => {
        parseCSVFile(file, id);
      });
    }
  }, []);

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      if (updated.length === 0) {
        setStep("upload");
      }
      return updated;
    });
  };

  const analyzeAllFiles = () => {
    if (allTransactions.length === 0) return;
    
    setAnalysis(analyzeTransactions(allTransactions));
    setCategoryBreakdown(calculateCategoryBreakdown(allTransactions));
    setStep("results");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    // Reset input so same files can be selected again
    e.target.value = '';
  };

  const handleReset = () => {
    setStep("upload");
    setFiles([]);
    setAnalysis(null);
    setCategoryBreakdown([]);
    setInsights(null);
    setInsightsError(null);
    setInsightsLoading(false);
    setFilesExpanded(false);
    setIsSampleData(false);
  };

  const handleLoadSampleData = useCallback(() => {
    const sampleTxns = getSampleTransactionsForMoneySnapshot();
    
    // Create synthetic file entry
    const sampleFile: UploadedFile = {
      id: 'sample-data',
      name: `Sample Data: ${SAMPLE_PERSONA.name}`,
      transactions: sampleTxns,
      dateRange: { start: '1/1/2025', end: '12/31/2025' },
      status: 'ready'
    };
    
    setFiles([sampleFile]);
    setIsSampleData(true);
    
    // Run analysis immediately
    const analysisResult = analyzeTransactions(sampleTxns);
    setAnalysis(analysisResult);
    setCategoryBreakdown(calculateCategoryBreakdown(sampleTxns));
    setStep("results");
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Download results as CSV
  const handleDownloadResults = useCallback(() => {
    if (allTransactions.length === 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    const filename = `money-snapshot-${today}.csv`;
    
    // Build CSV content
    const headers = ['Date', 'Description', 'Amount', 'Category'];
    const rows = allTransactions.map(txn => {
      const { category } = categorizeTransaction(txn.description, txn.amount);
      return [
        txn.date,
        `"${txn.description.replace(/"/g, '""')}"`,
        txn.amount.toFixed(2),
        category
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
    
    toast.success('Results downloaded!');
  }, [allTransactions]);

  const isParsing = files.some(f => f.status === 'parsing');

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <div className="text-4xl mb-4">📊</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-lab-navy mb-4">
            Money Snapshot
          </h1>
          <p className="text-xl text-lab-warm-gray mb-2">
            Where does your money actually go?
          </p>
          <p className="text-xl text-lab-warm-gray mb-6">
            Find out in 60 seconds.
          </p>
          <p className="text-lab-warm-gray mb-8">
            No account needed. Your files never leave your browser.
          </p>

          {step === "upload" && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => document.getElementById('hero-file-input')?.click()}
                className="bg-lab-teal hover:bg-lab-teal/90 text-white px-8"
                size="lg"
              >
                Upload CSV
              </Button>
              <input
                id="hero-file-input"
                type="file"
                accept=".csv"
                multiple
                onChange={handleFileSelect}
                className="hidden"
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
      {step === "upload" && (
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
                          You have bank statements but no clear picture of spending
                        </li>
                        <li className="flex items-start gap-2 text-sm text-lab-warm-gray">
                          <Check className="h-4 w-4 text-lab-sage mt-0.5 shrink-0" />
                          You want quick insights without setting up a budget system
                        </li>
                        <li className="flex items-start gap-2 text-sm text-lab-warm-gray">
                          <Check className="h-4 w-4 text-lab-sage mt-0.5 shrink-0" />
                          You're curious where your money actually goes
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-lab-navy mb-3">This tool may not be right if:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-lab-warm-gray">
                          <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                          You already use YNAB or Monarch and track everything
                        </li>
                        <li className="flex items-start gap-2 text-sm text-lab-warm-gray">
                          <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                          You need ongoing budget tracking (this is one-time analysis)
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
          </div>
        </section>
      )}

      {/* Upload Section */}
      <section className="pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {/* Step 1: Upload */}
          {step === "upload" && (
            <Card className="p-6">
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
                    multiple
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <Upload
                    size={48}
                    className={`mx-auto mb-4 transition-colors ${
                      isDragging ? "text-lab-teal" : "text-muted-foreground"
                    }`}
                  />
                  <p className="text-lg font-medium text-lab-navy mb-2">
                    Drop your CSV files here or click to browse
                  </p>
                  <p className="text-sm text-lab-warm-gray">
                    Upload from multiple bank accounts and credit cards at once.
                  </p>
                </div>

                {/* Bank Export Instructions */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-lab-teal hover:underline">
                    <ChevronDown size={16} className="transition-transform [[data-state=open]_&]:rotate-180" />
                    How do I get a CSV from my bank?
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 p-4 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-lab-warm-gray mb-3">
                      Most banks let you export transactions as CSV. Here's how:
                    </p>
                    <ul className="text-sm text-lab-warm-gray space-y-2">
                      <li><strong>Chase:</strong> Statements → Download → CSV</li>
                      <li><strong>Bank of America:</strong> Activity → Export → Spreadsheet</li>
                      <li><strong>Wells Fargo:</strong> Download Account Activity → CSV</li>
                      <li><strong>Capital One:</strong> Download Transactions → CSV</li>
                      <li><strong>Discover:</strong> Statements → Export → Excel/CSV</li>
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3">
                      Can't find the option? Search "[your bank] export CSV" for specific instructions.
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </Card>
          )}

          {/* Step 2: Managing Files */}
          {step === "managing" && (
            <div className="space-y-6">
              {/* File List */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-lab-navy">Your Files</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {files.map(file => (
                    <div 
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/50"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {file.status === 'parsing' && (
                          <Loader2 size={18} className="text-lab-teal animate-spin flex-shrink-0" />
                        )}
                        {file.status === 'ready' && (
                          <Check size={18} className="text-lab-sage flex-shrink-0" />
                        )}
                        {file.status === 'error' && (
                          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-lab-navy truncate">{file.name}</p>
                          {file.status === 'ready' && (
                            <p className="text-xs text-muted-foreground">
                              {file.dateRange.start} – {file.dateRange.end} • {file.transactions.length} transactions
                            </p>
                          )}
                          {file.status === 'parsing' && (
                            <p className="text-xs text-muted-foreground">Parsing...</p>
                          )}
                          {file.status === 'error' && (
                            <p className="text-xs text-red-500">{file.errorMessage || "Couldn't read this file"}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => removeFile(file.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}

                  {/* Add More Files */}
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv"
                      multiple
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-lg hover:border-lab-teal/50 hover:bg-secondary/30 transition-colors cursor-pointer">
                      <Plus size={16} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Add more files</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Combined Summary */}
              {readyFiles.length > 0 && (
                <div className="p-4 bg-lab-teal/5 rounded-lg border border-lab-teal/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-lab-navy">Combined</p>
                      <p className="text-xs text-muted-foreground">
                        {totalTransactionCount} transactions
                        {combinedDateRange && ` • ${combinedDateRange.start} – ${combinedDateRange.end}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              <Button
                onClick={analyzeAllFiles}
                disabled={readyFiles.length === 0 || isParsing}
                className="w-full bg-lab-teal hover:bg-lab-teal/90 text-white py-6 text-lg"
              >
                {isParsing ? (
                  <>
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Processing files...
                  </>
                ) : (
                  <>
                    Analyze {readyFiles.length === 1 ? 'File' : `All ${readyFiles.length} Files`}
                  </>
                )}
              </Button>

              {/* Privacy Note */}
              <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                <Lock size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  All processing happens in your browser. Your transactions never leave your device.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === "results" && analysis && (
            <div className="space-y-6">
              {/* Sample Data Banner */}
              {isSampleData && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-lab-amber/10 border border-lab-amber/30 rounded-lg">
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

              {/* 1. Headline Insight Card - ABOVE THE FOLD */}
              <HeadlineInsightCard
                totalIn={analysis.totalIn}
                totalOut={analysis.totalOut}
                net={analysis.net}
                monthsSpan={analysis.monthsSpan}
                categoryBreakdown={categoryBreakdown}
                uncategorizedPercentage={
                  categoryBreakdown.find(c => c.name === "Uncategorized")?.percentage || 0
                }
              />

              {/* 2. Quick Stats Bar */}
              <QuickStatsBar
                monthsSpan={analysis.monthsSpan}
                transactionCount={totalTransactionCount}
                fileCount={readyFiles.length}
              />

              {/* 3. The Big Picture */}
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
                    {analysis.monthsSpan > 1 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ~{formatCurrency(Math.round(analysis.totalIn / analysis.monthsSpan))}/mo
                      </p>
                    )}
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-1 text-red-500 mb-1">
                      <TrendingDown size={14} />
                      <span className="text-xs font-medium">Money Out</span>
                    </div>
                    <p className="text-xl font-bold text-lab-navy">{formatCurrency(analysis.totalOut)}</p>
                    {analysis.monthsSpan > 1 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        ~{formatCurrency(Math.round(analysis.totalOut / analysis.monthsSpan))}/mo
                      </p>
                    )}
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

              {/* 4. Summary */}
              <SummaryCard
                totalIn={analysis.totalIn}
                totalOut={analysis.totalOut}
                net={analysis.net}
                monthsSpan={analysis.monthsSpan}
                transactionCount={totalTransactionCount}
                topCategories={categoryBreakdown.slice(0, 3).map(c => c.name)}
              />

              {/* 5. Where It Goes */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-lab-navy">Where It Goes</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryBreakdown.length > 0 ? (
                    <div className="space-y-3">
                      {categoryBreakdown.map((cat) => {
                        const maxPercentage = categoryBreakdown[0]?.percentage || 100;
                        const barWidth = (cat.percentage / maxPercentage) * 100;
                        
                        // Make Needs Review expandable for debugging
                        if (cat.name === "Needs Review" && uncategorizedTransactions.length > 0) {
                          return (
                            <Collapsible 
                              key={cat.name} 
                              open={uncategorizedOpen} 
                              onOpenChange={setUncategorizedOpen}
                            >
                              <CollapsibleTrigger className="w-full text-left">
                                <div className="space-y-1 p-1 -m-1 rounded-lg hover:bg-lab-amber/10 transition-colors cursor-pointer">
                                  <div className="flex items-center justify-between text-sm">
                                    <div>
                                      <span className="font-medium text-lab-amber flex items-center gap-1">
                                        <ChevronRight 
                                          size={14} 
                                          className={`transition-transform ${uncategorizedOpen ? 'rotate-90' : ''}`} 
                                        />
                                        {cat.name}
                                      </span>
                                      {!uncategorizedOpen && (
                                        <p className="text-xs text-muted-foreground ml-5 mt-0.5">Click to help categorize these</p>
                                      )}
                                    </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-lab-navy">{formatCurrency(cat.total)}</span>
                              <span className="text-muted-foreground text-xs w-12 text-right">
                                {cat.percentage.toFixed(1)}%
                              </span>
                            </div>
                            {analysis.monthsSpan > 1 && (
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(Math.round(cat.total / analysis.monthsSpan))}/mo avg
                              </span>
                            )}
                          </div>
                                  </div>
                                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${cat.color} opacity-70 rounded-full transition-all duration-500`}
                                      style={{ width: `${barWidth}%` }}
                                    />
                                  </div>
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="mt-2 ml-4 p-3 bg-lab-amber/5 rounded-lg border border-lab-amber/20">
                                  <p className="text-xs text-lab-amber font-medium mb-3">
                                    These transactions need your help to categorize. Click any to teach me!
                                  </p>
                                  <ScrollArea className="max-h-[200px]">
                                    <div className="space-y-0">
                                      {uncategorizedTransactions.map((txn, idx) => (
                                        <button 
                                          key={idx}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setTeachingTransaction(txn);
                                          }}
                                          className="flex items-center justify-between w-full text-sm text-muted-foreground py-2.5 px-2 -mx-2 border-b border-border/30 last:border-0 cursor-pointer hover:bg-lab-amber/10 rounded-md transition-colors group text-left"
                                        >
                                          <span className="truncate max-w-[200px] sm:max-w-[280px] group-hover:text-lab-amber" title="Click to categorize">
                                            {txn.description.length > 50 
                                              ? txn.description.substring(0, 50) + "..." 
                                              : txn.description}
                                          </span>
                                          <span className="font-mono font-medium text-lab-navy ml-2 flex-shrink-0">
                                            {formatCurrency(Math.abs(txn.amount))}
                                          </span>
                                        </button>
                                      ))}
                                    </div>
                                  </ScrollArea>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        }
                        
                        return (
                          <div key={cat.name} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-lab-navy">{cat.name}</span>
                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-lab-navy">{formatCurrency(cat.total)}</span>
                                  <span className="text-muted-foreground text-xs w-12 text-right">
                                    {cat.percentage.toFixed(1)}%
                                  </span>
                                </div>
                                {analysis.monthsSpan > 1 && (
                                  <span className="text-xs text-muted-foreground">
                                    {formatCurrency(Math.round(cat.total / analysis.monthsSpan))}/mo avg
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={`h-full ${cat.color} opacity-70 rounded-full transition-all duration-500`}
                                style={{ width: `${barWidth}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      <div className="text-xs text-muted-foreground mt-4 pt-2 border-t border-border">
                        <p>Categories detected automatically based on transaction descriptions</p>
                        {learnedCategories.length > 0 && (
                          <button 
                            onClick={() => setLearnedRulesOpen(true)}
                            className="text-lab-teal hover:underline mt-1 flex items-center gap-1"
                          >
                            <Settings size={12} />
                            + {learnedCategories.length} custom rule{learnedCategories.length !== 1 ? 's' : ''} you've taught
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-lab-warm-gray text-sm">No spending categories detected</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 6. Quick Wins */}
              <QuickWinsCard
                categoryBreakdown={categoryBreakdown}
                monthsSpan={analysis.monthsSpan}
                totalOut={analysis.totalOut}
              />

              {/* 7. Patterns (AI Insights) */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-lab-navy flex items-center gap-2">
                    <Sparkles size={20} className="text-lab-amber" />
                    Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {insightsLoading && (
                    <div className="py-8 text-center">
                      <Loader2 size={24} className="mx-auto mb-3 text-lab-teal animate-spin" />
                      <p className="text-lab-warm-gray text-sm">Analyzing your patterns...</p>
                    </div>
                  )}
                  
                  {insightsError && !insightsLoading && (
                    <div className="py-6 text-center">
                      <p className="text-lab-warm-gray text-sm mb-4">{insightsError}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={fetchInsights}
                        className="text-lab-teal border-lab-teal/30 hover:bg-lab-teal/5"
                      >
                        <RefreshCw size={14} className="mr-2" />
                        Try again
                      </Button>
                    </div>
                  )}
                  
                  {insights && !insightsLoading && (
                    <div className="space-y-4">
                      <div className="text-lab-warm-gray text-sm leading-relaxed whitespace-pre-wrap">
                        {insights}
                      </div>
                      <p className="text-xs text-muted-foreground pt-3 border-t border-border/50 flex items-center gap-1">
                        <Sparkles size={12} className="text-lab-amber" />
                        Powered by Claude
                      </p>
                    </div>
                  )}
                  
                  {!insights && !insightsLoading && !insightsError && (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="text-purple-500 mt-0.5" size={20} />
                        <div>
                          <h3 className="font-semibold text-lab-navy mb-1">Want AI insights about your spending?</h3>
                          <p className="text-sm text-muted-foreground">
                            AI can spot unusual patterns and highlight opportunities in your budget.
                          </p>
                        </div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200/50 rounded-lg p-3">
                        <p className="text-xs text-purple-700">
                          <span className="font-medium">What's shared:</span> Only category totals and percentages (e.g., "Food & Dining - $485, 18%"). 
                          Your individual transactions are never sent.
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Link to="/about#privacy" className="text-xs text-muted-foreground hover:text-lab-teal transition-colors">
                          Learn more about privacy
                        </Link>
                        <Button 
                          onClick={fetchInsights}
                          variant="outline"
                          className="border-purple-300 hover:bg-purple-50"
                        >
                          I understand, get insights
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 8. What's Next */}
              <WhatsNextCard
                onReset={handleReset}
                onDownload={handleDownloadResults}
              />

              {/* Email Signup */}
              <div className="mt-8 border-t border-border pt-8">
                <EmailSignup 
                  heading="Want to know when I build more tools?" 
                  variant="compact"
                />
              </div>

            </div>
          )}
        </div>
      </section>

      {/* Category Teaching Dialog */}
      <Dialog open={!!teachingTransaction} onOpenChange={(open) => !open && setTeachingTransaction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Categorize this transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm font-medium text-lab-navy break-words">
                "{teachingTransaction?.description}"
              </p>
              {teachingTransaction && (
                <p className="text-xs text-muted-foreground mt-1">
                  Pattern: {extractPattern(teachingTransaction.description)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Select a category:</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose category..." />
                </SelectTrigger>
                <SelectContent>
                  {teachableCategories.map((cat) => (
                    <SelectItem key={cat.name} value={cat.name}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeachingTransaction(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleTeachCategory}
              disabled={!selectedCategory}
              className="bg-lab-teal hover:bg-lab-teal/90 text-white"
            >
              Save – Remember for future
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Learned Rules Management Dialog */}
      <Dialog open={learnedRulesOpen} onOpenChange={setLearnedRulesOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Custom Category Rules</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {learnedCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No custom rules yet. Click on uncategorized transactions to teach me!
              </p>
            ) : (
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-2">
                  {learnedCategories.map((rule, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-lab-navy truncate">
                          {rule.pattern}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          → {rule.category}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLearnedCategory(rule.pattern)}
                        className="text-muted-foreground hover:text-destructive flex-shrink-0"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {learnedCategories.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleClearAllLearned}
                className="text-destructive hover:text-destructive"
              >
                Clear All
              </Button>
            )}
            <Button onClick={() => setLearnedRulesOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MoneySnapshot;
