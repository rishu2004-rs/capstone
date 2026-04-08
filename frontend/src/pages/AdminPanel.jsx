import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Shield, UserCog, UserMinus, Plus, Mail, Key } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd have a GET /users endpoint.
    // For now, this is a placeholder for user management.
    setLoading(false);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-12 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-5xl font-black mb-4 tracking-tight">Access Control</h1>
          <p className="text-slate-400 font-medium max-w-xl text-lg">
            Manage system users, permissions, and administrative security protocols.
          </p>
        </div>
        <Shield size={200} className="absolute -bottom-10 -right-10 text-white/5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <UserCog className="text-primary-500" />
            <h2 className="text-2xl font-black dark:text-white">Platform Users</h2>
          </div>
          <div className="space-y-4">
             <div className="p-20 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                User management module active.
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Key className="text-amber-500" />
            <h2 className="text-2xl font-black dark:text-white">Security Logs</h2>
          </div>
          <div className="space-y-4 pb-20">
             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">System initialization complete</span>
                <span className="text-xs text-slate-400">Just now</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Database connection switched to local</span>
                <span className="text-xs text-slate-400">5m ago</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
