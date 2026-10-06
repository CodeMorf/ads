import React, { useState, useEffect } from 'react';
import { AllSenderTestSuite } from '../core/__tests__/test-suite';
import { VerificationTestResult } from '../types';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Play, 
  RotateCcw, 
  Clock, 
  Layers,
  Terminal,
  Cpu
} from 'lucide-react';

export const VerificationTestsTab: React.FC = () => {
  const [testResults, setTestResults] = useState<VerificationTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = AllSenderTestSuite.runAllTests();
      setTestResults(results);
      setIsRunning(false);
    }, 250);
  };

  useEffect(() => {
    executeTests();
  }, []);

  const passedCount = testResults.filter(t => t.status === 'PASSED').length;
  const totalCount = testResults.length;
  const isAllPassed = totalCount > 0 && passedCount === totalCount;

  return (
    <div className="space-y-8 pb-12">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Suite de Verificación & Invariantes de Seguridad</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Validación de integridad del sistema: prueba que las matemáticas financieras, el Decision Engine y el Risk Engine impidan categóricamente que cualquier IA viole los límites presupuestarios.
          </p>
        </div>

        <button
          onClick={executeTests}
          disabled={isRunning}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Ejecutando Pruebas...' : 'Ejecutar Suite de Pruebas'}</span>
        </button>
      </div>

      {/* Banner de Estado Global */}
      <div className={`p-5 rounded-xl border flex items-center justify-between ${
        isAllPassed 
          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
          : 'bg-amber-950/40 border-amber-800 text-amber-300'
      }`}>
        <div className="flex items-center gap-3">
          {isAllPassed ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-8 h-8 text-amber-400 shrink-0" />
          )}
          <div>
            <div className="text-base font-bold text-white">
              {isAllPassed 
                ? 'Todas las Pruebas de Seguridad Pasaron con Éxito (100%)' 
                : 'Verificación en Progreso o con Advertencias'}
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              {passedCount} de {totalCount} pruebas aprobadas. Ningún agente autónomo puede sobrepasar las restricciones financieras.
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <div className="text-xs opacity-80">Estado de Blindaje</div>
          <div className="text-sm font-bold text-white">INVARIANTE PROTEGIDA</div>
        </div>
      </div>

      {/* Tarjetas de Cada Test Unitario */}
      <div className="space-y-4">
        {testResults.map((test) => {
          const isPassed = test.status === 'PASSED';

          return (
            <div
              key={test.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 text-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-[11px]">{test.id}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-indigo-400 font-semibold">{test.category}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400 font-mono text-[11px]">{test.durationMs}ms</span>
                  </div>
                  <h2 className="text-sm font-bold text-white">{test.title}</h2>
                </div>

                <span
                  className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 ${
                    isPassed
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-red-950 text-red-300 border border-red-800'
                  }`}
                >
                  {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>{isPassed ? 'PASSED' : 'FAILED'}</span>
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg text-slate-300 leading-relaxed font-sans">
                {test.message}
              </div>

              {test.details && (
                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg">
                  <span className="text-[10px] text-slate-400 font-mono block mb-1">
                    Detalles de la Aserción Aritmética:
                  </span>
                  <pre className="text-[11px] font-mono text-emerald-400">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
