
import React from 'react';
import { Play, Pause, RotateCcw, Eye, Search, Package2 } from 'lucide-react';

interface MissionControlProps {
  currentPhase: 'surveillance' | 'search' | 'relief';
  onPhaseChange: (phase: 'surveillance' | 'search' | 'relief') => void;
  droneCount: number;
  activeDrones: number;
}

export const MissionControl: React.FC<MissionControlProps> = ({
  currentPhase,
  onPhaseChange,
  droneCount,
  activeDrones,
}) => {
  const phases = [
    {
      id: 'surveillance' as const,
      name: 'Surveillance',
      icon: Eye,
      description: 'Damage assessment and mapping',
      color: 'from-red-500 to-red-600',
    },
    {
      id: 'search' as const,
      name: 'Search & Connectivity',
      icon: Search,
      description: 'Victim detection and network extension',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      id: 'relief' as const,
      name: 'Relief Delivery',
      icon: Package2,
      description: 'Aid distribution and supply drops',
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Mission Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-white">Mission Control</h3>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <span>{activeDrones}/{droneCount} Drones Active</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
            <Play className="w-4 h-4" />
            <span className="text-sm">Running</span>
          </button>
          <button className="flex items-center space-x-1 px-3 py-1 bg-slate-600 text-slate-300 rounded-lg hover:bg-slate-500 transition-colors">
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Reset</span>
          </button>
        </div>
      </div>

      {/* Phase Selection */}
      <div className="grid grid-cols-3 gap-3">
        {phases.map((phase) => {
          const IconComponent = phase.icon;
          const isActive = currentPhase === phase.id;
          
          return (
            <button
              key={phase.id}
              onClick={() => onPhaseChange(phase.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                isActive
                  ? 'border-white bg-gradient-to-r ' + phase.color + ' text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <IconComponent className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">{phase.name}</div>
                  <div className="text-xs opacity-80">{phase.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
