import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Download, Copy, Check, Loader2 } from 'lucide-react';
import { generateLeadershipBrief } from '../lib/api';

export const LeadershipBriefStudio: React.FC = () => {
  const [reportType, setReportType] = useState('Weekly Brief');
  const [loading, setLoading] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await generateLeadershipBrief(reportType);
      setReportContent(res.markdown_content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!reportContent) return;
    navigator.clipboard.writeText(reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!reportContent) return;
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Skylark_${reportType.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.md`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Controls */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">Leadership Brief Studio</h1>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-full">
            AI Executive Chief of Staff
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {['Weekly Brief', 'Monthly Executive Update', 'Board Report'].map(t => (
              <button
                key={t}
                onClick={() => setReportType(t)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${reportType === t ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-5 py-2 rounded-xl text-white font-semibold text-xs bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate {reportType}
          </button>
        </div>
      </motion.div>

      {/* Generated Report Display */}
      {reportContent && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 font-mono">
              <FileText className="w-4 h-4 text-cyan-400" />
              Generated {reportType} Markdown Output
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button onClick={handleDownload} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 hover:bg-cyan-900 text-xs font-mono transition-colors">
                <Download className="w-3.5 h-3.5" />
                Download MD
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {reportContent}
          </pre>
        </motion.div>
      )}
    </div>
  );
};
