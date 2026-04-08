import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  BarChart3, 
  Plus, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  Users,
  CalendarDays,
  MoreVertical,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    caseNumber: '',
    title: '',
    petitioner: '',
    respondent: '',
    courtName: '',
    advocate: '',
    description: '',
    hearingDate: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [{ data: statsData }, { data: casesData }] = await Promise.all([
        api.get('/dashboard'),
        api.get('/cases')
      ]);
      setStats(statsData);
      setCases(casesData);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCase = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cases', formData);
      setShowAddModal(false);
      fetchDashboardData();
      setFormData({
        caseNumber: '', title: '', petitioner: '', respondent: '',
        courtName: '', advocate: '', description: '', hearingDate: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create case');
    }
  };

  const filteredCases = cases.filter(c => 
    c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatItem = ({ label, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-2xl ${color}`}>
          {icon}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-3xl font-black dark:text-white">{value || 0}</span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black dark:text-white mb-2">Command Center</h1>
          <p className="text-slate-500 font-medium">System overview and case management</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-slate-900 dark:bg-primary-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:opacity-90 transition-all"
          >
            <Plus size={20} />
            Add New Case
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatItem label="Total Cases" value={stats?.totalCases} icon={<BarChart3 size={24} />} color="bg-blue-50 text-blue-500 dark:bg-blue-900/20" />
        <StatItem label="Pending" value={stats?.pendingCases} icon={<Clock size={24} />} color="bg-amber-50 text-amber-500 dark:bg-amber-900/20" />
        <StatItem label="Active" value={stats?.inProgressCases} icon={<AlertCircle size={24} />} color="bg-primary-50 text-primary-500 dark:bg-primary-900/20" />
        <StatItem label="Closed" value={stats?.closedCases} icon={<CheckCircle2 size={24} />} color="bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20" />
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-2xl font-black dark:text-white">Recent Cases</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Find a case..."
                className="pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 ring-primary-500/50 w-full md:w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl hover:bg-slate-100 transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 text-xs font-black uppercase tracking-widest">
                <th className="px-8 py-4">Case #</th>
                <th className="px-8 py-4">Title</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Petitioner / Respondent</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredCases.map((c) => (
                <tr key={c._id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-8 py-6">
                    <span className="font-bold text-slate-900 dark:text-white">{c.caseNumber}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white">{c.title}</span>
                      <span className="text-xs text-slate-500">{c.courtName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.petitioner}</span>
                       <span className="text-slate-400 text-xs font-bold">VS</span>
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{c.respondent}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link to={`/case/${c._id}`} className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-primary-500 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all">
                      <ChevronRight size={20} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCases.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-bold">
              No cases found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Add Case Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <h2 className="text-3xl font-black dark:text-white mb-8">New Case Registry</h2>
                <form onSubmit={handleAddCase} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Case Number</label>
                      <input 
                        type="text" required
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 outline-none transition-all dark:text-white font-bold"
                        placeholder="e.g. CASE-2024-001"
                        value={formData.caseNumber}
                        onChange={(e) => setFormData({...formData, caseNumber: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Title</label>
                      <input 
                        type="text" required
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 outline-none transition-all dark:text-white font-bold"
                        placeholder="Property Dispute..."
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Petitioner</label>
                      <input 
                        type="text" required
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 outline-none transition-all dark:text-white font-bold"
                        value={formData.petitioner}
                        onChange={(e) => setFormData({...formData, petitioner: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Respondent</label>
                      <input 
                        type="text" required
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 outline-none transition-all dark:text-white font-bold"
                        value={formData.respondent}
                        onChange={(e) => setFormData({...formData, respondent: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Court Name</label>
                      <input 
                        type="text" required
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 outline-none transition-all dark:text-white font-bold"
                        value={formData.courtName}
                        onChange={(e) => setFormData({...formData, courtName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Next Hearing</label>
                      <input 
                        type="date"
                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 outline-none transition-all dark:text-white font-bold"
                        value={formData.hearingDate}
                        onChange={(e) => setFormData({...formData, hearingDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Description</label>
                    <textarea 
                      required rows="3"
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 outline-none transition-all dark:text-white font-bold resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-[2] py-4 bg-primary-500 text-white rounded-2xl font-bold shadow-xl shadow-primary-500/30 hover:opacity-90 transition-all"
                    >
                      Create Case
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
