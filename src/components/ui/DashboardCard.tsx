import React from 'react';

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  percent: number;
  badge: { label: string; color: string };
  barColor?: string;
  simulation?: boolean;
  onToggleSimulation?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  title,
  value,
  percent,
  badge,
  barColor = '#F97316',
  simulation = false,
  onToggleSimulation,
}) => (
  <div className="bg-white rounded-2xl shadow p-4 flex-1 min-w-[260px] flex flex-col gap-2 relative">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-lg font-semibold text-[#0A2259]">{title}</span>
      </div>
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold`}
        style={{ background: badge.color + '22', color: badge.color }}
      >
        {badge.label}
      </span>
    </div>
    <div className="flex items-center justify-between mt-2">
      <span className="text-base text-gray-600">{value}</span>
      <span className="text-base font-bold text-[#0A2259]">{percent}%</span>
    </div>
    <div className="w-full h-2 bg-gray-200 rounded-full my-1">
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${percent}%`, background: barColor }}
      />
    </div>
  </div>
);

export default DashboardCard; 