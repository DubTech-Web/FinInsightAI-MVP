import { Button } from "./ui/button";
import { TrendingUp, Shield, BarChart3, Sparkles, Moon, Sun } from "lucide-react";
import { useDarkMode } from "./DarkModeContext";

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900 dark:text-gray-100">FinInsight AI</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="dark:text-gray-300"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" onClick={onLogin} className="hidden sm:inline-flex">
              Sign In
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={onLogin}>
              Login
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <h1 className="text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
              Smart Financial Insights Powered by AI
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
              Transform your financial data into actionable insights. Get personalized recommendations, 
              track your investments, manage loans, and save smarter with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-red-600 hover:bg-red-700 text-white" size="lg" onClick={onLogin}>
                Get Started
              </Button>
              <Button variant="outline" size="lg" className="dark:border-gray-600 dark:text-gray-300">
                Learn More
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-32 h-32 sm:w-48 sm:h-48 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-gray-900 dark:text-gray-100 mb-4">
            Powerful Features for Your Financial Success
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Everything you need to take control of your finances
          </p>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-gray-900 dark:text-gray-100 mb-2">AI-Powered Insights</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get intelligent recommendations based on your spending patterns and financial goals.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-gray-900 dark:text-gray-100 mb-2">Real-Time Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track your income, expenses, and investments with beautiful, easy-to-understand charts.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-gray-900 dark:text-gray-100 mb-2">Secure & Private</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your financial data is encrypted and protected with bank-level security.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="bg-red-600 dark:bg-red-700 rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-white mb-4">
            Ready to Transform Your Financial Future?
          </h2>
          <p className="text-red-100 dark:text-red-200 mb-6 sm:mb-8">
            Join thousands of users who are making smarter financial decisions with AI.
          </p>
          <Button className="bg-white text-red-600 hover:bg-gray-100 dark:bg-gray-100 dark:text-red-700 dark:hover:bg-gray-200 w-full sm:w-auto" size="lg" onClick={onLogin}>
            Start Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 FinInsight AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
