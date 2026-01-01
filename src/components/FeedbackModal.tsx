import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle, Send } from "lucide-react";

type FeedbackVariant = "idea" | "tool-feedback";

interface FeedbackModalProps {
  /** Controlled open state */
  isOpen?: boolean;
  /** Callback when modal should close */
  onClose?: () => void;
  /** Context for where feedback originated */
  context?: string;
  /** Variant determines heading and placeholder text */
  variant?: FeedbackVariant;
  /** Optional trigger element (for uncontrolled usage) */
  trigger?: React.ReactNode;
}

const variantConfig = {
  idea: {
    heading: "Got an idea for a tool?",
    subtext: "I'm always looking for simple money questions that could use a better answer. Let me know what you're struggling with.",
    placeholder: "What's on your mind?",
  },
  "tool-feedback": {
    heading: "How was your experience?",
    subtext: "Your feedback helps make these tools better.",
    placeholder: "What worked? What didn't?",
  },
};

export function FeedbackModal({ 
  isOpen, 
  onClose, 
  context = "unknown", 
  variant = "idea",
  trigger 
}: FeedbackModalProps) {
  // Support both controlled (isOpen/onClose) and uncontrolled (trigger) usage
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : internalOpen;
  
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const config = variantConfig[variant];

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      if (!newOpen && onClose) {
        onClose();
      }
    } else {
      setInternalOpen(newOpen);
    }
  };

  const resetForm = () => {
    setStatus("idle");
    setMessage("");
    setEmail("");
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      // Delay reset to allow close animation
      const timer = setTimeout(resetForm, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const formData = new FormData();
      formData.append("message", message);
      if (email.trim()) {
        formData.append("email", email.trim());
      }
      formData.append("page_context", context);
      formData.append("feedback_type", variant);
      formData.append("timestamp", new Date().toISOString());
      formData.append("_subject", `[Rob's Money Lab] ${variant === "idea" ? "New idea" : "Tool feedback"} from ${context}`);

      const response = await fetch("https://formspree.io/f/mzdzdgga", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        setStatus("success");
        setTimeout(() => {
          handleOpenChange(false);
        }, 2000);
      } else {
        console.error("Formspree error:", await response.text());
        setStatus("error");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setStatus("error");
    }
  };

  const content = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{config.heading}</DialogTitle>
        <DialogDescription>
          {config.subtext}
        </DialogDescription>
      </DialogHeader>

      {status === "success" ? (
        <div className="flex flex-col items-center py-8 text-center">
          <CheckCircle className="text-lab-sage mb-3" size={48} />
          <p className="text-lg font-medium text-lab-navy">Thanks!</p>
          <p className="text-sm text-muted-foreground">Your feedback helps make these tools better.</p>
        </div>
      ) : status === "error" ? (
        <div className="flex flex-col items-center py-8 text-center">
          <AlertCircle className="text-destructive mb-3" size={48} />
          <p className="text-lg font-medium text-lab-navy">Something went wrong</p>
          <p className="text-sm text-muted-foreground mb-4">
            Please try again or email me directly.
          </p>
          <Button variant="outline" onClick={() => setStatus("idle")}>
            Try Again
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Your feedback</Label>
            <Textarea
              id="message"
              placeholder={config.placeholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              maxLength={2000}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              Your email <span className="text-xs text-muted-foreground">(if you'd like a response)</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-lab-teal hover:bg-lab-teal/90"
            disabled={status === "submitting" || !message.trim()}
          >
            {status === "submitting" ? (
              "Sending..."
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Send Feedback
              </>
            )}
          </Button>
        </form>
      )}
    </DialogContent>
  );

  // Controlled mode: no trigger, just Dialog with open state
  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {content}
      </Dialog>
    );
  }

  // Uncontrolled mode: with trigger
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {content}
    </Dialog>
  );
}
