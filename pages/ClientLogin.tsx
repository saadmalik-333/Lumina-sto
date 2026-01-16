
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  Mail, Hash, ArrowRight, Loader2, ShieldCheck, 
  AlertCircle, Clock, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const { useNavigate } = ReactRouterDOM;

const ClientLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [requestId, setRequestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsPending(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanId = requestId.trim().toUpperCase();

    try {
      const { data, error: dbError } = await supabase
        .from('requests')
        .select('*')
        .ilike('email', cleanEmail)
        .eq('request_id', cleanId)
        .maybeSingle();

      if (dbError) throw dbError;

      if (!data) {
        setError(`Access Denied: The portal ID "${cleanId}" for email "${cleanEmail}" was not found.`);
        setLoading(false);
        return;
      }

      if (data.status === 'Pending') {
        setIsPending(true);
        setError('Project Workspace Initialization: Your cloud portal is currently being provisioned by our team.');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('client_auth', JSON.stringify({
        email: data.email,
        request_id: data.request_id
      }));

      navigate('/client/dashboard');
    } catch (err: any) {
      setError(err.message || 'Cloud authentication failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-indigo-900 mb-2">Project Portal</h1>
          <p className="text-gray-500 font-medium">Secure Cloud Workspace Login</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-gray-100">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-indigo-50 text-indigo-600 border-indigo-100">
              <Zap size={10} fill="currentColor" /> Live Cloud Active
            </div>
          </div>

          {error && (
            <div className={`${isPending ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-red-50 text-red-600 border-red-100'} p-5 rounded-2xl text-sm mb-8 border flex gap-4 animate-in fade-in slide-in-from-top-2`}>
              <div className="shrink-0 mt-0.5">
                {isPending ? <Clock size={20} /> : <AlertCircle size={20} />}
              </div>
              <div className="flex-1 text-[13px] font-medium leading-relaxed">
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-indigo-900 mb-3 uppercase tracking-[0.2em]">Registered Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-indigo-900 mb-3 uppercase tracking-[0.2em]">Workspace ID</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  type="text" 
                  value={requestId}
                  onChange={(e) => setRequestId(e.target.value)}
                  placeholder="LMN-XXXX"
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800 text-sm font-medium uppercase tracking-widest"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-8 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-50"
            >
              {loading ? (
                <>Authenticating... <Loader2 className="animate-spin" /></>
              ) : (
                <>Enter Portal <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
