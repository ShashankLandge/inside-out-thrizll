// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    name: "",
    age: "",
    location: "",
    profile: {},
  });
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const me = await api.getMe();
        setForm({
          name: me.name || "",
          age: me.age || "",
          location: me.location || "",
          profile: me.profile || {},
        });
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  // src/pages/Profile.jsx (only the save function & form wiring needs changes; full file if you want)
  async function save(e) {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);
    try {
      const payload = {};

      // Only include if non-empty string
      if (form.name && form.name.trim() !== "") payload.name = form.name.trim();

      // age: include only when not empty
      if (
        form.age !== undefined &&
        form.age !== null &&
        `${form.age}`.trim() !== ""
      ) {
        payload.age = Number(form.age);
      }

      if (form.location && form.location.trim() !== "")
        payload.location = form.location.trim();

      // profile: include only if profile object has keys OR if status set
      if (
        form.profile &&
        typeof form.profile === "object" &&
        Object.keys(form.profile).length > 0
      ) {
        payload.profile = form.profile;
      }

      if (Object.keys(payload).length === 0) {
        // Show toast or notification instead of alert
        setSaveSuccess(false);
        setLoading(false);
        return;
      }

      const updated = await api.updateMe(payload);

      // merge updated fields into stored user (do not clobber)
      const existingUser =
        JSON.parse(localStorage.getItem("user") || "null") || {};
      const merged = {
        ...existingUser,
        ...{
          id: updated.id,
          name: updated.name ?? existingUser.name,
          age: updated.age ?? existingUser.age,
          location: updated.location ?? existingUser.location,
          profile: updated.profile ?? existingUser.profile,
        },
      };

      // update auth context properly
      login({ token: localStorage.getItem("token"), user: merged });

      // Show success message
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (e) {
      // Show error toast instead of alert
      console.error(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto card p-6 fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-16 h-16 bg-gradient-love rounded-full flex items-center justify-center text-white font-bold shadow-md">
          {form.name?.charAt(0) || user?.name?.charAt(0) || "U"}
        </div>
        <div>
          <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Your Profile</h3>
          <p className="text-sm text-gray-500">Update your dating profile</p>
        </div>
      </div>
      
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center slide-up">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Profile updated successfully!
        </div>
      )}
      <form onSubmit={save} className="space-y-6">
        <div className="relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-accent">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Your full name"
            className="input w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative flex-1">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-accent">Age</label>
            <input
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              placeholder="Your age"
              type="number"
              className="input w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="relative flex-1">
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-accent">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="City, Country"
              className="input w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-accent">Status</label>
          <input
            value={form.profile?.status || ""}
            onChange={(e) =>
              setForm({
                ...form,
                profile: { ...(form.profile || {}), status: e.target.value },
              })
            }
            placeholder="e.g. Loves dogs • Coffee person"
            className="input w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <div className="text-xs text-gray-400 mt-1 ml-1">
            <span className="text-accent">✨</span> This appears on your user card
          </div>
        </div>

        <div className="relative">
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs font-medium text-accent">
            Extra profile JSON (advanced)
          </label>
          <textarea
            value={JSON.stringify(form.profile || {}, null, 2)}
            onChange={(e) => {
              try {
                setForm({ ...form, profile: JSON.parse(e.target.value) });
              } catch {
                /* ignore if invalid JSON */
              }
            }}
            className="input w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all h-28 font-mono text-sm"
          />
          <div className="text-xs text-gray-400 mt-1 ml-1">
            <span className="text-secondary">💡</span> Store additional profile details (preferences, interests, etc.)
          </div>
        </div>

        <button
          className="btn-primary w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transform hover:scale-[1.02] transition-all"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Profile
            </>
          )}
        </button>
      </form>
    </div>
  );
}
