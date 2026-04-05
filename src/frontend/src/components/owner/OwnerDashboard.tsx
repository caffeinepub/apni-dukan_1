import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  Settings,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { getLS, setLS } from "../../hooks/useLocalStorage";
import type { OwnerTab } from "../../types";
import AdvertisementManagement from "./AdvertisementManagement";
import ChatManagement from "./ChatManagement";
import OrderManagement from "./OrderManagement";
import OwnerSettings from "./OwnerSettings";
import ProductManagement from "./ProductManagement";

interface OwnerDashboardProps {
  ownerName: string;
  onLogout: () => void;
}

export default function OwnerDashboard({
  ownerName,
  onLogout,
}: OwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<OwnerTab>("product");
  const [profileOpen, setProfileOpen] = useState(false);
  const [editName, setEditName] = useState(ownerName);
  const [currentName, setCurrentName] = useState(ownerName);

  function saveName() {
    setLS("apniDukan_currentOwner", editName.trim() || ownerName);
    const s = getLS<{ ownerNames: string[] }>("apniDukan_settings", {
      ownerNames: [],
    });
    if (editName.trim() && !s.ownerNames.includes(editName.trim())) {
      s.ownerNames.push(editName.trim());
      setLS("apniDukan_settings", s);
    }
    setCurrentName(editName.trim() || ownerName);
    setProfileOpen(false);
  }

  const tabs: { id: OwnerTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "product",
      label: "Product",
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      id: "order",
      label: "Order",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    { id: "chat", label: "Chat", icon: <MessageCircle className="w-5 h-5" /> },
    {
      id: "advertisement",
      label: "Ads",
      icon: <Megaphone className="w-5 h-5" />,
    },
    { id: "owner", label: "Owner", icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-[480px] mx-auto relative">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 bg-white shadow-sm flex items-center justify-between px-4 py-2">
        <button
          type="button"
          data-ocid="owner_dashboard.logo.button"
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-2"
        >
          <img
            src="/assets/img-20260403-wa0000-019d5212-163d-7239-b20a-489c5dd03af6.jpg"
            alt="logo"
            className="rounded-full object-contain bg-white border border-gray-200"
            style={{ width: 36, height: 36 }}
          />
          <div className="text-left">
            <p className="text-sm font-extrabold text-gray-900 leading-tight">
              Apni Dukan
            </p>
            <p className="text-[10px] text-primary leading-tight">
              Admin Panel
            </p>
          </div>
        </button>
        <button
          type="button"
          data-ocid="owner_dashboard.menu.button"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          {profileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </header>

      {/* Profile Dropdown */}
      <AnimatePresence>
        {profileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            data-ocid="owner_dashboard.popover"
            className="absolute top-14 right-4 z-40 bg-white rounded-xl shadow-xl border p-4 w-64"
          >
            <p className="text-xs text-gray-400 mb-2">Logged in as</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                {currentName[0]?.toUpperCase()}
              </div>
              <p className="font-bold text-gray-800">{currentName}</p>
            </div>
            <div className="flex flex-col gap-2 mb-3">
              <input
                className="border rounded-lg px-3 py-1.5 text-sm w-full"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Edit name"
              />
              <Button
                type="button"
                data-ocid="owner_dashboard.save_button"
                size="sm"
                onClick={saveName}
                className="w-full"
              >
                <User className="w-3 h-3 mr-1" /> Save Name
              </Button>
            </div>
            <button
              type="button"
              data-ocid="owner_dashboard.logout.button"
              onClick={() => {
                setLS("apniDukan_currentOwner", null);
                onLogout();
              }}
              className="flex items-center gap-2 text-red-500 text-sm font-medium w-full"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-base font-bold text-gray-800">
          Hello {currentName},
        </p>
      </div>

      {/* Tab Content */}
      <main className="flex-1 overflow-hidden pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {activeTab === "product" && <ProductManagement onBack={() => {}} />}
            {activeTab === "order" && <OrderManagement onBack={() => {}} />}
            {activeTab === "chat" && <ChatManagement onBack={() => {}} />}
            {activeTab === "advertisement" && (
              <AdvertisementManagement onBack={() => {}} />
            )}
            {activeTab === "owner" && <OwnerSettings onBack={() => {}} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t flex z-30">
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            data-ocid={`owner_dashboard.${tab.id}.tab`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
              activeTab === tab.id
                ? "text-primary border-t-2 border-primary"
                : "text-gray-400"
            }`}
          >
            {tab.icon}
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
