import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api.register(form);
      login({ token: res.token, user: res.user });
      navigate("/onboard");
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Create account</h2>
      <form onSubmit={submit} className="space-y-3">
        <input
          className="w-full p-2 border rounded"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <div className="flex gap-2">
          <input
            className="flex-1 p-2 border rounded"
            placeholder="Age"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />
          <input
            className="flex-1 p-2 border rounded"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button
          className="w-full bg-indigo-600 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <div className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <a href="/login" className="text-indigo-600">
          Log in
        </a>
      </div>
    </div>
  );
}
