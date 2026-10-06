import { FinancialEngine } from '../financial-engine';
import { DecisionEngine } from '../decision-engine';
import { RiskEngine, ProposedAction } from '../risk-engine';
import { TestingEngine } from '../testing-engine';
import { VerificationTestResult, ProductFinancials, AdPerformanceMetrics } from '../../types';

export class AllSenderTestSuite {
  public static runAllTests(): VerificationTestResult[] {
    const results: VerificationTestResult[] = [];

    // TEST 1: Cálculos Financieros del Producto (Ejemplo del enunciado del usuario)
    // Precio: 1290, Costo: 325, Envío: 250, Otros: 75. Beneficio antes Ads = 640. Min Profit = 350 -> CPA Max = 290
    const startT1 = performance.now();
    try {
      const prod = FinancialEngine.calculateProductMetrics({
        name: 'Test Product X',
        sku: 'TP-100',
        cost: 325,
        sellingPrice: 1290,
        stock: 50,
        shippingCost: 250,
        platformFee: 0,
        otherCosts: 75,
        minProfitTarget: 350,
      });

      const profitBeforeAdsExpected = 640;
      const maxCpaExpected = 290;
      const minRoasExpected = Number((1290 / 290).toFixed(2)); // ~4.45

      const isProfitCorrect = Math.abs(prod.profitBeforeAds - profitBeforeAdsExpected) < 0.01;
      const isMaxCpaCorrect = Math.abs(prod.maxProfitableCPA - maxCpaExpected) < 0.01;
      const isMinRoasCorrect = Math.abs(prod.minProfitableROAS - minRoasExpected) < 0.01;

      if (isProfitCorrect && isMaxCpaCorrect && isMinRoasCorrect) {
        results.push({
          id: 'TEST-FIN-01',
          title: 'Verificación de Fórmulas Financieras Deterministas',
          category: 'FINANCIAL',
          status: 'PASSED',
          message: `Margen unitario validado: Beneficio antes de Ads=$${prod.profitBeforeAds}, CPA Máx=$${prod.maxProfitableCPA}, ROAS Mín=${prod.minProfitableROAS}x`,
          durationMs: Number((performance.now() - startT1).toFixed(2)),
          details: { profitBeforeAds: prod.profitBeforeAds, maxCPA: prod.maxProfitableCPA, minROAS: prod.minProfitableROAS }
        });
      } else {
        throw new Error(`Cálculo discrepante: profit=${prod.profitBeforeAds}, cpa=${prod.maxProfitableCPA}`);
      }
    } catch (e: any) {
      results.push({
        id: 'TEST-FIN-01',
        title: 'Verificación de Fórmulas Financieras Deterministas',
        category: 'FINANCIAL',
        status: 'FAILED',
        message: e.message,
        durationMs: Number((performance.now() - startT1).toFixed(2)),
      });
    }

    // TEST 2: Decision Engine no toma decisiones drásticas con muestra insuficiente (1-2 conversiones)
    const startT2 = performance.now();
    try {
      const dummyProd = FinancialEngine.calculateProductMetrics({
        name: 'Test Prod',
        sku: 'TP-1',
        cost: 20,
        sellingPrice: 100,
        stock: 50,
        shippingCost: 10,
        platformFee: 5,
        otherCosts: 5,
        minProfitTarget: 20,
      });

      const lowSampleMetrics: AdPerformanceMetrics = {
        spend: 40,
        attributedRevenue: 100,
        netProfit: 20,
        conversions: 1, // Muestra de solo 1 venta
        roas: 2.5,
        cpa: 40,
        cpc: 1.0,
        ctr: 1.5,
        cpm: 20,
        frequency: 1.2,
        impressions: 2000,
        clicks: 40,
        lastUpdated: new Date().toISOString(),
      };

      const evalResult = DecisionEngine.evaluate(lowSampleMetrics, dummyProd, 10);
      // Con 1 sola conversión, debe responder KEEP_RUNNING (proteger contra decisiones apresuradas)
      if (evalResult.action === 'KEEP_RUNNING' && !evalResult.isSampleSufficient) {
        results.push({
          id: 'TEST-DEC-01',
          title: 'Protección contra Muestra Estadística Insuficiente',
          category: 'DECISION_ENGINE',
          status: 'PASSED',
          message: `Bloqueó decisión drástica con solo 1 conversión. Confidence score: ${(evalResult.confidenceScore * 100).toFixed(0)}%. Acción: KEEP_RUNNING.`,
          durationMs: Number((performance.now() - startT2).toFixed(2)),
        });
      } else {
        throw new Error(`Permitió acción no autorizada con muestra insuficiente: ${evalResult.action}`);
      }
    } catch (e: any) {
      results.push({
        id: 'TEST-DEC-01',
        title: 'Protección contra Muestra Estadística Insuficiente',
        category: 'DECISION_ENGINE',
        status: 'FAILED',
        message: e.message,
        durationMs: Number((performance.now() - startT2).toFixed(2)),
      });
    }

    // TEST 3: Risk Engine CLAMPING OBLIGATORIO: IA pide +80% -> Risk Engine limita a +20%
    const startT3 = performance.now();
    try {
      const dummyProd = FinancialEngine.calculateProductMetrics({
        name: 'Test Scale Prod',
        sku: 'TP-SCALE',
        cost: 30,
        sellingPrice: 120,
        stock: 100,
        shippingCost: 10,
        platformFee: 5,
        otherCosts: 5,
        minProfitTarget: 30,
      });

      const excellentMetrics: AdPerformanceMetrics = {
        spend: 200,
        attributedRevenue: 1000,
        netProfit: 400,
        conversions: 15,
        roas: 5.0,
        cpa: 13.3,
        cpc: 0.6,
        ctr: 3.2,
        cpm: 15,
        frequency: 1.4,
        impressions: 13000,
        clicks: 330,
        lastUpdated: new Date().toISOString(),
      };

      const proposal: ProposedAction = {
        type: 'INCREASE_BUDGET',
        deltaPercent: 80, // Solicitud temeraria del agente LLM
        currentBudget: 100,
        campaignId: 'camp_test_01',
        source: 'LLM_AGENT',
        reasoning: 'El agente LLM solicita agresivamente +80% de incremento',
      };

      const riskResult = RiskEngine.evaluateAndClamp(
        proposal,
        RiskEngine.DEFAULT_CONFIG,
        'AUTONOMOUS',
        dummyProd,
        excellentMetrics,
        300
      );

      // Verificamos que el incremento fue clampado al máximo legal de +20% ($120 diario en vez de $180)
      const isClamped = riskResult.approvedAction.riskClamped;
      const clampedBudget = riskResult.approvedAction.budgetApproved;

      if (isClamped && clampedBudget === 120) {
        results.push({
          id: 'TEST-RISK-01',
          title: 'Risk Guardrail Invariant: Clamping de Incremento +80% a +20%',
          category: 'RISK_ENGINE',
          status: 'PASSED',
          message: `El LLM solicitó +80% ($180/día). Risk Engine clampó legalmente a +20% ($120/día). Motivo registrado: "${riskResult.reason}"`,
          durationMs: Number((performance.now() - startT3).toFixed(2)),
          details: { requestedBudget: 180, approvedBudget: clampedBudget, clampReason: riskResult.reason }
        });
      } else {
        throw new Error(`Falla de contención: el presupuesto aprobado fue $${clampedBudget}`);
      }
    } catch (e: any) {
      results.push({
        id: 'TEST-RISK-01',
        title: 'Risk Guardrail Invariant: Clamping de Incremento +80% a +20%',
        category: 'RISK_ENGINE',
        status: 'FAILED',
        message: e.message,
        durationMs: Number((performance.now() - startT3).toFixed(2)),
      });
    }

    // TEST 4: Risk Engine bloquea escalado si el stock es crítico (< 10 unidades)
    const startT4 = performance.now();
    try {
      const lowStockProd = FinancialEngine.calculateProductMetrics({
        name: 'Low Stock Gadget',
        sku: 'LS-01',
        cost: 20,
        sellingPrice: 100,
        stock: 3, // Solo 3 unidades disponibles
        shippingCost: 10,
        platformFee: 5,
        otherCosts: 5,
        minProfitTarget: 20,
      });

      const metrics: AdPerformanceMetrics = {
        spend: 100,
        attributedRevenue: 500,
        netProfit: 200,
        conversions: 8,
        roas: 5.0,
        cpa: 12.5,
        cpc: 0.5,
        ctr: 2.8,
        cpm: 14,
        frequency: 1.3,
        impressions: 7000,
        clicks: 200,
        lastUpdated: new Date().toISOString(),
      };

      const proposal: ProposedAction = {
        type: 'INCREASE_BUDGET',
        deltaPercent: 20,
        currentBudget: 50,
        campaignId: 'camp_low_stock',
        source: 'LLM_AGENT',
        reasoning: 'Escalar por buen ROAS',
      };

      const riskResult = RiskEngine.evaluateAndClamp(
        proposal,
        RiskEngine.DEFAULT_CONFIG,
        'AUTONOMOUS',
        lowStockProd,
        metrics,
        200
      );

      if (riskResult.approvedAction.type === 'KEEP_RUNNING' && riskResult.violatesGuardrail) {
        results.push({
          id: 'TEST-RISK-02',
          title: 'Bloqueo de Escalado por Rotura de Stock Inminente',
          category: 'GUARDRAIL_INVARIANT',
          status: 'PASSED',
          message: `Escalado rechazado con éxito: Stock=3 unidades. Se protegió al cliente contra quiebre de inventario.`,
          durationMs: Number((performance.now() - startT4).toFixed(2)),
        });
      } else {
        throw new Error(`Permitió escalar con stock crítico de 3 unidades`);
      }
    } catch (e: any) {
      results.push({
        id: 'TEST-RISK-02',
        title: 'Bloqueo de Escalado por Rotura de Stock Inminente',
        category: 'GUARDRAIL_INVARIANT',
        status: 'FAILED',
        message: e.message,
        durationMs: Number((performance.now() - startT4).toFixed(2)),
      });
    }

    // TEST 5: Detección y Contención de Fatiga Publicitaria
    const startT5 = performance.now();
    try {
      const prod = FinancialEngine.calculateProductMetrics({
        name: 'Fatigue Test',
        sku: 'FT-01',
        cost: 15,
        sellingPrice: 80,
        stock: 100,
        shippingCost: 8,
        platformFee: 4,
        otherCosts: 3,
        minProfitTarget: 20,
      });

      const fatiguedAd = {
        id: 'ad_fatigued_1',
        campaignId: 'camp_fatigue',
        name: 'Anuncio con audiencia quemada',
        creative: {
          id: 'c_fatigued',
          title: 'Creatividad original agotada',
          angle: 'Ángulo saturado',
          hook: 'Gancho repetido',
          headline: 'Titular',
          primaryText: 'Texto',
          callToAction: 'Comprar',
          imagePrompt: '',
          videoPrompt: '',
          score: 80,
          status: 'WINNER' as const,
          variantVersion: 1
        },
        metrics: {
          spend: 400,
          attributedRevenue: 800,
          netProfit: 100,
          conversions: 10,
          roas: 2.0,
          cpa: 40,
          cpc: 2.1,
          ctr: 0.85, // Caída drástica de CTR
          cpm: 28,
          frequency: 3.8, // Frecuencia muy alta
          impressions: 18000,
          clicks: 190,
          lastUpdated: new Date().toISOString()
        },
        status: 'ACTIVE' as const,
        fatigueScore: 82,
        isWinner: true,
        isExperimental: false,
        platform: 'meta' as const,
        budgetAllocated: 50,
        createdAt: new Date().toISOString()
      };

      const fatigueEval = TestingEngine.evaluateFatigue(fatiguedAd, prod, 2.5);
      if (fatigueEval.isFatigued && fatigueEval.recommendation === 'MIGRATE_BUDGET_TO_VARIANT') {
        results.push({
          id: 'TEST-FAT-01',
          title: 'Detección Automática de Fatiga y Creación de Variante',
          category: 'GUARDRAIL_INVARIANT',
          status: 'PASSED',
          message: `Fatiga detectada correctamente (${fatigueEval.fatigueScore}/100, Frecuencia 3.8x, CTR 0.85%). Recomendación: ${fatigueEval.recommendation}`,
          durationMs: Number((performance.now() - startT5).toFixed(2)),
        });
      } else {
        throw new Error(`No detectó fatiga en anuncio con frecuencia 3.8x y CTR 0.85%`);
      }
    } catch (e: any) {
      results.push({
        id: 'TEST-FAT-01',
        title: 'Detección Automática de Fatiga y Creación de Variante',
        category: 'GUARDRAIL_INVARIANT',
        status: 'FAILED',
        message: e.message,
        durationMs: Number((performance.now() - startT5).toFixed(2)),
      });
    }

    return results;
  }
}
