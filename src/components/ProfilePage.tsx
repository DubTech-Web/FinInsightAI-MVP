import { Button } from "./ui/button";
import { User as UserType } from "../services/api";

interface ProfilePageProps {
  user: UserType;
  onBack: () => void;
}

export function ProfilePage({ user, onBack }: ProfilePageProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Profile</h2>
          <Button variant="secondary" size="sm" onClick={onBack}>
            Back to Dashboard
          </Button>
        </div>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-700">
            <img
  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
  alt="avatar"
  className="w-full h-full object-cover"
/>
          </div>
          <p className="text-gray-500 dark:text-gray-400">{user.name}</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">Name</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.name || "-"}</p>
          </div>

          <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">Email</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.email || "-"}</p>
          </div>

          <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-300">Occupation</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.occupation || "Not set"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
