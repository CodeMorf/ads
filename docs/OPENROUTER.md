# OpenRouter Gateway — Enrutamiento Dinámico de LLM

## 1. Filosofía de Enrutamiento

En AllSender Ads, **ningún modelo de lenguaje está fijado en código estático**. 

A través del panel de configuración de Super Admin, cada perfil de agente puede asignarse en caliente a los mejores modelos disponibles en la industria a través de **OpenRouter**.

---

## 2. Perfiles de Modelos

| Perfil | Propósito | Modelo Recomendado por Defecto |
| :--- | :--- | :--- |
| `FAST_MODEL` | Chequeos operacionales veloces y micro-tareas | `google/gemini-2.5-flash` o `openai/gpt-4o-mini` |
| `ANALYSIS_MODEL` | Análisis de series temporales, CPA y tendencias de degradación | `deepseek/deepseek-chat` (DeepSeek V3) |
| `STRATEGY_MODEL` | Selección de audiencias, plataformas y distribución de capital | `anthropic/claude-3.7-sonnet` |
| `JUDGE_MODEL` | Auditoría y veto de decisiones financieras elevadas | `deepseek/deepseek-r1` (Razonamiento Profundo) |
| `CREATIVE_MODEL` | Generación de conceptos, hooks psicológicos y storyboards | `anthropic/claude-3.7-sonnet` |
| `FALLBACK_MODEL` | Respaldo automático en caso de latencia o timeout | `openai/gpt-4o-mini` |

---

## 3. Telemetría y Contabilidad de Tokens

Cada llamada realizada a través de OpenRouter registra de forma inmutable:

- Modelo utilizado y proveedor subyacente.
- Tokens de entrada (prompt tokens).
- Tokens de salida (completion tokens).
- Costo financiero exacto en USD derivado de los precios de OpenRouter.
- Latencia en milisegundos.
- Decisión o payload generado.
