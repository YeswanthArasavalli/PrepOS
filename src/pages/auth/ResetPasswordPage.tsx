import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-medium text-white mb-2">Reset password</h2>
          <p className="text-sm text-slate-400 mb-5">Enter your email and we will send you a reset link.</p>
          {done ? (
            <div className="text-center py-4">
              <p className="text-emerald-400 text-sm">Reset link sent. Check your inbox.</p>
              <Link to="/login" className="mt-4 inline-block text-sm text-white hover:underline">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="px-3 py-2.5 bg-red-950 border border-red-900 rounded-lg text-red-300 text-sm">{error}</div>}
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-slate-500" />
              <button type="submit" disabled={loading}
                className="w-full py-2.5 bg-white text-slate-950 rounded-lg text-sm font-medium disabled:opacity-50">
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-sm text-slate-500 mt-4">
          <Link to="/login" className="text-white hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
