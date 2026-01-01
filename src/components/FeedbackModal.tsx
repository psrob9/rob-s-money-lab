import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react";

interface FeedbackModalProps {
  trigger?: React.ReactNode;
  source?: string;
}

export function FeedbackModal({ trigger, source }: FeedbackModalProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [feedbackType, setFeedbackType] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      const formData = new FormData();
      formData.append("feedbackType", feedbackType);
      formData.append("message", message);
      formData.append("email", email || "Not provided");
      formData.append("source", source || "Unknown");
      formData.append("_subject", `[Rob's Money Lab] New ${feedbackType} feedback`);

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
          setOpen(false);
          setStatus("idle");
          setFeedbackType("");
          setMessage("");
          setEmail("");
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <MessageSquare size={16} />
            Share Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Feedback</DialogTitle>
          <DialogDescription>
            Found a bug? Have an idea? I'd love to hear from you.
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle className="text-lab-sage mb-3" size={48} />
            <p className="text-lg font-medium text-lab-navy">Thanks for your feedback!</p>
            <p className="text-sm text-muted-foreground">I'll review it soon.</p>
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
              <Label htmlFor="feedbackType">What kind of feedback?</Label>
              <Select value={feedbackType} onValueChange={setFeedbackType} required>
                <SelectTrigger id="feedbackType" className="bg-background">
                  <SelectValue placeholder="Select a type..." />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="bug">🐛 Bug Report</SelectItem>
                  <SelectItem value="idea">💡 Feature Idea</SelectItem>
                  <SelectItem value="question">❓ Question</SelectItem>
                  <SelectItem value="praise">🎉 Just Saying Thanks</SelectItem>
                  <SelectItem value="other">💬 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Your feedback</Label>
              <Textarea
                id="message"
                placeholder="Tell me what's on your mind..."
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
                Email <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground">
                Only if you'd like a response. Never shared or used for marketing.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-lab-teal hover:bg-lab-teal/90"
              disabled={status === "submitting" || !feedbackType || !message.trim()}
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
    </Dialog>
  );
}
