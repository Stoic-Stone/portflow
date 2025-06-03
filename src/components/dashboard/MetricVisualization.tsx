import React, { useState, useEffect } from 'react';
import { fetchLiveWeather } from '../../lib/api';
import CircularProgress from '../ui/CircularProgress';

const MIN_TEMP = 15;
const MAX_TEMP = 35;

const MetricVisualization = () => {
  const [current, setCurrent] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLiveWeather()
      .then((data) => {
        console.log('Réponse météo:', data);
        const temp = data?.temperature ?? null;
        if (temp === null) {
          setCurrent(null);
        } else {
          setCurrent(Math.round(temp));
        }
      })
      .catch((err) => {
        console.error('Erreur météo:', err);
        setCurrent(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (current === null) return <div>Aucune donnée météo.</div>;

  const percentage = ((current - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)) * 100;

  return (
    <div className="bg-white rounded-2xl shadow flex flex-col items-center p-4 w-[200px] mx-auto">
      <div className="flex gap-2 mb-3">
        <button className="px-3 py-0.5 rounded-full bg-[#0A2259] text-white text-sm font-semibold">Température</button>
      </div>
      <div className="relative w-32 h-32 flex items-center justify-center">
        <CircularProgress percentage={percentage} color="#3B82F6" size={128} strokeWidth={12} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-[#0A2259]">{current}°C</span>
        </div>
      </div>
    </div>
  );
};

export default MetricVisualization;