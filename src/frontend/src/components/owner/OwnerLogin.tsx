import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";
import { useState } from "react";
import { getLS, setLS } from "../../hooks/useLocalStorage";
import type { AppSettings } from "../../types";

interface OwnerLoginProps {
  onSuccess: (ownerName: string) => void;
  onBack: () => void;
}

export default function OwnerLogin({ onSuccess, onBack }: OwnerLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [needsName, setNeedsName] = useState(false);
  const [ownerName, setOwnerName] = useState("");

  const settings = getLS<AppSettings>("apniDukan_settings", {
    phone: "9120499453",
    email: "apni.dukan.0704@gmail.com",
    paymentQR: "",
    ownerPassword: "07041845",
    ownerNames: [],
    theme: "blue",
  });

  function handleLogin() {
    if (password !== settings.ownerPassword) {
      setError("(The password is wrong please try customer login)");
      return;
    }
    setError("");
    const storedOwner = getLS<string | null>("apniDukan_currentOwner", null);
    if (storedOwner) {
      onSuccess(storedOwner);
    } else {
      setNeedsName(true);
    }
  }

  function handleNameSave() {
    if (!ownerName.trim()) return;
    const s = getLS<AppSettings>("apniDukan_settings", settings);
    if (!s.ownerNames.includes(ownerName.trim())) {
      s.ownerNames.push(ownerName.trim());
      setLS("apniDukan_settings", s);
    }
    setLS("apniDukan_currentOwner", ownerName.trim());
    onSuccess(ownerName.trim());
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm"
      >
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-primary mb-4"
        >
          ← Back
        </button>
        {!needsName ? (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Welcome Owner
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Enter your password to access the dashboard
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="owner-pass">Password</Label>
                <Input
                  id="owner-pass"
                  data-ocid="owner_login.input"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="mt-1"
                />
              </div>
              {error && (
                <p
                  data-ocid="owner_login.error_state"
                  className="text-sm text-destructive"
                >
                  {error}
                </p>
              )}
              <Button
                data-ocid="owner_login.submit_button"
                onClick={handleLogin}
                className="w-full h-12 font-bold uppercase tracking-widest"
              >
                Login
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Enter Your Name
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="owner-name">Your Name</Label>
                <Input
                  id="owner-name"
                  data-ocid="owner_login.name.input"
                  placeholder="Enter your name"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                data-ocid="owner_login.name.submit_button"
                onClick={handleNameSave}
                className="w-full h-12 font-bold"
              >
                Continue
              </Button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
