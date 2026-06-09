import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function SignupPage() {
  const { signUp } = useAuth();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError(""); setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
  };

  if (done) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-900 flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
        <h2 className="text-lg font-medium text-white mb-2">Check your email</h2>
        <p className="text-slate-400 text-sm">Confirmation link sent to <strong className="text-white">{email}</strong></p>
        <Link to="/login" className="mt-6 inline-block text-sm text-white hover:underline">Back to login</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 mb-3">
            <span className="text-white text-xl font-bold">P</span>
          </div>
          <h1 className="text-xl font-semibold text-white">PrepOS</h1>
          <p className="text-slate-400 text-sm mt-1">Create your account</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-medium text-white mb-5">Sign up</h2>
          {error && <div className="mb-4 px-3 py-2.5 bg-red-950 border border-red-900 rounded-lg text-red-300 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[{label:"Your name",type:"text",val:name,set:setName,ph:"Your name"},{label:"Email",type:"email",val:email,set:setEmail,ph:"you@email.com"},{label:"Password",type:"password",val:password,set:setPassword,ph:"Min. 8 characters"}].map(f=>(
              <div key={f.label}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}</label>
                <input type={f.type} required value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-slate-500" />
              </div>
            ))}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-white text-slate-950 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50">
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account? <Link to="/login" className="text-white hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
