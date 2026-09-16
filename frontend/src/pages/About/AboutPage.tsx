import React from 'react';
import { Waves, Shield, Cpu } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ocean-50 dark:bg-ocean-950/80 text-ocean-600 dark:text-ocean-400 border border-ocean-200 dark:border-ocean-800 text-xs font-bold uppercase tracking-wider">
          <Waves className="w-4 h-4 text-ocean-500" />
          <span>Smart India Hackathon (SIH 2026) Problem Statement</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">About OCEANSPHERE</h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm max-w-2xl mx-auto">
          Ocean Forecast Reliability & Decision Support System designed for INCOIS scientific ocean monitoring, numerical model validation, and coastal risk evaluation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-ocean-600 dark:text-ocean-400" />
            <span>Problem Statement & Objective</span>
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Numerical ocean models (e.g., HYCOM) provide continuous forecasts of sea surface temperature, salinity, currents, and sea surface height. However, regional variations, monsoon dynamics, and coastal bathymetry cause spatial divergence between predictions and real-world observations.
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            OceanSphere addresses this by continuously evaluating forecasts against in-situ observations (Argo floats, moored buoys, satellite SST), calculating feature biases, and training machine-learning models to predict reliability scores in real time.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Scientific Architecture & ML Engine</span>
          </h3>
          <ul className="space-y-2 text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-ocean-500 mt-1.5"></span>
              <span><strong>Backend</strong>: FastAPI REST service connecting directly to native PostgreSQL (<code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-800 dark:text-slate-200">ocean_reliability_db</code>).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></span>
              <span><strong>ML Model</strong>: Gradient Boosting Regressor achieving <strong>99.91% R² accuracy</strong> and <strong>0.124 MAE</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5"></span>
              <span><strong>Visualization</strong>: Interactive 3D Earth Globe with spatial lat/lon tracking and layer control toggles.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
