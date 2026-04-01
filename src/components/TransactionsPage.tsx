import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Send, ArrowUpRight, ArrowDownRight, Filter, Download, Lightbulb } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {User as UserType, askAI, Transaction} from "../services/api";

const formatNaira = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const getTransactionSummary = (transactions: Transaction[] = []) => {
  const income = transactions
    .filter((t) => t.type === "credit")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const expenses = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const net = income - expenses;
  return { income, expenses, net };
};

const categorySpendingFromTransactions = (transactions: Transaction[] = []) => {
  const map: Record<string, number> = {};

  transactions
    .filter((t) => t.type === "debit" && t.category)
    .forEach((t) => {
      const category = t.category || "Uncategorized";
      map[category] = (map[category] || 0) + Math.abs(t.amount);
    });

  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
};

const insights = [
  {
    id: 1,
    title: "Food Spending Alert",
    description: "Your food expenses increased 28% this month (₦2,400 vs ₦1,875 average). Main drivers: 15 restaurant visits vs usual 8.",
    action: "Consider meal prepping 3 days/week to save ~₦300/month.",
    impact: "High",
  },
  {
    id: 2,
    title: "Subscription Optimization",
    description: "You have 7 active subscriptions totaling ₦127/month. Netflix and Spotify have 40% overlap in content.",
    action: "Cancel redundant subscriptions to save ₦45/month (₦540/year).",
    impact: "Medium",
  },
  {
    id: 3,
    title: "Cashback Opportunity",
    description: "You spent ₦890 in categories eligible for 3% cashback. You're using a 1% card, missing ₦17.80 this month.",
    action: "Switch to Chase Freedom Unlimited for better rewards - ₦214/year potential.",
    impact: "Medium",
  },
];

export function TransactionsPage({ user }: { user: UserType }) {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "I've analyzed your recent transactions. I notice some spending patterns that could be optimized. Would you like insights on any specific category?",
    },
  ]);

  const transactions = user?.transactions ?? [];
  const summary = getTransactionSummary(transactions);
  const categorySpending = categorySpendingFromTransactions(transactions);

  // const handleSendMessage = async () => {
  //   const prompt = chatInput.trim();
  //   if (!prompt) return;

  //   setChatMessages((prev) => [...prev, { role: "user", content: prompt }]);
  //   setChatInput("");

  //   // optimistic loading state in chat area
  //   setChatMessages((prev) => [...prev, { role: "assistant", content: "Analyzing your transactions..." }]);

  //   try {
  //     const aiResponse = await askAI(user.user_id, prompt, { transactions: transactions }, "transactions");
  //     setChatMessages((prev) => {
  //       const trimmed = prev.filter((m) => m.role !== "assistant" || m.content !== "Analyzing your transactions...");
  //       return [...trimmed, { role: "assistant", content: aiResponse }];
  //     });
  //   } catch (error) {
  //     console.error("askAI failed:", error);
  //     setChatMessages((prev) => {
  //       const trimmed = prev.filter((m) => m.role !== "assistant" || m.content !== "Analyzing your transactions...");
  //       return [...trimmed, { role: "assistant", content: "Sorry, I couldn't get insights right now. Try again in a moment." }];
  //     });
  //   }
  // };

  return (
    <div className="space-y-6">
      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-300">Total Income</CardTitle>
            <ArrowDownRight className="w-4 h-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">{formatNaira(summary.income)}</div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-300">Total Expenses</CardTitle>
            <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">{formatNaira(summary.expenses)}</div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-gray-600 dark:text-gray-300">Net Cashflow</CardTitle>
            <ArrowDownRight className="w-4 h-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-gray-900 dark:text-gray-100">{summary.net >= 0 ? "+" : ""}{formatNaira(summary.net)}</div>
            <p className="text-green-600 dark:text-green-400 mt-1">{summary.net >= 0 ? "Positive cashflow" : "Negative cashflow"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Spending by Category Chart */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">Spending by Category</CardTitle>
          <CardDescription className="dark:text-gray-400">Where your money goes this month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categorySpending.length > 0 ? categorySpending : [{ category: "No data", amount: 0 }] }>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatNaira(value)} />
              <Bar dataKey="amount" fill="#DC2626" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-red-600 dark:text-red-400" />
          <h2 className="text-gray-900 dark:text-gray-100">AI Transaction Insights</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {insights.map((insight) => (
            <Card key={insight.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="dark:text-gray-100">{insight.title}</CardTitle>
                  <Badge
                    className={
                      insight.impact === "High"
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                        : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200"
                    }
                  >
                    {insight.impact}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">{insight.description}</p>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-900 dark:text-gray-100 mb-2">Recommended Action:</p>
                  <p className="text-gray-600 dark:text-gray-400">{insight.action}</p>
                </div>
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Take Action
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="dark:text-gray-100">Recent Transactions</CardTitle>
              <CardDescription className="dark:text-gray-400">Your latest financial activity</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="dark:border-gray-700">
                <TableHead className="dark:text-gray-300">Date</TableHead>
                <TableHead className="dark:text-gray-300">Description</TableHead>
                <TableHead className="dark:text-gray-300">Category</TableHead>
                <TableHead className="text-right dark:text-gray-300">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow key={transaction.transaction_id} className="dark:border-gray-700">
                    <TableCell className="dark:text-gray-300">
                      {transaction.date ? new Date(transaction.date).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="dark:text-gray-100">{transaction.description ?? "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                        {transaction.category ?? "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right ${
                        transaction.type === "credit"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === "credit" ? "+" : "-"}{formatNaira(Math.abs(transaction.amount))}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="dark:border-gray-700">
                  <TableCell colSpan={4} className="text-center text-gray-400 py-4">
                    No transaction data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Chat Section */}
      {/* <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">Ask AI About Transactions</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Get detailed analysis and recommendations for your spending
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
              placeholder="Ask about spending patterns, categories, or optimization..."
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
