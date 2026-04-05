import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

interface WelcomeScreenProps {
  onOwnerLogin: () => void;
  onCustomerLogin: () => void;
}

export default function WelcomeScreen({
  onOwnerLogin,
  onCustomerLogin,
}: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-8 w-full max-w-sm"
      >
        <img
          src="/assets/img-20260403-wa0000-019d5212-163d-7239-b20a-489c5dd03af6.jpg"
          alt="Apni Dukan Logo"
          className="object-contain bg-white rounded-full shadow-lg border-4 border-white"
          style={{ height: 100, width: 100 }}
        />
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-widest uppercase leading-tight">
            Welcome to Our Shop
          </h1>
          <p className="mt-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
            Login to get started ⬇
          </p>
        </div>
        <div className="flex flex-col gap-4 w-full">
          <Button
            data-ocid="welcome.owner_login.button"
            onClick={onOwnerLogin}
            className="w-full h-14 text-base font-bold uppercase tracking-widest"
            variant="outline"
            style={{ borderWidth: 2 }}
          >
            Owners Login
          </Button>
          <Button
            data-ocid="welcome.customer_login.button"
            onClick={onCustomerLogin}
            className="w-full h-14 text-base font-bold uppercase tracking-widest bg-primary text-primary-foreground"
          >
            Customers Login
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
