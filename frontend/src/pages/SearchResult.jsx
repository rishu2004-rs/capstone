import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Search, MapPin, Calendar, FileText, ChevronRight, Filter, User } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { motion } from 'framer-motion';

const SearchResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [localQuery, setLocalQuery] = useState(query);

  const handleSearch = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      navigate(`/search?q=${localQuery}`);
    }
  };

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/cases/search/${query}`);
        setResults(data);
        
        // If exactly one match and query matches case number exactly, redirect to case details
        if (data.length === 1 && data[0].caseNumber.toLowerCase() === query.toLowerCase()) {
          navigate(`/case/${data[0]._id}`);
        }
      } catch (err) {
        setError('Failed to fetch cases. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [query, navigate]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#3c4043] p-6 rounded-[2rem] border border-[#dadce0] dark:border-[#5f6368] shadow-sm">
        <div>
          <h1 className="text-2xl font-medium text-[#202124] dark:text-[#e8eaed]">Search Results</h1>
          <p className="text-[#5f6368] dark:text-[#9aa0a6] font-medium mt-1">Found {results.length} cases for "{query}"</p>
        </div>
        <form onSubmit={handleSearch} className="flex-1 max-w-xl relative group">
          <div className="absolute inset-y-0 left-5 flex items-center text-[#5f6368] dark:text-[#9aa0a6]">
            <Search size={20} strokeWidth={2} />
          </div>
          <input
            type="text"
            className="w-full pl-14 pr-28 py-3.5 rounded-full bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#5f6368] focus:border-[#1a73e8] dark:focus:border-[#8ab4f8] outline-none transition-all text-sm font-medium text-[#202124] dark:text-[#e8eaed] placeholder-[#9aa0a6]"
            placeholder="Search Case Number or Title"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-[#1a73e8] text-white rounded-full text-sm font-medium hover:bg-[#1557b0] transition-colors"
          >
            Track
          </button>
        </form>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-48 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((item, idx) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link 
                to={`/case/${item._id}`}
                className="block group bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {item.caseNumber}
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                
                <h3 className="text-xl font-bold mb-4 dark:text-white group-hover:text-primary-500 transition-colors">{item.title}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <MapPin size={16} className="text-slate-400" />
                    {item.courtName}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <Calendar size={16} className="text-slate-400" />
                    Next Hearing: {item.hearingDate ? new Date(item.hearingDate).toLocaleDateString() : 'TBA'}
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <User size={16} className="text-slate-400" />
                    P: {item.petitioner} vs R: {item.respondent}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between group-hover:bg-primary-50/50 dark:group-hover:bg-primary-900/10 rounded-b-3xl -mx-6 -mb-6 px-6 py-4 transition-colors">
                  <span className="text-primary-500 font-bold text-sm">View Details</span>
                  <ChevronRight size={20} className="text-primary-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem]">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Search size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2 dark:text-white">No cases found</h2>
          <p className="text-slate-500">We couldn't find any cases matching your search criteria.</p>
          <Link to="/" className="inline-block mt-8 font-bold text-primary-500 hover:underline">Go back home</Link>
        </div>
      )}
    </div>
  );
};

export default SearchResult;
