import { useEffect, useState } from "react";
import SubPageLayout from "../Components/SubPageLayout";
import { useSettings } from "../Components/SettingsProvider";
import { useTheme } from "../Components/ThemeProvider";

export default function GeneralSettings() {
  const { settings, saveSettings } = useSettings();
  const { setTheme } = useTheme();
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => setDraft(settings), [settings]);

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await saveSettings({
        language: draft.language,
        currency: draft.currency,
        dateFormat: draft.dateFormat,
        firstDayOfWeek: draft.firstDayOfWeek,
        theme: draft.theme,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1800);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SubPageLayout title="General">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-neutral-800">
            Language
            <select value={draft.language} onChange={(event) => setDraft({ ...draft, language: event.target.value })} className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm">
              <option value="en">English</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-neutral-800">
            Currency
            <select value={draft.currency} onChange={(event) => setDraft({ ...draft, currency: event.target.value })} className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm">
              <option value="NGN">₦ Nigerian Naira</option>
              <option value="USD">$ US Dollar</option>
              <option value="GBP">£ British Pound</option>
              <option value="EUR">€ Euro</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-neutral-800">
            Date format
            <select value={draft.dateFormat} onChange={(event) => setDraft({ ...draft, dateFormat: event.target.value })} className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-neutral-800">
            First day of week
            <select value={draft.firstDayOfWeek} onChange={(event) => setDraft({ ...draft, firstDayOfWeek: event.target.value })} className="mt-2 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm">
              <option>Monday</option>
              <option>Sunday</option>
            </select>
          </label>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-500 mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {["light", "dark", "system"].map((option) => (
              <label key={option} className={`cursor-pointer rounded-xl border px-3 py-3 text-center text-sm capitalize ${draft.theme === option ? "border-orange-500 bg-orange-50 text-orange-700" : "border-neutral-200 text-neutral-600"}`}>
                <input type="radio" name="theme" value={option} checked={draft.theme === option} onChange={() => { setDraft({ ...draft, theme: option }); setTheme(option); }} className="sr-only" />
                {option}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isSaving} className="w-full rounded-full bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-wait disabled:opacity-60">
          {isSaving ? "Saving..." : saved ? "Saved" : "Save Changes"}
        </button>
      </form>
    </SubPageLayout>
  );
}
