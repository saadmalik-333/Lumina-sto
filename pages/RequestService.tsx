
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2, Send, Sparkles } from 'lucide-react';
import { SERVICES } from '../constants';
import { supabase } from '../lib/supabase';
import { ServiceRequest } from '../types';
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
        contents: `Refine this project description: ${formData.projectDetails}`,
        config: {
          systemInstruction: "You are an elite creative studio director. Refine descriptions to be professional."
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-indigo-900 mb-4">Request Sent!</h2>
          <p className="text-gray-500 mb-8">We will review your project and contact you shortly.</p>
          <div className="bg-indigo-50 p-6 rounded-2xl mb-10 border border-indigo-100">
            <div className="text-[10px] uppercase font-black text-indigo-400 mb-1">Project ID</div>
            <div className="text-2xl font-bold text-indigo-900">{requestId}</div>
          </div>
          <button onClick={() => navigate('/')} className="w-full bg-indigo-600 text-white px-8 py-4 rounded-full font-bold shadow-lg">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-indigo-900 mb-4">Start a New Project</h1>
          <p className="text-gray-500">Let's create something extraordinary together.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-xs font-black text-indigo-900 mb-2 uppercase tracking-widest">Full Name</label>
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800" />
            </div>
            <div>
              <label className="block text-xs font-black text-indigo-900 mb-2 uppercase tracking-widest">Email Address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800" />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-black text-indigo-900 mb-2 uppercase tracking-widest">Service Type</label>
            <select name="service" value={formData.service} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 text-gray-800 appearance-none">
              {SERVICES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-black text-indigo-900 uppercase tracking-widest">Project Details</label>
              <button type="button" onClick={refineWithAI} disabled={refining || !formData.projectDetails} className="text-xs font-bold text-indigo-600 flex items-center gap-1.5 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
                {refining ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Refine with AI
              </button>
            </div>
            <textarea required rows={5} name="projectDetails" value={formData.projectDetails} onChange={handleChange} placeholder="Goals, audience, and vision..." className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800 resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <label className="block text-xs font-black text-indigo-900 mb-2 uppercase tracking-widest">Estimated Budget</label>
              <select name="budgetRange" value={formData.budgetRange} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 text-gray-800 appearance-none">
                <option value="$50">$50</option>
                <option value="$100">$100</option>
                <option value="$150">$150</option>
                <option value="$250">$250</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-indigo-900 mb-2 uppercase tracking-widest">Target Deadline</label>
              <select name="deadline" value={formData.deadline} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 text-gray-800 appearance-none">
                <option value="2 months">2 Months</option>
                <option value="4 months">4 Months</option>
                <option value="6 months">6 Months</option>
                <option value="8 months">8 Months</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white px-8 py-5 rounded-full text-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 disabled:opacity-70">
            {loading ? <><Loader2 className="animate-spin" /> Processing...</> : <>Send Request <Send size={20} /></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestService;
