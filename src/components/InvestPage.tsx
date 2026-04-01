import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Send, TrendingUp, AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

// Mock data
const investmentHistory = [
  { month: "Jan", stocks: 5000, bonds: 3000, crypto: 1000 },
  { month: "Feb", stocks: 5500, bonds: 3200, crypto: 1500 },
  { month: "Mar", stocks: 6200, bonds: 3500, crypto: 1200 },
  { month: "Apr", stocks: 6800, bonds: 3800, crypto: 1800 },
  { month: "May", stocks: 7500, bonds: 4000, crypto: 2200 },
  { month: "Jun", stocks: 8200, bonds: 4200, crypto: 2500 },
];

const portfolioPerformance = [
  { month: "Jan", value: 9000 },
  { month: "Feb", value: 10200 },
  { month: "Mar", value: 10900 },
  { month: "Apr", value: 12400 },
  { month: "May", value: 13700 },
  { month: "Jun", value: 14900 },
];

const recommendations = [
  {
    id: 1,
    type: "High Growth",
    title: "Tech Sector ETF",
    reason: "Based on your risk profile and age, tech stocks show 23% average annual growth. Your current allocation is only 15%.",
    expectedReturn: "18-25%",
    risk: "Medium-High",
    product: "Vanguard Information Technology ETF (VGT)",
  },
  {
    id: 2,
    type: "Balanced",
    title: "Index Fund",
    reason: "Your portfolio lacks diversification. S&P 500 index funds provide stable growth with lower risk.",
    expectedReturn: "10-12%",
    risk: "Low-Medium",
    product: "Fidelity 500 Index Fund (FXAIX)",
  },
  {
    id: 3,
    type: "Income",
    title: "Dividend Stocks",
    reason: "You have consistent income. Dividend aristocrats can provide passive income while maintaining capital appreciation.",
    expectedReturn: "8-10% + 3% dividend",
    risk: "Low",
    product: "ProShares S&P 500 Dividend Aristocrats ETF (NOBL)",
  },
];

export function InvestPage() {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "I've analyzed your investment portfolio. You're currently invested in stocks (55%), bonds (28%), and crypto (17%). Would you like me to explain any of the recommendations?",
    },
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [...prev, { role: "user", content: chatInput }]);

    setTimeout(() => {
      let response = "";
      const input = chatInput.toLowerCase();

      if (input.includes("tech") || input.includes("etf") || input.includes("first")) {
        response =
          "The Tech Sector ETF recommendation is based on several factors: 1) Your age and investment timeline (30+ years) can absorb market volatility, 2) Tech sector has historically outperformed with 23% CAGR, 3) Your current tech allocation is underweight at 15% vs recommended 25-30%, 4) Your risk tolerance survey indicates you're comfortable with higher volatility for better returns.";
      } else if (input.includes("diversif") || input.includes("index") || input.includes("second")) {
        response =
          "The Index Fund recommendation addresses portfolio diversification: 1) You're currently concentrated in 12 individual stocks, increasing risk, 2) S&P 500 provides exposure to 500 companies across all sectors, 3) Lower expense ratio (0.015%) vs your current holdings (avg 0.8%), 4) Historical data shows index funds outperform 85% of active managers over 15 years.";
      } else if (input.includes("dividend") || input.includes("income") || input.includes("third")) {
        response =
          "The Dividend Stocks recommendation is strategic: 1) Your steady monthly income ($5,500) allows for long-term dividend reinvestment, 2) Dividend aristocrats have 25+ years of consecutive dividend increases, showing stability, 3) Provides quarterly passive income stream, 4) Lower volatility than growth stocks while still appreciating 8-10% annually.";
      } else if (input.includes("risk") || input.includes("safe")) {
        response =
          "Based on your profile, you have a moderate-aggressive risk tolerance. Your age (32), stable income, emergency fund (6 months), and long investment horizon allow for higher risk. However, I recommend maintaining 20-30% in low-risk assets (bonds/dividend stocks) for stability.";
      } else {
        response =
          "I can help you understand each recommendation in detail. Ask me about specific recommendations, risk levels, diversification strategies, or any investment concepts you'd like clarified.";
      }

      setChatMessages((prev) => [...prev, { role: "assistant", content: response }]);
    }, 1000);

    setChatInput("");
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-300">Total Portfolio Value</CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">$14,900.00</div>
            <p className="text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4" />
              +65.6% total return
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-300">Monthly Return</CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">+8.8%</div>
            <p className="text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-4 h-4" />
              Above market average
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-300">Risk Score</CardTitle>
            <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">Moderate</div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Well diversified</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Portfolio Performance</CardTitle>
            <CardDescription className="dark:text-gray-400">Total value over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={portfolioPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Asset Allocation</CardTitle>
            <CardDescription className="dark:text-gray-400">Investment distribution by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={investmentHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stocks" fill="#DC2626" />
                <Bar dataKey="bonds" fill="#F97316" />
                <Bar dataKey="crypto" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h2 className="text-gray-900 dark:text-gray-100">AI Investment Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="mb-2 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
                      {rec.type}
                    </Badge>
                    <CardTitle className="dark:text-gray-100">{rec.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">{rec.reason}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Expected Return:</span>
                    <span className="text-green-600 dark:text-green-400">{rec.expectedReturn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Risk Level:</span>
                    <span className="text-gray-900 dark:text-gray-100">{rec.risk}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-900 dark:text-gray-100">Recommended Product:</p>
                  <p className="text-gray-600 dark:text-gray-400">{rec.product}</p>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Chat Section */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">Ask AI About Investments</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Get detailed explanations about recommendations and investment strategies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-64 overflow-y-auto space-y-3">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-lg p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="Ask about any recommendation or investment strategy..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            />
            <Button onClick={handleSendMessage} className="bg-red-600 hover:bg-red-700 text-white">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
