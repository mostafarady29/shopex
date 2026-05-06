"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { 
  Store, 
  CreditCard, 
  Bell, 
  Shield, 
  Percent,
  Save,
  Loader2,
  X
} from "lucide-react";
import api from "@/lib/api";
import QRCode from "react-qr-code";

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Settings State
  const [settings, setSettings] = useState({
    storeName: "",
    contactEmail: "",
    currency: "USD",
    affiliateCommissionRate: 10,
    affiliateMinPayout: 50,
    affiliateCookieDuration: 30,
    stripeEnabled: false,
    stripePublishableKey: "",
    stripeSecretKey: "",
    paypalEnabled: false,
    paypalClientId: "",
    notifyNewOrders: true,
    notifyLowStock: true,
    notifyNewAffiliates: true,
    notifySupportTickets: false,
    adminSessionTimeout: 60,
    customerPasswordPolicy: "standard",
  });

  // User State
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

  // Passwords
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // 2FA Modal
  const [show2faModal, setShow2faModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, userRes] = await Promise.all([
          api.get("/settings"),
          api.get("/auth/me")
        ]);
        
        if (settingsRes.data.settings) {
          const s = settingsRes.data.settings;
          setSettings({
            ...s,
            stripePublishableKey: s.stripePublishableKey || "",
            stripeSecretKey: s.stripeSecretKey || "",
            paypalClientId: s.paypalClientId || ""
          });
        }

        if (userRes.data.user) {
          setIsTwoFactorEnabled(userRes.data.user.isTwoFactorEnabled || false);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSettingChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(""), 3000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put("/settings", settings);
      showToast("Settings saved successfully.");
    } catch (err) {
      showToast("Failed to save settings.", true);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      return showToast("New passwords do not match", true);
    }
    if (!passwords.currentPassword || !passwords.newPassword) {
      return showToast("Please fill all password fields", true);
    }

    try {
      await api.put("/auth/update-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      showToast("Password updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update password", true);
    }
  };

  const handleToggle2FA = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      // Generate secret and show modal
      try {
        const res = await api.post("/auth/2fa/generate");
        setQrCodeUrl(res.data.otpauthUrl);
        setShow2faModal(true);
      } catch (err) {
        showToast("Failed to generate 2FA", true);
      }
    } else {
      // Disable 2FA
      try {
        await api.post("/auth/2fa/disable");
        setIsTwoFactorEnabled(false);
        showToast("2FA has been disabled.");
      } catch (err) {
        showToast("Failed to disable 2FA", true);
      }
    }
  };

  const handleVerify2FA = async () => {
    try {
      await api.post("/auth/2fa/enable", { token: twoFactorCode });
      setIsTwoFactorEnabled(true);
      setShow2faModal(false);
      setTwoFactorCode("");
      showToast("2FA has been successfully enabled!");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Invalid 2FA code", true);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Store },
    { id: "affiliates", label: "Affiliate System", icon: Percent },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6 relative">
      {/* Toast Messages */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-50 text-green-900 border border-green-200 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-50 text-red-900 border border-red-200 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          {errorMessage}
        </div>
      )}

      {/* 2FA Modal */}
      {show2faModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Enable Two-Factor Auth</h3>
              <button onClick={() => setShow2faModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-600 mb-6">Scan this QR code with Google Authenticator or Authy, then enter the 6-digit code below.</p>
            
            <div className="flex justify-center mb-6 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
              <QRCode value={qrCodeUrl} size={180} />
            </div>

            <input 
              type="text" 
              placeholder="Enter 6-digit code" 
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              className="w-full text-center tracking-[0.5em] text-2xl px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none mb-4" 
              maxLength={6}
            />

            <Button onClick={handleVerify2FA} className="w-full">Verify and Enable</Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your store configuration and affiliate rules.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Store Profile</h3>
                <p className="text-sm text-gray-500 mb-4">This information will be displayed publicly.</p>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                    <input type="text" value={settings.storeName} onChange={(e) => handleSettingChange("storeName", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input type="email" value={settings.contactEmail} onChange={(e) => handleSettingChange("contactEmail", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" />
                  </div>
                </div>
              </div>
              <hr className="border-gray-200" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Regional Settings</h3>
                <div className="grid gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Currency</label>
                    <select value={settings.currency} onChange={(e) => handleSettingChange("currency", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all bg-white">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "affiliates" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Global Affiliate Rules</h3>
                <p className="text-sm text-gray-500 mb-4">Configure the default behavior for your affiliate program.</p>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Commission Rate (%)</label>
                    <input type="number" value={settings.affiliateCommissionRate} onChange={(e) => handleSettingChange("affiliateCommissionRate", Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Payout Threshold ($)</label>
                    <input type="number" value={settings.affiliateMinPayout} onChange={(e) => handleSettingChange("affiliateMinPayout", Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cookie Duration (Days)</label>
                    <input type="number" value={settings.affiliateCookieDuration} onChange={(e) => handleSettingChange("affiliateCookieDuration", Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Payment Gateways</h3>
                <p className="text-sm text-gray-500 mb-4">Configure your payment processors to accept customer payments.</p>
                <div className="grid gap-4">
                  <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-base">Stripe Integration</h4>
                        <p className="text-sm text-gray-500 mt-1">Accept credit cards, Apple Pay, and Google Pay.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={settings.stripeEnabled} onChange={(e) => handleSettingChange("stripeEnabled", e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>
                    <div className={`space-y-4 ${!settings.stripeEnabled && 'opacity-50 pointer-events-none'}`}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Publishable Key</label>
                        <input type="text" value={settings.stripePublishableKey} onChange={(e) => handleSettingChange("stripePublishableKey", e.target.value)} placeholder="pk_test_..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all font-mono text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                        <input type="password" value={settings.stripeSecretKey} onChange={(e) => handleSettingChange("stripeSecretKey", e.target.value)} placeholder="sk_test_..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all font-mono text-sm" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 border border-gray-200 rounded-xl bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-base">PayPal</h4>
                        <p className="text-sm text-gray-500 mt-1">Accept PayPal and Venmo payments.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={settings.paypalEnabled} onChange={(e) => handleSettingChange("paypalEnabled", e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>
                    <div className={`space-y-4 ${!settings.paypalEnabled && 'opacity-50 pointer-events-none'}`}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                        <input type="text" value={settings.paypalClientId} onChange={(e) => handleSettingChange("paypalClientId", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all font-mono text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Admin Notifications</h3>
                <p className="text-sm text-gray-500 mb-4">Select which events trigger email notifications to administrators.</p>
                
                <div className="border border-gray-200 rounded-xl divide-y divide-gray-100">
                  <label className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors rounded-t-xl">
                    <div>
                      <p className="font-medium text-gray-900">New Orders</p>
                      <p className="text-sm text-gray-500">Get notified when a customer places a new order.</p>
                    </div>
                    <input type="checkbox" checked={settings.notifyNewOrders} onChange={(e) => handleSettingChange("notifyNewOrders", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black" />
                  </label>
                  
                  <label className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">Low Stock Alerts</p>
                      <p className="text-sm text-gray-500">Get notified when product inventory falls below threshold.</p>
                    </div>
                    <input type="checkbox" checked={settings.notifyLowStock} onChange={(e) => handleSettingChange("notifyLowStock", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black" />
                  </label>
                  
                  <label className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">New Affiliate Signups</p>
                      <p className="text-sm text-gray-500">Get notified when a new affiliate registers.</p>
                    </div>
                    <input type="checkbox" checked={settings.notifyNewAffiliates} onChange={(e) => handleSettingChange("notifyNewAffiliates", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black" />
                  </label>
                  
                  <label className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors rounded-b-xl">
                    <div>
                      <p className="font-medium text-gray-900">Customer Support Tickets</p>
                      <p className="text-sm text-gray-500">Get notified when a customer submits a new ticket.</p>
                    </div>
                    <input type="checkbox" checked={settings.notifySupportTickets} onChange={(e) => handleSettingChange("notifySupportTickets", e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Security Preferences</h3>
                <p className="text-sm text-gray-500 mb-6">Manage security policies for admin and customer accounts.</p>
                
                <div className="grid gap-6">
                  <div className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 text-base">Two-Factor Authentication (2FA)</h4>
                        <p className="text-sm text-gray-500 mt-1">Require all administrator accounts to use 2FA via Authenticator app.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isTwoFactorEnabled} onChange={handleToggle2FA} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-xl p-5 mt-4">
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <h4 className="font-medium text-gray-900 text-base">Change Password</h4>
                      <p className="text-sm text-gray-500 mt-1">Update your administrator password.</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords(p => ({ ...p, newPassword: e.target.value }))} placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all" />
                      </div>
                      <button onClick={handlePasswordUpdate} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Session Timeout</label>
                    <select value={settings.adminSessionTimeout} onChange={(e) => handleSettingChange("adminSessionTimeout", Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all bg-white">
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="1440">24 Hours</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-2">Automatically log out inactive admin sessions after this duration.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Password Policy</label>
                    <select value={settings.customerPasswordPolicy} onChange={(e) => handleSettingChange("customerPasswordPolicy", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none transition-all bg-white">
                      <option value="standard">Standard (8+ characters, at least 1 number)</option>
                      <option value="strict">Strict (12+ characters, uppercase, lowercase, number, symbol)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
