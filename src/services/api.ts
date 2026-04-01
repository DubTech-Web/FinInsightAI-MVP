// services/api.ts


export interface Transaction {
  transaction_id: string;
  date: string;
  type: "credit" | "debit";
  amount: number;
  category?: string;
  description?: string;
}

export interface Loan {
  loan_id: number;
  user_id?: number;
  loan_amount?: number;
  interest_rate?: number;
  tenure_months?: number;
  monthly_repayment?: number;
  loan_status?: "active" | "repaid" | "none";
  start_date?: string;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  occupation?: string;
  avatar_url?: string;
  monthly_income?: number;
  monthly_spending?: number;
  savings?: number;
  account_balance?: number;
  loans?: Loan[];
  transactions?: Transaction[];
  financial_goals?: string;
  credit_score?: number;
  question: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export async function loginUser(email: string): Promise<User> {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password: email, // using email as password
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Login failed");
  }
const userData: User = await response.json();

  // // 👀 Log it to the console
  // console.log("Logged in user data:", userData);

  return userData;

}

export async function askAI(
  userId: number,
  question: string, 
  userProfile?: User,
  requestType: string = "auto"
): Promise<string> {
  if (!userProfile) throw new Error("User profile is required");

  // Prepare payload exactly as backend expects
  const payload = {
    user_id: userId,
    monthly_income: userProfile.monthly_income || 0,
    monthly_spending: userProfile.monthly_spending || 0,
    savings_balance: userProfile.savings || 0,
    account_balance: userProfile.account_balance || 0,
    credit_score: userProfile.credit_score || 650,
    active_loans: userProfile.loans?.length || 0,
    financial_goals: userProfile.financial_goals || "",
    transactions: userProfile.transactions || [],
    request_type: requestType, // optional; backend can auto-select
    question, // optional extra context
  };

  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || "Failed to get AI response");
  }

  const result = await response.json();
  return result.summary || result.recommendations?.[0] || "Unable to process your question";
}