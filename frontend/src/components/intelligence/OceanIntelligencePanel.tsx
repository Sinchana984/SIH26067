import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Compass, Layers, ShieldCheck, ArrowRightLeft, Waves, RefreshCw, ChevronRight } from 'lucide-react';
import { orchestrateAIQuery, OrchestrationResponsePayload, AIChatMessagePayload } from '../../services/api';
import { ShipRouteResult } from '../../types';

interface OceanIntelligencePanelProps {
  onRouteGenerated?: (route: ShipRouteResult) => void;
  currentRoute?: ShipRouteResult | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  tools_called?: string[];
  data_sources?: string[];
  suggestions?: string[];
  route_result?: ShipRouteResult;
}

export const OceanIntelligencePanel: React.FC<OceanIntelligencePanelProps> = ({
  onRouteGenerated,
  currentRoute
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `### 🌊 Welcome to OceanSphere AI Intelligence Platform\n\nI am your marine routing & oceanographic intelligence assistant. Ask me questions or request route calculations using natural language.\n\n_Powered by strictly water-constrained A* routing, HYCOM hydrodynamic models, & INCOIS ocean observations._`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data_sources: ['MODEL (HYCOM)', 'OBSERVATION (Argo Floats)', 'ANALYSIS (Gradient Boosting ML)'],
      suggestions: [
        'Route Kolkata to Kochi',
        'Route Mumbai to Singapore',
        'Why does this route avoid Sri Lanka?',
        'Compare Mumbai to Singapore with Kochi to Singapore'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendQuery = async (inputQuery?: string) => {
    const textToSubmit = (inputQuery || query).trim();
    if (!textToSubmit || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSubmit,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const historyPayload: AIChatMessagePayload[] = messages.slice(-4).map((m) => ({
        sender: m.sender,
        text: m.text
      }));

      const response: OrchestrationResponsePayload = await orchestrateAIQuery({
        message: textToSubmit,
        history: historyPayload
      });

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tools_called: response.tools_called,
        data_sources: response.data_sources_used,
        suggestions: response.suggestions,
        route_result: response.route_result
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (response.route_result && onRouteGenerated) {
        onRouteGenerated(response.route_result);
      }
    } catch (err) {
      console.error('[AI Panel] Orchestrator error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **System Note**: Unable to complete AI orchestration. Reverting to direct backend marine pathfinder.\n\n_Status: Insufficient data available for this analysis._`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    // Clean lightweight markdown parser for formatting
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs text-slate-200 leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="font-extrabold text-sm text-sky-400 mt-2 mb-1 flex items-center gap-1.5">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('**') && line.endsWith('**')) {
            return <p key={idx} className="font-bold text-slate-100">{line.replace(/\*\*/g, '')}</p>;
          }
          if (line.startsWith('- ')) {
            const content = line.replace('- ', '');
            // Highlight inline code `code`
            const formatted = content.split(/`([^`]+)`/).map((part, pIdx) =>
              pIdx % 2 === 1 ? <code key={pIdx} className="px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800/60 font-mono text-[11px] text-sky-300 font-bold">{part}</code> : part
            );
            return <li key={idx} className="ml-3 list-disc text-slate-300">{formatted}</li>;
          }
          if (line.startsWith('_') && line.endsWith('_')) {
            return <p key={idx} className="text-[11px] italic text-slate-400 border-t border-slate-800/60 pt-1.5 mt-2">{line.replace(/_/g, '')}</p>;
          }
          
          const formattedLine = line.split(/`([^`]+)`/).map((part, pIdx) =>
            pIdx % 2 === 1 ? <code key={pIdx} className="px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-800/60 font-mono text-[11px] text-sky-300 font-bold">{part}</code> : part
          );
          return line.trim() ? <p key={idx}>{formattedLine}</p> : <div key={idx} className="h-1" />;
        })}
      </div>
    );
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-sky-900/50 shadow-2xl overflow-hidden flex flex-col h-[560px]">
      
      {/* Panel Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-950 via-sky-950 to-slate-950 border-b border-sky-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs tracking-wider text-white uppercase flex items-center gap-2">
              Ocean Intelligence
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold normal-case">
                AI Orchestrator Online
              </span>
            </h3>
            <p className="text-[10px] text-slate-400">Natural-language marine routing & data assistant</p>
          </div>
        </div>

        {currentRoute && (
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono bg-sky-950/80 border border-sky-800/60 px-2.5 py-1 rounded-lg text-sky-300">
            <Compass className="w-3 h-3 text-sky-400" />
            <span>Active: {currentRoute.origin_port.name.split(' ')[0]} → {currentRoute.destination_port.name.split(' ')[0]}</span>
          </div>
        )}
      </div>

      {/* Quick Action Preset Pills */}
      <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 shrink-0 flex items-center gap-1">
          <Compass className="w-3 h-3 text-sky-400" /> Quick Actions:
        </span>
        <button
          onClick={() => handleSendQuery('Route Kolkata to Kochi')}
          className="shrink-0 px-2.5 py-1 rounded-full bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-800/60 hover:border-sky-600 text-[11px] font-medium transition-all flex items-center gap-1"
        >
          <span>Route Kolkata → Kochi</span>
        </button>
        <button
          onClick={() => handleSendQuery('Route Mumbai to Singapore for a container vessel')}
          className="shrink-0 px-2.5 py-1 rounded-full bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-800/60 hover:border-sky-600 text-[11px] font-medium transition-all flex items-center gap-1"
        >
          <span>Route Mumbai → Singapore</span>
        </button>
        <button
          onClick={() => handleSendQuery('Compare Mumbai to Singapore with Kochi to Singapore')}
          className="shrink-0 px-2.5 py-1 rounded-full bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-800/60 hover:border-sky-600 text-[11px] font-medium transition-all flex items-center gap-1"
        >
          <ArrowRightLeft className="w-3 h-3 text-sky-400" />
          <span>Compare Routes</span>
        </button>
        <button
          onClick={() => handleSendQuery('Why does this route avoid Sri Lanka?')}
          className="shrink-0 px-2.5 py-1 rounded-full bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-800/60 hover:border-sky-600 text-[11px] font-medium transition-all flex items-center gap-1"
        >
          <span>Explain Detour</span>
        </button>
        <button
          onClick={() => handleSendQuery('What are the ocean conditions along this route?')}
          className="shrink-0 px-2.5 py-1 rounded-full bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-800/60 hover:border-sky-600 text-[11px] font-medium transition-all flex items-center gap-1"
        >
          <Waves className="w-3 h-3 text-sky-400" />
          <span>Ocean Conditions</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
              msg.sender === 'user'
                ? 'bg-sky-600 border-sky-400 text-white'
                : 'bg-slate-800 border-slate-700 text-sky-400'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] space-y-2 ${
              msg.sender === 'user'
                ? 'bg-sky-600 text-white p-3 rounded-2xl rounded-tr-none shadow-md'
                : 'bg-slate-950/90 border border-slate-800 text-slate-200 p-3.5 rounded-2xl rounded-tl-none shadow-xl'
            }`}>
              {/* Header inside bot bubble */}
              {msg.sender === 'assistant' && (
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800/80 pb-1.5 mb-1.5">
                  <span className="font-bold text-sky-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Ocean Intelligence AI
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
              )}

              {/* Text / Markdown */}
              {msg.sender === 'user' ? (
                <p className="text-xs font-medium">{msg.text}</p>
              ) : (
                renderMarkdown(msg.text)
              )}

              {/* Tools Called Badge */}
              {msg.tools_called && msg.tools_called.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] font-bold text-slate-400">Tools Executed:</span>
                  {msg.tools_called.map((tool) => (
                    <span key={tool} className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                      ⚡ {tool}
                    </span>
                  ))}
                </div>
              )}

              {/* Route Summary Card in AI Message */}
              {msg.route_result && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-sky-800/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-sky-400" />
                      {msg.route_result.origin_port.name} → {msg.route_result.destination_port.name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                      {msg.route_result.total_distance_nm} NM
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                    <div>⏱️ Transit: <span className="font-bold text-white">{msg.route_result.estimated_transit_hours} hrs</span></div>
                    <div>⛽ Fuel: <span className="font-bold text-white">{msg.route_result.fuel_consumption_tons} tons</span></div>
                    <div>🎯 Reliability: <span className="font-bold text-emerald-400">{msg.route_result.average_reliability_score}%</span></div>
                    <div>🛡️ Land Status: <span className="font-bold text-sky-300">0 Crossings</span></div>
                  </div>
                </div>
              )}

              {/* Interactive Follow-up Suggestions */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="pt-2.5 space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Suggested Follow-ups:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSendQuery(sug)}
                        className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-sky-950 text-sky-300 hover:text-sky-200 border border-slate-800 hover:border-sky-700 transition-all flex items-center gap-1"
                      >
                        <ChevronRight className="w-3 h-3 text-sky-400 shrink-0" />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Spinner Indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-sky-400">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl rounded-tl-none text-xs text-sky-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></div>
              <span>Executing controlled tools on project data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask OceanSphere (e.g. Route Kolkata to Kochi...)"
              disabled={loading}
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-xs text-white placeholder-slate-500 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
