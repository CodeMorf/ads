import React from 'react';
import { useApp } from '../context/AppContext';
import { AutonomousMode, UserRole } from '../types';
import { 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Lock, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { 
    userRole, 
    setUserRole, 
    autonomousMode, 
    setAutonomousMode, 
    runAutonomousCycle, 
    isOptimizing,
    isZernioLive,
    toggleZernioEnvironment,
    pendingApprovals
  } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Panorama' },
    { id: 'products', label: 'Productos & Márgenes' },
    { id: 'brain', label: 'AI Ads Brain' },
    { id: 'risk', label: 'Risk Engine' },
    { id: 'launcher', label: 'Nuevo Lanzamiento' },
    { id: 'testing', label: 'Testing & Fatiga' },
    { id: 'activity', label: 'Actividad de AI', badge: pendingApprovals.length > 0 ? pendingApprovals.length : undefined },
    { id: 'ask', label: 'Ask AllSender' },
    { id: 'tests', label: 'Verificación & Tests' },
    { id: 'settings', label: 'OpenRouter & Config' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950 text-slate-100 sticky top-0 z-50">
      {/* Barra superior con marca y controles de gobernanza */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-sm">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">AllSender Ads</span>
              <span className="text-xs text-slate-400 font-medium">Enterprise SaaS</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Autonomous Ad Optimization & Risk Governance
            </div>
          </div>
        </div>

        {/* Controles de Modo Autónomo & Gobernanza */}
        <div className="flex items-center gap-3">
          {/* Indicador de Risk Engine Activo */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Risk Guardrails: Activo (100%)</span>
          </div>

          {/* Switcher Zernio Sandbox / Live */}
          <button
            onClick={toggleZernioEnvironment}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
              isZernioLive
                ? 'bg-blue-950/80 border-blue-700 text-blue-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Alternar entre Zernio Live API y Zernio Sandbox Simulator"
          >
            <span className={`w-2 h-2 rounded-full ${isZernioLive ? 'bg-blue-400' : 'bg-amber-400'}`} />
            <span>Zernio: {isZernioLive ? 'PRODUCCIÓN' : 'SANDBOX DEMO'}</span>
          </button>

          {/* Selector de Modo Autónomo */}
          <div className="flex items-center bg-slate-900 rounded border border-slate-800 p-0.5 text-xs font-medium">
            <span className="px-2 text-slate-400 text-[11px]">Modo:</span>
            {(['MANUAL', 'ASSISTED', 'AUTONOMOUS'] as AutonomousMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setAutonomousMode(mode)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  autonomousMode === mode
                    ? mode === 'AUTONOMOUS'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-800 text-slate-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'MANUAL' && 'Manual'}
                {mode === 'ASSISTED' && 'Asistido'}
                {mode === 'AUTONOMOUS' && 'Autónomo'}
              </button>
            ))}
          </div>

          {/* Selector de Rol de Usuario (RBAC) */}
          <div className="flex items-center gap-1 text-xs">
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
              aria-label="Rol de Usuario"
            >
              <option value="SUPER_ADMIN">Rol: Super Admin</option>
              <option value="OWNER">Rol: Owner</option>
              <option value="ADMIN">Rol: Admin</option>
              <option value="MARKETER">Rol: Marketer</option>
              <option value="ANALYST">Rol: Analyst</option>
              <option value="VIEWER">Rol: Viewer</option>
            </select>
          </div>

          {/* Botón Acción Rápida: Ejecutar Ciclo Autónomo */}
          <button
            onClick={() => runAutonomousCycle()}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Optimizando...' : 'Optimizar Ahora'}</span>
          </button>
        </div>
      </div>

      {/* Barra de navegación de pestañas (Clean typography, zero-pill discipline) */}
      <nav className="px-6 flex items-center gap-6 overflow-x-auto no-scrollbar text-sm font-medium">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`py-3 relative text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? 'text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
