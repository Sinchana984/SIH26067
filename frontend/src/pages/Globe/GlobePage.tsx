import React, { useEffect, useState } from 'react';
import { OceanGlobe } from '../../components/globe/OceanGlobe';
import { getRegions, getReliability } from '../../services/api';
import { Region, ReliabilityScore } from '../../types';
import { Globe } from 'lucide-react';

export const GlobePage: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [reliability, setReliability] = useState<ReliabilityScore[]>([]);
  const [, setSelectedRegion] = useState<Region | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [regData, relData] = await Promise.all([
        getRegions(),
        getReliability(undefined, undefined, 50)
      ]);
      setRegions(regData);
      setReliability(relData);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-ocean-600 dark:text-ocean-400" />
            <span>Global Reliability 3D Earth Globe</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Full-screen interactive 3D spatial visualization of ocean forecast reliability score boundaries.</p>
        </div>
      </div>

      <OceanGlobe
        regions={regions}
        reliabilityScores={reliability}
        onSelectRegion={(reg) => setSelectedRegion(reg)}
        fullScreen={true}
      />
    </div>
  );
};
