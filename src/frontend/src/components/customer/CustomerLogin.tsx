import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "motion/react";
import { useState } from "react";
import { getLS, setLS } from "../../hooks/useLocalStorage";
import type { Customer } from "../../types";

interface CustomerLoginProps {
  onSuccess: (customer: Customer) => void;
  onBack: () => void;
}

export default function CustomerLogin({
  onSuccess,
  onBack,
}: CustomerLoginProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  function handleSave() {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!mobile.trim() || !/^[0-9]{10}$/.test(mobile.trim())) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!address.trim()) {
      setError("Please enter your address");
      return;
    }

    const customers = getLS<Customer[]>("apniDukan_customers", []);
    const existing = customers.find((c) => c.mobile === mobile.trim());
    if (existing) {
      setLS("apniDukan_currentCustomer", existing.id);
      onSuccess(existing);
      return;
    }
    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      name: name.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...customers, newCustomer];
    setLS("apniDukan_customers", updated);
    setLS("apniDukan_currentCustomer", newCustomer.id);
    onSuccess(newCustomer);
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
          className="text-sm text-primary mb-4 flex items-center gap-1"
        >
          ← Back
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-6">Customer Login</h2>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="cust-name">Name</Label>
            <Input
              id="cust-name"
              data-ocid="customer_login.input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cust-mobile">Mobile Number</Label>
            <Input
              id="cust-mobile"
              data-ocid="customer_login.mobile.input"
              placeholder="10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              autoComplete="off"
              maxLength={10}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="cust-address">Address</Label>
            <Textarea
              id="cust-address"
              data-ocid="customer_login.address.textarea"
              placeholder="Enter your full address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="off"
              className="mt-1"
              rows={3}
            />
          </div>
          {error && (
            <p
              data-ocid="customer_login.error_state"
              className="text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button
            type="button"
            data-ocid="customer_login.submit_button"
            onClick={handleSave}
            className="w-full h-12 font-bold uppercase tracking-widest"
          >
            Save
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
