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
        alert("No changes to save");
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

      alert("Saved");
    } catch (e) {
      alert(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h3 className="text-xl font-semibold mb-4">Your profile</h3>
      <form onSubmit={save} className="space-y-3">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
          className="w-full p-2 border rounded"
        />
        <div className="flex gap-2">
          <input
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            placeholder="Age"
            className="flex-1 p-2 border rounded"
          />
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Location"
            className="flex-1 p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Status (short)
          </label>
          <input
            value={form.profile?.status || ""}
            onChange={(e) =>
              setForm({
                ...form,
                profile: { ...(form.profile || {}), status: e.target.value },
              })
            }
            placeholder="e.g. Loves dogs • Coffee person"
            className="w-full p-2 border rounded"
          />
          <div className="text-xs text-gray-400 mt-1">
            Optional — appears on your user card
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
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
            className="w-full p-2 border rounded h-28"
          />
          <div className="text-xs text-gray-400 mt-1">
            You can store other optional fields here (preferences, religion,
            etc.)
          </div>
        </div>

        <button
          className="w-full p-2 bg-indigo-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
