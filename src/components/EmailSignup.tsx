import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2 } from "lucide-react";

interface EmailSignupProps {
  heading?: string;
  variant?: "default" | "compact";
}

export function EmailSignup({ 
  heading = "Get notified of new tools",
  variant = "default"
}: EmailSignupProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("https://formspree.io/f/mzdzdgga", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email,
          source: "email-signup"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      setIsSuccess(true);
      setEmail("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={`text-center ${variant === "compact" ? "py-6" : "py-12"}`}>
        <div className="inline-flex items-center gap-2 text-lab-sage font-medium">
          <CheckCircle2 size={20} />
          <span>You're on the list! 🎉</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-center ${variant === "compact" ? "py-6" : "py-12"}`}>
      <h3 className={`font-semibold text-lab-navy mb-2 ${variant === "compact" ? "text-lg" : "text-xl"}`}>
        {heading}
      </h3>
      <p className="text-lab-warm-gray text-sm mb-6 max-w-md mx-auto">
        I'm building more privacy-first finance tools. Drop your email to hear about them first. No spam, unsubscribe anytime.
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
          disabled={isSubmitting}
        />
        <Button 
          type="submit" 
          disabled={isSubmitting || !email}
          className="bg-lab-teal hover:bg-lab-teal/90 text-white"
        >
          {isSubmitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Notify Me"
          )}
        </Button>
      </form>
      
      {error && (
        <p className="text-destructive text-sm mt-3">{error}</p>
      )}
    </div>
  );
}
