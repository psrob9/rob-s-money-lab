import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  badge?: string;
  comingSoon?: boolean;
}

export function ToolCard({ title, description, href, badge, comingSoon }: ToolCardProps) {
  const CardWrapper = comingSoon ? "div" : Link;
  
  return (
    <CardWrapper
      to={comingSoon ? undefined : href}
      className={`group block bg-card rounded-xl border border-border p-6 shadow-sm transition-all duration-300 ${
        comingSoon 
          ? "opacity-90" 
          : "hover:shadow-md hover:border-lab-teal/30 hover:-translate-y-1"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-lg font-semibold text-lab-navy group-hover:text-lab-teal transition-colors">
          {title}
        </h3>
        {badge && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            comingSoon 
              ? "bg-lab-amber/10 text-lab-amber" 
              : "bg-lab-sage/10 text-lab-sage"
          }`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-lab-warm-gray text-sm leading-relaxed mb-4">
        {description}
      </p>
      {!comingSoon && (
        <div className="flex items-center text-lab-teal text-sm font-medium">
          Try it now
          <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </CardWrapper>
  );
}
