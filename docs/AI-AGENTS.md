# Sistema de Agentes de IA — Mastra Framework

AllSender Ads implementa una arquitectura multi-agente donde cada agente desempeña una función especializada dentro del ciclo de optimización publicitaria.

---

## 1. Agentes Especializados

### 1.1 Ads Analyst Agent
- **Perfil de Modelo Asignado**: `ANALYSIS_MODEL` (e.g. DeepSeek V3 o Claude 3.5 Haiku vía OpenRouter).
- **Misión**: Analizar continuamente el flujo de datos proveniente de Zernio.
- **Variables Auditadas**: CTR, CPC, CPM, CPA, ROAS, frecuencia de impacto, gasto acumulado, beneficio neto generado y velocidad de ventas.
- **Detección Clave**: Señales tempranas de fatiga de audiencia y saturación de creatividades.

### 1.2 Strategist Agent
- **Perfil de Modelo Asignado**: `STRATEGY_MODEL` (e.g. Claude 3.7 Sonnet).
- **Misión**: Definir la dirección táctica de las campañas según la economía del producto y los aprendizajes históricos de Mastra Memory.
- **Responsabilidades**:
  - Qué nuevos ángulos probar.
  - Selección de la plataforma publicitaria óptima (Meta para UGC, Google para intención de búsqueda, TikTok para descubrimiento viral).
  - Distribución del presupuesto inicial entre ganadores (85%) y experimentación (15%).
  - Identificación de causas raíz de bajo desempeño.

### 1.3 Creative Agent
- **Perfil de Modelo Asignado**: `CREATIVE_MODEL` (e.g. Claude 3.7 Sonnet o Gemini 2.5 Pro).
- **Misión**: Redacción de conceptos publicitarios de alta tasa de conversión.
- **Entregables**:
  - Hooks psicológicos para los primeros 3 segundos.
  - Headlines persuasivos orientados a beneficios.
  - Textos principales con manejo de objeciones.
  - Llamadas a la acción (CTA) orientadas a compra directa.
  - Prompts visuales detallados para generación de imágenes y storyboards de video UGC.

### 1.4 Optimization Agent
- **Perfil de Modelo Asignado**: `FAST_MODEL` (e.g. Gemini 2.5 Flash o GPT-4o Mini).
- **Misión**: Emitir recomendaciones operativas granulares.
- **Catálogo de Acciones**:
  - `PAUSE`: Pausar anuncios no rentables o fatigados.
  - `REDUCE_BUDGET`: Reducir gasto en conjuntos con CPA en riesgo.
  - `INCREASE_BUDGET`: Recomendar escalado de presupuesto en anuncios con excelente ROAS.
  - `CREATE_VARIANT`: Solicitar al Creative Agent la creación de variantes para anuncios ganadores que muestren desgaste.
  - `REALLOCATE_BUDGET`: Mover fondos de conjuntos perdedores hacia ganadores.
  - `KEEP_RUNNING`: Mantener en observación mientras se madura la muestra estadística.

### 1.5 Judge Agent
- **Perfil de Modelo Asignado**: `JUDGE_MODEL` (e.g. DeepSeek R1).
- **Misión**: Actuar como tribunal supervisor independiente para revisar decisiones de impacto económico elevado (> $500 USD de presupuesto diario o reasignaciones agresivas).

---

## 2. Memoria Semántica y Episódica (Mastra Memory)

Mastra mantiene un almacén persistente de conocimiento que responde a consultas clave:

- **Creatividades Ganadoras**: Cuáles hooks, ángulos y formatos (UGC vs estudio) han producido el mayor ROAS históricamente para cada SKU.
- **Audiencias Rentables**: Demografías e intereses que convierten con el menor CPA.
- **Patrones de Fatiga**: A partir de qué umbral de frecuencia (e.g. 2.8x - 3.5x) decae el CTR de cada producto.
- **Estacionalidad**: Días de la semana y horas donde el margen neto se maximiza.
