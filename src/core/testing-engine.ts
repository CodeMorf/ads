import { Campaign, CampaignAd, CreativeConcept, ProductFinancials } from '../types';

export interface DynamicTestingFunnelState {
  campaignId: string;
  totalConceptsGenerated: number;
  activeTestAds: number;
  stage: 'CONCEPTS_GENERATED' | 'TOP_5_TESTING' | 'TOP_3_NARROWING' | 'TOP_2_FINALS' | 'WINNER_SELECTED';
  winnerAdId?: string;
  winnerBudgetAllocationPct: number; // e.g. 85%
  experimentBudgetAllocationPct: number; // e.g. 15%
}

export interface FatigueAnalysisResult {
  isFatigued: boolean;
  fatigueScore: number; // 0 a 100
  signals: {
    frequencyExceeded: boolean;
    ctrDropped: boolean;
    cpaInflated: boolean;
    roasDeteriorated: boolean;
  };
  recommendation: 'CONTINUE' | 'PREPARE_VARIANT' | 'MIGRATE_BUDGET_TO_VARIANT';
  rationale: string;
}

export class TestingEngine {
  /**
   * Evalúa la fatiga de un anuncio según métricas en tiempo real.
   * Reglas:
   * - Frecuencia > 2.8x (alerta), > 3.5x (crítica)
   * - Caída de CTR < 1.2%
   * - Incremento de CPA > 25% sobre el histórico inicial
   * - Deterioro de ROAS
   */
  public static evaluateFatigue(
    ad: CampaignAd,
    product: ProductFinancials,
    historicalBaselineCTR: number = 2.4
  ): FatigueAnalysisResult {
    const { frequency, ctr, cpa, roas } = ad.metrics;
    let score = 0;

    const frequencyExceeded = frequency >= 2.8;
    if (frequency >= 4.0) score += 40;
    else if (frequency >= 3.0) score += 25;
    else if (frequency >= 2.5) score += 15;

    const ctrDropped = ctr < historicalBaselineCTR * 0.7; // Caída de >30%
    if (ctrDropped) score += 30;

    const cpaInflated = cpa > product.maxProfitableCPA * 0.9;
    if (cpaInflated) score += 20;

    const roasDeteriorated = roas < product.minProfitableROAS * 1.1;
    if (roasDeteriorated) score += 10;

    score = Math.min(100, Math.max(0, score));
    const isFatigued = score >= 60;

    let recommendation: 'CONTINUE' | 'PREPARE_VARIANT' | 'MIGRATE_BUDGET_TO_VARIANT' = 'CONTINUE';
    let rationale = 'Creatividad fresca y con buen engagement.';

    if (score >= 75) {
      recommendation = 'MIGRATE_BUDGET_TO_VARIANT';
      rationale = `Fatiga severa detectada (${score}/100). Frecuencia alta (${frequency.toFixed(1)}x) y CTR deteriorado (${ctr}%). Crear y activar variante de inmediato.`;
    } else if (score >= 50) {
      recommendation = 'PREPARE_VARIANT';
      rationale = `Señales tempranas de desgaste (${score}/100). Generar nuevos hooks para reemplazar antes del colapso del ROAS.`;
    }

    return {
      isFatigued,
      fatigueScore: score,
      signals: {
        frequencyExceeded,
        ctrDropped,
        cpaInflated,
        roasDeteriorated,
      },
      recommendation,
      rationale,
    };
  }

  /**
   * Crea una variante mejorada a partir de un concepto existente para mitigar la fatiga
   * sin destruir el anuncio original mientras el nuevo demuestra tracción.
   */
  public static createVariantForFatigue(
    originalConcept: CreativeConcept,
    newAngle: string,
    newHook: string
  ): CreativeConcept {
    return {
      id: `variant_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${originalConcept.title} (Variante v${originalConcept.variantVersion + 1})`,
      angle: newAngle || originalConcept.angle,
      hook: newHook || `Nueva perspectiva: ${originalConcept.hook}`,
      headline: `[Renovado] ${originalConcept.headline}`,
      primaryText: originalConcept.primaryText,
      callToAction: originalConcept.callToAction,
      imagePrompt: `${originalConcept.imagePrompt} - Nuevo encuadre cinematográfico con mayor dinamismo.`,
      videoPrompt: `${originalConcept.videoPrompt} - Hook alternativo en los primeros 2 segundos.`,
      score: Math.min(95, originalConcept.score + 3),
      status: 'TESTING',
      variantVersion: originalConcept.variantVersion + 1,
    };
  }

  /**
   * Filtra y selecciona los mejores conceptos según scoring del AI Strategist
   */
  public static selectTopConcepts(concepts: CreativeConcept[], topN: number = 3): CreativeConcept[] {
    return [...concepts].sort((a, b) => b.score - a.score).slice(0, topN);
  }

  /**
   * Calcula la distribución de presupuesto entre ganador (80-90%) y experimentos (10-20%)
   */
  public static calculateBudgetSplit(
    totalDailyBudget: number,
    winnerAllocationPct: number = 85
  ): { winnerBudget: number; experimentalPoolBudget: number } {
    const winnerBudget = Math.round(totalDailyBudget * (winnerAllocationPct / 100));
    const experimentalPoolBudget = totalDailyBudget - winnerBudget;
    return { winnerBudget, experimentalPoolBudget };
  }
}
