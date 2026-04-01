import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Send, PiggyBank, Target, TrendingUp, Lightbulb } from "lucide-react";
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
import { User as UserType, askAI } from "../services/api";

// Mock data
const savingsHistory = [
  { month: "Jan", emergency: 2000, vacation: 500, retirement: 500 },
  { month: "Feb", emergency: 4000, vacation: 1200, retirement: 1000 },
  { month: "Mar", emergency: 6000, vacation: 2000, retirement: 1500 },
  { month: "Apr", emergency: 8000, vacation: 2500, retirement: 2100 },
  { month: "May", emergency: 10000, vacation: 3200, retirement: 2600 },
  { month: "Jun", emergency: 12000, vacation: 4000, retirement: 3200 },
];

const savingsGrowth = [
  { month: "Jan", total: 3000, goal: 25000 },
  { month: "Feb", total: 6200, goal: 25000 },
  { month: "Mar", total: 9500, goal: 25000 },
  { month: "Apr", total: 12600, goal: 25000 },
  { month: "May", total: 15800, goal: 25000 },
  { month: "Jun", total: 19200, goal: 25000 },
];

const savingsRecommendations = [
  {
    id: 1,
    type: "High-Yield Account",
    title: "Premium Savings Account",
    reason: "Your savings in a regular account (0.5% APY) are losing value to inflation. Premium accounts offer 4.5% APY, earning you $864/year on current balance.",
    expectedReturn: "4.5% APY",
    provider: "Marcus by Goldman Sachs",
    benefit: "+$864/year interest",
  },
  {
    id: 2,
    type: "Automated Savings",
    title: "Round-Up Savings Program",
    reason: "Based on your spending patterns, automatic round-ups on purchases could save an additional $180/month without lifestyle changes.",
    expectedReturn: "$2,160/year",
    provider: "Acorns Round-Ups Program",
    benefit: "Effortless savings growth",
  },
  {
    id: 3,
    type: "Goal-Based Savings",
    title: "CD Ladder Strategy",
    reason: "Your vacation fund ($4,000) has a 12-month timeline. A CD ladder with 4.8% APY will earn $192 more than current account, with no risk.",
    expectedReturn: "4.8% APY",
    provider: "Ally Bank CD Ladder",
    benefit: "Higher returns, low risk",
  },
];

const savingsGoals = [
  { name: "Emergency Fund", current: 12000, target: 16500, percentage: 72.7 },
  { name: "Vacation", current: 4000, target: 6000, percentage: 66.7 },
  { name: "Retirement", current: 3200, target: 50000, percentage: 6.4 },
];

export function SavePage({ user }: { user: UserType }) {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "Great job! I can review your savings goals and recommend when to boost returns.",
    },
  ]);

  const currentSavings = user?.savings ?? 0;
  const monthlyIncome = user?.monthly_income ?? 0;
  const monthlySpending = user?.monthly_spending ?? 0;
  const monthlyContribution = Math.max(0, monthlyIncome - monthlySpending);
  const savingsRate = monthlyIncome ? (monthlyContribution / monthlyIncome) * 100 : 0;
  const projectedAnnualTotal = currentSavings + monthlyContribution * 12;
  const hasSavings = currentSavings > 0 || monthlyContribution > 0;

  const generateSavingsGrowth = () => {
    const goalTarget = 25000;
    const history = [];
    const base = currentSavings;
    for (let i = 5; i >= 0; i--) {
      const monthLabel = new Date(new Date().setMonth(new Date().getMonth() - i)).toLocaleString("en-US", { month: "short" });
      const amount = Math.max(0, base - monthlyContribution * (5 - i));
      history.push({ month: monthLabel, total: amount, goal: goalTarget });
    }
    return history;
  };

  const generateSavingsHistory = () => {
    if (!hasSavings) return [];
    const history: Array<{ month: string; emergency: number; vacation: number; retirement: number }> = [];
    const now = new Date();
    const emergency = currentSavings * 0.5;
    const vacation = currentSavings * 0.2;
    const retirement = currentSavings * 0.3;

    for (let i = 5; i >= 0; i--) {
      const monthLabel = new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleString("en-US", { month: "short" });
      const baseContribution = Math.max(0, currentSavings - monthlyContribution * (5 - i));
      history.push({ month: monthLabel, emergency: emergency * ((i + 1) / 6), vacation: vacation * ((i + 1) / 6), retirement: retirement * ((i + 1) / 6) });
    }

    return history;
  };

  const savingsGrowthData = hasSavings ? generateSavingsGrowth() : [];
  const savingsHistoryData = hasSavings ? generateSavingsHistory() : [];

  const savingsGoalsData = hasSavings
    ? [
        { name: "Emergency Fund", current: currentSavings * 0.5, target: 16500, percentage: Math.min(100, (currentSavings * 0.5 / 16500) * 100) },
        { name: "Vacation", current: currentSavings * 0.2, target: 6000, percentage: Math.min(100, (currentSavings * 0.2 / 6000) * 100) },
        { name: "Retirement", current: currentSavings * 0.3, target: 50000, percentage: Math.min(100, (currentSavings * 0.3 / 50000) * 100) },
      ]
    : [];

  // const handleSendMessage = async () => {
  //   const message = chatInput.trim();
  //   if (!message) return;

  //   setChatMessages((prev) => [...prev, { role: "user", content: message }]);
  //   setChatInput("");

  //   setChatMessages((prev) => [...prev, { role: "assistant", content: "Analyzing your savings scenario..." }]);

  //   try {
  //     const aiResponse = await askAI(user.user_id, message, {
  //       monthly_income: monthlyIncome,
  //       monthly_spending: monthlySpending,
  //       savings: currentSavings,
  //     }, "savings");

  //     setChatMessages((prev) => {
  //       const filtered = prev.filter((m) => !(m.role === "assistant" && m.content === "Analyzing your savings scenario..."));
  //       return [...filtered, { role: "assistant", content: aiResponse }];
  //     });
  //   } catch (error) {
  //     console.error("askAI savings call failed", error);
  //     setChatMessages((prev) => {
  //       const filtered = prev.filter((m) => !(m.role === "assistant" && m.content === "Analyzing your savings scenario..."));
  //       return [...filtered, { role: "assistant", content: "Sorry, I couldn't generate savings advice right now. Please try again." }];
  //     });
  //   }
  // };

  return (
    <div className="space-y-6">
      {/* Savings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-300">Total Savings</CardTitle>
            <PiggyBank className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">₦{currentSavings.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
              <TrendingUp className="w-4 h-4" />
              {hasSavings ? `+₦${(monthlyContribution).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} this month` : "No active savings yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-300">Savings Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">{savingsRate.toFixed(1)}%</div>
            <p className={`mt-1 ${savingsRate >= 20 ? "text-green-600" : "text-orange-500"}`}>{savingsRate >= 20 ? "Excellent" : "Improve your rate"}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-300">Projected Annual Savings</CardTitle>
            <Target className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">₦{projectedAnnualTotal.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">At current rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">Savings Goals Progress</CardTitle>
          <CardDescription className="dark:text-gray-400">Track your progress toward each goal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasSavings ? savingsGoalsData.map((goal) => (
            <div key={goal.name}>
              <div className="flex justify-between mb-2">
                <div>
                  <p className="text-gray-900 dark:text-gray-100">{goal.name}</p>
                  <p className="text-gray-600 dark:text-gray-400">
                    ₦{goal.current.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ₦{goal.target.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <span className="text-gray-900 dark:text-gray-100">{goal.percentage.toFixed(1)}%</span>
              </div>
              <Progress value={goal.percentage} className="h-3" />
            </div>
          )) : (
            <div className="text-gray-400">No savings goal progress available yet. Start saving to track your goals.</div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      {hasSavings ? (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Savings Growth</CardTitle>
            <CardDescription className="dark:text-gray-400">Total savings vs goal over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={savingsGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#10B981" strokeWidth={2} name="Current Savings" />
                <Line type="monotone" dataKey="goal" stroke="#DC2626" strokeWidth={2} strokeDasharray="5 5" name="Goal" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Savings by Category</CardTitle>
            <CardDescription className="dark:text-gray-400">Monthly allocation across goals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={savingsHistoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="emergency" fill="#10B981" name="Emergency" />
                <Bar dataKey="vacation" fill="#F59E0B" name="Vacation" />
                <Bar dataKey="retirement" fill="#DC2626" name="Retirement" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      ) : (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent>
            <p className="text-gray-400">No savings history available yet. Start depositing to unlock charts.</p>
          </CardContent>
        </Card>
      )}


      {/* AI Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h2 className="text-gray-900 dark:text-gray-100">AI Savings Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {savingsRecommendations.map((rec) => (
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
                    <span className="text-gray-600 dark:text-gray-400">Total Benefit:</span>
                    <span className="text-gray-900 dark:text-gray-100">{rec.benefit}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-900 dark:text-gray-100">Recommended Product:</p>
                  <p className="text-gray-600 dark:text-gray-400">{rec.provider}</p>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Chat Section
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">Ask AI About Savings</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Get personalized advice on optimizing your savings strategy
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
              placeholder="Ask about savings strategies, interest rates, or goals..."
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
      </Card> */}
    </div>
  );
}
