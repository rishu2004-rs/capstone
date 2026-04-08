import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Gavel, Shield, Clock, ArrowRight, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  return (
    <div className="space-y-32 pb-24 font-sans">
      {/* Hero Section */}
      <section className="relative pt-20 pb-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto space-y-10"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f1f3f4] text-[#1a73e8] dark:bg-[#3c4043] dark:text-[#8ab4f8] font-medium text-sm tracking-wide">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1a73e8] opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1a73e8]"></span>
            </span>
            Real-time Case Tracking System
          </div>
          
          <h1 className="text-6xl md:text-[5.5rem] font-medium tracking-tight text-[#202124] dark:text-[#e8eaed] leading-[1.05]">
            Transparency in <br />
            <span className="text-[#1a73e8] dark:text-[#8ab4f8]">Judicial Proceedings</span>
          </h1>
          
          <p className="text-2xl text-[#5f6368] dark:text-[#9aa0a6] max-w-3xl mx-auto leading-relaxed font-light mt-6">
            Search, track, and monitor court cases instantly. Whether you are a party to a case or an advocate, stay updated with real-time judicial records.
          </p>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto relative group mt-14">
            <div className="absolute inset-y-0 left-8 flex items-center text-[#5f6368] dark:text-[#9aa0a6]">
              <Search size={28} strokeWidth={2} />
            </div>
            <input
              type="text"
              placeholder="Search Case Number (e.g., CN-2024-001)"
              className="w-full pl-20 pr-48 py-7 rounded-full bg-white dark:bg-[#292a2d] border border-[#dadce0] dark:border-[#5f6368] focus:border-[#1a73e8] dark:focus:border-[#8ab4f8] outline-none shadow-sm transition-all text-xl font-medium text-[#202124] dark:text-[#e8eaed] placeholder-[#9aa0a6]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              type="submit"
              className="absolute right-3 top-3 bottom-3 px-8 bg-[#1a73e8] text-white rounded-full font-medium text-lg hover:bg-[#1557b0] transition-colors flex items-center gap-2"
            >
              Search
              <ArrowRight size={22} />
            </button>
          </form>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {[
          {
            icon: <Clock className="text-[#1a73e8] dark:text-[#8ab4f8]" size={36} strokeWidth={1.5} />,
            title: "Live Status Updates",
            desc: "Stay informed with real-time updates on case proceedings and status changes."
          },
          {
            icon: <Shield className="text-[#188038] dark:text-[#81c995]" size={36} strokeWidth={1.5} />,
            title: "Secure Documentation",
            desc: "Encrypted and authenticated access to case documents and hearing records."
          },
          {
            icon: <UserCheck className="text-[#f29900] dark:text-[#fde293]" size={36} strokeWidth={1.5} />,
            title: "Verified Access",
            desc: "Dedicated portals for judicial staff, advocates, and the general public."
          }
        ].map((feature, i) => (
          <div
            key={i}
            className="p-12 rounded-[2rem] bg-[#f1f3f4] dark:bg-[#292a2d] transition-all h-full flex flex-col items-center text-center hover:bg-[#e8eaed] dark:hover:bg-[#3c4043]"
          >
            <div className="w-20 h-20 rounded-full bg-white dark:bg-[#202124] flex items-center justify-center mb-8 shadow-sm">
              {feature.icon}
            </div>
            <h3 className="text-2xl font-medium mb-4 text-[#202124] dark:text-[#e8eaed]">{feature.title}</h3>
            <p className="text-[#5f6368] dark:text-[#9aa0a6] text-lg leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
