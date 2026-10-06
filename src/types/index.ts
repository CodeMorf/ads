export type PlatformType = 'meta' | 'google' | 'tiktok';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'OWNER' 
  | 'ADMIN' 
  | 'MARKETER' 
  | 'ANALYST' 
  | 'VIEWER';

export type AutonomousMode = 'MANUAL' | 'ASSISTED' | 'AUTONOMOUS';

export interface ProductFinancials {
  id: string;
  name: string;
  sku: string;
  cost: number;            // Costo del producto
  sellingPrice: number;    // Precio de venta habitual
  salePrice?: number;      // Precio de oferta (opcional)
  stock: number;           // Stock disponible
  shippingCost: number;    // Costo de envío
  platformFee: number;     // Comisiones pasarelas/tienda
  otherCosts: number;      // Otros costos (empaque, etc.)
  minProfitTarget: number; // Margen o beneficio mínimo requerido por unidad
  images: string[];
  videos: string[];
  landingPage: string;
  currency: string;
  category: string;
  // Métricas calculadas automáticamente
  grossMargin: number;           // Margen bruto (%)
  profitBeforeAds: number;       // Beneficio antes de publicidad
  maxProfitableCPA: number;      // CPA máximo rentable
  minProfitableROAS: number;     // ROAS mínimo rentable
  recommendedDailyBudget: number;// Presupuesto publicitario recomendado diario
}

export type ActionType = 
  | 'PAUSE'
  | 'REDUCE_BUDGET'
  | 'INCREASE_BUDGET'
  | 'CREATE_VARIANT'
  | 'CHANGE_AUDIENCE'
  | 'CHANGE_COPY'
  | 'CHANGE_CREATIVE'
  | 'REALLOCATE_BUDGET'
  | 'KEEP_RUNNING';

export type CampaignStatus = 'ACTIVE' | 'PAUSED' | 'LEARNING' | 'FATIGUED' | 'SCALED' | 'TESTING';

export interface AdPerformanceMetrics {
  spend: number;
  attributedRevenue: number;
  netProfit: number;
  conversions: number;
  roas: number;
  cpa: number;
  cpc: number;
  ctr: number;
  cpm: number;
  frequency: number;
  impressions: number;
  clicks: number;
  lastUpdated: string;
}

export interface CreativeConcept {
  id: string;
  title: string;
  angle: string;
  hook: string;
  headline: string;
  primaryText: string;
  callToAction: string;
  imagePrompt: string;
  videoPrompt: string;
  score: number; // 0-100 calculado por Strategist Agent
  status: 'CONCEPT' | 'TESTING' | 'WINNER' | 'DISCARDED';
  variantVersion: number;
}

export interface CampaignAd {
  id: string;
  campaignId: string;
  name: string;
  creative: CreativeConcept;
  metrics: AdPerformanceMetrics;
  status: CampaignStatus;
  fatigueScore: number; // 0-100 (alta fatiga > 65)
  isWinner: boolean;
  isExperimental: boolean;
  platform: PlatformType;
  budgetAllocated: number; // Diario
  createdAt: string;
}

export interface Campaign {
  id: string;
  productId: string;
  name: string;
  objective: string;
  platform: PlatformType;
  targetCountry: string;
  dailyBudget: number;
  experimentalBudgetPercent: number; // e.g. 15% para experimentación, 85% ganadores
  status: CampaignStatus;
  ads: CampaignAd[];
  metrics: AdPerformanceMetrics;
  createdAt: string;
}

export interface AIActionLog {
  id: string;
  timestamp: string;
  accountId: string;
  productId: string;
  productName: string;
  campaignId: string;
  campaignName: string;
  adId?: string;
  adName?: string;
  aiAgent: 'Ads Analyst' | 'Strategist Agent' | 'Creative Agent' | 'Optimization Agent' | 'Judge Agent';
  aiModel: string;
  metricsBefore: {
    cpa: number;
    roas: number;
    spend: number;
    conversions: number;
    frequency?: number;
  };
  reasoning: string;
  requestedAction: {
    type: ActionType;
    delta?: number | string; // e.g. "+80% presupuesto" o "-30%"
    targetId?: string;
  };
  approvedAction: {
    type: ActionType;
    delta?: number | string; // e.g. "+20% presupuesto" (clampado por Risk Engine)
    riskClamped: boolean;
    clampingReason?: string;
  };
  executedAction: string;
  status: 'EXECUTED' | 'PENDING_APPROVAL' | 'REJECTED_BY_RISK' | 'USER_APPROVED' | 'USER_REJECTED';
  userApprovedBy?: string;
  metricsAfter?: {
    cpa: number;
    roas: number;
    spend: number;
    netProfitDelta: number;
  };
}

export interface RiskEngineConfig {
  maxDailyBudget: number;              // Límite total diario para la cuenta
  maxMonthlyBudget: number;            // Límite total mensual
  maxCPA: number;                      // CPA límite absoluto permitido
  minROAS: number;                     // ROAS piso absoluto permitido
  maxDailyLoss: number;                // Pérdida máxima diaria antes de pausa preventiva
  maxDailyIncreasePct: number;         // Incremento máximo diario permitido por 24h (ej. 20%)
  maxDailyReductionPct: number;        // Reducción máxima diaria permitida (ej. 50%)
  maxExperimentSpend: number;          // Gasto máximo por experimento antes de decisión
  minConversionsBeforeAction: number;  // Mínimo de conversiones antes de tomar decisiones drásticas
  experimentationPercent: number;      // Porcentaje reservado para experimentación (ej. 15%)
  minStockForScale: number;            // Stock mínimo para permitir escalar
}

export type ModelProfileType = 
  | 'FAST_MODEL'
  | 'ANALYSIS_MODEL'
  | 'STRATEGY_MODEL'
  | 'JUDGE_MODEL'
  | 'CREATIVE_MODEL'
  | 'FALLBACK_MODEL';

export interface OpenRouterModelConfig {
  id: string;
  provider: 'DeepSeek' | 'Anthropic' | 'Google' | 'OpenAI' | 'Qwen' | 'Moonshot/Kimi';
  modelId: string;
  displayName: string;
  costPer1kPrompt: number;
  costPer1kCompletion: number;
  latencyAvgMs: number;
  contextWindow: number;
}

export interface OpenRouterSettings {
  apiKey: string;
  isMockMode: boolean;
  selectedModels: Record<ModelProfileType, string>;
  availableModels: OpenRouterModelConfig[];
  usageLog: {
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalCostUsd: number;
    totalCalls: number;
  };
}

export interface MastraMemoryItem {
  id: string;
  date: string;
  category: 'CREATIVE_WINNER' | 'AUDIENCE_INSIGHT' | 'FATIGUE_PATTERN' | 'SEASONALITY' | 'FAILED_EXPERIMENT';
  productId: string;
  productName: string;
  summary: string;
  confidenceScore: number;
  keyTakeaway: string;
  metricsProof: string;
}

export interface VerificationTestResult {
  id: string;
  title: string;
  category: 'FINANCIAL' | 'DECISION_ENGINE' | 'RISK_ENGINE' | 'GUARDRAIL_INVARIANT';
  status: 'PASSED' | 'FAILED' | 'PENDING';
  message: string;
  durationMs: number;
  details?: Record<string, any>;
}
