# Decision Engine — Motor Matemático Determinista

El Decision Engine es el núcleo aritmético y estadístico de AllSender Ads. Su propósito es erradicar la toma de decisiones basada en alucinaciones o interpretaciones subjetivas del LLM.

---

## 1. Fórmulas Financieras Deterministas

Para cada producto en el catálogo:

$$\text{Direct Costs} = \text{Costo Producto} + \text{Envío} + \text{Comisiones Pasarela} + \text{Otros Costos}$$

$$\text{Profit Before Ads} = \text{Precio de Venta} - \text{Direct Costs}$$

$$\text{CPA Máximo Rentable} = \text{Profit Before Ads} - \text{Beneficio Mínimo Deseado}$$

$$\text{ROAS Mínimo Rentable} = \frac{\text{Precio de Venta}}{\text{CPA Máximo Rentable}}$$

### Ejemplo de Cálculo

- Precio de venta = **$1,290.00**
- Costo de producto = **$325.00**
- Envío = **$250.00**
- Otros costos = **$75.00**
- Beneficio antes de publicidad = $1,290 - (325 + 250 + 75) = **$640.00**
- Si el beneficio neto deseado es de **$350.00**:
  - **CPA Máximo Rentable** = $640.00 - $350.00 = **$290.00**
  - **ROAS Mínimo** = $1,290 / $290 = **4.45x**

Si una campaña tiene un CPA actual de **$320.00** en una muestra estadísticamente representativa, el Decision Engine la cataloga de forma inapelable como **candidata a reducción o pausa**.

---

## 2. Confidence Score y Suficiencia de Muestra

El motor implementa un modelo de confianza estadística para evitar el error común de actuar ante 1 o 2 ventas casuales:

| Conversiones Acumuladas | Confidence Score | Clasificación de Muestra | Acción Permitida |
| :--- | :--- | :--- | :--- |
| 0 (Gasto < 2.5x CPA Máx) | 0.15 - 0.50 | Insignificante / Inicial | Solo `KEEP_RUNNING` (Aprendizaje) |
| 0 (Gasto ≥ 2.5x CPA Máx) | 0.92 | Muestra Suficiente de Sangrado | `PAUSE` Inmediato para detener pérdida |
| 1 - 2 conversiones | 0.45 | Insuficiente | `KEEP_RUNNING` |
| 3 - 4 conversiones | 0.65 | Transición | Micro-ajustes |
| ≥ 5 conversiones | 0.80 - 0.98 | **Sólida / Estadísticamente Válida** | `INCREASE_BUDGET` o `REDUCE_BUDGET` |
