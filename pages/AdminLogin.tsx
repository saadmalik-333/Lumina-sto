
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  Lock, Mail, Loader2, ShieldCheck, ArrowLeft, 
  AlertCircle, CheckCircle2, UserPlus, 
  Eye, EyeOff, ExternalLink, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

const { useNavigate } = ReactRouterDOM;

const AdminLogin: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);
  
  const { login, signUp, session } = useAuth();
  const navigate = useNavigate();

  const PROJECT_ID = 'peosewioliuyozdjziep';
  const PROVIDERS_URL = `https://supabase.com/dashboard/project/${PROJECT_ID}/auth/providers`;
  const USERS_URL = `https://supabase.com/dashboard/project/${PROJECT_ID}/auth/users`;

  useEffect(() => {
    if (session) navigate('/admin/dashboard');
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setShowTroubleshooting(false);
    setIsEmailUnconfirmed(false);

    try {
      if (isLoginMode) {
        await login(email, password);
        navigate('/admin/dashboard');
      } else {
        await signUp(email, password);
        setSuccess('Account created! But you MUST confirm it in Supabase to log in.');
        setShowTroubleshooting(true);
        setIsLoginMode(true);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || '';
      
      if (msg.includes('Email not confirmed')) {
        setError('Login Blocked: Your email address has not been confirmed yet.');
        setIsEmailUnconfirmed(true);
        setShowTroubleshooting(true);
      } else if (msg.includes('Invalid login credentials')) {
        setError('Invalid credentials. Check your password or check if the user is confirmed.');
        setShowTroubleshooting(true);
      } else {
        setError(msg || 'Authentication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-indigo-600 mb-8 transition-colors text-sm font-medium active:scale-95"
          >
            <ArrowLeft size={16} /> Back to Studio
          </button>
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-lg mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-indigo-900 mb-2">
            {isLoginMode ? 'Admin Portal' : 'Register Admin'}
          </h1>
          <p className="text-gray-500">
            {isLoginMode ? 'Enter your credentials to manage requests.' : 'Create a new administrator account.'}
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 transition-all duration-300">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 flex gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0" />
              <div>
                <p className="font-bold">{isEmailUnconfirmed ? 'Email Confirmation Required' : 'Access Denied'}</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm mb-6 border border-green-100 flex gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={18} className="shrink-0" />
              <div>
                <p className="font-bold">Registration Successful</p>
                <p>{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-indigo-900 mb-2 uppercase tracking-wider">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@luminastudio.com"
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-indigo-900 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  required
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-12 py-4 focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800"
                  autoComplete="current-password"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white px-8 py-4 rounded-full font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-100 disabled:opacity-70 active:scale-95"
            >
              {loading ? (
                <>Processing... <Loader2 className="animate-spin" /></>
              ) : isLoginMode ? (
                <>Sign In <ShieldCheck size={18} /></>
              ) : (
                <>Create Admin <UserPlus size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-50 text-center">
            <button 
              onClick={() => { setIsLoginMode(!isLoginMode); setError(''); setSuccess(''); setShowTroubleshooting(false); setEmail(''); setPassword(''); }}
              className="text-indigo-600 font-bold text-sm hover:underline transition-all"
            >
              {isLoginMode ? "Need an account? Register first" : "Already registered? Sign In"}
            </button>
          </div>
        </div>

        {(showTroubleshooting || isEmailUnconfirmed) && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="flex items-center gap-2 font-bold mb-4 text-base">
                  <AlertTriangle size={20} className="text-yellow-400" />
                  Fix "Email Not Confirmed"
                </h4>
                
                <div className="space-y-6 text-sm text-indigo-100 leading-relaxed">
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center font-bold shrink-0">1</div>
                    <div>
                      <p className="font-bold text-white mb-1">Disable Confirmation (BEST WAY)</p>
                      <p className="mb-2 text-xs opacity-80">Stop Supabase from asking for email verification forever.</p>
                      <a href={PROVIDERS_URL} target="_blank" rel="noreferrer" className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-bold text-xs inline-flex items-center gap-2 hover:bg-indigo-50 transition-colors">
                        Go to Auth Settings <ExternalLink size={14} />
                      </a>
                      <p className="mt-2 text-[10px] italic">Expand 'Email' and turn OFF 'Confirm Email'. Click Save.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center font-bold shrink-0">2</div>
                    <div>
                      <p className="font-bold text-white mb-1">Manually Confirm User</p>
                      <p className="mb-2 text-xs opacity-80">Force this specific user to be active.</p>
                      <a href={USERS_URL} target="_blank" rel="noreferrer" className="text-white font-bold inline-flex items-center gap-1 hover:underline text-xs">
                        Open Users List <ExternalLink size={14} />
                      </a>
                      <p className="mt-1 text-[10px] italic">Find your email &rarr; click '...' (dots) &rarr; 'Confirm User'.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-800 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl"></div>
            </div>
          </div>
        )}
        
        <p className="text-center text-gray-400 text-[10px] mt-8 uppercase tracking-widest font-bold">
          Studio Admin Security Layer
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
