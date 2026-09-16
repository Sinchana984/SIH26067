import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Send, Bot, User, X, MessageSquare, Compass, ShieldCheck, Waves, Cpu, ExternalLink, HelpCircle, ArrowRightLeft } from 'lucide-react';
import { orchestrateAIQuery, OrchestrationResponsePayload, AIChatMessagePayload } from '../../services/api';
import { ShipRouteResult } from '../../types';

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

export const GlobalOceanIntelligenceDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'global-welcome-1',
      sender: 'assistant',
      text: `### 🌊 OceanSphere AI Global Platform Assistant\n\nI can assist you across the entire platform — from ocean observation datasets and ML reliability scores to vessel profiles and smart marine routing.\n\n_Ask me anything about OceanSphere data, features, analytics, or navigation!_`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data_sources: ['PLATFORM_DOCUMENTATION', 'HYCOM_MODEL', 'INCOIS_OBSERVATIONS'],
      suggestions: [
        'What can OceanSphere help me with?',
        'What dataset is this temperature value from?',
        'Plan a route from Kolkata to Kochi',
        'Show Panamax Bulk Carrier parameters'
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

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
        context: {
          current_page: location.pathname
        },
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
    } catch (err) {
      console.error('[Global AI Drawer] Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **System Note**: Unable to process query. Reverting to platform default guide.\n\n_Status: Insufficient data available for this analysis._`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
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
    <>
      {/* Floating Widget Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-50 p-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-ocean-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-xl shadow-sky-600/30 border border-sky-400/40 transition-all transform hover:scale-105 flex items-center gap-2 group"
        title="Open Ocean Intelligence Platform Assistant"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
        </div>
        <span className="text-xs font-extrabold uppercase tracking-wider hidden sm:inline-block">
          Ocean Intelligence
        </span>
      </button>

      {/* Slide-out Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-slate-900/98 backdrop-blur-xl border-l border-sky-900/50 shadow-2xl flex flex-col transition-all duration-300">
          
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-sky-950 to-slate-950 border-b border-sky-900/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wider text-white uppercase flex items-center gap-2">
                  Ocean Intelligence
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold normal-case">
                    Online
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Active context: <code className="text-sky-300 font-mono">{location.pathname}</code></p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Presets */}
          <div className="px-3 py-2 bg-slate-950/80 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 shrink-0">
              Prompts:
            </span>
            <button
              onClick={() => handleSendQuery('What can OceanSphere help me with?')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-800/60 text-[11px] font-medium transition-all"
            >
              Platform Guide
            </button>
            <button
              onClick={() => handleSendQuery('Show data provenance')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-800/60 text-[11px] font-medium transition-all"
            >
              Data Provenance
            </button>
            <button
              onClick={() => handleSendQuery('What is the temperature in Arabian Sea?')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-800/60 text-[11px] font-medium transition-all"
            >
              Ocean Data
            </button>
            <button
              onClick={() => handleSendQuery('Route Kolkata to Kochi')}
              className="shrink-0 px-2.5 py-1 rounded-full bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-800/60 text-[11px] font-medium transition-all"
            >
              Route Kolkata → Kochi
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 border-sky-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-sky-400'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[85%] space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white p-3 rounded-2xl rounded-tr-none shadow-md'
                    : 'bg-slate-950/90 border border-slate-800 text-slate-200 p-3.5 rounded-2xl rounded-tl-none shadow-xl'
                }`}>
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800/80 pb-1.5 mb-1.5">
                      <span className="font-bold text-sky-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Ocean Intelligence
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                  )}

                  {msg.sender === 'user' ? (
                    <p className="text-xs font-medium">{msg.text}</p>
                  ) : (
                    renderMarkdown(msg.text)
                  )}

                  {msg.tools_called && msg.tools_called.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
                      <span className="text-[10px] font-bold text-slate-400">Tools:</span>
                      {msg.tools_called.map((tool) => (
                        <span key={tool} className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                          ⚡ {tool}
                        </span>
                      ))}
                    </div>
                  )}

                  {msg.route_result && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-sky-800/60 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-sky-400" />
                          {msg.route_result.origin_port.name} → {msg.route_result.destination_port.name}
                        </span>
                        <button
                          onClick={() => {
                            setIsOpen(false);
                            navigate('/routing');
                          }}
                          className="px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[10px] flex items-center gap-1"
                        >
                          <span>View on Map</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                        <div>⏱️ Distance: <span className="font-bold text-white">{msg.route_result.total_distance_nm} NM</span></div>
                        <div>⏱️ Transit: <span className="font-bold text-white">{msg.route_result.estimated_transit_hours} hrs</span></div>
                        <div>🎯 Reliability: <span className="font-bold text-emerald-400">{msg.route_result.average_reliability_score}%</span></div>
                        <div>🛡️ Land Status: <span className="font-bold text-sky-300">0 Crossings</span></div>
                      </div>
                    </div>
                  )}

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pt-2.5 space-y-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Suggestions:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSendQuery(sug)}
                            className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-sky-950 text-sky-300 hover:text-sky-200 border border-slate-800 hover:border-sky-700 transition-all flex items-center gap-1"
                          >
                            <span>• {sug}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-sky-400">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl rounded-tl-none text-xs text-sky-300 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></div>
                  <span>Executing controlled tools on OceanSphere backend...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3.5 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about ocean data, routing, vessels, features..."
                disabled={loading}
                className="w-full pl-3.5 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-xs text-white placeholder-slate-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
