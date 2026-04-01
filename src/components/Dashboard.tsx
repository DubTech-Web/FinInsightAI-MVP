import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import {
  TrendingUp,
  LayoutDashboard,
  TrendingDown,
  DollarSign,
  CreditCard,
  PiggyBank,
  LogOut, 
  Send,
  User,
  Bell,
  Search,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useDarkMode } from "./DarkModeContext";
import { InvestPage } from "./InvestPage";
import { LoanPage } from "./LoanPage";
import { SavePage } from "./SavePage";
import { TransactionsPage } from "./TransactionsPage";
import { User as UserType, askAI } from "../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
  onViewProfile: () => void;
}

// Mock data for charts
const transactionData = [
  { month: "Jan", income: 4000, expenses: 2400 },
  { month: "Feb", income: 3000, expenses: 1398 },
  { month: "Mar", income: 5000, expenses: 3800 },
  { month: "Apr", income: 4500, expenses: 3908 },
  { month: "May", income: 6000, expenses: 4800 },
  { month: "Jun", income: 5500, expenses: 3800 },
];

const processTransactions = (transactions: Array<{ date: string; type: "credit" | "debit"; amount: number }>) => {
  const monthMap: Record<string, { month: string; income: number; expenses: number }> = {};

  transactions.forEach((tx) => {
    const date = new Date(tx.date);
    if (isNaN(date.getTime())) return;

    const monthShort = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const monthLabel = `${monthShort} ${year}`;
    const monthKey = `${year}-${String(date.getMonth()).padStart(2, "0")}`;

    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { month: monthLabel, income: 0, expenses: 0 };
    }

    if (tx.type === "credit") {
      monthMap[monthKey].income += tx.amount;
    } else if (tx.type === "debit") {
      monthMap[monthKey].expenses += tx.amount;
    }
  });

  const ordered = Object.entries(monthMap)
    .map(([key, value]) => ({
      ...value,
      sortKey: key,
    }))
    .sort((a, b) => (a.sortKey < b.sortKey ? -1 : 1))
    .map(({ sortKey, ...rest }) => rest);

  return ordered.length ? ordered.slice(-6) : transactionData;
};

const processSpending = (transactions: Array<{ type: "credit" | "debit"; category?: string; amount: number }>) => {
  const categoryMap: Record<string, number> = {};

  transactions
    .filter((tx) => tx.type === "debit" && tx.category)
    .forEach((tx) => {
      const category = tx.category!;
      categoryMap[category] = (categoryMap[category] || 0) + tx.amount;
    });

  const colors = ["#EF4444", "#F97316", "#DC2626", "#B91C1C", "#991B1B", "#7C2D12", "#EA580C"];

  return Object.entries(categoryMap)
    .map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.value - a.value);
};

const processSavingsGrowth = (
  transactions: Array<{ date: string; type: "credit" | "debit"; amount: number }>,
  totalSavings?: number,
) => {
  const monthly = processTransactions(transactions);
  let cumulative = 0;
  const growth = monthly.map((m) => {
    const net = m.income - m.expenses;
    cumulative += net;
    return { month: m.month, savings: cumulative };
  });

  if (totalSavings != null && growth.length > 0) {
    const final = growth[growth.length - 1].savings;
    const factor = final === 0 ? 0 : totalSavings / final;
    return growth.map((value) => ({ month: value.month, savings: Number((value.savings * factor).toFixed(2)) }));
  }

  return growth.length ? growth : savingsData;
};

const processLoanRepayment = (
  loan_amount?: number,
  monthly_repayment?: number,
  tenure_months?: number,
) => {
  if (!loan_amount || !monthly_repayment || !tenure_months || tenure_months <= 0) {
    return loanData;
  }

  const repayment: Array<{ month: string; amount: number }> = [];
  let remaining = loan_amount;

  for (let i = 1; i <= tenure_months; i++) {
    remaining = Math.max(0, remaining - monthly_repayment);
    repayment.push({ month: `M${i}`, amount: Number(remaining.toFixed(2)) });
    if (remaining <= 0) break;
  }

  if (remaining > 0 && repayment.length < tenure_months) {
    for (let i = repayment.length + 1; i <= tenure_months; i++) {
      remaining = Math.max(0, remaining - monthly_repayment);
      repayment.push({ month: `M${i}`, amount: Number(remaining.toFixed(2)) });
    }
  }

  return repayment;
};

const spendingData = [
  { name: "Food", value: 2400, color: "#EF4444" },
  { name: "Transport", value: 1398, color: "#F97316" },
  { name: "Entertainment", value: 3800, color: "#DC2626" },
  { name: "Utilities", value: 2908, color: "#B91C1C" },
  { name: "Shopping", value: 4800, color: "#991B1B" },
];

const loanData = [
  { month: "Jan", amount: 15000 },
  { month: "Feb", amount: 13500 },
  { month: "Mar", amount: 12000 },
  { month: "Apr", amount: 10500 },
  { month: "May", amount: 9000 },
  { month: "Jun", amount: 7500 },
];

const savingsData = [
  { month: "Jan", savings: 1000 },
  { month: "Feb", savings: 2200 },
  { month: "Mar", savings: 3500 },
  { month: "Apr", savings: 4100 },
  { month: "May", savings: 5300 },
  { month: "Jun", savings: 7000 },
];

export function Dashboard({ user, onLogout, onViewProfile }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [chatInput, setChatInput] = useState("");
  const [chartData, setChartData] = useState(transactionData);
  const [spendingChartData, setSpendingChartData] = useState(spendingData);
  const [savingsGrowthData, setSavingsGrowthData] = useState(savingsData);
  const [loanRepaymentData, setLoanRepaymentData] = useState(loanData);
  const [loanCardMode, setLoanCardMode] = useState<"active" | "repaid" | "none">("none");
  const [loanSummary, setLoanSummary] = useState<string>("No loan history available");
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: "Hello! I'm your AI financial advisor. How can I help you today?" },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    if (user?.transactions && user.transactions.length > 0) {
      const calculatedData = processTransactions(user.transactions);
      setChartData(calculatedData);

      const calculatedSpending = processSpending(user.transactions);
      setSpendingChartData(calculatedSpending.length > 0 ? calculatedSpending : spendingData);

      const calculatedSavings = processSavingsGrowth(user.transactions, user.savings);
      setSavingsGrowthData(calculatedSavings.length > 0 ? calculatedSavings : savingsData);
    } else {
      setChartData(transactionData);
      setSpendingChartData(spendingData);
      setSavingsGrowthData(savingsData);
    }

    if (user?.loans?.[0]?.loan_status === "active" && user.loans[0].loan_amount && user.loans[0].monthly_repayment && user.loans[0].tenure_months) {
      setLoanCardMode("active");
      setLoanRepaymentData(processLoanRepayment(user.loans[0].loan_amount, user.loans[0].monthly_repayment, user.loans[0].tenure_months));
      setLoanSummary(`Active loan: ₦${new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(user.loans[0].loan_amount)} at ${user.loans[0].interest_rate ?? 0}% for ${user.loans[0].tenure_months} months. Monthly repayment: ₦${new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(user.loans[0].monthly_repayment)}.`);
    } else if (user?.loans?.[0]?.loan_status === "repaid") {
      setLoanCardMode("repaid");
      setLoanSummary(`Loan repaid. Total amount: ₦${new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(user.loans[0].loan_amount ?? 0)} across ${user.loans[0].tenure_months ?? 0} months at ₦${new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(user.loans[0].monthly_repayment ?? 0)} monthly.`);
      setLoanRepaymentData([]);
    } else {
      setLoanCardMode("none");
      setLoanSummary("No loan history available");
      setLoanRepaymentData([]);
    }
  }, [user]);

  const handleSendMessage = () => {
  if (!chatInput.trim() || chatLoading) return;

  const userMessage = chatInput.trim();

  setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
  setChatInput("");
  setChatLoading(true);

  askAI(user.user_id, userMessage, user)
    .then((aiResponse) => {
      setChatMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
    })
    .catch((error) => {
      // console.error("AI request failed:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an issue processing your question. Please try again.",
        },
      ]);
    })
    .finally(() => setChatLoading(false));
};

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "invest", label: "Invest", icon: TrendingUp },
    { id: "loan", label: "Loan", icon: CreditCard },
    { id: "save", label: "Save", icon: PiggyBank },
    { id: "transactions", label: "Transactions", icon: DollarSign },
  ];

  const handleMenuItemClick = (itemId: string) => {
    setActiveTab(itemId);
    setMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-gray-900 dark:text-gray-100">FinInsight AI</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          onClick={onLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-gray-800">
          <div className="flex flex-col h-full">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden dark:text-gray-300"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-gray-900 dark:text-gray-100">Financial Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400 hidden sm:block">Welcome back<span className="text-red-700 px-2 py-1 rounded">
    {user?.name || "User"}
  </span>! Here's your financial overview.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="relative hidden md:block">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input className="pl-10 w-64 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" placeholder="Search..." />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="dark:text-gray-300"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="dark:text-gray-300 hidden sm:flex">
                <Bell className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="dark:text-gray-300"
                onClick={onViewProfile}
                title="View profile"
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === "overview" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-gray-600 dark:text-gray-300">Total Balance</CardTitle>
                    <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-900 dark:text-gray-100">₦{user.account_balance ? new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(user.account_balance) : '0.00'}</div>
                    <p className="text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4" />
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-gray-600 dark:text-gray-300">Monthly Income</CardTitle>
                    <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-900 dark:text-gray-100">₦{user.monthly_income ? new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(user.monthly_income) : '0.00'}</div>
                    <p className="text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4" />
                      +12.5% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-gray-600 dark:text-gray-300">Monthly Expenses</CardTitle>
                    <TrendingDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-900 dark:text-gray-100">₦{user.monthly_spending ? new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(user.monthly_spending) : '0.00'}</div>
                    <p className="text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                      <TrendingDown className="w-4 h-4" />
                      +8.2% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-gray-600 dark:text-gray-300">Savings</CardTitle>
                    <PiggyBank className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-900 dark:text-gray-100">₦{user.savings ? new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(user.savings) : '0.00'}</div>
                    <p className="text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4" />
                      +32.1% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Income vs Expenses */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-gray-100">Income vs Expenses</CardTitle>
                    <CardDescription className="dark:text-gray-400">Monthly comparison for the last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `₦${new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`} />
                        <Legend />
                        <Area type="monotone" dataKey="income" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Spending Breakdown */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-gray-100">Spending Breakdown</CardTitle>
                    <CardDescription className="dark:text-gray-400">Category-wise expenses this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={spendingChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {spendingChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `₦${new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Loan Details */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-gray-100">Loan Details</CardTitle>
                    <CardDescription className="dark:text-gray-400">User loan records (active/repaid)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {user.loans && user.loans.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                          <thead>
                            <tr>
                              <th className="px-3 py-2 text-gray-400">Loan ID</th>
                              <th className="px-3 py-2 text-gray-400">Status</th>
                              <th className="px-3 py-2 text-gray-400">Amount</th>
                              <th className="px-3 py-2 text-gray-400">Interest</th>
                              <th className="px-3 py-2 text-gray-400">Tenure</th>
                              <th className="px-3 py-2 text-gray-400">Monthly</th>
                              <th className="px-3 py-2 text-gray-400">Start Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {user.loans.map((loan) => (
                              <tr key={loan.loan_id} className="border-t border-gray-700">
                                <td className="px-3 py-2">{loan.loan_id}</td>
                                <td className="px-3 py-2">{loan.loan_status}</td>
                                <td className="px-3 py-2">₦{loan.loan_amount?.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="px-3 py-2">{loan.interest_rate?.toFixed(2)}%</td>
                                <td className="px-3 py-2">{loan.tenure_months} mo</td>
                                <td className="px-3 py-2">₦{loan.monthly_repayment?.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="px-3 py-2">{loan.start_date}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-300">No loan history available</p>
                    )}
                  </CardContent>
                </Card>

                {/* Savings Growth */}
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="dark:text-gray-100">Savings Growth</CardTitle>
                    <CardDescription className="dark:text-gray-400">Your savings accumulation over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={savingsGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `₦${new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`} />
                        <Legend />
                        <Bar dataKey="savings" fill="#DC2626" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "invest" && <InvestPage/>}
          {activeTab === "loan" && <LoanPage user={user} />}
          {activeTab === "save" && <SavePage user={user} />}
          {activeTab === "transactions" && <TransactionsPage user={user} />}
        </main>

        {/* AI Chat Section */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Chat Messages */}
            <div className="mb-4 max-h-32 lg:max-h-40 overflow-y-auto space-y-3">
              {chatMessages.slice(-3).map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-2 lg:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] lg:max-w-lg p-2 lg:p-3 rounded-lg text-sm lg:text-base ${
                      message.role === "user"
                        ? "bg-red-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {message.content}
      </ReactMarkdown>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-2 lg:gap-3 justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 lg:p-3 rounded-lg text-sm lg:text-base">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="flex gap-2 lg:gap-3">
              <Input
                placeholder="Ask AI for financial insights..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !chatLoading && handleSendMessage()}
                disabled={chatLoading}
                className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 disabled:opacity-50"
              />
              <Button
                onClick={handleSendMessage}
                disabled={chatLoading}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                size="icon"
              >
                {chatLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
