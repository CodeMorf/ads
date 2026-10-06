# Arquitectura del Sistema — AllSender Ads

## Visión General

AllSender Ads está diseñado con una arquitectura modular desacoplada en capas estables, garantizando la seguridad del capital y la total auditabilidad operativa.

```text
┌────────────────────────────────────────────────────────┐
│                   CAPA DE PRESENTACIÓN                  │
│   React 19 + TypeScript + Tailwind CSS (Zero-Pill UI)  │
│   Dashboard · Launcher · Risk Simulator · Ask Assistant │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                 CAPA DE ESTADO & SERVICIOS             │
│   AppContext · RBAC (SuperAdmin, Owner, Marketer...)   │
│   Modos: MANUAL / ASSISTED / AUTONOMOUS                │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                  CAPA DE INTELIGENCIA                  │
│   Mastra Multi-Agent Hub · OpenRouter Model Gateway     │
│   Analyst · Strategist · Creative · Optimizer · Judge  │
│   Mastra Long-Term Memory (Contexto, Fatiga, Éxitos)   │
└──────────────────────────┬─────────────────────────────┘
                           │ (Propone Acciones)
┌──────────────────────────▼─────────────────────────────┐
│                CAPA DE DECISIÓN DETERMINISTA           │
│   Decision Engine: Confianza Estadística (Sample Size) │
│   Financial Engine: CPA Máx Rentable, ROAS Mínimo      │
└──────────────────────────┬─────────────────────────────┘
                           │ (Valida Viabilidad)
┌──────────────────────────▼─────────────────────────────┐
│                 CAPA DE RIESGO SOBERANA                │
│   Risk Engine: Máxima Autoridad (Clamp +20% Max/24h)   │
│   Límites de Presupuesto · Protección de Stock        │
└──────────────────────────┬─────────────────────────────┘
                           │ (Acción Autorizada y Clampada)
┌──────────────────────────▼─────────────────────────────┐
│                CAPA DE PROVEEDORES ADS                 │
│   Abstracción AdsProvider                              │
│   ZernioProvider (Omni-Hub Meta, Google, TikTok)       │
│   [Futuros Direct Providers: Meta, Google, TikTok]     │
└────────────────────────────────────────────────────────┘
```

## Invariantes Críticas

1. **Invariante de Soberanía Financiera**: Ningún agente de inteligencia artificial (LLM) se comunica directamente con las APIs de presupuesto de Meta, Google, TikTok o Zernio.
2. **Invariante de Clamping**: Toda acción que modifique el presupuesto diario de una campaña pasa forzosamente por el Risk Engine, el cual clampa matemáticamente los incrementos al tope máximo de `+20%` por período de 24 horas.
3. **Invariante de Stock Crítico**: Si el inventario disponible de un producto es `<= 5 unidades`, cualquier orden de escalado es vetada automáticamente para prevenir ventas sin respaldo físico.
4. **Invariante de Muestra Estadística**: El Decision Engine prohíbe tomar decisiones drásticas (como pausar o escalar al doble) con menos de 5 conversiones, catalogando la campaña como "fase de aprendizaje".
