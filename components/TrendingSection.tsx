import React from 'react';
import { TrendingData } from '../types';
import { TrendingUp, ExternalLink, Hash, Tag } from 'lucide-react';

interface TrendingSectionProps {
  data: TrendingData;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({ data }) => {
  if (!data || (data.items.length === 0 && !data.rawText)) return null;

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-indigo-400" />
        <h2 className="text-lg font-semibold text-white">Trending Now in Your Industry</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {data.items.length > 0 ? (
          data.items.map((item, idx) => (
            <div key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="font-medium text-slate-200 mb-2">{item.topic}</h3>
                <p className="text-sm text-slate-400 leading-snug mb-3">{item.description}</p>
                
                {item.hashtags && item.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.hashtags.map((tag, tIdx) => (
                      <span key={tIdx} className="inline-flex items-center text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/20">
                        <Hash className="w-2.5 h-2.5 mr-0.5" />
                        {tag.replace(/^#/, '')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {item.keywords && item.keywords.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <div className="flex items-start gap-1.5">
                    <Tag className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-500 font-mono">
                      {item.keywords.join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-slate-400 italic bg-slate-800/30 p-4 rounded-lg">
            {data.rawText}
          </div>
        )}
      </div>

      {data.sources.length > 0 && (
        <div className="border-t border-slate-800 pt-4 mt-4">
          <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider font-semibold">Sources & Real-time Data</p>
          <div className="flex flex-wrap gap-3">
            {data.sources.map((source, idx) => (
              <a 
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-colors bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20"
              >
                {source.title} <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
