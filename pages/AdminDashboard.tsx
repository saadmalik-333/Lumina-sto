import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  Search, ExternalLink, RefreshCw, 
  Check, X as CloseIcon, Trash2, 
  Download, FilterX, Loader2, CheckCircle,
  MessageSquare, AlertCircle, CheckCircle2,
  LogOut, ShieldCheck, User, ChevronRight,
  Clock, Calendar
} from 'lucide-react';
import { supabase } from '../lib/supabase.ts';
import { ServiceRequest, ServiceStatus } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';

const { useNavigate, Link } = ReactRouterDOM;

const AdminDashboard: React.FC = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | 'All'>('All');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const { logout, session } = useAuth();
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
      showNotification('Database synchronization failure.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
        },
        (payload) => {
          const updatedRecord = payload.new as ServiceRequest;
          
          if (payload.eventType === 'INSERT') {
            setRequests((prev) => [updatedRecord, ...prev]);
            showNotification('New project inquiry received in real-time.', 'success');
          } else if (payload.eventType === 'UPDATE') {
            setRequests((prev) => 
              prev.map(r => r.id === updatedRecord.id ? { ...r, ...updatedRecord } : r)
            );
            // Sync current modal if open
            setSelectedRequest(current => 
              current?.id === updatedRecord.id ? { ...current, ...updatedRecord } : current
            );
          } else if (payload.eventType === 'DELETE') {
            setRequests((prev) => prev.filter(r => r.id !== payload.old.id));
            if (selectedRequest?.id === payload.old.id) setSelectedRequest(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRequest?.id]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
      showNotification('Logout failed. Please try again.', 'error');
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const acceptRequest = async (request: ServiceRequest) => {
    if (!request.id || updating) return;
    setUpdating(true);
    
    try {
      const { error: sbError } = await supabase
        .from('requests')
        .update({ status: 'Accepted' })
        .eq('id', request.id);

      if (sbError) throw sbError;

      // Update Local State immediately to prevent "hang" feel
      const updatedItem = { ...request, status: 'Accepted' as ServiceStatus };
      setRequests(prev => prev.map(r => r.id === request.id ? updatedItem : r));
      if (selectedRequest?.id === request.id) setSelectedRequest(updatedItem);

      showNotification('Project production phase activated.', 'success');

      // Background Integration (Non-blocking)
      const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwtPl0XA_2zAW2bS2UuA95a0EFAGTrNLP-7_8q10tsU5K_1HQwB0AthIf0X9bkI45L6Yw/exec';
      const payload = {
        request_id: request.request_id,
        full_name: request.full_name,
        email: request.email,
        service: request.service,
        project_details: request.project_details,
        budget: request.budget_range,
        deadline: request.deadline,
        status: 'Accepted',
        start_date: request.start_date || new Date().toISOString().split('T')[0]
      };

      fetch(WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(e => console.warn('Background sync warning:', e.message));

    } catch (err: any) {
      console.error('Acceptance Logic Error:', err);
      showNotification('Project update failed.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const updateRequestData = async (id: string, updates: Partial<ServiceRequest>) => {
    if (updating) return;
    setUpdating(true);
    try {
      const { error } = await supabase.from('requests').update(updates).eq('id', id);
      if (error) throw error;
      
      // Update local state immediately
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      if (selectedRequest?.id === id) setSelectedRequest(prev => prev ? { ...prev, ...updates } : null);
      
      showNotification('Cloud database updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Update operation failed.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm('Permanently delete this record from the cloud?')) return;
    try {
      const { error } = await supabase.from('requests').delete().eq('id', id);
      if (error) throw error;
      setRequests(prev => prev.filter(r => r.id !== id));
      if (selectedRequest?.id === id) setSelectedRequest(null);
      showNotification('Project record removed.', 'success');
    } catch (err) {
      console.error(err);
      showNotification('Deletion failed.', 'error');
    }
  };

  const filteredRequests = requests.filter(r => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (r.full_name || '').toLowerCase().includes(term) || 
                          (r.request_id || '').toLowerCase().includes(term) ||
                          (r.email || '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-600 border border-yellow-100';
      case 'Accepted': return 'bg-green-50 text-green-600 border border-green-100';
      case 'In Progress': return 'bg-indigo-50 text-indigo-600 border border-indigo-100';
      case 'Completed': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'Rejected': return 'bg-red-50 text-red-600 border border-red-100';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const isRecentlyCreated = (dateStr?: string) => {
    if (!dateStr) return false;
    const now = new Date();
    const created = new Date(dateStr);
    const diff = now.getTime() - created.getTime();
    return diff < 1000 * 60 * 60 * 24;
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pt-20">
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-indigo-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 lg:gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-xl font-serif font-black tracking-tighter text-indigo-900 group-hover:text-indigo-600 transition-colors">LUMINA</span>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
            </Link>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <div className="hidden lg:flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Admin Control</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-3 mr-4">
               <div className="text-right">
                  <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest leading-none">Director</p>
                  <p className="text-[9px] text-slate-400 font-bold leading-none mt-1 truncate max-w-[120px]">{session?.user?.email}</p>
               </div>
               <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
                  <User size={20} />
               </div>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-50 text-red-600 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-sm hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 border border-red-100 active:scale-95"
            >
              <LogOut size={14} className="sm:w-4 sm:h-4" /> <span className="hidden xs:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex-grow">
        {notification && (
          <div className={`fixed bottom-6 lg:bottom-10 right-6 lg:right-10 z-[120] p-4 lg:p-6 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 duration-500 border max-w-[calc(100vw-3rem)] ${
            notification.type === 'success' ? 'bg-indigo-900 text-white border-indigo-800' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 className="text-indigo-400 shrink-0" /> : <AlertCircle className="shrink-0" />}
            <p className="font-bold text-xs lg:text-sm tracking-wide">{notification.message}</p>
          </div>
        )}

        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 lg:mb-12 gap-6 lg:gap-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-serif font-black text-indigo-900 mb-2">Director Dashboard</h1>
            <p className="text-slate-500 text-sm font-medium tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {requests.length} Active Cloud Inquiries
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <button 
              onClick={fetchRequests} 
              className="flex-1 lg:flex-none bg-white border border-slate-100 p-4 rounded-xl text-indigo-600 hover:scale-105 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              <span className="text-[10px] font-black uppercase tracking-widest lg:hidden">Refresh</span>
            </button>
            <button className="flex-[2] lg:flex-none bg-white border border-slate-100 text-indigo-600 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2">
              <Download size={16} /> Export
            </button>
          </div>
        </header>

        <div className="glass p-4 lg:p-6 rounded-[2rem] mb-8 lg:mb-10 flex flex-col md:flex-row gap-4 lg:gap-6 shadow-sm border border-indigo-50/50">
          <div className="relative flex-grow">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search Client or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-none rounded-xl pl-16 pr-6 py-4 focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 text-sm font-medium outline-none shadow-inner"
            />
          </div>
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full md:w-auto bg-white border-none rounded-xl pl-8 pr-12 py-4 focus:ring-2 focus:ring-indigo-500 text-slate-700 font-black text-[10px] uppercase tracking-widest min-w-[180px] outline-none cursor-pointer shadow-inner appearance-none"
            >
              <option value="All">All Projects</option>
              <option value="Pending">New Inquiries</option>
              <option value="Accepted">Approved</option>
              <option value="In Progress">Production</option>
              <option value="Completed">Finalized</option>
              <option value="Rejected">Non-Fits</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
               <ChevronRight size={12} className="rotate-90" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-100/30 border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
              <thead>
                <tr className="bg-slate-50/50 border-b border-indigo-50">
                  <th className="px-6 lg:px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">TIMESTAMP</th>
                  <th className="px-6 lg:px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">ID</th>
                  <th className="px-6 lg:px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">CLIENT</th>
                  <th className="hidden md:table-cell px-6 lg:px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">DOMAIN</th>
                  <th className="px-6 lg:px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400">STATUS</th>
                  <th className="px-6 lg:px-8 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50">
                {filteredRequests.map((req) => {
                  const isNew = isRecentlyCreated(req.created_at);
                  return (
                    <tr 
                      key={req.id} 
                      className={`hover:bg-indigo-50/30 transition-all cursor-pointer group animate-fade ${isNew ? 'bg-indigo-50/10' : ''}`}
                      onClick={() => setSelectedRequest(req)}
                    >
                      <td className="px-6 lg:px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[11px] text-slate-500 font-bold">{formatTimestamp(req.created_at)}</span>
                          {isNew && (
                            <span className="inline-flex items-center gap-1 text-[8px] font-black text-indigo-600 uppercase tracking-widest mt-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span> NEW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 lg:px-8 py-6">
                        <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase">{req.request_id}</div>
                      </td>
                      <td className="px-6 lg:px-8 py-6">
                        <div className="font-bold text-indigo-900 text-base group-hover:text-indigo-600 transition-colors leading-tight mb-1">{req.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-medium truncate max-w-[150px]">{req.email}</div>
                      </td>
                      <td className="hidden md:table-cell px-6 lg:px-8 py-6">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                          {req.service.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-6 lg:px-8 py-6">
                        <span className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 lg:px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2 sm:gap-3">
                          {req.status === 'Pending' && (
                            <button 
                              disabled={updating}
                              onClick={() => acceptRequest(req)}
                              className="w-9 h-9 bg-green-50 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-600 hover:text-white transition-all border border-green-100 active:scale-95"
                              title="Accept Project"
                            >
                              {updating && selectedRequest?.id === req.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedRequest(req)}
                            className="w-9 h-9 bg-white text-indigo-600 rounded-xl flex items-center justify-center border border-slate-100 hover:border-indigo-600 transition-all shadow-sm active:scale-95"
                          >
                            <ExternalLink size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredRequests.length === 0 && (
            <div className="p-20 lg:p-32 text-center">
              <FilterX className="mx-auto text-slate-200 mb-6" size={48} />
              <p className="text-slate-400 font-serif italic text-xl">No inquiries found in cloud storage.</p>
            </div>
          )}
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 lg:p-12 overflow-y-auto">
          <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-md" onClick={() => setSelectedRequest(null)} />
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] lg:rounded-[4rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500 my-auto border border-white/50 max-h-[90vh] flex flex-col">
            <div className="p-8 lg:p-12 border-b border-gray-50 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-indigo-600 text-white rounded-2xl lg:rounded-3xl flex items-center justify-center text-xl lg:text-2xl font-black shadow-2xl">
                  {selectedRequest.request_id.slice(-2)}
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-serif font-black text-indigo-900">{selectedRequest.request_id}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Project Insight Brief</p>
                    <span className="text-slate-300">•</span>
                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Submitted {formatTimestamp(selectedRequest.created_at)}</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="w-10 h-10 lg:w-14 lg:h-14 rounded-full bg-white flex items-center justify-center text-slate-300 hover:text-red-500 transition-all shadow-sm hover:rotate-90">
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="p-8 lg:p-12 space-y-8 lg:space-y-12 overflow-y-auto flex-grow custom-scrollbar">
              {selectedRequest.status === 'Pending' && (
                <div className="bg-indigo-900 rounded-[2rem] lg:rounded-[2.5rem] p-8 lg:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-10 relative overflow-hidden shadow-2xl border border-indigo-800 text-center md:text-left">
                  <div className="relative z-10">
                    <h3 className="text-xl lg:text-2xl font-serif font-bold mb-2">Initiate Engagement?</h3>
                    <p className="text-indigo-200 text-xs lg:text-sm max-w-sm leading-relaxed">Approval activates the client's cloud workspace and updates production pipeline.</p>
                  </div>
                  <button 
                    disabled={updating}
                    onClick={() => acceptRequest(selectedRequest)}
                    className="w-full md:w-auto relative z-10 bg-white text-indigo-900 px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                  >
                    {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} 
                    Approve Request
                  </button>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-700 rounded-full blur-3xl -mr-20 -mt-20 opacity-40"></div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-6 lg:space-y-8">
                  <section>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 lg:mb-4">Client Dossier</label>
                    <div className="bg-slate-50 p-6 lg:p-8 rounded-2xl lg:rounded-[2rem] border border-slate-100 shadow-inner">
                      <p className="text-xl lg:text-2xl font-black text-indigo-900 mb-1 lg:mb-2 leading-tight">{selectedRequest.full_name}</p>
                      <p className="text-indigo-600 font-bold text-sm tracking-tight truncate">{selectedRequest.email}</p>
                    </div>
                  </section>
                  <section>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 lg:mb-4">Engagement constraints</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-100 shadow-inner">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-tighter">Budget Allocation</p>
                        <p className="text-lg font-black text-indigo-900">{selectedRequest.budget_range}</p>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-100 shadow-inner">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-tighter">Target Deadline</p>
                        <p className="text-lg font-black text-indigo-900">{selectedRequest.deadline}</p>
                      </div>
                    </div>
                  </section>
                </div>

                <section className="flex flex-col">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 lg:mb-4">The Creative Brief</label>
                  <div className="bg-slate-50 p-6 lg:p-8 rounded-2xl lg:rounded-[2rem] border border-slate-100 flex-grow shadow-inner">
                    <MessageSquare size={20} className="text-indigo-200 mb-4 lg:mb-6" />
                    <p className="text-slate-600 leading-relaxed italic text-base lg:text-lg font-medium">"{selectedRequest.project_details}"</p>
                  </div>
                </section>
              </div>

              <section className="bg-slate-50/50 p-6 lg:p-10 rounded-2xl lg:rounded-[3rem] border border-slate-100 shadow-inner">
                <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-6 lg:mb-8">Production Workspace Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
                  <div className="space-y-3 lg:space-y-4">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Scheduled Kickoff</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                      <input 
                        type="date" 
                        value={selectedRequest.start_date || ''} 
                        onChange={(e) => updateRequestData(selectedRequest.id!, { start_date: e.target.value })} 
                        className="w-full bg-white border border-slate-100 rounded-xl pl-12 pr-6 py-3 lg:px-6 lg:py-4 font-bold text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                      />
                    </div>
                  </div>
                  <div className="space-y-3 lg:space-y-4">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Collaboration URL</label>
                    <div className="relative">
                      <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                      <input 
                        type="url" 
                        placeholder="https://collab.luminastudio.com/p/..." 
                        value={selectedRequest.meeting_link || ''} 
                        onChange={(e) => updateRequestData(selectedRequest.id!, { meeting_link: e.target.value })} 
                        className="w-full bg-white border border-slate-100 rounded-xl pl-12 pr-6 py-3 lg:px-6 lg:py-4 font-bold text-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-3 lg:space-y-4">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">Director's Memo (Client Access)</label>
                  <textarea 
                    rows={3} 
                    value={selectedRequest.admin_notes || ''} 
                    onChange={(e) => updateRequestData(selectedRequest.id!, { admin_notes: e.target.value })} 
                    placeholder="Provide production updates for the client..."
                    className="w-full bg-white border border-slate-100 rounded-2xl lg:rounded-[2rem] px-6 py-4 lg:px-8 lg:py-6 text-slate-600 italic font-medium text-sm lg:text-base resize-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                  />
                </div>
              </section>
            </div>

            <div className="p-8 lg:p-12 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 lg:gap-8 shrink-0">
              <button 
                onClick={() => deleteRequest(selectedRequest.id!)} 
                className="w-full sm:w-auto text-red-400 hover:text-red-600 font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
              >
                <Trash2 size={16} /> Archive Permanent
              </button>
              <button 
                onClick={() => setSelectedRequest(null)} 
                className="w-full sm:w-auto bg-white border border-slate-200 text-indigo-900 px-10 lg:px-12 py-4 lg:py-5 rounded-xl lg:rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 active:scale-95"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;