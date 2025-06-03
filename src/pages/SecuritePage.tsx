import React, { useEffect, useState } from 'react';
import { fetchActiveTeam } from '../lib/api';

interface SecurityMember {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  zone_name?: string;
  status: string;
}

const STATUS_LABELS: Record<string, string> = {
  online: 'En ligne',
  busy: 'Occupé',
  away: 'Absent',
};

const STATUS_COLORS: Record<string, string> = {
  online: 'bg-green-500',
  busy: 'bg-red-500',
  away: 'bg-yellow-500',
};

const SecuritePage = () => {
  const [loading, setLoading] = useState(true);
  const [securityTeam, setSecurityTeam] = useState<SecurityMember[]>([]);

  useEffect(() => {
    async function fetchTeam() {
      setLoading(true);
      try {
        const team = await fetchActiveTeam();
        // Filter only security members
        setSecurityTeam(Array.isArray(team) ? team.filter((m: SecurityMember) => m.role === 'security') : []);
      } finally {
        setLoading(false);
      }
    }
    fetchTeam();
  }, []);

  return (
    <div className="p-8 w-full min-h-screen bg-sableClair">
      <h1 className="text-4xl font-bold text-blueMarine mb-10">Sécurité du Port</h1>
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-5xl mx-auto mb-10">
        <h2 className="text-2xl font-bold text-blueMarine mb-6">Équipe de Sécurité</h2>
        <table className="w-full text-left">
          <thead>
            <tr className="text-blueMarine text-base font-semibold">
              <th className="py-2 px-4">Membre</th>
              <th className="py-2 px-4">Zone</th>
              <th className="py-2 px-4">Statut</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="text-center py-8">Chargement...</td></tr>
            ) : securityTeam.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-8">Aucun membre de sécurité trouvé.</td></tr>
            ) : (
              securityTeam.map((member) => (
                <tr key={member.id} className="border-t last:border-b">
                  <td className="py-2 px-4 font-medium flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium bg-blueMarine">
                      {member.full_name ? member.full_name.split(' ').map((n: string) => n[0]).join('') : '?'}
                    </div>
                    <span>{member.full_name}</span>
                  </td>
                  <td className="py-2 px-4">{member.zone_name || '-'}</td>
                  <td className="py-2 px-4">
                    <span className={`inline-flex items-center gap-2`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[member.status] || 'bg-gray-400'}`}></span>
                      <span>{STATUS_LABELS[member.status] || member.status}</span>
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-blueMarine mb-6">Événements &amp; Logs de Sécurité</h2>
        <div className="text-gray-400 text-center py-12">[Module d'événements de sécurité à venir]</div>
      </div>
    </div>
  );
};

export default SecuritePage; 