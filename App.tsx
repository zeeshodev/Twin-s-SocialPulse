import React, { useState, useEffect } from 'react';
import { fetchSocialInsights, fetchTrendingTopics } from './services/geminiService';
import { SocialInsightsResponse, TrendingData } from './types';
import { PlatformCard } from './components/PlatformCard';
import { TrendingSection } from './components/TrendingSection';
import { 
  Activity, 
  Settings, 
  RefreshCw, 
  Zap, 
  Search,
  Globe
} from 'lucide-react';

const DEFAULT_INDUSTRY = "General Tech & Lifestyle";

const App: React.FC = () => {
  const [industry, setIndustry] = useState<string>(DEFAULT_INDUSTRY);
  const [tempIndustry, setTempIndustry] = useState<string>(DEFAULT_INDUSTRY);
  
  const [data, setData] = useState<SocialInsightsResponse | null>(null);
  const [trendingData, setTrendingData] = useState<TrendingData | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleFetchInsights = async (forceIndustry?: string) => {
    setLoading(true);
    setError(null);
    setTrendingData(null);
    
    try {
      const targetIndustry = forceIndustry || industry;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Fetch both in parallel
      const [insightsResult, trendingResult] = await Promise.allSettled([
        fetchSocialInsights(targetIndustry, timezone),
        fetchTrendingTopics(targetIndustry)
      ]);

      // Handle Insights
      if (insightsResult.status === 'fulfilled') {
        setData(insightsResult.value);
      } else {
        setError("Failed to generate main insights. Please check your API key.");
        console.error(insightsResult.reason);
      }

      // Handle Trending (Non-blocking)
      if (trendingResult.status === 'fulfilled') {
        setTrendingData(trendingResult.value);
      } else {
        console.warn("Trending topics failed:", trendingResult.reason);
      }

    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    handleFetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempIndustry.trim()) {
      setIndustry(tempIndustry);
      handleFetchInsights(tempIndustry);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">SocialPulse AI</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current Time</span>
                <span className="font-mono text-sm font-medium">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <button 
                onClick={() => handleFetchInsights()}
                disabled={loading}
                className={`p-2 rounded-full hover:bg-slate-800 transition-all ${loading ? 'animate-spin opacity-50' : ''}`}
                title="Refresh Insights"
              >
                <RefreshCw className="w-5 h-5 text-indigo-400" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Real-Time Posting Monitor</h1>
            <p className="text-slate-400 max-w-2xl">
              AI-driven predictions for maximizing engagement based on current global trends and your specific niche.
            </p>
        </div>

        {/* Controls */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-8 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-400 mb-2">Target Audience / Industry</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  value={tempIndustry}
                  onChange={(e) => setTempIndustry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-slate-600"
                  placeholder="e.g. Crypto, Beauty, SaaS, Gaming..."
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="hidden md:block h-10 w-px bg-slate-800 mx-2"></div>
               <div className="flex flex-col">
                  <span className="text-xs text-slate-500 mb-1">Detected Region</span>
                  <div className="flex items-center gap-1.5 text-sm text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </div>
               </div>
               <button 
                type="submit"
                disabled={loading}
                className="ml-auto md:ml-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : 'Update Insights'}
                {!loading && <Zap className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>

        {/* Content Area */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/50 text-rose-200 p-4 rounded-xl mb-8 flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 rounded-full">
              <Settings className="w-5 h-5" />
            </div>
            {error}
          </div>
        )}

        {loading && !data && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
             {[1, 2, 3].map(i => (
               <div key={i} className="h-64 bg-slate-800 rounded-xl"></div>
             ))}
           </div>
        )}

        {!loading && (
          <>
            {/* General Advice Banner */}
            {data && (
              <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-indigo-300 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> AI Strategic Overview
                </h2>
                <p className="text-slate-300 leading-relaxed">{data.generalAdvice}</p>
              </div>
            )}

            {/* Trending Topics Section */}
            {trendingData && <TrendingSection data={trendingData} />}

            {/* Platform Grid */}
            {data && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.platforms.map((platform) => (
                  <PlatformCard key={platform.name} platform={platform} />
                ))}
              </div>
            )}
          </>
        )}

        {!data && !loading && !error && (
            <div className="text-center py-20 text-slate-500">
                <p>Ready to analyze. Click "Update Insights" to begin.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;