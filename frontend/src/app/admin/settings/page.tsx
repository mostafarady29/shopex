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
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Publishable Key</label>
                        <input type="text" placeholder="pk_test_..." defaultValue="pk_test_51O..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-mono text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                        <input type="password" placeholder="sk_test_..." defaultValue="sk_test_51O..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-mono text-sm" />
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
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>
                    <div className="space-y-4 opacity-50 pointer-events-none">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client ID</label>
                        <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all font-mono text-sm" />
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
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black" defaultChecked />
                  </label>
                  
                  <label className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">Low Stock Alerts</p>
                      <p className="text-sm text-gray-500">Get notified when product inventory falls below threshold.</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black" defaultChecked />
                  </label>
                  
                  <label className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">New Affiliate Signups</p>
                      <p className="text-sm text-gray-500">Get notified when a new affiliate registers.</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black" defaultChecked />
                  </label>
                  
                  <label className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors rounded-b-xl">
                    <div>
                      <p className="font-medium text-gray-900">Customer Support Tickets</p>
                      <p className="text-sm text-gray-500">Get notified when a customer submits a new ticket.</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black accent-black" />
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
                        <input type="checkbox" className="sr-only peer" defaultChecked />
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
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all" />
                      </div>
                      <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Session Timeout</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-white">
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="1440">24 Hours</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-2">Automatically log out inactive admin sessions after this duration.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Password Policy</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-white">
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
