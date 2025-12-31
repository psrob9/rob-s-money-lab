import { Layout } from "@/components/Layout";

const About = () => {
  return (
    <Layout>
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-lab-navy mb-8">
            Hey, I'm Rob
          </h1>
          
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
        </div>
      </section>
    </Layout>
  );
};

export default About;
