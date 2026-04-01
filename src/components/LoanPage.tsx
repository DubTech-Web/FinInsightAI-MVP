import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Send, CreditCard, AlertCircle, Calendar, Lightbulb } from "lucide-react";
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

const loanRepaymentHistory = [
  { month: "Jan", outstanding: 15000, paid: 1500 },
  { month: "Feb", outstanding: 13500, paid: 1500 },
  { month: "Mar", outstanding: 12000, paid: 1500 },
  { month: "Apr", outstanding: 10500, paid: 1500 },
  { month: "May", outstanding: 9000, paid: 1500 },
  { month: "Jun", outstanding: 7500, paid: 1500 },
];

const monthlyPayments = [
  { month: "Jan", principal: 1100, interest: 400 },
  { month: "Feb", principal: 1150, interest: 350 },
  { month: "Mar", principal: 1180, interest: 320 },
  { month: "Apr", principal: 1220, interest: 280 },
  { month: "May", principal: 1260, interest: 240 },
  { month: "Jun", principal: 1300, interest: 200 },
];

const getLoanBalanceTimeline = (loans: any[]) => {
  const timeline: Array<{ month: string; outstanding: number; paid: number }> = [];
  let chartCounter = 1;

  const merged = loans.map((loan) => {
    const balance = loan.loan_amount ?? 0;
    const payment = loan.monthly_repayment ?? 0;
    const tenure = loan.tenure_months ?? 0;
    const rate = loan.interest_rate ?? 0;
    return { initial: balance, payment, tenure, rate, id: loan.loan_id };
  });

  let remainingTotal = merged.reduce((sum, loan) => sum + loan.initial, 0);
  while (remainingTotal > 0 && chartCounter <= 36) {
    const paidThisMonth = merged.reduce((sum, loan) => {
      if (loan.initial <= 0 || loan.payment <= 0) return sum;
      const remainingForLoan = Math.max(0, loan.initial - loan.payment);
      const paid = Math.min(loan.payment, loan.initial);
      loan.initial = remainingForLoan;
      return sum + paid;
    }, 0);

    remainingTotal = merged.reduce((sum, loan) => sum + loan.initial, 0);
    timeline.push({ month: `M${chartCounter}`, outstanding: remainingTotal, paid: paidThisMonth });
    chartCounter += 1;
    if (chartCounter > 120) break;
  }

  if (!timeline.length) {
    timeline.push({ month: "No loan", outstanding: 0, paid: 0 });
  }

  return timeline;
};

const getLoanInterestTimeline = (loans: any[]) => {
  const timeline: Array<{ month: string; interest: number; principal: number }> = [];
  let chartCounter = 1;

  const loanStates = loans.map((loan) => {
    return {
      remaining: loan.loan_amount ?? 0,
      monthlyPayment: loan.monthly_repayment ?? 0,
      interestRate: (loan.interest_rate ?? 0) / 100,
      tenure: loan.tenure_months ?? 0,
      id: loan.loan_id,
    };
  });

  while (loanStates.some((loan) => loan.remaining > 0) && chartCounter <= 120) {
    let totalInterest = 0;
    let totalPrincipal = 0;

    loanStates.forEach((loan) => {
      if (loan.remaining <= 0 || loan.monthlyPayment <= 0) return;
      const monthlyInterest = loan.remaining * (loan.interestRate / 12);
      const principalPayment = Math.min(loan.monthlyPayment - monthlyInterest, loan.remaining);
      loan.remaining = Math.max(0, loan.remaining - principalPayment);

      totalInterest += monthlyInterest;
      totalPrincipal += principalPayment;
    });

    timeline.push({ month: `M${chartCounter}`, interest: Number(totalInterest.toFixed(2)), principal: Number(totalPrincipal.toFixed(2)) });
    chartCounter += 1;
    if (chartCounter > 120) break;
  }

  if (!timeline.length) timeline.push({ month: "No loan", interest: 0, principal: 0 });
  return timeline;
};

const loanRecommendations = [
  {
    id: 1,
    type: "Refinancing",
    title: "Lower Interest Rate Loan",
    reason: "Your credit score improved by 45 points. You qualify for refinancing at 4.5% vs current 6.8%, saving $2,400 over loan lifetime.",
    monthlySavings: "$180",
    provider: "Chase Bank Personal Loan Refinancing",
    benefit: "Save $2,400 total",
  },
  {
    id: 2,
    type: "Consolidation",
    title: "Debt Consolidation",
    reason: "You have 3 separate loans with varying rates (6.8%, 7.2%, 8.1%). Consolidating at 5.9% reduces monthly payment by $220.",
    monthlySavings: "$220",
    provider: "Wells Fargo Debt Consolidation",
    benefit: "Single payment, lower rate",
  },
  {
    id: 3,
    type: "Early Payoff",
    title: "Accelerated Payment Plan",
    reason: "Your savings rate allows for extra $300/month payments. This will clear your loan 18 months early, saving $1,800 in interest.",
    monthlySavings: "Pay off 18mo early",
    provider: "Current Lender - Increase Payment",
    benefit: "Save $1,800 interest",
  },
];

export function LoanPage({ user }: { user: UserType }) {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "I've analyzed your loan portfolio. I can recommend improvements based on your loan and repayment history.",
    },
  ]);

  const loanItems = user?.loans ?? [];
  const activeLoans = loanItems.filter((loan) => loan.loan_status === "active");
  const repaidLoans = loanItems.filter((loan) => loan.loan_status === "repaid");
  const totalActive = activeLoans.reduce((sum, loan) => sum + (loan.loan_amount ?? 0), 0);
  const totalRepaid = repaidLoans.reduce((sum, loan) => sum + (loan.loan_amount ?? 0), 0);
  const totalMonthlyRepayment = activeLoans.reduce((sum, loan) => sum + (loan.monthly_repayment ?? 0), 0);
  const totalLoanBalance = loanItems.reduce((sum, loan) => sum + (loan.loan_amount ?? 0), 0);
  const totalRemaining = totalActive;
  const progressPercentage = totalLoanBalance > 0 ? ((totalLoanBalance - totalRemaining) / totalLoanBalance) * 100 : 0;
  const hasLoan = loanItems.length > 0;

  const loanBalanceData = hasLoan ? getLoanBalanceTimeline(activeLoans) : [];
  const interestData = hasLoan ? getLoanInterestTimeline(activeLoans) : [];
  const spendingLoanData = hasLoan ? activeLoans.map((loan, idx) => ({ month: `L${idx + 1}`, principal: loan.loan_amount ?? 0, interestRate: loan.interest_rate ?? 0 })) : [];

  // const handleSendMessage = async () => {
  //   const query = chatInput.trim();
  //   if (!query) return;

  //   setChatMessages((prev) => [...prev, { role: "user", content: query }]);
  //   setChatInput("");

  //   setChatMessages((prev) => [...prev, { role: "assistant", content: "Analyzing your loan profile..." }]);

  //   try {
  //     const aiResponse = await askAI(user.user_id, query, { loans: loanItems, monthly_income: user.monthly_income, monthly_spending: user.monthly_spending, savings: user.savings }, "loan");
  //     setChatMessages((prev) => {
  //       const clean = prev.filter((m) => !(m.role === "assistant" && m.content === "Analyzing your loan profile..."));
  //       return [...clean, { role: "assistant", content: aiResponse }];
  //     });
  //   } catch (error) {
  //     console.error("askAI loan message failed", error);
  //     setChatMessages((prev) => {
  //       const clean = prev.filter((m) => !(m.role === "assistant" && m.content === "Analyzing your loan profile..."));
  //       return [...clean, { role: "assistant", content: "Sorry, I couldn't generate the recommendation right now. Please try again." }];
  //     });
  //   }
  // };

  const totalLoan = totalLoanBalance;
  const remaining = totalRemaining;

  return (
    <div className="space-y-6">
      {/* Loan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-300">Outstanding Balance</CardTitle>
            <CreditCard className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">{remaining > 0 ? `₦${remaining.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₦0.00"}</div>
            <p className="text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
              {totalLoan > 0 ? `${progressPercentage.toFixed(1)}% paid off` : "No active loans"}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-300">Monthly Payment</CardTitle>
            <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">{totalMonthlyRepayment > 0 ? `₦${totalMonthlyRepayment.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₦0.00"}</div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{activeLoans.length > 0 ? "Next due date: 15th" : "No active loans"}</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-300">Interest Rate</CardTitle>
            <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">{activeLoans.length > 0 ? `${activeLoans[0]?.interest_rate?.toFixed(2) ?? 0}% APR` : "N/A"}</div>
            <p className="text-orange-600 dark:text-orange-400 mt-1">{activeLoans.length > 0 ? "Review for refinancing" : "No active loans"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Repayment Progress */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">Repayment Progress</CardTitle>
          <CardDescription className="dark:text-gray-400">You're on track to be debt-free!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-gray-900 dark:text-gray-100">{hasLoan ? `${progressPercentage.toFixed(1)}%` : "0%"}</span>
            </div>
            <Progress value={hasLoan ? progressPercentage : 0} className="h-3" />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Total Loan</p>
              <p className="text-gray-900 dark:text-gray-100">{totalLoan > 0 ? `₦${totalLoan.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₦0.00"}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Paid</p>
              <p className="text-green-600 dark:text-green-400">{totalLoan > 0 ? `₦${(totalLoan - totalRemaining).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₦0.00"}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Remaining</p>
              <p className="text-red-600 dark:text-red-400">{totalRemaining > 0 ? `₦${totalRemaining.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "₦0.00"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      {hasLoan ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-gray-100">Loan Balance Over Time</CardTitle>
              <CardDescription className="dark:text-gray-400">Outstanding balance reduction</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={loanBalanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  <Area type="monotone" dataKey="outstanding" stroke="#DC2626" fill="#DC2626" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="paid" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-gray-100">Principal vs Interest</CardTitle>
              <CardDescription className="dark:text-gray-400">Projection of payment impact</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={interestData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  <Legend />
                  <Line type="monotone" dataKey="principal" stroke="#10B981" dot={false} />
                  <Line type="monotone" dataKey="interest" stroke="#EF4444" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent>
            <p className="text-gray-400">No loan chart available. Add a loan to see analysis and timelines.</p>
          </CardContent>
        </Card>
      )}

      {/* AI Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h2 className="text-gray-900 dark:text-gray-100">AI Loan Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {loanRecommendations.map((rec) => (
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
                    <span className="text-gray-600 dark:text-gray-400">Savings/Benefit:</span>
                    <span className="text-green-600 dark:text-green-400">{rec.monthlySavings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Benefit:</span>
                    <span className="text-gray-900 dark:text-gray-100">{rec.benefit}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-900 dark:text-gray-100">Recommended Option:</p>
                  <p className="text-gray-600 dark:text-gray-400">{rec.provider}</p>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Chat Section
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">Ask AI About Loans</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Get detailed explanations about loan options and strategies
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
              placeholder="Ask about refinancing, consolidation, or early payoff..."
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
