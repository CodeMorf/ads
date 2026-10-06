import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AIActionLog } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Cpu
} from 'lucide-react';

export const AuditLogTab: React.FC = () => {
  const { actionLogs, approveAction, rejectAction, userRole } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = actionLogs.filter((log) => {
    const matchesSearch = 
      log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reasoning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.executedAction.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Actividad de AllSender AI (Audit Log)</h1>
          <p className="text-sm text-slate-400 mt-1">
            Registro de gobernanza inmutable. Cada decisión del LLM, evaluación matemática y clamping del Risk Engine queda documentada con sus métricas antes y después.
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Supervisión Auditada · Rol: <strong>{userRole}</strong></span>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por producto, campaña o acción..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-indigo-500"
            aria-label="Filtrar por estado"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="EXECUTED">Ejecutados Automáticamente</option>
            <option value="PENDING_APPROVAL">Pendientes de Aprobación</option>
            <option value="USER_APPROVED">Aprobados por Usuario</option>
            <option value="USER_REJECTED">Rechazados por Usuario</option>
          </select>
        </div>
      </div>

      {/* Lista Principal de Registros de Auditoría */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-xs">
            No se encontraron eventos de auditoría con los filtros seleccionados.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const isPending = log.status === 'PENDING_APPROVAL';

            return (
              <div
                key={log.id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 transition-all text-xs space-y-3"
              >
                {/* Fila Principal */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-slate-400 font-mono text-[11px]">{log.timestamp}</span>
                      <span className="text-slate-500">·</span>
                      <strong className="text-white text-sm">{log.productName}</strong>
                      <span className="text-slate-500">·</span>
                      <span className="text-indigo-400 font-medium">{log.campaignName}</span>
                    </div>

                    <div className="text-slate-200 text-sm font-semibold mt-1">
                      {log.executedAction}
                    </div>
                  </div>

                  {/* Estado y Badges */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold ${
                        log.status === 'EXECUTED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : log.status === 'PENDING_APPROVAL'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                          : log.status === 'USER_APPROVED'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {log.status === 'EXECUTED' && 'Ejecutado por IA'}
                      {log.status === 'PENDING_APPROVAL' && 'Aprobación Pendiente'}
                      {log.status === 'USER_APPROVED' && 'Aprobado Manual'}
                      {log.status === 'USER_REJECTED' && 'Rechazado Manual'}
                    </span>

                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
                    >
                      {isExpanded ? 'Ocultar Detalle' : 'Ver Detalle'}
                    </button>
                  </div>
                </div>

                {/* Resumen del Razonamiento Comercial */}
                <div className="p-3 bg-slate-950 rounded-lg text-slate-300 leading-relaxed text-xs">
                  <strong>Razonamiento del Agente:</strong> {log.reasoning}
                </div>

                {/* Acciones para Pendientes de Aprobación */}
                {isPending && (
                  <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg flex flex-wrap items-center justify-between gap-3">
                    <div className="text-amber-300 text-xs">
                      Esta acción requiere autorización porque supera el umbral de modo {userRole}.
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => approveAction(log.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded text-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprobar y Ejecutar</span>
                      </button>
                      <button
                        onClick={() => rejectAction(log.id)}
                        className="px-3 py-1 bg-slate-800 hover:bg-red-900 text-red-200 font-medium rounded text-xs flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Detalle Técnico Expandible */}
                {isExpanded && (
                  <div className="pt-3 border-t border-slate-800 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Métricas Previas */}
                      <div className="p-3 bg-slate-950 rounded-lg space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block">Métricas Antes:</span>
                        <div className="text-slate-300">CPA: <strong>${log.metricsBefore.cpa}</strong></div>
                        <div className="text-slate-300">ROAS: <strong>{log.metricsBefore.roas}x</strong></div>
                        <div className="text-slate-300">Ventas: <strong>{log.metricsBefore.conversions}</strong></div>
                      </div>

                      {/* Decisión IA vs Risk Engine */}
                      <div className="p-3 bg-slate-950 rounded-lg space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block">Solicitud vs Aprobación:</span>
                        <div className="text-slate-300">
                          IA pidió: <strong className="text-amber-400">{log.requestedAction.type} ({log.requestedAction.delta})</strong>
                        </div>
                        <div className="text-slate-300">
                          Risk Engine aprobó: <strong className="text-emerald-400">{log.approvedAction.type} ({log.approvedAction.delta})</strong>
                        </div>
                        {log.approvedAction.riskClamped && (
                          <div className="text-[11px] text-amber-400 font-medium pt-1">
                            ⚠️ {log.approvedAction.clampingReason}
                          </div>
                        )}
                      </div>

                      {/* Información del Modelo */}
                      <div className="p-3 bg-slate-950 rounded-lg space-y-1">
                        <span className="text-[11px] text-slate-400 font-semibold block">Metadatos de IA:</span>
                        <div className="text-slate-300">Agente: <strong>{log.aiAgent}</strong></div>
                        <div className="text-slate-300">Modelo: <strong className="font-mono text-indigo-400">{log.aiModel}</strong></div>
                        <div className="text-slate-400 text-[11px]">Cuenta: {log.accountId}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
