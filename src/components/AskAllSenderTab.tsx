import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Bot, 
  User,
  Lightbulb
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  dataCard?: any;
}

export const AskAllSenderTab: React.FC = () => {
  const { askAllSender, totalSpendToday, totalNetProfitToday, overallROAS, overallCPA } = useApp();
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `Hola. Soy el asistente estratégico de AllSender Ads. Tengo acceso completo en tiempo real a tus márgenes financieros, las métricas de Zernio (Meta, Google, TikTok) y los registros de seguridad del Risk Engine. ¿En qué puedo asistirte hoy?`,
      timestamp: 'Ahora',
    },
  ]);

  const quickPrompts = [
    '¿Cómo están mis campañas?',
    '¿Dónde estoy perdiendo dinero?',
    'Quiero vender 50 unidades esta semana.',
    '¿Qué anuncio debería escalar?',
    'Crea otra publicidad basada en mi ganador.',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Ahora',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const result = await askAllSender(query);
      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: result.answer,
        timestamp: 'Ahora',
        dataCard: result.relatedData,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ast_${Date.now()}`,
          sender: 'assistant',
          text: `Error al procesar consulta: ${err.message}`,
          timestamp: 'Ahora',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-400" />
          <span>Ask AllSender (Asistente Ejecutivo)</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Consulta tu rendimiento en lenguaje natural. Respuestas generadas a partir de tus márgenes unitarios reales, datos de Zernio y parámetros del Risk Engine.
        </p>
      </div>

      {/* Prompts Rápidos Sugeridos */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>Consultas Frecuentes:</span>
        </span>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Ventana de Chat */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col h-[560px] overflow-hidden shadow-xl">
        {/* Historial de Mensajes */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-indigo-400 border border-slate-700'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] p-4 rounded-xl leading-relaxed whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'bg-slate-950 text-slate-200 border border-slate-800'
                }`}
              >
                {msg.text}

                {/* Si incluye tarjeta de datos adicionales */}
                {msg.dataCard && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    <strong className="text-slate-300 block">Datos Verificados en la Base de Datos:</strong>
                    <div className="bg-slate-900/90 p-2.5 rounded font-mono text-emerald-400">
                      {JSON.stringify(msg.dataCard, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>AllSender está consultando métricas y verificando con Risk Engine...</span>
            </div>
          )}
        </div>

        {/* Input de Mensaje */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Pregunta sobre rendimiento, escalado, fatiga o metas de ventas..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputQuery.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
