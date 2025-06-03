import React, { useEffect, useState } from 'react';
import { CloudSun, Clock } from 'lucide-react';
import { fetchLiveWeather, fetchPortStatus } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const WelcomeBlock = () => {
  const { user } = useAuth();
  const [temperature, setTemperature] = useState<number | null>(null);
  const [weatherDesc, setWeatherDesc] = useState('');
  const [trafficLevel, setTrafficLevel] = useState('');
  const [marineConditions, setMarineConditions] = useState('');
  const [nextHighTide, setNextHighTide] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchLiveWeather(),
      fetchPortStatus()
    ]).then(([weather, portStatusArr]) => {
      setTemperature(weather.temperature || null);
      setWeatherDesc(weather.weather || '');
      setMarineConditions(weather.weather || '');
      if (portStatusArr && portStatusArr[0]) {
        setTrafficLevel(portStatusArr[0].traffic_level || '');
        // Format next_high_tide as HH:mm
        const tide = portStatusArr[0].next_high_tide;
        if (tide) {
          const date = new Date(tide);
          setNextHighTide(date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
        } else {
          setNextHighTide('');
        }
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;
  
  const userName = user?.first_name || 'Utilisateur';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blueMarine to-blueMarine/90 text-blancCasse rounded-2xl p-8">
      {/* Background SVG Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="opacity-10">
          <path fill="#FFFFFF" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,202.7C384,192,480,160,576,170.7C672,181,768,235,864,234.7C960,235,1056,181,1152,170.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      {/* Terminal Silhouette */}
      <div className="absolute top-0 right-0 opacity-10">
        <svg width="250" height="200" viewBox="0 0 250 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20,180 L50,100 L60,100 L80,180 Z" fill="white" />
          <path d="M100,180 L100,80 L120,80 L120,180 Z" fill="white" />
          <path d="M140,180 L140,50 L160,50 L160,180 Z" fill="white" />
          <path d="M180,180 L180,70 L200,70 L200,180 Z" fill="white" />
          <path d="M220,180 L220,90 L240,90 L240,180 Z" fill="white" />
          <path d="M10,180 L250,180 L250,190 L10,190 Z" fill="white" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-1">Bonjour {userName} 👋</h1>
        <p className="text-blancCasse/80 mb-6">
          Bienvenue à PortFlow – Voici un résumé de la situation actuelle du terminal.
        </p>
        
        {/* Port Conditions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <CloudSun size={18} />
              <span className="text-sm font-medium">Température</span>
            </div>
            <p className="font-numeric text-lg font-medium">{temperature !== null ? `${temperature}°C` : 'N/A'}</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 18L20 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M4 12L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M4 6L20 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="text-sm font-medium">Trafic</span>
            </div>
            <p className="font-numeric text-lg font-medium">{trafficLevel}</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={18} />
              <span className="text-sm font-medium">Prochaine marée haute</span>
            </div>
            <p className="font-numeric text-lg font-medium">{nextHighTide}</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <CloudSun size={18} />
              <span className="text-sm font-medium">Conditions marines</span>
            </div>
            <p className="font-numeric text-lg font-medium">{weatherDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBlock;