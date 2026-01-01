import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TransactionProvider } from "@/contexts/TransactionContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Tools from "./pages/Tools";
import MoneySnapshot from "./pages/MoneySnapshot";
import TrueMonthlyCost from "./pages/TrueMonthlyCost";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TransactionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/tools/money-snapshot" element={<MoneySnapshot />} />
            <Route path="/tools/true-monthly-cost" element={<TrueMonthlyCost />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TransactionProvider>
  </QueryClientProvider>
);

export default App;
