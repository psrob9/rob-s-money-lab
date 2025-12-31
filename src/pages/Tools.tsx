import { Layout } from "@/components/Layout";
import { ToolCard } from "@/components/ToolCard";

const Tools = () => {
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
            
            {/* Placeholder cards for future tools */}
            <div className="bg-card/50 rounded-xl border border-dashed border-border p-6 flex flex-col items-center justify-center min-h-[180px] text-center">
              <p className="text-muted-foreground text-sm mb-1">New tool</p>
              <p className="text-xs text-muted-foreground">Coming soon...</p>
            </div>
            <div className="bg-card/50 rounded-xl border border-dashed border-border p-6 flex flex-col items-center justify-center min-h-[180px] text-center">
              <p className="text-muted-foreground text-sm mb-1">New tool</p>
              <p className="text-xs text-muted-foreground">Coming soon...</p>
            </div>
          </div>

          <div className="mt-16 p-8 bg-amber-50/50 rounded-xl border border-amber-200/50 text-center">
            <h2 className="text-xl font-semibold text-lab-navy mb-3">
              Got an idea for a tool?
            </h2>
            <p className="text-lab-warm-gray max-w-md mx-auto">
              I'm always looking for simple money questions that could use a better answer. Let me know what you're struggling with.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Tools;
