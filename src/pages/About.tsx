import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import robPhoto from "@/assets/rob.jpg";

const About = () => {
  return (
    <Layout>
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          {/* Hey, I'm Rob */}
          <div className="flex items-center gap-6 mb-8">
            <img 
              src={robPhoto} 
              alt="Rob" 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-lg border-4 border-lab-teal/20"
            />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-lab-navy mb-2">
                Hey, I'm Rob
              </h1>
              <div className="w-16 h-1 bg-lab-teal rounded-full" />
            </div>
          </div>
          
          <div className="prose prose-lg max-w-none space-y-6 text-lab-warm-gray leading-relaxed">
            <p>
              I'm not a financial advisor. I'm not a CPA. I'm just someone who's spent way too many hours staring at spreadsheets trying to figure out where my money actually goes.
            </p>
            
            <p>
              I've used YNAB for years, built elaborate tracking systems, and discovered that most people don't need more tracking—they need clearer answers to simple questions.
            </p>
            
            <p>
              So I started building tools. Not apps that require daily maintenance or subscriptions that guilt you into logging in. Just simple tools that answer specific questions about your money.
            </p>
          </div>

          {/* The Tools */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-lab-navy mb-6">The Tools</h2>
            
            <div className="space-y-4">
              <div className="p-6 bg-secondary/50 rounded-xl border border-border">
                <Link to="/tools/money-snapshot" className="text-lg font-semibold text-lab-navy hover:text-lab-teal transition-colors">
                  Money Snapshot
                </Link>
                <p className="text-lab-warm-gray mt-2">
                  Upload your bank statements and see exactly where your money goes. Categories, totals, patterns—all in about 60 seconds.
                </p>
              </div>
              
              <div className="p-6 bg-secondary/50 rounded-xl border border-border">
                <Link to="/tools/true-monthly-cost" className="text-lg font-semibold text-lab-navy hover:text-lab-teal transition-colors">
                  True Monthly Cost Calculator
                </Link>
                <p className="text-lab-warm-gray mt-2">
                  Find every recurring charge hiding in your transactions. Subscriptions, bills, annual fees—see what you're actually committed to spending each month.
                </p>
              </div>
            </div>
            
            <p className="text-lab-warm-gray mt-4 text-sm">
              Both tools work with CSV exports from any bank. Not sure how it works? Try the sample data first—no upload required.
            </p>
          </div>

          {/* What This Costs */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-lab-navy mb-6">What This Costs</h2>
            
            <div className="prose prose-lg max-w-none space-y-4 text-lab-warm-gray leading-relaxed">
              <p>
                Everything here is free. I'm not selling anything (yet—maybe someday I'll offer something premium, but the core tools will always be free).
              </p>
              
              <p>
                If these help you, that's awesome. If you have ideas for other tools, I'd love to hear them.
              </p>
            </div>
          </div>

          {/* Privacy First */}
          <div id="privacy" className="mt-12 scroll-mt-20">
            <h2 className="text-2xl font-bold text-lab-navy mb-6">Privacy First</h2>
            
            <p className="text-lab-warm-gray mb-6 leading-relaxed">
              I built these tools the way I'd want someone to build tools for me: your data stays yours.
            </p>
            
            <div className="p-6 bg-secondary/50 rounded-xl border border-border">
              <h3 className="text-lg font-semibold text-lab-navy mb-4">
                How Your Data is Handled
              </h3>
              <ul className="space-y-3 text-sm text-lab-warm-gray">
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-lab-sage mt-1.5 flex-shrink-0"></span>
                  <span><strong className="text-lab-navy">Your CSV files are processed entirely in your browser</strong> — transactions never touch a server</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-lab-sage mt-1.5 flex-shrink-0"></span>
                  <span><strong className="text-lab-navy">Individual transaction details never leave your device</strong> — not the descriptions, not the amounts, nothing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-lab-sage mt-1.5 flex-shrink-0"></span>
                  <span><strong className="text-lab-navy">AI insights are opt-in</strong> — if you choose to use them, only category totals and percentages are sent to Claude (Anthropic's AI), never your actual transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-lab-sage mt-1.5 flex-shrink-0"></span>
                  <span><strong className="text-lab-navy">No accounts, no tracking, no data storage</strong> — when you close the tab, it's gone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-lab-sage mt-1.5 flex-shrink-0"></span>
                  <span><strong className="text-lab-navy">Category preferences are saved locally</strong> — if you teach the tool a new category, that's stored in your browser only</span>
                </li>
              </ul>
            </div>
          </div>

          {/* What Gets Sent for AI Insights */}
          <div className="mt-8">
            <div className="p-6 bg-secondary/50 rounded-xl border border-border">
              <h3 className="text-lg font-semibold text-lab-navy mb-4">
                What Gets Sent for AI Insights (Only If You Opt In)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-lab-sage mb-2">Example of what Claude sees:</p>
                  <pre className="bg-background/80 rounded-lg p-4 text-xs text-lab-warm-gray overflow-x-auto border border-border">
{`Total spending: $4,500
- Housing: 45%
- Food & Dining: 18%
- Shopping: 12%
...`}
                  </pre>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-destructive mb-2">What Claude never sees:</p>
                  <pre className="bg-background/80 rounded-lg p-4 text-xs text-lab-warm-gray overflow-x-auto border border-border line-through opacity-60">
{`01/15 PENNYMAC MORTGAGE -$2,145.67
01/18 DOORDASH*CHIPOTLE -$18.45`}
                  </pre>
                </div>
                
                <p className="text-sm text-lab-warm-gray font-medium">
                  Your actual transactions stay on your device. Always.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
