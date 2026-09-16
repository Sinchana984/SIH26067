import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Navigation,
  Compass,
  Anchor,
  ShieldCheck,
  Zap,
  Fuel,
  ArrowRightLeft,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Download,
  FileText,
  Layers,
  MapPin,
  Clock,
  Gauge,
  TrendingUp,
  CheckCircle2,
  Ship,
  Info,
  ChevronRight,
  ExternalLink,
  Globe
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  getRoutingPorts,
  getVesselProfiles,
  calculateShipRoute,
  FALLBACK_PORTS,
  FALLBACK_VESSELS
} from '../../services/api';
import { PortLocation, VesselProfile, ShipRouteResult, RouteWaypoint } from '../../types';

import { RouteMap } from '../../components/routing/RouteMap';
import { OceanIntelligencePanel } from '../../components/intelligence/OceanIntelligencePanel';

export const ShipRoutingPage: React.FC = () => {
  // ── State ─────────────────────────────────────────────────────────────────
  const [ports, setPorts] = useState<PortLocation[]>(FALLBACK_PORTS);
  const [vessels, setVessels] = useState<VesselProfile[]>(FALLBACK_VESSELS);
  const [loading, setLoading] = useState<boolean>(false);

  const [originId, setOriginId] = useState<string>('BOM'); // Default Mumbai
  const [destId, setDestId] = useState<string>('MAA');   // Default Chennai
  const [vesselId, setVesselId] = useState<string>('CONTAINER_L');
  const [optimizationMode, setOptimizationMode] = useState<'reliability' | 'eco' | 'express'>('reliability');
  const [customSpeed, setCustomSpeed] = useState<number>(19.5);

  const [avoidHighWaves, setAvoidHighWaves] = useState<boolean>(true);
  const [avoidLowReliability, setAvoidLowReliability] = useState<boolean>(true);
  const [avoidActiveAlerts, setAvoidActiveAlerts] = useState<boolean>(true);

  const [routeResult, setRouteResult] = useState<ShipRouteResult | null>(null);
  const [selectedWaypoint, setSelectedWaypoint] = useState<RouteWaypoint | null>(null);

  // Map layer overlays
  const [showWavesOverlay, setShowWavesOverlay] = useState<boolean>(true);
  const [showReliabilityOverlay, setShowReliabilityOverlay] = useState<boolean>(true);
  const [showDirectRoute, setShowDirectRoute] = useState<boolean>(false);

  // Voyage Simulation Player State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simStep, setSimStep] = useState<number>(0);
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Initial Load & Calculation ─────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      const p = await getRoutingPorts();
      const v = await getVesselProfiles();
      setPorts(p);
      setVessels(v);
    }
    loadData();
  }, []);

  const selectedVessel = useMemo(() => {
    return vessels.find((v) => v.id === vesselId) || vessels[0];
  }, [vessels, vesselId]);

  useEffect(() => {
    if (selectedVessel) {
      setCustomSpeed(selectedVessel.default_speed_knots);
    }
  }, [selectedVessel]);

  const handleCalculateRoute = async () => {
    setLoading(true);
    try {
      const result = await calculateShipRoute({
        origin_port_id: originId,
        destination_port_id: destId,
        vessel_id: vesselId,
        optimization_mode: optimizationMode,
        custom_speed_knots: customSpeed,
        avoid_high_waves: avoidHighWaves,
        avoid_low_reliability: avoidLowReliability,
        avoid_active_alerts: avoidActiveAlerts
      });
      setRouteResult(result);
      if (result.waypoints.length > 0) {
        setSelectedWaypoint(result.waypoints[0]);
      }
      // Reset simulation
      setIsSimulating(false);
      setSimStep(0);
    } catch (err) {
      console.error('[ShipRouting] Calculation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial route calculation on mount
  useEffect(() => {
    handleCalculateRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwapPorts = () => {
    const temp = originId;
    setOriginId(destId);
    setDestId(temp);
  };

  // ── Voyage Simulation Control ──────────────────────────────────────────────
  useEffect(() => {
    if (isSimulating && routeResult && routeResult.waypoints.length > 0) {
      simTimerRef.current = setInterval(() => {
        setSimStep((prev) => {
          if (prev >= routeResult.waypoints.length - 1) {
            setIsSimulating(false);
            return prev;
          }
          const nextStep = prev + 1;
          setSelectedWaypoint(routeResult.waypoints[nextStep]);
          return nextStep;
        });
      }, 1200 / simSpeed);
    } else if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
    }

    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [isSimulating, routeResult, simSpeed]);

  const handlePlayPauseSim = () => {
    if (!routeResult) return;
    if (simStep >= routeResult.waypoints.length - 1) {
      setSimStep(0);
    }
    setIsSimulating(!isSimulating);
  };

  const handleResetSim = () => {
    setIsSimulating(false);
    setSimStep(0);
    if (routeResult && routeResult.waypoints.length > 0) {
      setSelectedWaypoint(routeResult.waypoints[0]);
    }
  };

  // ── Exports ────────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    window.print();
  };

  const handleExportGPX = () => {
    if (!routeResult) return;
    let gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="OceanSphere Smart Ship Routing Engine">\n  <rte>\n    <name>${routeResult.route_id}</name>\n    <desc>${routeResult.origin_port.name} to ${routeResult.destination_port.name} via OceanSphere Smart Reliable Route</desc>\n`;
    routeResult.waypoints.forEach((wpt) => {
      gpx += `    <rtept lat="${wpt.latitude}" lon="${wpt.longitude}">\n      <name>${wpt.name}</name>\n      <cmt>Reliability: ${wpt.reliability_score}%, Wave: ${wpt.wave_height_m}m, Speed: ${wpt.expected_speed_knots}kts</cmt>\n    </rtept>\n`;
    });
    gpx += `  </rte>\n</gpx>`;

    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${routeResult.route_id}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!routeResult) return;
    const jsonStr = JSON.stringify(routeResult, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${routeResult.route_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportKML = () => {
    if (!routeResult) return;
    let kml = `<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n  <Document>\n    <name>${routeResult.route_id}</name>\n    <description>OceanSphere Smart Marine Ship Route from ${routeResult.origin_port.name} to ${routeResult.destination_port.name}</description>\n`;
    kml += `    <Style id="smartRouteStyle">\n      <LineStyle>\n        <color>ff0284c7</color>\n        <width>4</width>\n      </LineStyle>\n    </Style>\n`;
    routeResult.waypoints.forEach((wpt) => {
      kml += `    <Placemark>\n      <name>${wpt.name}</name>\n      <description>Reliability: ${wpt.reliability_score}%, Wave: ${wpt.wave_height_m}m, Speed: ${wpt.expected_speed_knots}kts</description>\n      <Point><coordinates>${wpt.longitude},${wpt.latitude},0</coordinates></Point>\n    </Placemark>\n`;
    });
    const coordsStr = routeResult.waypoints.map(w => `${w.longitude},${w.latitude},0`).join(' ');
    kml += `    <Placemark>\n      <name>${routeResult.route_id} Passage Path</name>\n      <styleUrl>#smartRouteStyle</styleUrl>\n      <LineString><coordinates>${coordsStr}</coordinates></LineString>\n    </Placemark>\n  </Document>\n</kml>`;

    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${routeResult.route_id}.kml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Chart Data Preparation
  const chartData = useMemo(() => {
    if (!routeResult) return [];
    return routeResult.waypoints.map((wpt) => ({
      name: `${wpt.distance_from_start_nm} NM`,
      reliability: wpt.reliability_score,
      waveHeight: wpt.wave_height_m,
      speed: wpt.expected_speed_knots,
      lat: wpt.latitude,
      lon: wpt.longitude,
      advisory: wpt.advisory
    }));
  }, [routeResult]);

  // Map projections & SVG Canvas Dimensions
  const mapOrigin = routeResult ? routeResult.origin_port : ports[0];
  const mapDest = routeResult ? routeResult.destination_port : ports[1];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header & Operational Stats ────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-950 to-ocean-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-ocean-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-ocean-500/20 text-ocean-300 border border-ocean-500/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3 h-3 text-ocean-400 animate-spin-slow" />
                INCOIS High-Reliability Decision Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                v2.4 Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              Smart Ship Routing System
              <Navigation className="w-7 h-7 text-ocean-400" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Precision ocean voyage planning powered by numerical model forecast reliability (HYCOM), real-time sea state wave energy fields, and current vector optimization.
            </p>
          </div>

          {/* Quick Operational KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Route Reliability</div>
              <div className="text-lg font-black text-emerald-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                {routeResult ? `${routeResult.average_reliability_score}%` : '94.8%'}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Fuel Savings</div>
              <div className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                <Fuel className="w-4 h-4" />
                {routeResult ? `+${routeResult.fuel_saved_tons_vs_direct} T` : '+14.2 T'}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Eta Accuracy</div>
              <div className="text-lg font-black text-sky-400 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                ±1.2 Hrs
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Hazards Avoided</div>
              <div className="text-lg font-black text-rose-400 flex items-center justify-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {routeResult ? `${routeResult.hazard_zones_bypassed} Zones` : '2 Zones'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Layout ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT CONTROL PANEL (4 Cols) ─────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-5">
          {/* AI Ocean Intelligence Panel */}
          <OceanIntelligencePanel
            onRouteGenerated={(newRoute) => {
              setRouteResult(newRoute);
              if (newRoute.origin_port) setOriginId(newRoute.origin_port.id);
              if (newRoute.destination_port) setDestId(newRoute.destination_port.id);
            }}
            currentRoute={routeResult}
          />

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Anchor className="w-4 h-4 text-ocean-600" />
                Voyage Parameters
              </h2>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                ECDIS Ready
              </span>
            </div>

            {/* Departure Port */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Departure Port
              </label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-ocean-500 outline-none"
              >
                {ports.map((p) => (
                  <option key={`orig-${p.id}`} value={p.id}>
                    {p.name} ({p.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-1">
              <button
                onClick={handleSwapPorts}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-ocean-100 dark:hover:bg-ocean-950 text-slate-600 dark:text-slate-300 hover:text-ocean-600 border border-slate-200 dark:border-slate-700 transition-all hover:rotate-180"
                title="Swap Departure & Destination Ports"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Destination Port */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> Arrival Destination Port
              </label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-ocean-500 outline-none"
              >
                {ports.map((p) => (
                  <option key={`dest-${p.id}`} value={p.id}>
                    {p.name} ({p.country})
                  </option>
                ))}
              </select>
            </div>

            {/* Vessel Selection */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Ship className="w-3.5 h-3.5 text-ocean-600" /> Vessel Class Profile
              </label>
              <select
                value={vesselId}
                onChange={(e) => setVesselId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-ocean-500 outline-none"
              >
                {vessels.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.category})
                  </option>
                ))}
              </select>

              {/* Vessel specs badge */}
              {selectedVessel && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-[11px] grid grid-cols-3 gap-2 text-center text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="block text-[9px] font-semibold text-slate-400">Design Speed</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedVessel.default_speed_knots} kts</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-semibold text-slate-400">Fuel Rate</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedVessel.fuel_rate_tons_per_day} t/day</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-semibold text-slate-400">Max Wave</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedVessel.max_wave_height_m}m</span>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Speed Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-sky-500" /> Target Cruising Speed
                </span>
                <span className="font-extrabold text-ocean-600">{customSpeed} Knots</span>
              </div>
              <input
                type="range"
                min={6}
                max={30}
                step={0.5}
                value={customSpeed}
                onChange={(e) => setCustomSpeed(parseFloat(e.target.value))}
                className="w-full accent-ocean-600 bg-slate-200 dark:bg-slate-700 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            {/* Optimization Strategy Tabs */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" /> Optimization Strategy
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setOptimizationMode('reliability')}
                  className={`py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 ${
                    optimizationMode === 'reliability'
                      ? 'bg-white dark:bg-slate-900 text-ocean-600 dark:text-ocean-400 shadow-sm border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Max Safety</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOptimizationMode('eco')}
                  className={`py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 ${
                    optimizationMode === 'eco'
                      ? 'bg-white dark:bg-slate-900 text-ocean-600 dark:text-ocean-400 shadow-sm border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Fuel className="w-4 h-4 text-amber-500" />
                  <span>Eco / Fuel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOptimizationMode('express')}
                  className={`py-2 px-1 rounded-lg transition-all flex flex-col items-center justify-center gap-1 ${
                    optimizationMode === 'express'
                      ? 'bg-white dark:bg-slate-900 text-ocean-600 dark:text-ocean-400 shadow-sm border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-4 h-4 text-sky-500" />
                  <span>Express</span>
                </button>
              </div>
            </div>

            {/* Avoidance Constraints */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-medium">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hazard Avoidance Filters</span>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={avoidHighWaves}
                    onChange={(e) => setAvoidHighWaves(e.target.checked)}
                    className="rounded text-ocean-600 focus:ring-ocean-500"
                  />
                  <span>Bypass High Waves (&gt; 2.8m)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={avoidLowReliability}
                    onChange={(e) => setAvoidLowReliability(e.target.checked)}
                    className="rounded text-ocean-600 focus:ring-ocean-500"
                  />
                  <span>Avoid Low Reliability Grid (&lt; 70%)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={avoidActiveAlerts}
                    onChange={(e) => setAvoidActiveAlerts(e.target.checked)}
                    className="rounded text-ocean-600 focus:ring-ocean-500"
                  />
                  <span>Divert Around Active Severe Alerts</span>
                </label>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              onClick={handleCalculateRoute}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-ocean-600 via-sky-600 to-blue-600 hover:from-ocean-700 hover:to-blue-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-ocean-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Computing Optimal Path...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Calculate Smart Route</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Presets Box */}
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Frequent Maritime Corridors</div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => { setOriginId('BOM'); setDestId('MAA'); }}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-ocean-500 rounded-lg text-slate-700 dark:text-slate-300"
              >
                Mumbai → Chennai
              </button>
              <button
                onClick={() => { setOriginId('BOM'); setDestId('DXB'); }}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-ocean-500 rounded-lg text-slate-700 dark:text-slate-300"
              >
                Mumbai → Dubai
              </button>
              <button
                onClick={() => { setOriginId('MAA'); setDestId('IXZ'); }}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-ocean-500 rounded-lg text-slate-700 dark:text-slate-300"
              >
                Chennai → Port Blair
              </button>
              <button
                onClick={() => { setOriginId('COK'); setDestId('SIN'); }}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-ocean-500 rounded-lg text-slate-700 dark:text-slate-300"
              >
                Kochi → Singapore
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT MAIN PANEL (8 Cols) ───────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. Interactive Route Visualizer Map */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
            
            {/* Map Top Bar */}
            <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-ocean-400" />
                <span className="font-bold">Indian Ocean Maritime Route Visualizer</span>
                {routeResult && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {routeResult.route_id}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDirectRoute(!showDirectRoute)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                    showDirectRoute ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Direct GC Route
                </button>
                <button
                  onClick={() => setShowWavesOverlay(!showWavesOverlay)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                    showWavesOverlay ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  Waves Grid
                </button>
                <button
                  onClick={() => setShowReliabilityOverlay(!showReliabilityOverlay)}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                    showReliabilityOverlay ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  INCOIS Heatmap
                </button>
              </div>
            </div>

            {/* SVG Visual Canvas */}
            <div className="h-[380px] w-full relative bg-slate-950 flex items-center justify-center overflow-hidden select-none">
              
              {/* Synthetic grid background */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

              {/* Professional Interactive Leaflet Map */}
              <RouteMap
                routeResult={routeResult}
                mapOrigin={mapOrigin}
                mapDest={mapDest}
                simStep={simStep}
                showDirectRoute={showDirectRoute}
                selectedWaypoint={selectedWaypoint}
                setSelectedWaypoint={setSelectedWaypoint}
              />
            </div>

            {/* Simulated Voyage Controls Bar */}
            <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPauseSim}
                  className="p-2 rounded-lg bg-ocean-600 hover:bg-ocean-500 text-white font-bold transition-all flex items-center gap-1.5 shadow-md"
                >
                  {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isSimulating ? 'Pause Voyage' : 'Simulate Voyage'}</span>
                </button>

                <button
                  onClick={handleResetSim}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                  title="Reset Voyage Simulation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Speed Toggle */}
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-[10px] font-bold">
                  {[1, 2, 4].map((spd) => (
                    <button
                      key={`spd-${spd}`}
                      onClick={() => setSimSpeed(spd)}
                      className={`px-2 py-0.5 rounded ${simSpeed === spd ? 'bg-ocean-600 text-white' : 'text-slate-400'}`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Waypoint Telemetry Indicator */}
              {selectedWaypoint && (
                <div className="hidden sm:flex items-center gap-3 text-slate-300 text-[11px]">
                  <span>Leg <strong className="text-white">{selectedWaypoint.step} / {routeResult?.waypoints.length ? routeResult.waypoints.length - 1 : 0}</strong></span>
                  <span>Pos: <strong className="text-sky-400">{selectedWaypoint.latitude}°N, {selectedWaypoint.longitude}°E</strong></span>
                  <span>Wave: <strong className="text-emerald-400">{selectedWaypoint.wave_height_m}m</strong></span>
                  <span>SOG: <strong className="text-amber-400">{selectedWaypoint.expected_speed_knots} kts</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* 2. Key Voyage Metrics Cards */}
          {routeResult && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Distance</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{routeResult.total_distance_nm}</span>
                <span className="text-[10px] text-slate-500 font-medium block">Nautical Miles</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Transit Duration</span>
                <span className="text-lg font-black text-ocean-600">{routeResult.estimated_transit_hours}</span>
                <span className="text-[10px] text-slate-500 font-medium block">Hours ({(routeResult.estimated_transit_hours / 24).toFixed(1)} Days)</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Average SOG</span>
                <span className="text-lg font-black text-sky-600">{routeResult.average_speed_knots}</span>
                <span className="text-[10px] text-slate-500 font-medium block">Knots</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Fuel Burn</span>
                <span className="text-lg font-black text-amber-600">{routeResult.fuel_consumption_tons}</span>
                <span className="text-[10px] text-slate-500 font-medium block">Metric Tons</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">CO2 Footprint</span>
                <span className="text-lg font-black text-rose-600">{routeResult.co2_emissions_tons}</span>
                <span className="text-[10px] text-slate-500 font-medium block">Tons CO2</span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Risk Rating</span>
                <span className={`text-xs font-black px-2 py-1 rounded-full inline-block mt-1 ${
                  routeResult.overall_risk === 'High Risk' ? 'bg-rose-100 text-rose-700' : routeResult.overall_risk === 'Moderate Risk' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {routeResult.overall_risk}
                </span>
              </div>
            </div>
          )}

          {/* 3. Ocean Environment & Reliability Distance Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-ocean-600" />
                  Route Profile Analytics (Distance vs Sea State & INCOIS Score)
                </h3>
                <p className="text-xs text-slate-500">
                  Cross-section of forecast reliability score and wave height across nautical miles from departure.
                </p>
              </div>
              <span className="text-[10px] font-bold text-ocean-600 bg-ocean-50 dark:bg-ocean-950 px-2.5 py-1 rounded-full border border-ocean-200">
                HYCOM 1/12° Grid
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis yAxisId="left" domain={[50, 100]} stroke="#10b981" fontSize={10} unit="%" />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 6]} stroke="#38bdf8" fontSize={10} unit="m" />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="reliability" name="INCOIS Reliability Score (%)" fill="#10b981" fillOpacity={0.15} stroke="#10b981" strokeWidth={2.5} />
                  <Line yAxisId="right" type="monotone" dataKey="waveHeight" name="Wave Height (m)" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Step-by-Step Voyage Leg Manifest Table */}
          {routeResult && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-ocean-600" />
                    Voyage Navigation Waypoint Manifest
                  </h3>
                  <p className="text-xs text-slate-500">
                    Step-by-step leg breakdown with heading bearings, SOG expectations, and pilot advisories.
                  </p>
                </div>

                {/* Export Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={routeResult.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:scale-102"
                    title="Open exact passage waypoints directly in Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
                    <span>Open in Google Maps</span>
                  </a>

                  <a
                    href={routeResult.google_earth_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:scale-102"
                    title="Launch 3D Marine Passage in Google Earth Web"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Google Earth 3D</span>
                  </a>

                  <button
                    onClick={handleExportKML}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Download Google Earth KML Waypoints File"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Export KML</span>
                  </button>

                  <button
                    onClick={handleExportPDF}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Export Printable PDF Voyage Report"
                  >
                    <Download className="w-3.5 h-3.5 text-ocean-600" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={handleExportGPX}
                    className="px-3 py-1.5 rounded-xl bg-ocean-50 dark:bg-ocean-950 hover:bg-ocean-100 border border-ocean-200 text-ocean-700 dark:text-ocean-300 text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Download GPX File for Ship ECDIS System"
                  >
                    <Navigation className="w-3.5 h-3.5 text-ocean-500" />
                    <span>GPX ECDIS</span>
                  </button>

                  <button
                    onClick={handleExportJSON}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Export JSON Manifest"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-3 py-2.5">Step</th>
                      <th className="px-3 py-2.5">Waypoint / Position</th>
                      <th className="px-3 py-2.5">Dist</th>
                      <th className="px-3 py-2.5">Bearing</th>
                      <th className="px-3 py-2.5">SOG</th>
                      <th className="px-3 py-2.5">Wave</th>
                      <th className="px-3 py-2.5">Reliability</th>
                      <th className="px-3 py-2.5">Status / Advisory</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {routeResult.waypoints.map((wpt) => {
                      const isSelected = selectedWaypoint?.step === wpt.step;
                      return (
                        <tr
                          key={`wpt-tr-${wpt.step}`}
                          onClick={() => setSelectedWaypoint(wpt)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-ocean-50 dark:bg-ocean-950/60 font-semibold text-slate-900 dark:text-white'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="px-3 py-2">
                            <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold ${
                              isSelected ? 'bg-ocean-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}>
                              {wpt.step}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-bold">{wpt.name}</div>
                            <div className="text-[10px] text-slate-400">{wpt.latitude}°N, {wpt.longitude}°E</div>
                          </td>
                          <td className="px-3 py-2 font-mono">{wpt.distance_from_start_nm} NM</td>
                          <td className="px-3 py-2 font-mono">{wpt.heading_deg}°</td>
                          <td className="px-3 py-2 font-bold text-sky-600">{wpt.expected_speed_knots} kts</td>
                          <td className="px-3 py-2 font-mono text-emerald-600">{wpt.wave_height_m} m</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              wpt.reliability_score >= 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {wpt.reliability_score}%
                            </span>
                          </td>
                          <td className="px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400 max-w-xs truncate">
                            {wpt.advisory}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
