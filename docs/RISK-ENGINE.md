# Risk Engine — Salvaguardas Financieras y Clamping

El **Risk Engine** es la capa con máxima autoridad dentro de AllSender Ads. Se ubica entre el Decision Engine y la capa de integración de publicidad (Zernio).

---

## 1. Principio de Autoridad Soberana

Ninguna entidad, agente ni instrucción de un modelo de lenguaje puede superar o eludir los límites parametrizados en el Risk Engine.

### Reglas de Clamping Matemático

1. **Incremento Máximo Diario (`MAX_DAILY_INCREASE_PCT`)**:
   - Valor estándar: **+20%**.
   - Si un agente LLM solicita un escalado agresivo de `+80%` (e.g. pasar de $100 a $180 diarios):
     - El Risk Engine intercepta la petición.
     - Aplica clamping determinista: $\text{Nuevo Presupuesto} = 100 \times (1 + 0.20) = \$120$.
     - Registra la causa en el log de auditoría: `Risk clamped: requested +80%, clamped to +20%`.

2. **Reducción Máxima Diaria (`MAX_DAILY_REDUCTION_PCT`)**:
   - Valor estándar: **-50%**.
   - Suaviza recortes para prevenir la descalibración abrupta de los algoritmos de subasta.

3. **Techo Máximo de Cuenta (`MAX_DAILY_BUDGET`)**:
   - Gasto total diario consolidado que la cuenta nunca puede sobrepasar bajo ninguna circunstancia.

4. **Protección de Rotura de Stock (`MIN_STOCK_FOR_SCALE`)**:
   - Si el stock de un producto es `<= 5 unidades`, el Risk Engine bloquea de inmediato cualquier orden de escalado, incluso si el ROAS es extraordinario (ej. 10.0x).

---

## 2. Modos de Operación Autónomos

| Modo | Comportamiento del Sistema |
| :--- | :--- |
| **MANUAL** | Los agentes y el Decision Engine emiten recomendaciones; el usuario humano debe aprobar cada acción antes de que se envíe a Zernio. |
| **ASSISTED** | Las micro-optimizaciones (ajustes de presupuesto de bajo impacto) se ejecutan automáticamente; cambios significativos o pausas de anuncios requieren aprobación humana. |
| **AUTONOMOUS** | El sistema opera de forma autónoma continua dentro de los límites estrictos del Risk Engine. |

> **Nota Crítica**: Ningún modo autónomo tiene autorización de saltarse el Risk Engine.
