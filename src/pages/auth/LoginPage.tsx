import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { setError(error.message); return; }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 mb-3">
            <span className="text-white text-xl font-bold">P</span>
          </div>
          <h1 className="text-xl font-semibold text-white">PrepOS</h1>
          <p className="text-slate-400 text-sm mt-1">SSC CGL · Coal India · NET · JAD</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-medium text-white mb-5">Sign in</h2>
          {error && <div className="mb-4 px-3 py-2.5 bg-red-950 border border-red-900 rounded-lg text-red-300 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-slate-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-slate-500" />
            </div>
            <div className="flex justify-end">
              <Link to="/reset-password" className="text-xs text-slate-400 hover:text-white">Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-white text-slate-950 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-slate-500 mt-4">
          No account? <Link to="/signup" className="text-white hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
