import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { getLS, setLS } from "../../hooks/useLocalStorage";
import type { AppSettings, Category } from "../../types";

interface OwnerSettingsProps {
  onBack: () => void;
}

export default function OwnerSettings({ onBack: _onBack }: OwnerSettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(() =>
    getLS<AppSettings>("apniDukan_settings", {
      phone: "9120499453",
      email: "apni.dukan.0704@gmail.com",
      paymentQR: "",
      ownerPassword: "07041845",
      ownerNames: [],
      theme: "blue",
    }),
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    getLS<Category[]>("apniDukan_categories", []),
  );

  // Password change
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passStep, setPassStep] = useState<"current" | "new">("current");
  const [passError, setPassError] = useState("");

  // Contact
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);

  const qrRef = useRef<HTMLInputElement>(null);
  const catImgRefs = useRef<(HTMLInputElement | null)[]>([]);

  function saveSettings(partial: Partial<AppSettings>) {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    setLS("apniDukan_settings", updated);
  }

  function handlePasswordStep1() {
    if (currentPass !== settings.ownerPassword) {
      setPassError("Current password is incorrect");
      return;
    }
    setPassError("");
    setPassStep("new");
  }

  function handlePasswordSave() {
    if (!newPass.trim()) {
      toast.error("Password cannot be empty");
      return;
    }
    saveSettings({ ownerPassword: newPass.trim() });
    setCurrentPass("");
    setNewPass("");
    setPassStep("current");
    toast.success("Password changed successfully");
  }

  function handleQRChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => saveSettings({ paymentQR: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = "";
    toast.success("QR code updated!");
  }

  function saveContact() {
    saveSettings({ phone: phone.trim(), email: email.trim() });
    toast.success("Contact details updated!");
  }

  function updateCategoryName(id: string, name: string) {
    const updated = categories.map((c) => (c.id === id ? { ...c, name } : c));
    setCategories(updated);
    setLS("apniDukan_categories", updated);
  }

  function handleCategoryImage(
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const updated = categories.map((c) =>
        c.id === id ? { ...c, image: reader.result as string } : c,
      );
      setCategories(updated);
      setLS("apniDukan_categories", updated);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b bg-white">
        <h2 className="font-bold text-gray-800">Settings</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Owner Logins */}
        <section className="mb-6">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">
            Owner Logins
          </p>
          <div className="bg-white rounded-xl p-4 border">
            {settings.ownerNames.length === 0 ? (
              <p className="text-sm text-gray-400">No owners registered yet</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {settings.ownerNames.map((name, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable owner names
                  <li key={i} className="text-sm text-gray-700">
                    • {name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Change Password */}
        <section className="mb-6">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">
            Change Password
          </p>
          <div className="bg-white rounded-xl p-4 border flex flex-col gap-3">
            {passStep === "current" ? (
              <>
                <div>
                  <Label>Current Password</Label>
                  <Input
                    data-ocid="owner_settings.password.input"
                    type="password"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="mt-1"
                  />
                </div>
                {passError && (
                  <p className="text-xs text-destructive">{passError}</p>
                )}
                <Button
                  data-ocid="owner_settings.password.primary_button"
                  onClick={handlePasswordStep1}
                  className="w-full"
                >
                  Verify
                </Button>
              </>
            ) : (
              <>
                <div>
                  <Label>New Password</Label>
                  <Input
                    data-ocid="owner_settings.newpassword.input"
                    type="password"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button
                  data-ocid="owner_settings.newpassword.save_button"
                  onClick={handlePasswordSave}
                  className="w-full"
                >
                  Save New Password
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setPassStep("current");
                    setPassError("");
                  }}
                  className="w-full text-gray-500"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </section>

        {/* Payment QR */}
        <section className="mb-6">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">
            Payment QR Code
          </p>
          <div className="bg-white rounded-xl p-4 border flex flex-col gap-3 items-center">
            {settings.paymentQR ? (
              <img
                src={settings.paymentQR}
                alt="QR"
                className="w-40 h-40 object-contain rounded"
              />
            ) : (
              <div className="w-40 h-40 border-2 border-dashed rounded flex items-center justify-center">
                <p className="text-xs text-gray-400">No QR uploaded</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              ref={qrRef}
              onChange={handleQRChange}
              className="hidden"
            />
            <Button
              data-ocid="owner_settings.qr.upload_button"
              variant="outline"
              onClick={() => qrRef.current?.click()}
              className="w-full"
            >
              Change QR Code
            </Button>
          </div>
        </section>

        {/* Contact Details */}
        <section className="mb-6">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">
            Contact Details
          </p>
          <div className="bg-white rounded-xl p-4 border flex flex-col gap-3">
            <div>
              <Label>Phone Number</Label>
              <Input
                data-ocid="owner_settings.phone.input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                data-ocid="owner_settings.email.input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button
              data-ocid="owner_settings.contact.save_button"
              onClick={saveContact}
              className="w-full"
            >
              Save Contact Details
            </Button>
          </div>
        </section>

        {/* Category Management */}
        <section className="mb-6">
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">
            Category Management
          </p>
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex flex-col gap-3">
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  data-ocid={`owner_settings.category.item.${idx + 1}`}
                  className="flex items-center gap-3"
                >
                  <button
                    type="button"
                    onClick={() => catImgRefs.current[idx]?.click()}
                    className="flex-shrink-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-50 border flex items-center justify-center overflow-hidden">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-contain p-0.5"
                      />
                    </div>
                  </button>
                  <input
                    ref={(el) => {
                      catImgRefs.current[idx] = el;
                    }}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCategoryImage(cat.id, e)}
                    className="hidden"
                  />
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => updateCategoryName(cat.id, e.target.value)}
                    className="flex-1 text-sm border rounded px-2 py-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
