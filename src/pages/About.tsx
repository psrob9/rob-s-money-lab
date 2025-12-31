import { Layout } from "@/components/Layout";

const About = () => {
  return (
    <Layout>
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-lab-navy mb-4">
            Hey, I'm Rob
          </h1>
          <div className="w-16 h-1 bg-lab-teal rounded-full mb-8" />
          
          <div className="prose prose-lg max-w-none space-y-6 text-lab-warm-gray leading-relaxed">
            <p>
              I'm not a financial advisor. I'm not a CPA. I'm just someone who's spent way too many hours staring at spreadsheets trying to figure out where my money actually goes.
            </p>
            
            <p>
              I've used YNAB for years, built elaborate tracking systems, and discovered that most people don't need more tracking—they need clearer answers to simple questions.
            </p>
            
            <p>
              So I started building tools. Not apps that require daily maintenance or subscriptions that guilt you into logging in. Just simple, one-time-use tools that answer specific questions about your money.
            </p>
            
            <p>
              Everything here is free. Your data stays on your device. I'm not selling anything (yet—maybe someday I'll offer something premium, but the core tools will always be free).
            </p>
            
            <p>
              If these help you, that's awesome. If you have ideas for other tools, I'd love to hear them.
            </p>
          </div>

          <div className="mt-12 p-6 bg-secondary/50 rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-lab-sage"></span>
              <span className="text-sm font-medium text-lab-navy">Privacy first</span>
            </div>
            <p className="text-sm text-lab-warm-gray">
              All tools run entirely in your browser. Your financial data never touches a server.
            </p>
          </div>

          {/* How Your Data is Handled */}
          <div className="mt-8 p-6 bg-secondary/50 rounded-xl border border-border">
            <h2 className="text-lg font-semibold text-lab-navy mb-4">
              How Your Data is Handled
            </h2>
            <ul className="space-y-3 text-sm text-lab-warm-gray">
              <li className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-lab-sage mt-1.5 flex-shrink-0"></span>
                <span>Your CSV files are processed entirely in your browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-lab-sage mt-1.5 flex-shrink-0"></span>
                <span>Individual transactions never leave your device</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-lab-sage mt-1.5 flex-shrink-0"></span>
                <span>If you choose AI insights, only category totals and percentages are sent to Claude</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-lab-sage mt-1.5 flex-shrink-0"></span>
                <span>No data is stored, sold, or used for any other purpose</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
