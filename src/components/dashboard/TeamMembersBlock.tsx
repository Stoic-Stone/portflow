import React, { useEffect, useState } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';
import { fetchActiveTeam } from '../../lib/api';

const TeamMembersBlock = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; member: any | null; action: 'chat' | 'call' | null }>({ open: false, member: null, action: null });

  useEffect(() => {
    fetchActiveTeam()
      .then(setTeamMembers)
      .finally(() => setLoading(false));
  }, []);

  // Fonction utilitaire pour traduire les rôles en français
  const translateRole = (role: string) => {
    switch (role) {
      case 'crane_operator': return 'Grutier';
      case 'logistics_agent': return 'Agent logistique';
      case 'customs_agent': return 'Agent de douane';
      case 'supervisor': return 'Superviseur';
      case 'security': return 'Sécurité';
      case 'admin': return 'Administrateur';
      default: return role;
    }
  };

  // Simple Modal component
  const Modal = ({ open, onClose, children }: any) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px] relative">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"><X size={20} /></button>
          {children}
        </div>
      </div>
    );
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Équipe Active</h2>
        <div>
          <span className="text-sm text-gray-500">{teamMembers.length} membres en service</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-grisClair">
              <th className="text-left pb-3 font-medium text-gray-500">Membre</th>
              <th className="text-left pb-3 font-medium text-gray-500 hidden md:table-cell">Rôle</th>
              <th className="text-left pb-3 font-medium text-gray-500 hidden md:table-cell">Zone</th>
              <th className="text-left pb-3 font-medium text-gray-500">Statut</th>
              <th className="text-right pb-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map((member: any) => (
              <tr key={member.id} className="border-b border-grisClair last:border-0 hover:bg-gray-50">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium bg-blueMarine">
                      {member.full_name ? member.full_name.split(' ').map((n: string) => n[0]).join('') : '?'}
                    </div>
                    <span className="font-medium">{member.full_name || '-'}</span>
                  </div>
                </td>
                <td className="py-3 hidden md:table-cell">{translateRole(member.role) || '-'}</td>
                <td className="py-3 hidden md:table-cell">{member.zone_name || '-'}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${member.status === 'online' ? 'bg-green-500' : member.status === 'busy' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                    <span className="capitalize">{member.status}</span>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      className="p-1.5 rounded-full hover:bg-grisClair transition-colors"
                      onClick={() => setModal({ open: true, member, action: 'chat' })}
                      aria-label={`Chat with ${member.full_name}`}
                    >
                      <MessageCircle size={18} />
                    </button>
                    <button
                      className="p-1.5 rounded-full hover:bg-grisClair transition-colors"
                      onClick={() => setModal({ open: true, member, action: 'call' })}
                      aria-label={`Call ${member.full_name}`}
                    >
                      <Phone size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Chat/Call Modal */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, member: null, action: null })}>
        {modal.member && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-blueMarine text-xl">
              {modal.member.full_name ? modal.member.full_name.split(' ').map((n: string) => n[0]).join('') : '?'}
            </div>
            <div className="text-lg font-semibold">{modal.member.full_name}</div>
            <div className="text-gray-500 mb-2">{modal.action === 'chat' ? 'Démarrer une conversation' : 'Démarrer un appel'}</div>
            <button
              className="bg-blueMarine text-white px-4 py-2 rounded shadow hover:bg-blue-900 transition"
              onClick={() => setModal({ open: false, member: null, action: null })}
            >
              {modal.action === 'chat' ? 'Envoyer un message' : 'Appeler'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeamMembersBlock;