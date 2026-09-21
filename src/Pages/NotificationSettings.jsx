import { useEffect, useState } from "react";
import SubPageLayout from "../Components/SubPageLayout";
import { useSettings } from "../Components/SettingsProvider";

export default function NotificationSettings() {
  const { settings, saveSettings } = useSettings();
  const [preferences, setPreferences] = useState(settings.notifications);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => setPreferences(settings.notifications), [settings.notifications]);

  function togglePreference(key) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await saveSettings({ notifications: preferences });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SubPageLayout title="Notifications">
      <div className="space-y-8">
        <div>
          <h2 className="text-sm font-semibold text-neutral-500 mb-3">Notification preferences</h2>
          <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
            {[
              ["master", "All notifications"],
              ["expenseAdded", "Expense added"],
              ["savingsAdded", "Savings added"],
              ["goalReminders", "Savings goal reminders"],
              ["monthlySummary", "Monthly financial summary"],
              ["securityAlerts", "Security alerts"],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between px-4 py-3 text-sm text-neutral-800">
                {label}
                <input type="checkbox" checked={preferences[key]} onChange={() => togglePreference(key)} className="h-4 w-4 accent-orange-500" />
              </label>
            ))}
          </div>
          <button type="button" onClick={handleSave} disabled={isSaving} className="mt-4 w-full rounded-full bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60">{isSaving ? "Saving..." : saved ? "Saved" : "Save Changes"}</button>
        </div>

      </div>
    </SubPageLayout>
  );
}