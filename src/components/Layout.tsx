import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, FlaskConical, MessageSquare, Github } from "lucide-react";
import { FeedbackModal } from "@/components/FeedbackModal";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "Tools" },
  { to: "/about", label: "About" },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackContext, setFeedbackContext] = useState<"header" | "footer">("header");
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  const isActive = (path: string) => location.pathname === path;
  
  const openFeedback = (context: "header" | "footer") => {
    setFeedbackContext(context);
    setFeedbackOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center gap-2 text-xl font-bold text-lab-navy hover:text-lab-teal transition-colors"
            >
              <img src="/favicon.png" alt="Rob's Money Lab" className="w-8 h-8 rounded-lg" />
              <span className="hidden sm:inline">Rob's Money Lab</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? "text-lab-teal"
                      : "text-lab-warm-gray hover:text-lab-navy"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => openFeedback("header")}
                className="text-sm font-medium text-lab-warm-gray hover:text-lab-navy transition-colors"
              >
                Feedback
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-lab-warm-gray hover:text-lab-navy transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-base font-medium py-2 transition-colors ${
                    isActive(link.to)
                      ? "text-lab-teal"
                      : "text-lab-warm-gray hover:text-lab-navy"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openFeedback("header");
                }}
                className="text-base font-medium py-2 text-lab-warm-gray hover:text-lab-navy transition-colors text-left"
              >
                Feedback
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-lab-warm-gray">
            <p className="flex items-center gap-1.5">
              <FlaskConical size={16} className="text-lab-teal" />
              <span>Rob's Money Lab</span>
            </p>
            <div className="flex items-center gap-4">
              <p className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-lab-sage"></span>
                Your transaction data stays private
              </p>
              <button
                onClick={() => openFeedback("footer")}
                className="flex items-center gap-1 hover:text-lab-navy transition-colors"
              >
                <MessageSquare size={14} />
                Share feedback
              </button>
              <a
                href="https://github.com/psrob9/rob-s-money-lab"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-lab-navy transition-colors"
                aria-label="View source on GitHub"
              >
                <Github size={14} />
                <span className="hidden sm:inline">Source</span>
              </a>
            </div>
            <p>© {currentYear}</p>
          </div>
        </div>
      </footer>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        context={feedbackContext}
        variant="idea"
      />
    </div>
  );
}
