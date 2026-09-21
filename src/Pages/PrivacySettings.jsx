import { useState } from "react";
import SubPageLayout from "../Components/SubPageLayout";
import { useSettings } from "../Components/SettingsProvider";

export default function PrivacySettings() {
  const { settings: appSettings, saveSettings } = useSettings();
  const [settings, setSettings] = useState(appSettings.privacy);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function toggleSetting(key) {
    setSettings((current) => {
      const next = { ...current, [key]: !current[key] };
      return next;
    });
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await saveSettings({ privacy: settings });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } finally {
      setIsSaving(false);
    }
  }

  function clearLocalData() {
    localStorage.clear();
    window.location.reload();
  }

  return (
    <SubPageLayout title="Privacy">
      <div className="space-y-6">
        <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200">
          {[
            ["showBalance", "Show balance on Home"],
            ["saveHistory", "Save transaction history"],
            ["analytics", "Use data for analytics"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center justify-between px-4 py-3 text-sm text-neutral-800">
              {label}
              <input type="checkbox" checked={settings[key]} onChange={() => toggleSetting(key)} className="h-4 w-4 accent-orange-500" />
            </label>
          ))}
        </div>
        <button type="button" onClick={handleSave} disabled={isSaving} className="w-full rounded-full bg-orange-500 px-4 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60">{isSaving ? "Saving..." : saved ? "Saved" : "Save Changes"}</button>
        <button type="button" onClick={clearLocalData} className="w-full rounded-xl border border-red-200 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50">
          Clear local app data
        </button>
      </div>
    </SubPageLayout>
  );
}