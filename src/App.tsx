import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { ProductsTab } from './components/ProductsTab';
import { AIBrainTab } from './components/AIBrainTab';
import { RiskEngineTab } from './components/RiskEngineTab';
import { CampaignLauncherTab } from './components/CampaignLauncherTab';
import { DynamicTestingTab } from './components/DynamicTestingTab';
import { AuditLogTab } from './components/AuditLogTab';
import { AskAllSenderTab } from './components/AskAllSenderTab';
import { VerificationTestsTab } from './components/VerificationTestsTab';
import { SettingsTab } from './components/SettingsTab';
import { ShieldCheck, Cpu, Database, BookOpen } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Barra de Navegación & Control de Gobernanza */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'brain' && <AIBrainTab />}
        {activeTab === 'risk' && <RiskEngineTab />}
        {activeTab === 'launcher' && <CampaignLauncherTab />}
        {activeTab === 'testing' && <DynamicTestingTab />}
        {activeTab === 'activity' && <AuditLogTab />}
        {activeTab === 'ask' && <AskAllSenderTab />}
        {activeTab === 'tests' && <VerificationTestsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Footer Profesional */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-300">AllSender Ads Platform</span>
            <span className="text-slate-700">·</span>
            <span>Arquitectura: LLM → Decision Engine → Risk Engine → Zernio → Ads Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button 
              onClick={() => setActiveTab('tests')}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tests Verificados</span>
            </button>
            <span className="text-slate-800">·</span>
            <button 
              onClick={() => setActiveTab('settings')}
              className="hover:text-indigo-400 transition-colors flex items-center gap-1"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>OpenRouter Gateway</span>
            </button>
            <span className="text-slate-800">·</span>
            <span className="text-slate-400">Versión 1.0 Production-Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
