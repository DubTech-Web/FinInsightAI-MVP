import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { ProfilePage } from "./components/ProfilePage";
import { DarkModeProvider } from "./components/DarkModeContext";
import { User } from "./services/api";

type Page = "landing" | "login" | "dashboard" | "profile";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("landing");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentPage("dashboard");
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setCurrentPage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setCurrentPage("landing");
  };

  return (
    <DarkModeProvider>
      {currentPage === "landing" && (
        <LandingPage onLogin={() => setCurrentPage("login")} />
      )}
      {currentPage === "login" && (
        <LoginPage
          onLogin={handleLogin}
          onBack={() => setCurrentPage("landing")}
        />
      )}
      {currentPage === "dashboard" && user && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onViewProfile={() => setCurrentPage("profile")}
        />
      )}

      {currentPage === "profile" && user && (
        <ProfilePage user={user} onBack={() => setCurrentPage("dashboard")} />
      )}
    </DarkModeProvider>
  );
}