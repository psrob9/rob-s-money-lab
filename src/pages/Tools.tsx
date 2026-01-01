import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";
import { FeedbackModal } from "@/components/FeedbackModal";
import { Lightbulb, ArrowRight } from "lucide-react";

const Tools = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <Layout>
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-lab-navy mb-4">
              The Tools
            </h1>
            <p className="text-lg text-lab-warm-gray max-w-xl mx-auto">
              Simple, one-time-use tools that answer specific questions about your money. More coming soon.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ToolCard
              title="Money Snapshot"
              description="See where your money actually goes in 60 seconds. Upload a CSV, get instant clarity."
              href="/tools/money-snapshot"
            />
            
            <ToolCard
              title="True Monthly Cost Calculator"
              description="Find all your recurring costs and see what you really spend each month."
              href="/tools/true-monthly-cost"
            />
            
            {/* Got an Idea card */}
            <button
              onClick={() => setFeedbackOpen(true)}
              className="bg-card rounded-xl border border-border p-6 flex flex-col min-h-[180px] text-left hover:shadow-md hover:border-lab-teal/30 transition-all group"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-lab-amber/10">
                  <Lightbulb className="text-lab-amber" size={20} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-lab-navy mb-2">Got an Idea?</h3>
              <p className="text-sm text-muted-foreground flex-1">
                I'm always looking for simple money questions that could use a better answer.
              </p>
              <span className="text-sm font-medium text-lab-teal flex items-center gap-1 mt-4 group-hover:gap-2 transition-all">
                Share Your Idea <ArrowRight size={14} />
              </span>
            </button>
          </div>

          <FeedbackModal
            isOpen={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
            context="tools-page"
            variant="idea"
          />
        </div>
      </section>
    </Layout>
  );
};

export default Tools;
