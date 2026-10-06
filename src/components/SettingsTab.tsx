import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OpenRouterGateway, OPENROUTER_CATALOG } from '../integrations/openrouter';
import { ModelProfileType, UserRole } from '../types';
import { 
  Settings, 
  Cpu, 
  Key, 
  ShieldCheck, 
  Users, 
  DollarSign, 
  Zap, 
  CheckCircle2, 
  History,
  Lock
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { userRole, setUserRole, zernioProvider, isZernioLive, toggleZernioEnvironment } = useApp();
  const [openRouterSettings, setOpenRouterSettings] = useState(() => OpenRouterGateway.getSettings());
  const [savedNotification, setSavedNotification] = useState(false);

  const modelProfiles: { id: ModelProfileType; label: string; desc: string }[] = [
    { id: 'FAST_MODEL', label: 'Fast Model (Micro-operaciones)', desc: 'Para chequeos rápidos y tareas operativas de baja latencia.' },
    { id: 'ANALYSIS_MODEL', label: 'Analysis Model (Analista de Métricas)', desc: 'Para análisis de tendencias de CPA, ROAS y saturación.' },
    { id: 'STRATEGY_MODEL', label: 'Strategy Model (Estratega Jefe)', desc: 'Para selección de audiencias, plataformas y asignación de capital.' },
    { id: 'CREATIVE_MODEL', label: 'Creative Model (Agente Creativo)', desc: 'Para generación de hooks, copys, titulares persuasivos y prompts.' },
    { id: 'JUDGE_MODEL', label: 'Judge Model (Tribunal de Riesgo)', desc: 'Para auditoría y veto de decisiones con alto impacto económico.' },
    { id: 'FALLBACK_MODEL', label: 'Fallback Model (Respaldo Seguro)', desc: 'Respaldo inmediato si el modelo primario experimenta latencia o caída.' },
  ];

  const handleModelChange = (profile: ModelProfileType, modelId: string) => {
    OpenRouterGateway.updateModelMapping(profile, modelId);
    setOpenRouterSettings(OpenRouterGateway.getSettings());
    showSaved();
  };

  const handleApiKeyChange = (key: string) => {
    OpenRouterGateway.updateSettings({ apiKey: key });
    setOpenRouterSettings(OpenRouterGateway.getSettings());
    showSaved();
  };

  const handleToggleMock = () => {
    OpenRouterGateway.updateSettings({ isMockMode: !openRouterSettings.isMockMode });
    setOpenRouterSettings(OpenRouterGateway.getSettings());
    showSaved();
  };

  const showSaved = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2000);
  };

  const callHistory = OpenRouterGateway.getHistory();

  return (
    <div className="space-y-8 pb-12">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" />
            <span>OpenRouter Gateway & Ajustes de Integración</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configuración dinámica de modelos por agente. Sin modelos fijados en código rígido. Mapea DeepSeek, Claude, Gemini, OpenAI, Qwen o Kimi en caliente.
          </p>
        </div>

        {savedNotification && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1.5 rounded-lg animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Configuración guardada</span>
          </div>
        )}
      </div>

      {/* BLOQUE 1: OPENROUTER CONFIG & API KEY */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Credenciales del Gateway OpenRouter</h2>
          </div>
          <button
            onClick={handleToggleMock}
            className={`px-3 py-1 rounded text-xs font-semibold border transition-colors ${
              openRouterSettings.isMockMode
                ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
            }`}
          >
            Modo: {openRouterSettings.isMockMode ? 'SIMULADO / FALLBACK SEGURO' : 'LIVE API OPENROUTER'}
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">OpenRouter API Key (sk-or-v1-...)</label>
            <input
              type="password"
              value={openRouterSettings.apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="Pega tu clave sk-or-v1-... (Opcional, incluye fallback inteligente determinista)"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Las claves se manejan estrictamente con proxy seguro. En modo simulado, los agentes ejecutan respuestas deterministas de alta fidelidad sin coste de API.
            </p>
          </div>

          {/* Telemetría y Consumo Acumulado */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Llamadas Totales</span>
              <strong className="text-white text-base">{openRouterSettings.usageLog.totalCalls}</strong>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Tokens de Entrada</span>
              <strong className="text-white text-base">{openRouterSettings.usageLog.totalPromptTokens.toLocaleString()}</strong>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Tokens de Salida</span>
              <strong className="text-white text-base">{openRouterSettings.usageLog.totalCompletionTokens.toLocaleString()}</strong>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px] block">Costo Estimado</span>
              <strong className="text-emerald-400 text-base">${openRouterSettings.usageLog.totalCostUsd.toFixed(4)} USD</strong>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: ASIGNACIÓN DE MODELOS POR PERFIL (Sección 4) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-5">
          <Cpu className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-base font-bold text-white">Perfiles de Modelos por Agente (Configuración Super Admin)</h2>
            <p className="text-xs text-slate-400">
              Configura qué modelo de OpenRouter atiende a cada agente para optimizar costo y precisión.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {modelProfiles.map((p) => {
            const currentSelected = openRouterSettings.selectedModels[p.id];

            return (
              <div
                key={p.id}
                className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white text-sm">{p.label}</div>
                  <div className="text-slate-400 text-xs">{p.desc}</div>
                </div>

                <div className="w-full sm:w-72 shrink-0">
                  <select
                    value={currentSelected}
                    onChange={(e) => handleModelChange(p.id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                    aria-label={p.label}
                  >
                    {OPENROUTER_CATALOG.map((m) => (
                      <option key={m.id} value={m.modelId}>
                        [{m.provider}] {m.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BLOQUE 3: CONEXIÓN ZERNIO ADS HUB (Sección 9) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Zernio Omni-Ads Gateway</h2>
          </div>
          <span className="text-xs text-slate-400">Abstracción AdsProvider</span>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <strong className="text-white text-sm block">Entorno Zernio Actual</strong>
              <span className="text-slate-400 text-xs">
                {isZernioLive
                  ? 'Conectado a la API oficial de Zernio (Meta, Google, TikTok).'
                  : 'Modo Sandbox Activo: Simulación determinista segura sin consumo publicitario real.'}
              </span>
            </div>

            <button
              onClick={toggleZernioEnvironment}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs shrink-0"
            >
              Cambiar a {isZernioLive ? 'Modo Sandbox' : 'Modo Producción'}
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Arquitectura desacoplada: AllSender Ads interactúa únicamente con la interfaz <code className="text-indigo-300 font-mono">AdsProvider</code>, permitiendo conectar posteriormente <code className="text-slate-300 font-mono">MetaDirectProvider</code>, <code className="text-slate-300 font-mono">GoogleDirectProvider</code> o <code className="text-slate-300 font-mono">TikTokDirectProvider</code> sin tocar la lógica de negocio.
          </div>
        </div>
      </div>

      {/* BLOQUE 4: GESTIÓN DE ROLES Y CONTROL DE ACCESO (Sección 15) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800 mb-5">
          <Users className="w-5 h-5 text-indigo-400" />
          <div>
            <h2 className="text-base font-bold text-white">Control de Acceso Basado en Roles (RBAC)</h2>
            <p className="text-xs text-slate-400">
              Restricciones estrictas según el nivel de autorización del operador.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { role: 'SUPER_ADMIN' as const, desc: 'Control total de OpenRouter, Risk Engine, APIs y fondos.' },
            { role: 'OWNER' as const, desc: 'Titular de la cuenta. Puede aprobar acciones de escala y modificar límites.' },
            { role: 'ADMIN' as const, desc: 'Gestor operativo. Aprueba acciones y lanza campañas.' },
            { role: 'MARKETER' as const, desc: 'Lanza campañas, genera creatividades y prueba variantes.' },
            { role: 'ANALYST' as const, desc: 'Visualiza dashboards, métricas de CPA/ROAS y registros de auditoría.' },
            { role: 'VIEWER' as const, desc: 'Acceso solo lectura sin permisos de ejecución.' },
          ].map(r => (
            <div
              key={r.role}
              onClick={() => setUserRole(r.role)}
              className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                userRole === r.role
                  ? 'bg-indigo-950/40 border-indigo-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <strong className="font-bold text-white">{r.role}</strong>
                {userRole === r.role && <span className="text-emerald-400 font-bold text-[10px]">ACTIVO</span>}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
