
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2, Send, Sparkles } from 'lucide-react';
import { SERVICES } from '../constants.tsx';
import { supabase } from '../lib/supabase.ts';
import { ServiceRequest } from '../types.ts';
import { GoogleGenAI } from "@google/genai";

const { useParams, useNavigate } = ReactRouterDOM;

const RequestService: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [refining, setRefining] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestId, setRequestId] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    service: serviceId === 'general' ? 'web-design' : (serviceId || 'web-design'),
    projectDetails: '',
    budgetRange: '$50',
    deadline: '2 months'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateRequestId = () => {
    const prefix = 'LMN';
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${num}`;
  };

  const refineWithAI = async () => {
    if (!formData.projectDetails.trim()) return;
    setRefining(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Refine this project description to be more professional and clear for a creative studio: ${formData.projectDetails}`,
        config: {
          systemInstruction: "You are an elite creative studio director. Refine descriptions to be professional, concise, and punchy."
        }
      });
      if (response.text) {
        setFormData(prev => ({ ...prev, projectDetails: response.text }));
      }
    } catch (err) {
      console.error('AI Refinement failed', err);
    } finally {
      setRefining(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newRequestId = generateRequestId();
    try {
      const { error } = await supabase.from('requests').insert([
        {
          request_id: newRequestId,
          full_name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          service: formData.service,
          project_details: formData.projectDetails.trim(),
          budget_range: formData.budgetRange,
          deadline: formData.deadline,
          status: 'Pending'
        } as ServiceRequest
      ]);

      if (error) throw error;
      setRequestId(newRequestId);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 animate-fade">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-12 shadow-2xl text-center border border-gray-100">
          <div className="w-16 h-16 lg:w-20 lg:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl lg:text-3xl font-serif font-bold text-indigo-900 mb-4">Request Sent!</h2>
          <p className="text-gray-500 mb-8 text-sm lg:text-base">We will review your project and contact you shortly.</p>
          <div className="bg-indigo-50 p-6 rounded-2xl mb-10 border border-indigo-100">
            <div className="text-[10px] uppercase font-black text-indigo-400 mb-1 tracking-widest">Project Workspace ID</div>
            <div className="text-2xl font-bold text-indigo-900 tracking-tight">{requestId}</div>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="w-full bg-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition-all text-sm uppercase tracking-widest"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24 px-6 animate-fade">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 lg:mb-16">
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-indigo-900 mb-4 tracking-tight">Start a New Project</h1>
          <p className="text-gray-500 text-base lg:text-lg">Let's create something extraordinary together.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] lg:rounded-[2.5rem] p-8 lg:p-12 shadow-xl border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8">
            <div>
              <label className="block text-[10px] font-black text-indigo-900 mb-2 uppercase tracking-widest">Full Name</label>
              <input 
                required 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                placeholder="John Doe" 
                className="w-full bg-gray-50 border-none rounded-xl lg:rounded-2xl px-5 py-3 lg:px-6 lg:py-4 focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800 text-sm font-medium" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-indigo-900 mb-2 uppercase tracking-widest">Email Address</label>
              <input 
                required 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="john@example.com" 
                className="w-full bg-gray-50 border-none rounded-xl lg:rounded-2xl px-5 py-3 lg:px-6 lg:py-4 focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800 text-sm font-medium" 
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-[10px] font-black text-indigo-900 mb-2 uppercase tracking-widest">Service Type</label>
            <div className="relative">
              <select 
                name="service" 
                value={formData.service} 
                onChange={handleChange} 
                className="w-full bg-gray-50 border-none rounded-xl lg:rounded-2xl px-5 py-3 lg:px-6 lg:py-4 focus:ring-2 focus:ring-indigo-500 text-gray-800 appearance-none text-sm font-medium"
              >
                {SERVICES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                <ArrowRight size={14} className="rotate-90" />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
              <label className="block text-[10px] font-black text-indigo-900 uppercase tracking-widest">Project Details</label>
              <button 
                type="button" 
                onClick={refineWithAI} 
                disabled={refining || !formData.projectDetails.trim()} 
                className="text-[10px] font-black text-indigo-600 flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all disabled:opacity-50 disabled:grayscale uppercase tracking-widest"
              >
                {refining ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Refine with AI
              </button>
            </div>
            <textarea 
              required 
              rows={5} 
              name="projectDetails" 
              value={formData.projectDetails} 
              onChange={handleChange} 
              placeholder="Goals, target audience, and your creative vision..." 
              className="w-full bg-gray-50 border-none rounded-xl lg:rounded-2xl px-5 py-4 lg:px-6 lg:py-5 focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800 text-sm font-medium resize-none leading-relaxed" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-10">
            <div>
              <label className="block text-[10px] font-black text-indigo-900 mb-2 uppercase tracking-widest">Estimated Budget</label>
              <div className="relative">
                <select 
                  name="budgetRange" 
                  value={formData.budgetRange} 
                  onChange={handleChange} 
                  className="w-full bg-gray-50 border-none rounded-xl lg:rounded-2xl px-5 py-3 lg:px-6 lg:py-4 focus:ring-2 focus:ring-indigo-500 text-gray-800 appearance-none text-sm font-medium"
                >
                  <option value="$50">$50 - Basic Asset</option>
                  <option value="$100">$100 - Standard Setup</option>
                  <option value="$150">$150 - Professional Package</option>
                  <option value="$250">$250 - Premium Strategy</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                  <ArrowRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-indigo-900 mb-2 uppercase tracking-widest">Target Deadline</label>
              <div className="relative">
                <select 
                  name="deadline" 
                  value={formData.deadline} 
                  onChange={handleChange} 
                  className="w-full bg-gray-50 border-none rounded-xl lg:rounded-2xl px-5 py-3 lg:px-6 lg:py-4 focus:ring-2 focus:ring-indigo-500 text-gray-800 appearance-none text-sm font-medium"
                >
                  <option value="2 months">2 Months</option>
                  <option value="4 months">4 Months</option>
                  <option value="6 months">6 Months</option>
                  <option value="8 months">8 Months</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                  <ArrowRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full btn-premium bg-indigo-600 text-white px-8 py-4 lg:py-5 rounded-full text-base lg:text-lg font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-70 active:scale-95"
          >
            {loading ? <><Loader2 className="animate-spin" /> Transmitting...</> : <>Send Request <Send size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestService;
