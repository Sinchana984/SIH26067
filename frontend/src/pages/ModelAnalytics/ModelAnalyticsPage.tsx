import React, { useState } from 'react';
import { predictReliability } from '../../services/api';
import { PredictResponse } from '../../types';
import { Cpu, Zap, Play, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

export const ModelAnalyticsPage: React.FC = () => {
  const { isDarkMode } = useTheme();

  // Live Prediction Form Inputs
  const [form, setForm] = useState({
    region_id: 'IND_WEST',
    latitude: 15.5,
    longitude: 72.5,
    forecast_temperature: 28.5,
    observed_temperature: 28.2,
    forecast_salinity: 35.1,
    observed_salinity: 35.0,
    forecast_current_speed: 0.20,
    observed_current_speed: 0.18
  });

  const [predResult, setPredResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await predictReliability(form);
    setPredResult(res);
    setLoading(false);
  };

  const featureImportance = [
    { feature: 'Temperature Bias', importance: 42.5 },
    { feature: 'Current Speed Bias', importance: 28.2 },
    { feature: 'Salinity Bias', importance: 16.8 },
    { feature: 'HYCOM SST', importance: 7.5 },
    { feature: 'Observed SST', importance: 5.0 }
  ];

  const gridColor = isDarkMode ? '#1E293B' : '#F1F5F9';
  const textColor = isDarkMode ? '#94A3B8' : '#64748B';
  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
    borderColor: isDarkMode ? '#334155' : '#E2E8F0',
    color: isDarkMode ? '#F8FAFC' : '#0F172A',
    borderRadius: '0.75rem',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-6 h-6 text-ocean-600 dark:text-ocean-400" />
          <span>Model Analytics & Live Prediction Sandbox</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Machine learning algorithm evaluation, feature importance breakdown, and live inference runner.</p>
      </div>

      {/* Model Performance Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Primary Model</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">Gradient Boosting</h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Active in Production</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Model Accuracy (R²)</span>
          <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">99.91%</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Cross-validated</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Mean Absolute Error</span>
          <h3 className="text-xl font-bold text-ocean-600 dark:text-ocean-400 mt-1">0.124</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Score Error Margin</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Root Mean Sq. Error</span>
          <h3 className="text-xl font-bold text-navy-500 dark:text-sky-400 mt-1">0.187</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">RMSE Variance</span>
        </div>
      </div>

      {/* Live Prediction Interactive Sandbox Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Zap className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Live Prediction Sandbox (`POST /predict`)</h3>
        </div>

        <form onSubmit={handlePredict} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Region ID</label>
            <select
              value={form.region_id}
              onChange={e => setForm({ ...form, region_id: e.target.value })}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="IND_WEST">West Coast of India (Arabian Sea)</option>
              <option value="IND_EAST">East Coast of India (Bay of Bengal)</option>
              <option value="IND_SOUTH">Southern Indian Ocean</option>
              <option value="IND_GUJARAT">Gujarat Coastal Zone</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Forecast Temp (°C)</label>
            <input
              type="number" step="0.1"
              value={form.forecast_temperature}
              onChange={e => setForm({ ...form, forecast_temperature: parseFloat(e.target.value) })}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Observed Temp (°C)</label>
            <input
              type="number" step="0.1"
              value={form.observed_temperature}
              onChange={e => setForm({ ...form, observed_temperature: parseFloat(e.target.value) })}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Forecast Salinity (PSU)</label>
            <input
              type="number" step="0.1"
              value={form.forecast_salinity}
              onChange={e => setForm({ ...form, forecast_salinity: parseFloat(e.target.value) })}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Observed Salinity (PSU)</label>
            <input
              type="number" step="0.1"
              value={form.observed_salinity}
              onChange={e => setForm({ ...form, observed_salinity: parseFloat(e.target.value) })}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Forecast Speed (m/s)</label>
            <input
              type="number" step="0.01"
              value={form.forecast_current_speed}
              onChange={e => setForm({ ...form, forecast_current_speed: parseFloat(e.target.value) })}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-ocean-500 hover:bg-ocean-600 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-transform hover:scale-105"
            >
              <Play className="w-4 h-4" />
              <span>{loading ? 'Running ML Model...' : 'Run Live Inference'}</span>
            </button>
          </div>
        </form>

        {predResult && (
          <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white space-y-2 text-xs animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-ocean-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Prediction Result Payload</span>
              </span>
              <span className="text-slate-400 text-[10px]">{predResult.timestamp}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
              <div>
                <span className="text-slate-400 block">Predicted Score</span>
                <span className="text-lg font-bold text-emerald-400">{predResult.predicted_reliability_score}%</span>
              </div>
              <div>
                <span className="text-slate-400 block">Reliability Category</span>
                <span className="font-bold text-white">{predResult.predicted_category}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Confidence Level</span>
                <span className="font-bold text-sky-300">{predResult.confidence_level}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Risk Assessment</span>
                <span className="font-bold text-emerald-300">{predResult.risk_level}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Importance Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Feature Importance Breakdown</h3>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureImportance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" domain={[0, 50]} tick={{ fontSize: 11, fill: textColor }} />
              <YAxis dataKey="feature" type="category" tick={{ fontSize: 11, fill: textColor }} width={140} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val) => [`${val}%`, 'Relative Importance']} />
              <Bar dataKey="importance" fill="#2563EB" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
