
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { 
  Search, ExternalLink, RefreshCw, 
  Check, X as CloseIcon, Trash2, 
  Download, FilterX, Loader2, CheckCircle,
  MessageSquare, AlertCircle, CheckCircle2,
  LogOut, ShieldCheck, User
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ServiceRequest, ServiceStatus } from '../types';
import { useAuth } from '../context/AuthContext';

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
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
      showNotification('Logout failed. Please try again.', 'error');
    }
  };

  const acceptRequest = async (request: ServiceRequest) => {
    if (!request.id) return;
    setUpdating(true);
    
    try {
      const { error: sbError } = await supabase
        .from('requests')
        .update({ status: 'Accepted' })
        .eq('id', request.id);

      if (sbError) throw sbError;

      // Automated Project Sync (Google Sheets) - Example external integration
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
      });

      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: 'Accepted' as ServiceStatus } : r));
      if (selectedRequest?.id === request.id) {
        setSelectedRequest({ ...selectedRequest, status: 'Accepted' });
      }

      showNotification('Project production phase activated.', 'success');
    } catch (err: any) {
      console.error('Acceptance Logic Error:', err);
      showNotification('Project update failed.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const updateRequestData = async (id: string, updates: Partial<ServiceRequest>) => {
    setUpdating(true);
    try {
      const { error } = await supabase.from('requests').update(updates).eq('id', id);
      if (error) throw error;
      
      setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      if (selectedRequest?.id === id) setSelectedRequest({ ...selectedRequest, ...updates } as ServiceRequest);
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
      setSelectedRequest(null);
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

  return (
    <div className="min-h-screen bg-studio flex flex-col">
      {/* Dedicated Admin Navbar */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-indigo-50 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-xl font-serif font-black tracking-tighter text-indigo-900 group-hover:text-indigo-600 transition-colors">LUMINA</span>
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></div>
            </Link>
            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <div className="hidden sm:flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Admin Control</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 mr-4">
               <div className="text-right">
                  <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest leading-none">Director</p>
                  <p className="text-[9px] text-slate-400 font-bold leading-none mt-1">{session?.user?.email}</p>
               </div>
               <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shadow-inner">
                  <User size={20} />
               </div>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-red-50 text-red-600 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 border border-red-100 hover:border-red-600"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto w-full px-6 py-12 flex-grow">
        {notification && (
          <div className={`fixed bottom-10 right-10 z-[120] p-6 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 duration-500 border ${
            notification.type === 'success' ? 'bg-indigo-900 text-white border-indigo-800' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 className="text-indigo-400" /> : <AlertCircle />}
            <p className="font-bold text-sm tracking-wide">{notification.message}</p>
          </div>
        )}

        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
          <div>
            <h1 className="text-4xl font-serif font-black text-indigo-900 mb-2">Director Dashboard</h1>
            <p className="text-slate-500 font-medium tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {requests.length} Active Cloud Inquiries
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={fetchRequests} 
              className="bg-white border border-slate-100 p-4 rounded-2xl text-indigo-600 hover:scale-105 transition-all shadow-sm flex items-center gap-2"
              title="Refresh Records"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              <span className="text-[10px] font-black uppercase tracking-widest md:hidden">Refresh</span>
            </button>
            <button className="bg-white border border-slate-100 text-indigo-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-indigo-50 transition-all flex items-center gap-2">
              <Download size={16} /> Export Data
            </button>
          </div>
        </header>

        <div className="glass p-6 rounded-[2.5rem] mb-10 flex flex-col md:flex-row gap-6 shadow-sm border border-indigo-50/50">
          <div className="relative flex-grow">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
            <input 
              type="text" 
              placeholder="Search by Identity or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-none rounded-2xl pl-16 pr-6 py-4 focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 font-medium outline-none shadow-inner"
            />
          </div>
          <div className="relative">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full md:w-auto bg-white border-none rounded-2xl pl-8 pr-12 py-4 focus:ring-2 focus:ring-indigo-500 text-slate-700 font-black text-xs uppercase tracking-widest min-w-[200px] outline-none cursor-pointer shadow-inner appearance-none"
            >
              <option value="All">All Projects</option>
              <option value="Pending">New Inquiries</option>
              <option value="Accepted">Approved</option>
              <option value="In Progress">Production</option>
              <option value="Completed">Finalized</option>
              <option value="Rejected">Non-Fits</option>
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
               <RefreshCw size={12} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-indigo-100/30 border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-indigo-50">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">CLIENT</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">DOMAIN</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">STATUS</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50">
                {filteredRequests.map((req) => (
                  <tr 
                    key={req.id} 
                    className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                    onClick={() => setSelectedRequest(req)}
                  >
                    <td className="px-8 py-7">
                      <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{req.request_id}</div>
                    </td>
                    <td className="px-8 py-7">
                      <div className="font-bold text-indigo-900 text-lg group-hover:text-indigo-600 transition-colors">{req.full_name}</div>
                      <div className="text-xs text-slate-400 font-medium">{req.email}</div>
                    </td>
                    <td className="px-8 py-7">
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                        {req.service.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-7">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-8 py-7 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-3">
                        {req.status === 'Pending' && (
                          <button 
                            disabled={updating}
                            onClick={() => acceptRequest(req)}
                            className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm border border-green-100"
                            title="Accept Project"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedRequest(req)}
                          className="w-10 h-10 bg-white text-indigo-600 rounded-xl flex items-center justify-center border border-slate-100 hover:border-indigo-600 transition-all shadow-sm"
                        >
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRequests.length === 0 && (
            <div className="p-32 text-center">
              <FilterX className="mx-auto text-slate-200 mb-6" size={64} />
              <p className="text-slate-400 font-serif italic text-2xl">No inquiries found in cloud storage.</p>
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
          <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-md" onClick={() => setSelectedRequest(null)} />
          <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500 my-auto border border-white/50">
            <div className="p-10 lg:p-14 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center text-2xl font-black shadow-2xl">
                  {selectedRequest.request_id.slice(-2)}
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-black text-indigo-900">{selectedRequest.request_id}</h2>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Project Insight Brief</p>
                </div>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-slate-300 hover:text-red-500 transition-all shadow-sm hover:rotate-90">
                <CloseIcon size={24} />
              </button>
            </div>

            <div className="p-10 lg:p-14 space-y-12 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {selectedRequest.status === 'Pending' && (
                <div className="bg-indigo-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden shadow-2xl border border-indigo-800">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-serif font-bold mb-2">Initiate Engagement?</h3>
                    <p className="text-indigo-200 text-sm max-w-sm leading-relaxed">Approval activates the client's cloud workspace and updates the production pipeline.</p>
                  </div>
                  <button 
                    disabled={updating}
                    onClick={() => acceptRequest(selectedRequest)}
                    className="relative z-10 bg-white text-indigo-900 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {updating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} 
                    Approve Request
                  </button>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-700 rounded-full blur-3xl -mr-20 -mt-20 opacity-40"></div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <section>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Client Dossier</label>
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                      <p className="text-2xl font-black text-indigo-900 mb-2">{selectedRequest.full_name}</p>
                      <p className="text-indigo-600 font-bold tracking-tight">{selectedRequest.email}</p>
                    </div>
                  </section>
                  <section>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Engagement constraints</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100 shadow-inner">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-tighter">Budget Allocation</p>
                        <p className="text-xl font-black text-indigo-900">{selectedRequest.budget_range}</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-2xl text-center border border-slate-100 shadow-inner">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-tighter">Target Deadline</p>
                        <p className="text-xl font-black text-indigo-900">{selectedRequest.deadline}</p>
                      </div>
                    </div>
                  </section>
                </div>

                <section>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">The Creative Brief</label>
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 min-h-full shadow-inner">
                    <MessageSquare size={24} className="text-indigo-200 mb-6" />
                    <p className="text-slate-600 leading-relaxed italic text-lg font-medium">"{selectedRequest.project_details}"</p>
                  </div>
                </section>
              </div>

              <section className="bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100 shadow-inner">
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest mb-8">Production Workspace Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Scheduled Kickoff</label>
                    <input 
                      type="date" 
                      value={selectedRequest.start_date || ''} 
                      onChange={(e) => updateRequestData(selectedRequest.id!, { start_date: e.target.value })} 
                      className="w-full bg-white border border-slate-100 rounded-xl px-6 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Collaboration URL</label>
                    <input 
                      type="url" 
                      placeholder="https://collab.luminastudio.com/p/..." 
                      value={selectedRequest.meeting_link || ''} 
                      onChange={(e) => updateRequestData(selectedRequest.id!, { meeting_link: e.target.value })} 
                      className="w-full bg-white border border-slate-100 rounded-xl px-6 py-4 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Director's Memo (Client Portal Access)</label>
                  <textarea 
                    rows={4} 
                    value={selectedRequest.admin_notes || ''} 
                    onChange={(e) => updateRequestData(selectedRequest.id!, { admin_notes: e.target.value })} 
                    placeholder="Provide production updates or directives for the client..."
                    className="w-full bg-white border border-slate-100 rounded-[2rem] px-8 py-6 text-slate-600 italic font-medium resize-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none" 
                  />
                </div>
              </section>
            </div>

            <div className="p-10 lg:p-14 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-8">
              <button 
                onClick={() => deleteRequest(selectedRequest.id!)} 
                className="text-red-400 hover:text-red-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
              >
                <Trash2 size={16} /> Archive Permanent
              </button>
              <button 
                onClick={() => setSelectedRequest(null)} 
                className="btn-premium bg-white border border-slate-200 text-indigo-900 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm"
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
