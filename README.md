# ALLSENDER ADS — AI Advertising Optimization Platform

**AllSender Ads** es una plataforma SaaS autónoma de grado de producción diseñada para gestionar, optimizar y escalar publicidad digital omnicanal (Meta Ads, Google Ads y TikTok Ads).

El sistema opera bajo una regla no negociable: **nunca permitir que un modelo de lenguaje (LLM) controle presupuestos o dinero directamente**.

---

## 🏛️ Principio Central y Pipeline de Ejecución

El sistema ejecuta de forma continua el siguiente ciclo cerrado:

```text
CREAR → PRESELECCIONAR → PROBAR → MEDIR → DECIDIR → PAUSAR → ESCALAR → GENERAR NUEVAS VARIANTES → APRENDER → REPETIR
```

### Arquitectura Obligatoria de 5 Capas

```text
┌──────────────┐     ┌───────────────────┐     ┌─────────────────┐     ┌──────────────┐     ┌──────────────────┐
│  LLM AGENTS  │ ──► │  DECISION ENGINE  │ ──► │   RISK ENGINE   │ ──► │    ZERNIO    │ ──► │   ADS PLATFORMS  │
│   (Mastra)   │     │   (Matemático)    │     │  (Autoridad)    │     │  (Omni-Hub)  │     │ Meta/Google/TikTok│
└──────────────┘     └───────────────────┘     └─────────────────┘     └──────────────┘     └──────────────────┘
```

1. **LLM Agents (Mastra Brain)**: Proponen ideas, analizan creatividades, detectan patrones.
2. **Decision Engine**: Evalúa matemáticamente la rentabilidad y calcula la validez estadística de la muestra.
3. **Risk Engine (Soberano)**: Clampa y limita cualquier acción para respetar los techos presupuestarios y de seguridad.
4. **Zernio Hub (`AdsProvider`)**: Ejecuta las órdenes en las APIs publicitarias.
5. **Ads Platforms**: Despliegue en Meta, Google Ads y TikTok Ads.

---

## 🚀 Características Principales

- **Dashboard Ejecutivo Omnicanal**: Inversión en tiempo real, ingresos atribuidos, beneficio neto, ROAS, CPA, CPC, CTR y ahorro financiero estimado por intervenciones de IA.
- **Motor Financiero Determinista**: Cada producto calcula automáticamente su Margen Bruto, Beneficio antes de Ads, CPA Máximo Rentable y ROAS Mínimo antes de permitir cualquier inversión publicitaria.
- **AI Ads Brain con Mastra**:
  - **Ads Analyst**: Diagnóstico de CTR, CPC, CPA, ROAS, frecuencia y fatiga.
  - **Strategist Agent**: Estrategia de audiencias, ángulos de venta y plataformas.
  - **Creative Agent**: Generación de 10 conceptos con hooks psicológicos y copys.
  - **Optimization Agent**: Recomendaciones operativas (PAUSE, REDUCE_BUDGET, INCREASE_BUDGET, etc.).
  - **Judge Agent**: Tribunal auditor de decisiones con alto impacto económico.
- **OpenRouter Gateway Dinámico**: Router configurable desde UI con soporte para DeepSeek (V3/R1), Claude (3.7 Sonnet/3.5 Haiku), Gemini, OpenAI (GPT-4o), Qwen y Kimi. Registro de tokens, costo y latencia.
- **Risk Engine Clamping**: Si un agente solicita agresivamente un incremento de presupuesto de +80%, el Risk Engine lo clampa automáticamente al límite seguro diario de +20%.
- **Testing Dinámico 10 → 5 → 3 → Ganador**: Asignación disciplinada de capital: 80-90% a anuncios ganadores y 10-20% a experimentación constante.
- **Detección Automática de Fatiga**: Detecta subida de frecuencia (>2.8x), caída de CTR y deterioro de CPA para crear variantes frescas antes de que muera el ganador.
- **Zernio Provider Abstraction (`AdsProvider`)**: Servicios desacoplados para cuentas, campañas, anuncios, creatividades, audiencias y presupuestos.
- **Actividad de AllSender AI (Audit Log)**: Registro inmutable con métricas antes, razonamiento, acción solicitada, acción aprobada y acción ejecutada.
- **Ask AllSender**: Asistente estratégico ejecutivo que responde consultas de negocio usando datos financieros reales.
- **Suite de Pruebas Integrada**: Suite de tests ejecutables directamente en la interfaz para verificar las invariantes matemáticas del sistema.

---

## 💻 Puesta en Marcha en Localhost

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:3000
```

---

## 📚 Documentación Técnica

- [Arquitectura de Sistemas](docs/ARCHITECTURE.md)
- [Agentes de IA y Framework Mastra](docs/AI-AGENTS.md)
- [Motor Matemático de Decisiones](docs/DECISION-ENGINE.md)
- [Risk Engine y Guardrails Financieros](docs/RISK-ENGINE.md)
- [Módulo de Integración con Zernio](docs/ZERNIO.md)
- [OpenRouter Gateway & Model Routing](docs/OPENROUTER.md)
- [Modelado de Datos & Base de Datos](docs/DATABASE.md)
- [Roadmap de Producto](docs/ROADMAP.md)
