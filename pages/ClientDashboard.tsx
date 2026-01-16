
import React, { useState, useEffect } from 'react';
// Fix: Use namespace import to resolve missing exported member errors
import * as ReactRouterDOM from 'react-router-dom';
import { 
  CheckCircle2, Clock, Calendar, Link as LinkIcon, 
  MessageSquare, User, Package, ArrowLeft, Loader2,
  RefreshCw, LogOut, ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ServiceRequest, ServiceStatus } from '../types';

const { useNavigate } = ReactRouterDOM;

const ClientDashboard: React.FC = () => {
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchClientData = async () => {
    const authData = sessionStorage.getItem('client_auth');
    if (!authData) {
      navigate('/client/portal');
      return;
    }

    const { email, request_id } = JSON.parse(authData);
    setLoading(true);

    try {
      // Use case-insensitive matching even here to prevent edge-case logout loops
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .ilike('email', email)
        .ilike('request_id', request_id)
        .maybeSingle();

      if (error || !data) throw new Error('Session invalid');
      setRequest(data);
    } catch (err) {
      sessionStorage.removeItem('client_auth');
      navigate('/client/portal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('client_auth');
    navigate('/client/portal');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={40} />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Workspace...</p>
      </div>
    </div>
  );

  if (!request) return null;

  const steps: ServiceStatus[] = ['Pending', 'Accepted', 'In Progress', 'Completed'];
  const currentStepIndex = steps.indexOf(request.status);

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-gray-100">
              <Package size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-indigo-900">Workspace: {request.request_id}</h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Authorized Access</p>
            </div>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={fetchClientData}
              className="p-3 bg-white border border-gray-100 text-gray-400 rounded-2xl hover:text-indigo-600 transition-colors shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-red-500 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all shadow-sm"
            >
              <LogOut size={18} /> Exit
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Status Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Stepper */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-indigo-900 uppercase tracking-widest mb-8">Production Cycle</h2>
              
              <div className="relative flex justify-between">
                <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0"></div>
                <div 
                  className="absolute top-5 left-0 h-1 bg-indigo-600 transition-all duration-1000 -z-0"
                  style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, idx) => {
                  const isActive = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  
                  return (
                    <div key={step} className="relative z-10 flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                        isCurrent ? 'bg-indigo-600 border-indigo-200 text-white scale-125' : 
                        isActive ? 'bg-indigo-600 border-white text-white' : 
                        'bg-white border-gray-100 text-gray-300'
                      }`}>
                        {isActive ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-gray-200"></div>}
                      </div>
                      <span className={`mt-4 text-[10px] font-black uppercase tracking-widest ${
                        isCurrent ? 'text-indigo-900' : isActive ? 'text-indigo-400' : 'text-gray-300'
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Service & Schedule Details */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Selected Service</h3>
                  <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                    <p className="text-xl font-bold text-indigo-900 capitalize">{request.service.replace('-', ' ')}</p>
                    <p className="text-indigo-600 text-sm font-medium mt-1">Lumina Creative Partnership</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Timeline Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-gray-700">
                      <Calendar className="text-indigo-600 shrink-0" size={20} />
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Start Date</p>
                        <p className="font-bold">{request.start_date || 'Awaiting Confirmation'}</p>
                      </div>
                    </div>
                    {request.schedule && (
                      <div className="flex items-center gap-4 text-gray-700">
                        <Clock className="text-indigo-600 shrink-0" size={20} />
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Schedule</p>
                          <p className="font-bold">{request.schedule}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Area: Meeting Link */}
              {request.status !== 'Pending' && request.meeting_link && (
                <div className="mt-12 pt-12 border-t border-gray-50">
                  <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h4 className="text-lg font-bold mb-1">Your Virtual Studio Link</h4>
                        <p className="text-indigo-200 text-sm">Access your session or presentation via the secure portal below.</p>
                      </div>
                      <a 
                        href={request.meeting_link.startsWith('http') ? request.meeting_link : `https://${request.meeting_link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-xl"
                      >
                        Join Workspace <ChevronRight size={18} />
                      </a>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-700 rounded-full -mr-16 -mt-16 opacity-40 blur-2xl"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Status Card */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 text-center">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Current Progress</h3>
              <div className={`inline-block px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest mb-6 ${
                request.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                request.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' :
                request.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {request.status}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                {request.status === 'Pending' ? 'Our creative team is evaluating your project scope.' : 
                 request.status === 'Accepted' ? 'Your project has been confirmed. Portal features are now active.' :
                 request.status === 'In Progress' ? 'Active development phase. See schedule for next sync.' :
                 'Deliverables have been finalized. The workspace remains active for archive access.'}
              </p>
            </div>

            {/* Admin Message Box */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="text-indigo-600" size={20} />
                <h3 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Admin Directives</h3>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl min-h-[150px] relative">
                {request.admin_notes ? (
                  <p className="text-sm text-gray-600 italic leading-relaxed">"{request.admin_notes}"</p>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                    <Clock size={24} className="text-gray-200 mb-2" />
                    <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">No notes provided</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Support */}
            <a 
              href={`mailto:support@luminastudio.com?subject=Workspace Support: ${request.request_id}`}
              className="w-full bg-white border border-gray-200 p-6 rounded-[2rem] flex items-center justify-between group hover:border-indigo-600 transition-all shadow-sm"
            >
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Questions?</p>
                <p className="font-bold text-indigo-900">Contact Support</p>
              </div>
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ChevronRight size={18} />
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
