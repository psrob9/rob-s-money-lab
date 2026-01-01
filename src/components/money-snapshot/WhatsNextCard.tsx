import { Download, RefreshCw, ArrowRight, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FeedbackModal } from "@/components/FeedbackModal";

interface WhatsNextCardProps {
  onReset: () => void;
  onDownload?: () => void;
}

export const WhatsNextCard = ({
  onReset,
  onDownload,
}: WhatsNextCardProps) => {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-lab-navy">What's Next?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-1 h-auto py-3 px-3"
            onClick={onDownload}
            disabled={!onDownload}
          >
            <Download size={18} className="text-lab-teal" />
            <span className="text-xs font-medium">Download CSV</span>
            <span className="text-[10px] text-muted-foreground">Export categorized data</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center gap-1 h-auto py-3 px-3"
            asChild
          >
            <Link to="/tools/true-monthly-cost">
              <ArrowRight size={18} className="text-lab-teal" />
              <span className="text-xs font-medium">True Monthly Cost</span>
              <span className="text-[10px] text-muted-foreground">Find recurring costs</span>
            </Link>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center gap-1 h-auto py-3 px-3"
            onClick={onReset}
          >
            <RefreshCw size={18} className="text-lab-teal" />
            <span className="text-xs font-medium">Start Over</span>
            <span className="text-[10px] text-muted-foreground">Analyze new files</span>
          </Button>
          
          <FeedbackModal 
            context="money-snapshot"
            variant="tool-feedback"
            trigger={
              <Button
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-3 px-3"
              >
                <MessageSquare size={18} className="text-lab-teal" />
                <span className="text-xs font-medium">Share Feedback</span>
                <span className="text-[10px] text-muted-foreground">Help us improve</span>
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};
