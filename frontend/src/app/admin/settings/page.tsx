"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { 
  Store, 
  CreditCard, 
  Bell, 
  Shield, 
  Mail, 
  Globe, 
  Percent,
  Save,
  Loader2
} from "lucide-react";

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const tabs = [
    { id: "general", label: "General", icon: Store },
    { id: "affiliates", label: "Affiliate System", icon: Percent },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-6">
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
                    <input type="text" defaultValue="ShopEx" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <input type="email" defaultValue="support@shopex.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" />
                  </div>
                </div>
              </div>
              <hr className="border-gray-200" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Regional Settings</h3>
                <div className="grid gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Currency</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-white">
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
                    <input type="number" defaultValue="10" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Payout Threshold ($)</label>
                    <input type="number" defaultValue="50" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cookie Duration (Days)</label>
                    <input type="number" defaultValue="30" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" />
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Return Window Processing</h4>
                <p className="text-sm text-blue-700">Commissions are held as "Pending" until the 30-day return window expires. This is handled automatically by BullMQ workers.</p>
              </div>
            </div>
          )}

          {(activeTab === "payments" || activeTab === "notifications" || activeTab === "security") && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Coming Soon</h3>
              <p className="text-gray-500 mt-2 max-w-sm">This settings module is currently under development and will be available in the next release.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
