import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { 
  History, 
  FileText, 
  Calendar, 
  MapPin, 
  User, 
  Scale, 
  ChevronRight,
  Upload,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const CaseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [updateData, setUpdateData] = useState({
    status: '',
    hearingDate: ''
  });

  const [docData, setDocData] = useState({
    name: '',
    url: ''
  });

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  const fetchCaseDetails = async () => {
    try {
      const { data } = await api.get(`/cases/${id}`);
      setCaseData(data);
      setUpdateData({
        status: data.status,
        hearingDate: data.hearingDate ? data.hearingDate.split('T')[0] : ''
      });
    } catch (err) {
      console.error('Failed to fetch case details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await api.put(`/cases/update-status/${id}`, updateData);
      fetchCaseDetails();
    } catch (err) {
      alert('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/cases/${id}/documents`, docData);
      setDocData({ name: '', url: '' });
      fetchCaseDetails();
    } catch (err) {
      alert('Upload failed');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!caseData) return <div className="text-center py-20 font-bold text-slate-500">Case not found.</div>;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Left Column - Core Info */}
      <div className="lg:col-span-2 space-y-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none"
        >
          <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
            <div>
              <div className="inline-block px-4 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-3">
                {caseData.caseNumber}
              </div>
              <h1 className="text-4xl font-black dark:text-white tracking-tight">{caseData.title}</h1>
            </div>
            <StatusBadge status={caseData.status} />
          </div>

          <p className="text-slate-600 dark:text-slate-400 leading-[1.8] text-lg mb-10 pb-10 border-b border-slate-50 dark:border-slate-800">
            {caseData.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl"><User size={20} /></div>
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Petitioner</p>
                  <p className="font-bold dark:text-white text-lg">{caseData.petitioner}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl"><User size={20} /></div>
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Respondent</p>
                  <p className="font-bold dark:text-white text-lg">{caseData.respondent}</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-500 rounded-2xl"><MapPin size={20} /></div>
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Court Location</p>
                  <p className="font-bold dark:text-white text-lg">{caseData.courtName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-2xl"><Calendar size={20} /></div>
                <div>
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Next Hearing</p>
                  <p className="font-bold dark:text-white text-lg">{caseData.hearingDate ? new Date(caseData.hearingDate).toLocaleDateString() : 'To be scheduled'}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Dynamic History Timeline */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-10">
            <History className="text-primary-500" />
            <h2 className="text-2xl font-black dark:text-white">Case History</h2>
          </div>
          
          <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
            {caseData.history?.length > 0 ? (
              caseData.history.slice().reverse().map((entry, idx) => (
                <div key={idx} className="relative pl-10">
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-4 border-primary-500 z-10" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <StatusBadge status={entry.status} />
                    <span className="text-xs font-bold text-slate-400">{new Date(entry.updatedAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-2 text-slate-600 dark:text-slate-400 font-medium">
                    Updated by {entry.updatedBy?.name || 'System'}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 font-medium pl-2">Created on {new Date(caseData.createdAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Actions & Docs */}
      <div className="space-y-8">
        {/* Management Card */}
        {(user?.role === 'admin' || user?.role === 'court_staff') && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl shadow-slate-900/40"
          >
            <div className="flex items-center gap-3 mb-8">
              <RefreshCw size={24} className="text-primary-400" />
              <h3 className="text-xl font-black">Management</h3>
            </div>
            
            <form onSubmit={handleUpdateStatus} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Update Status</label>
                <select 
                  className="w-full px-5 py-4 rounded-2xl bg-slate-800 border-none outline-none focus:ring-2 ring-primary-500 transition-all font-bold"
                  value={updateData.status}
                  onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                >
                  {['Pending', 'In Progress', 'Hearing Scheduled', 'Closed', 'Dismissed'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Hearing Date</label>
                <input 
                  type="date"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-800 border-none outline-none focus:ring-2 ring-primary-500 transition-all font-bold"
                  value={updateData.hearingDate}
                  onChange={(e) => setUpdateData({...updateData, hearingDate: e.target.value})}
                />
              </div>
              <button 
                disabled={updating}
                className="w-full py-4 bg-primary-500 text-white rounded-2xl font-extrabold hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Commit Changes'}
              </button>
            </form>
          </motion.div>
        )}

        {/* Documentation Card */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8 text-emerald-500">
            <FileText size={24} />
            <h3 className="text-xl font-black dark:text-white">Documents</h3>
          </div>

          <div className="space-y-4 mb-10">
            {caseData.documents?.length > 0 ? (
              caseData.documents.map((doc, i) => (
                <a 
                  key={i} href={doc.url} target="_blank" rel="noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group hover:bg-primary-500 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-slate-700 rounded-lg group-hover:bg-white/20">
                      <FileText size={16} className="text-slate-400 group-hover:text-white" />
                    </div>
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300 group-hover:text-white">{doc.name}</span>
                  </div>
                  <ExternalLink size={16} className="text-slate-300 group-hover:text-white" />
                </a>
              ))
            ) : (
              <p className="text-slate-400 font-medium text-center py-4 italic">No documents attached.</p>
            )}
          </div>

          {(user?.role === 'admin' || user?.role === 'court_staff') && (
            <form onSubmit={handleUploadDoc} className="space-y-4 pt-6 border-t border-slate-50 dark:border-slate-800">
              <input 
                type="text" placeholder="Doc Name" required
                className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 ring-emerald-500/50 transition-all dark:text-white text-sm"
                value={docData.name}
                onChange={(e) => setDocData({...docData, name: e.target.value})}
              />
              <input 
                type="text" placeholder="URL Link" required
                className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 ring-emerald-500/50 transition-all dark:text-white text-sm"
                value={docData.url}
                onChange={(e) => setDocData({...docData, url: e.target.value})}
              />
              <button className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                <Upload size={18} />
                Attach File
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
