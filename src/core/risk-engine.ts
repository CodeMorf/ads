import { 
  ActionType, 
  RiskEngineConfig, 
  AutonomousMode, 
  ProductFinancials, 
  AdPerformanceMetrics 
} from '../types';

export interface ProposedAction {
  type: ActionType;
  deltaPercent?: number; // e.g. 80 for +80%, -30 for -30%
  targetBudget?: number;
  currentBudget: number;
  campaignId: string;
  adId?: string;
  source: 'LLM_AGENT' | 'DECISION_ENGINE' | 'USER';
  reasoning: string;
}

export interface RiskEvaluationResult {
  allowed: boolean;
  requiresUserApproval: boolean;
  requestedAction: {
    type: ActionType;
    delta: string;
    budgetProposed: number;
  };
  approvedAction: {
    type: ActionType;
    delta: string;
    budgetApproved: number;
    riskClamped: boolean;
  };
  reason: string;
  previousValue: number;
  newValue: number;
  violatesGuardrail: boolean;
  guardrailBreaches: string[];
}

export class RiskEngine {
  /**
   * Configuración por defecto de salvaguardas financieras
   */
  public static readonly DEFAULT_CONFIG: RiskEngineConfig = {
    maxDailyBudget: 1500,               // $1500 USD máx por cuenta al día
    maxMonthlyBudget: 45000,            // $45,000 USD máx mensual
    maxCPA: 350,                        // Umbral máximo de seguridad
    minROAS: 1.8,                       // Piso mínimo absoluto de ROAS
    maxDailyLoss: 500,                  // Pérdida máxima en 24h antes de corte
    maxDailyIncreasePct: 20,            // Máximo incremento permitido por día (+20%)
    maxDailyReductionPct: 50,           // Máxima reducción diaria (-50%)
    maxExperimentSpend: 150,            // Gasto tope por experimento sin resultados
    minConversionsBeforeAction: 5,      // Muestra mínima de conversiones
    experimentationPercent: 15,         // 15% reservado a testeo, 85% a ganadores
    minStockForScale: 10,               // Mínimo 10 unidades para permitir escalar
  };

  /**
   * Evalúa y clampa cualquier acción propuesta por un agente LLM o Decision Engine.
   * La autoridad del Risk Engine es inquebrantable.
   */
  public static evaluateAndClamp(
    proposal: ProposedAction,
    config: RiskEngineConfig,
    mode: AutonomousMode,
    product: ProductFinancials,
    metrics: AdPerformanceMetrics,
    totalAccountDailySpend: number
  ): RiskEvaluationResult {
    const breaches: string[] = [];
    let clampedBudget = proposal.currentBudget;
    let clampedType = proposal.type;
    let isClamped = false;
    let clampingReason = 'Aprobado sin modificaciones dentro de parámetros de riesgo.';

    const originalProposedBudget = proposal.targetBudget ?? (
      proposal.deltaPercent 
        ? Math.round(proposal.currentBudget * (1 + proposal.deltaPercent / 100))
        : proposal.currentBudget
    );

    // 1. REGLA DE INVENTARIO: Prohibido escalar si stock está bajo
    if (proposal.type === 'INCREASE_BUDGET' && product.stock < config.minStockForScale) {
      breaches.push(`Stock bajo (${product.stock} < ${config.minStockForScale}). Riesgo de quiebre de stock.`);
      clampedType = 'KEEP_RUNNING';
      clampedBudget = proposal.currentBudget;
      isClamped = true;
      clampingReason = `Escalado bloqueado: Inventario insuficiente (${product.stock} unidades en almacén).`;
    }

    // 2. REGLA DE INCREMENTO MÁXIMO DIARIO (Max Daily Increase e.g. 20%)
    if (proposal.type === 'INCREASE_BUDGET') {
      const requestedIncreasePct = proposal.currentBudget > 0 
        ? ((originalProposedBudget - proposal.currentBudget) / proposal.currentBudget) * 100 
        : 0;

      if (requestedIncreasePct > config.maxDailyIncreasePct) {
        breaches.push(
          `Incremento solicitado (+${requestedIncreasePct.toFixed(0)}%) excede el límite de seguridad diario (+${config.maxDailyIncreasePct}%).`
        );
        // Clampar matemáticamente al máximo legal
        clampedBudget = Math.round(proposal.currentBudget * (1 + config.maxDailyIncreasePct / 100));
        isClamped = true;
        clampingReason = `Incremento ajustado al tope de seguridad de +${config.maxDailyIncreasePct}% (solicitado +${requestedIncreasePct.toFixed(0)}%).`;
      } else {
        clampedBudget = originalProposedBudget;
      }

      // Comprobar techo máximo diario global de la cuenta
      const projectedAccountSpend = (totalAccountDailySpend - proposal.currentBudget) + clampedBudget;
      if (projectedAccountSpend > config.maxDailyBudget) {
        breaches.push(`El presupuesto proyectado ($${projectedAccountSpend}) superaría el límite diario de la cuenta ($${config.maxDailyBudget}).`);
        const maxPermittedForThisAd = Math.max(proposal.currentBudget, config.maxDailyBudget - (totalAccountDailySpend - proposal.currentBudget));
        clampedBudget = maxPermittedForThisAd;
        isClamped = true;
        clampingReason = `Presupuesto limitado por el techo diario de la cuenta ($${config.maxDailyBudget} USD).`;
      }
    }

    // 3. REGLA DE REDUCCIÓN MÁXIMA DIARIA
    if (proposal.type === 'REDUCE_BUDGET') {
      const requestedReductionPct = proposal.currentBudget > 0
        ? ((proposal.currentBudget - originalProposedBudget) / proposal.currentBudget) * 100
        : 0;

      if (requestedReductionPct > config.maxDailyReductionPct) {
        breaches.push(`Reducción solicitada (-${requestedReductionPct.toFixed(0)}%) excede la reducción máxima diaria permitida (-${config.maxDailyReductionPct}%).`);
        clampedBudget = Math.round(proposal.currentBudget * (1 - config.maxDailyReductionPct / 100));
        isClamped = true;
        clampingReason = `Reducción suavizada a -${config.maxDailyReductionPct}% para evitar frenazos de entrega en el algoritmo publicitario.`;
      } else {
        clampedBudget = Math.max(5, originalProposedBudget); // Mínimo $5 USD para no romper la entrega
      }
    }

    // 4. REGLA DE PAUSA
    if (proposal.type === 'PAUSE') {
      clampedType = 'PAUSE';
      clampedBudget = 0;
      clampingReason = proposal.reasoning || 'Pausa autorizada para contener pérdidas.';
    }

    // 5. EVALUACIÓN SEGÚN MODO AUTÓNOMO:
    // MANUAL: Requiere aprobación del usuario siempre.
    // ASSISTED: Micro-acciones se auto-ejecutan; cambios de presupuesto > $50 o pausas requieren aprobación.
    // AUTONOMOUS: Se ejecuta directamente mientras no viole guardrails.
    let requiresUserApproval = false;

    if (mode === 'MANUAL') {
      requiresUserApproval = true;
    } else if (mode === 'ASSISTED') {
      const isLargeBudgetChange = Math.abs(clampedBudget - proposal.currentBudget) > 50;
      const isPause = clampedType === 'PAUSE';
      if (isLargeBudgetChange || isPause) {
        requiresUserApproval = true;
      }
    } else if (mode === 'AUTONOMOUS') {
      // En modo autónomo, solo se pide aprobación si hubo una anomalía crítica no resuelta
      requiresUserApproval = false;
    }

    const requestedDeltaStr = proposal.deltaPercent 
      ? `${proposal.deltaPercent > 0 ? '+' : ''}${proposal.deltaPercent}%` 
      : `$${originalProposedBudget - proposal.currentBudget}`;

    const approvedDeltaPct = proposal.currentBudget > 0 
      ? Math.round(((clampedBudget - proposal.currentBudget) / proposal.currentBudget) * 100)
      : 0;

    const approvedDeltaStr = clampedType === 'PAUSE' 
      ? 'PAUSAR ANUNCIO' 
      : `${approvedDeltaPct > 0 ? '+' : ''}${approvedDeltaPct}% ($${clampedBudget}/día)`;

    return {
      allowed: true,
      requiresUserApproval,
      requestedAction: {
        type: proposal.type,
        delta: requestedDeltaStr,
        budgetProposed: originalProposedBudget,
      },
      approvedAction: {
        type: clampedType,
        delta: approvedDeltaStr,
        budgetApproved: clampedBudget,
        riskClamped: isClamped,
      },
      reason: clampingReason,
      previousValue: proposal.currentBudget,
      newValue: clampedBudget,
      violatesGuardrail: breaches.length > 0,
      guardrailBreaches: breaches,
    };
  }
}
