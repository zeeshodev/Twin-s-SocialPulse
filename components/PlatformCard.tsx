import React, { useState } from 'react';
import { PlatformInsight, PlatformStatus } from '../types';
import { EngagementChart } from './EngagementChart';
import { 
  Instagram, 
  Linkedin, 
  Twitter, 
  Facebook, 
  Youtube, 
  Video, 
  TrendingUp, 
  Clock,
  AlertCircle,
  Share2,
  Check
} from 'lucide-react';

interface PlatformCardProps {
  platform: PlatformInsight;
}

const getIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('instagram')) return <Instagram className="w-6 h-6 text-pink-500" />;
  if (n.includes('linkedin')) return <Linkedin className="w-6 h-6 text-blue-500" />;
  if (n.includes('twitter') || n.includes('x')) return <Twitter className="w-6 h-6 text-sky-400" />;
  if (n.includes('facebook')) return <Facebook className="w-6 h-6 text-blue-600" />;
  if (n.includes('youtube')) return <Youtube className="w-6 h-6 text-red-500" />;
  if (n.includes('tiktok')) return <Video className="w-6 h-6 text-teal-400" />;
  return <TrendingUp className="w-6 h-6 text-gray-400" />;
};

const getStatusColor = (status: PlatformStatus) => {
  switch (status) {
    case PlatformStatus.EXCELLENT: return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    case PlatformStatus.GOOD: return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    case PlatformStatus.FAIR: return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    case PlatformStatus.POOR: return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
  }
};

const getChartColor = (status: PlatformStatus) => {
    switch (status) {
      case PlatformStatus.EXCELLENT: return '#34d399'; // emerald-400
      case PlatformStatus.GOOD: return '#60a5fa'; // blue-400
      case PlatformStatus.FAIR: return '#facc15'; // yellow-400
      case PlatformStatus.POOR: return '#fb7185'; // rose-400
      default: return '#94a3b8';
    }
};

export const PlatformCard: React.FC<PlatformCardProps> = ({ platform }) => {
  const [copied, setCopied] = useState(false);
  const statusStyles = getStatusColor(platform.currentStatus);
  const chartColor = getChartColor(platform.currentStatus);

  const handleShare = async () => {
    const text = `📊 ${platform.name} Forecast\n\n` +
      `⚡ Status: ${platform.currentStatus} Time to Post\n` +
      `🕒 Next Best Slot: ${platform.nextBestSlot}\n` +
      `📈 Virality Score: ${platform.viralityScore}%\n` +
      `💡 Insight: ${platform.reasoning}\n\n` +
      `via SocialPulse AI`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${platform.name} Posting Insight`,
          text: text,
        });
      } catch (err) {
        // Handle cancellation or error silently if it's just an abort
        if ((err as Error).name !== 'AbortError') console.error('Share failed:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
            {getIcon(platform.name)}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100">{platform.name}</h3>
            <div className={`text-xs px-2 py-0.5 rounded-full border inline-block mt-1 ${statusStyles}`}>
              {platform.currentStatus} Time
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-100">{platform.viralityScore}%</div>
            <div className="text-xs text-slate-400">Virality Score</div>
          </div>
          <button
            onClick={handleShare}
            className="mt-1 p-2 bg-slate-900/50 hover:bg-slate-700 rounded-lg transition-all text-slate-400 hover:text-white border border-transparent hover:border-slate-600"
            title="Share Insight"
            aria-label="Share Insight"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-slate-300">
          <Clock className="w-4 h-4 mt-0.5 text-slate-500" />
          <span>
            Next best slot: <span className="text-white font-medium">{platform.nextBestSlot}</span>
          </span>
        </div>
        
        <div className="flex items-start gap-2 text-sm text-slate-400 bg-slate-900/50 p-2 rounded-lg">
          <AlertCircle className="w-4 h-4 mt-0.5 min-w-[16px]" />
          <p className="leading-snug text-xs">{platform.reasoning}</p>
        </div>
      </div>

      <EngagementChart data={platform.hourlyForecast || []} color={chartColor} />
    </div>
  );
};
