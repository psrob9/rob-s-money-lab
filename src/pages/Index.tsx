import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-slate-50 via-background to-teal-50/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-lab-navy mb-6 animate-fade-in">
            Rob's Money Lab
          </h1>
          <p className="text-xl sm:text-2xl text-lab-teal font-semibold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Simple tools for real money questions.
          </p>
          <p className="text-lg text-lab-warm-gray leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Free tools I've built to help people understand their money better. 
            No ads. No data selling. Just useful stuff.
          </p>
        </div>
      </section>

      {/* Tools Preview Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-lab-navy mb-8 text-center">
            The Tools
          </h2>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ToolCard
              title="Money Snapshot"
              description="See where your money actually goes in 60 seconds. Upload a CSV, get instant clarity."
              href="/tools/money-snapshot"
              badge="New"
            />
            
            <ToolCard
              title="True Monthly Cost Calculator"
              description="Find all your recurring costs and see what you really spend each month."
              href="/tools/true-monthly-cost"
            />
            
            {/* Placeholder card for future tools */}
            <div className="hidden lg:block bg-card/50 rounded-xl border border-dashed border-border p-6 flex items-center justify-center min-h-[180px]">
              <p className="text-muted-foreground text-sm text-center">More tools coming...</p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link 
              to="/tools" 
              className="inline-flex items-center text-lab-teal font-medium hover:underline"
            >
              View all tools
              <ArrowRight size={18} className="ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Teaser Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center">
          <p className="text-lg text-lab-warm-gray leading-relaxed mb-6">
            Built by Rob, a regular person who got tired of budgeting apps that make money feel complicated.
          </p>
          <Link 
            to="/about" 
            className="inline-flex items-center text-lab-teal font-medium hover:underline"
          >
            Learn more about this project
            <ArrowRight size={18} className="ml-1" />
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
