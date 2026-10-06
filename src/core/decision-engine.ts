import { ActionType, ProductFinancials, AdPerformanceMetrics } from '../types';

export interface DecisionEvaluation {
  action: ActionType;
  confidenceScore: number; // 0.00 a 1.00
  isSampleSufficient: boolean;
  recommendedDelta?: number | string; // e.g. "+15%", "-25%", "PAUSE"
  primaryReason: string;
  reasons: string[];
  metricsContext: {
    currentCPA: number;
    maxProfitableCPA: number;
    currentROAS: number;
    minProfitableROAS: number;
    conversions: number;
    spend: number;
    frequency: number;
    ctr: number;
  };
}

export class DecisionEngine {
  /**
   * Mínimo de conversiones antes de considerar que la muestra es estadísticamente válida
   * para tomar decisiones drásticas (pausar o escalar agresivamente).
   */
  private static MIN_CONVERSIONS_FOR_MAJOR_DECISION = 5;

  /**
   * Mínimo de gasto relativo (en múltiplos de CPA máximo) antes de declarar un anuncio perdedor sin conversiones.
   * Si ha gastado > 2.5x el CPA máximo sin 1 conversión, la probabilidad de ser rentable es < 5%.
   */
  private static MAX_SPEND_MULTIPLE_WITHOUT_CONVERSIONS = 2.5;

  /**
   * Calcula el Confidence Score estadístico basado en:
   * 1. Número de conversiones acumuladas
   * 2. Volumen de impresiones y clics
   * 3. Proximidad del gasto al umbral del CPA
   */
  public static calculateConfidenceScore(
    conversions: number,
    spend: number,
    maxCPA: number,
    clicks: number
  ): { score: number; isSufficient: boolean; label: string } {
    if (clicks < 50 && conversions === 0) {
      return { score: 0.15, isSufficient: false, label: 'Muestra preliminar insignificante' };
    }

    // Caso A: Sin conversiones pero con gasto elevado
    if (conversions === 0) {
      const spendRatio = maxCPA > 0 ? spend / maxCPA : 0;
      if (spendRatio >= DecisionEngine.MAX_SPEND_MULTIPLE_WITHOUT_CONVERSIONS) {
        return { 
          score: 0.92, 
          isSufficient: true, 
          label: `Confianza alta (Gasto > ${spendRatio.toFixed(1)}x CPA máx sin conversiones)` 
        };
      }
      return { 
        score: Math.min(0.60, spendRatio / DecisionEngine.MAX_SPEND_MULTIPLE_WITHOUT_CONVERSIONS), 
        isSufficient: false, 
        label: 'Esperando mayor volumen de datos' 
      };
    }

    // Caso B: Con conversiones
    let baseScore = 0.40;
    if (conversions >= 15) baseScore = 0.98;
    else if (conversions >= 10) baseScore = 0.90;
    else if (conversions >= 5) baseScore = 0.80;
    else if (conversions >= 3) baseScore = 0.65;
    else baseScore = 0.45; // 1 o 2 conversiones

    const isSufficient = conversions >= DecisionEngine.MIN_CONVERSIONS_FOR_MAJOR_DECISION;
    return {
      score: baseScore,
      isSufficient,
      label: isSufficient 
        ? `Muestra sólida (${conversions} conv.)` 
        : `Muestra en maduración (${conversions}/${DecisionEngine.MIN_CONVERSIONS_FOR_MAJOR_DECISION} conv.)`,
    };
  }

  /**
   * Evalúa determinísticamente un anuncio o campaña contra las reglas del negocio.
   */
  public static evaluate(
    metrics: AdPerformanceMetrics,
    product: ProductFinancials,
    fatigueScore: number = 0
  ): DecisionEvaluation {
    const { cpa, roas, conversions, spend, frequency, ctr, clicks } = metrics;
    const { maxProfitableCPA, minProfitableROAS, stock } = product;

    const reasons: string[] = [];
    const confidence = this.calculateConfidenceScore(conversions, spend, maxProfitableCPA, clicks);

    const metricsContext = {
      currentCPA: cpa,
      maxProfitableCPA,
      currentROAS: roas,
      minProfitableROAS,
      conversions,
      spend,
      frequency,
      ctr,
    };

    // 1. REGLA DE SEGURIDAD DE INVENTARIO: Stock crítico
    if (stock <= 5) {
      reasons.push(`Stock bajo o agotándose (${stock} unidades disponibles).`);
      return {
        action: 'PAUSE',
        confidenceScore: 0.99,
        isSampleSufficient: true,
        recommendedDelta: 'PAUSE_STOCK_PROTECTION',
        primaryReason: `Inventario crítico (${stock} unidades). Pausar para evitar ventas sin stock.`,
        reasons,
        metricsContext,
      };
    }

    // 2. REGLA DE FATIGA CREATIVA SEVERA
    if (fatigueScore >= 75 || (frequency > 3.5 && ctr < 0.8)) {
      reasons.push(`Fatiga detectada: Frecuencia ${frequency.toFixed(2)}x y CTR en ${ctr.toFixed(2)}%.`);
      return {
        action: 'CREATE_VARIANT',
        confidenceScore: 0.85,
        isSampleSufficient: true,
        recommendedDelta: 'REFRESH_CREATIVE',
        primaryReason: 'Fatiga de audiencia detectada. El anuncio original se satura, generar variantes frescas.',
        reasons,
        metricsContext,
      };
    }

    // 3. REGLA DE GASTO ELEVADO SIN CONVERSIONES (Bleeding ad)
    if (conversions === 0 && spend >= maxProfitableCPA * DecisionEngine.MAX_SPEND_MULTIPLE_WITHOUT_CONVERSIONS) {
      reasons.push(`Gasto $${spend.toFixed(2)} acumulado supera el límite de seguridad sin generar ventas.`);
      return {
        action: 'PAUSE',
        confidenceScore: confidence.score,
        isSampleSufficient: true,
        recommendedDelta: 'PAUSE',
        primaryReason: `Consumió ${spend.toFixed(0)} USD (> 2.5x CPA máx) sin conversiones. Pausar sangrado.`,
        reasons,
        metricsContext,
      };
    }

    // 4. MUESTRA INSUFICIENTE: Proteger contra decisiones apresuradas
    if (!confidence.isSufficient && conversions < DecisionEngine.MIN_CONVERSIONS_FOR_MAJOR_DECISION) {
      reasons.push(`Solo ${conversions} conversiones. Datos insuficientes para tomar acción drástica.`);
      return {
        action: 'KEEP_RUNNING',
        confidenceScore: confidence.score,
        isSampleSufficient: false,
        recommendedDelta: '0%',
        primaryReason: `Fase de aprendizaje: Muestra insuficiente (${conversions}/${DecisionEngine.MIN_CONVERSIONS_FOR_MAJOR_DECISION} conv). Mantener observación.`,
        reasons,
        metricsContext,
      };
    }

    // 5. EVALUACIÓN DE DESEMPEÑO CON DATOS ESTADÍSTICAMENTE VÁLIDOS

    // CASO A: CPA Severamente por encima del umbral (> 1.25x CPA Máximo) o ROAS colapsado
    if (cpa > maxProfitableCPA * 1.25 || roas < minProfitableROAS * 0.70) {
      reasons.push(`CPA actual ($${cpa.toFixed(2)}) supera el CPA máximo admisible ($${maxProfitableCPA.toFixed(2)}).`);
      reasons.push(`ROAS actual (${roas.toFixed(2)}) está por debajo del mínimo de equilibrio (${minProfitableROAS.toFixed(2)}).`);

      // Si es catastrófico (> 1.6x CPA), pausar
      if (cpa > maxProfitableCPA * 1.6) {
        return {
          action: 'PAUSE',
          confidenceScore: confidence.score,
          isSampleSufficient: true,
          recommendedDelta: 'PAUSE',
          primaryReason: `CPA inaceptable ($${cpa.toFixed(2)} vs máx $${maxProfitableCPA.toFixed(2)}). Destruye el beneficio unitario.`,
          reasons,
          metricsContext,
        };
      }

      // Si es moderado, reducir presupuesto
      return {
        action: 'REDUCE_BUDGET',
        confidenceScore: confidence.score,
        isSampleSufficient: true,
        recommendedDelta: '-25%',
        primaryReason: `CPA por encima del umbral rentable ($${cpa.toFixed(2)} > $${maxProfitableCPA.toFixed(2)}). Reducir exposición.`,
        reasons,
        metricsContext,
      };
    }

    // CASO B: Rendimiento altamente rentable (CPA <= 75% del CPA Máximo y ROAS saludable)
    if (cpa <= maxProfitableCPA * 0.75 && roas >= minProfitableROAS * 1.25) {
      reasons.push(`CPA altamente rentable: $${cpa.toFixed(2)} (margen favorable de $${(maxProfitableCPA - cpa).toFixed(2)} por venta).`);
      reasons.push(`ROAS excelente: ${roas.toFixed(2)}x superando el objetivo de ${minProfitableROAS.toFixed(2)}x.`);

      return {
        action: 'INCREASE_BUDGET',
        confidenceScore: confidence.score,
        isSampleSufficient: true,
        recommendedDelta: '+20%',
        primaryReason: `Excelente rentabilidad confirmada (${conversions} ventas, CPA $${cpa.toFixed(2)}). Apto para escalar presupuesto.`,
        reasons,
        metricsContext,
      };
    }

    // CASO C: Rentable pero en rango estándar
    if (cpa <= maxProfitableCPA && roas >= minProfitableROAS) {
      reasons.push(`Operando de forma estable dentro de los parámetros esperados.`);
      return {
        action: 'KEEP_RUNNING',
        confidenceScore: confidence.score,
        isSampleSufficient: true,
        recommendedDelta: '0%',
        primaryReason: 'Campaña estable y rentable. Monitorear sin alteraciones bruscas.',
        reasons,
        metricsContext,
      };
    }

    // CASO DEFAULT: Rendimiento fronterizo
    return {
      action: 'KEEP_RUNNING',
      confidenceScore: confidence.score,
      isSampleSufficient: true,
      recommendedDelta: '0%',
      primaryReason: 'Métricas cerca del punto de equilibrio. Continuar recabando datos antes de ajustar.',
      reasons,
      metricsContext,
    };
  }
}
