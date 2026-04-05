import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import CartPage from "./components/customer/CartPage";
import ChatPage from "./components/customer/ChatPage";
import CheckoutPage from "./components/customer/CheckoutPage";
import CustomerDashboard from "./components/customer/CustomerDashboard";
import CustomerLogin from "./components/customer/CustomerLogin";
import ProductDetail from "./components/customer/ProductDetail";
import OwnerDashboard from "./components/owner/OwnerDashboard";
import OwnerLogin from "./components/owner/OwnerLogin";
import { DEFAULT_CATEGORIES } from "./data/categories";
import { getLS, setLS } from "./hooks/useLocalStorage";
import type { Customer, Product, Screen } from "./types";

// Initialize default data on first load
function initApp() {
  if (!localStorage.getItem("apniDukan_initialized")) {
    setLS("apniDukan_categories", DEFAULT_CATEGORIES);
    setLS("apniDukan_settings", {
      phone: "9120499453",
      email: "apni.dukan.0704@gmail.com",
      paymentQR: "",
      ownerPassword: "07041845",
      ownerNames: [],
      theme: "blue",
    });
    localStorage.setItem("apniDukan_initialized", "1");
  }
}

export default function App() {
  useEffect(() => {
    initApp();
  }, []);

  const [screen, setScreen] = useState<Screen>("splash");
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(
    () => {
      const id = getLS<string | null>("apniDukan_currentCustomer", null);
      if (!id) return null;
      const customers = getLS<Customer[]>("apniDukan_customers", []);
      return customers.find((c) => c.id === id) ?? null;
    },
  );
  const [currentOwner, setCurrentOwner] = useState<string | null>(() =>
    getLS<string | null>("apniDukan_currentOwner", null),
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSplashDone = useCallback(() => {
    // Auto-login if session exists
    const custId = getLS<string | null>("apniDukan_currentCustomer", null);
    const owner = getLS<string | null>("apniDukan_currentOwner", null);
    if (custId) {
      const customers = getLS<Customer[]>("apniDukan_customers", []);
      const cust = customers.find((c) => c.id === custId);
      if (cust) {
        setCurrentCustomer(cust);
        setScreen("customer_dashboard");
        return;
      }
    }
    if (owner) {
      setCurrentOwner(owner);
      setScreen("owner_dashboard");
      return;
    }
    setScreen("welcome");
  }, []);

  const handleCustomerSuccess = useCallback((customer: Customer) => {
    setCurrentCustomer(customer);
    setScreen("customer_dashboard");
  }, []);

  const handleOwnerSuccess = useCallback((name: string) => {
    setCurrentOwner(name);
    setScreen("owner_dashboard");
  }, []);

  const handleCustomerLogout = useCallback(() => {
    setLS("apniDukan_currentCustomer", null);
    setCurrentCustomer(null);
    setScreen("welcome");
  }, []);

  const handleOwnerLogout = useCallback(() => {
    setLS("apniDukan_currentOwner", null);
    setCurrentOwner(null);
    setScreen("welcome");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="bottom-center" />

      {screen === "splash" && <SplashScreen onFinish={handleSplashDone} />}

      {screen === "welcome" && (
        <WelcomeScreen
          onOwnerLogin={() => setScreen("owner_login")}
          onCustomerLogin={() => setScreen("customer_login")}
        />
      )}

      {screen === "customer_login" && (
        <CustomerLogin
          onSuccess={handleCustomerSuccess}
          onBack={() => setScreen("welcome")}
        />
      )}

      {screen === "customer_dashboard" && currentCustomer && (
        <CustomerDashboard
          customer={currentCustomer}
          onProductDetail={(product) => {
            setSelectedProduct(product);
            setScreen("product_detail");
          }}
          onCart={() => setScreen("cart")}
          onChat={() => setScreen("customer_chat")}
          onLogout={handleCustomerLogout}
          onOrdersUpdate={() => {}}
        />
      )}

      {screen === "product_detail" && selectedProduct && currentCustomer && (
        <ProductDetail
          product={selectedProduct}
          customerId={currentCustomer.id}
          onBack={() => setScreen("customer_dashboard")}
          onCart={() => setScreen("cart")}
        />
      )}

      {screen === "cart" && currentCustomer && (
        <CartPage
          customerId={currentCustomer.id}
          onBack={() => setScreen("customer_dashboard")}
          onCheckout={() => setScreen("checkout_step1")}
        />
      )}

      {screen === "checkout_step1" && currentCustomer && (
        <CheckoutPage
          customer={currentCustomer}
          onBack={() => setScreen("cart")}
          onSuccess={() => setScreen("customer_dashboard")}
        />
      )}

      {screen === "customer_chat" && currentCustomer && (
        <ChatPage
          customer={currentCustomer}
          onBack={() => setScreen("customer_dashboard")}
        />
      )}

      {screen === "owner_login" && (
        <OwnerLogin
          onSuccess={handleOwnerSuccess}
          onBack={() => setScreen("welcome")}
        />
      )}

      {screen === "owner_dashboard" && currentOwner && (
        <OwnerDashboard ownerName={currentOwner} onLogout={handleOwnerLogout} />
      )}
    </div>
  );
}
