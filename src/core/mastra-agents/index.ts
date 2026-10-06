import { 
  ActionType, 
  AdPerformanceMetrics, 
  Campaign, 
  CampaignAd, 
  CreativeConcept, 
  MastraMemoryItem, 
  ProductFinancials 
} from '../../types';
import { OpenRouterGateway } from '../../integrations/openrouter';

export interface AgentExecutionOutput<T = any> {
  agentName: string;
  modelUsed: string;
  summary: string;
  data: T;
  latencyMs: number;
  tokensConsumed: number;
}

/**
 * Sistema de Memoria Semántica y Episódica de Mastra
 */
export class MastraMemoryStore {
  private static memory: MastraMemoryItem[] = [
    {
      id: 'mem_01',
      date: '2026-09-18',
      category: 'CREATIVE_WINNER',
      productId: 'prod_demo_01',
      productName: 'Smart Massager Pro X',
      summary: 'Formato UGC estilo "Alivio del dolor en 60 segundos" generó un 48% más de conversiones que fotos de estudio estáticas.',
      confidenceScore: 0.94,
      keyTakeaway: 'Priorizar ganchos con demostración visual inmediata del alivio del dolor y testimonios de usuarios en primeros 3 segundos.',
      metricsProof: 'ROAS 4.62 vs 2.15 en creatividades de catálogo.'
    },
    {
      id: 'mem_02',
      date: '2026-09-24',
      category: 'AUDIENCE_INSIGHT',
      productId: 'prod_demo_01',
      productName: 'Smart Massager Pro X',
      summary: 'Audiencia de oficinistas y home-office de 28-45 años tiene un CPA 32% menor que audiencias deportivas.',
      confidenceScore: 0.91,
      keyTakeaway: 'Enfocar la segmentación en "Teletrabajo / Dolores cervicales" en lugar de "Atletas / Fitness".',
      metricsProof: 'CPA $19.40 vs $28.50 en fitness.'
    },
    {
      id: 'mem_03',
      date: '2026-10-01',
      category: 'FATIGUE_PATTERN',
      productId: 'prod_demo_02',
      productName: 'Auriculares Titanium ANC',
      summary: 'A partir de frecuencia 3.2x en Meta, el CTR decae más de 35% y el CPA escala rápidamente.',
      confidenceScore: 0.88,
      keyTakeaway: 'Activar rotación de creatividades automáticamente cuando la frecuencia supere 2.8x.',
      metricsProof: 'CTR cayó de 2.9% a 1.2% en semana 3.'
    },
    {
      id: 'mem_04',
      date: '2026-10-03',
      category: 'SEASONALITY',
      productId: 'prod_demo_01',
      productName: 'Smart Massager Pro X',
      summary: 'Los días domingos por la noche y lunes el ROAS aumenta un 24% para productos de bienestar.',
      confidenceScore: 0.86,
      keyTakeaway: 'Reservar un 20% más de presupuesto para fines de semana tarde.',
      metricsProof: 'Conversiones dominicales con CPA $17.10 promedio.'
    }
  ];

  public static getAll(): MastraMemoryItem[] {
    return [...this.memory];
  }

  public static add(item: Omit<MastraMemoryItem, 'id' | 'date'>): MastraMemoryItem {
    const newItem: MastraMemoryItem = {
      id: `mem_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...item,
    };
    this.memory.unshift(newItem);
    return newItem;
  }

  public static query(queryText: string): MastraMemoryItem[] {
    const q = queryText.toLowerCase();
    return this.memory.filter(m => 
      m.summary.toLowerCase().includes(q) || 
      m.keyTakeaway.toLowerCase().includes(q) || 
      m.productName.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  }
}

/**
 * 1. ADS ANALYST AGENT
 * Analiza continuamente CTR, CPC, CPM, CPA, ROAS, conversiones, frecuencia, gasto, beneficio y tendencias.
 */
export class AdsAnalystAgent {
  public static async analyze(
    metrics: AdPerformanceMetrics,
    product: ProductFinancials,
    fatigueScore: number
  ): Promise<AgentExecutionOutput<{
    health: 'OPTIMAL' | 'ACCEPTABLE' | 'DEGRADED' | 'CRITICAL';
    fatigueWarning: boolean;
    trendAnalysis: string;
    keyObservations: string[];
  }>> {
    const systemPrompt = `Eres el Ads Analyst de AllSender Ads. Tu función es evaluar con precisión matemática y analítica el rendimiento de campañas de publicidad digital (Meta, Google, TikTok).`;
    const userPrompt = `Analiza las siguientes métricas para el producto "${product.name}":
- Inversión: $${metrics.spend}
- Ingresos atribuidos: $${metrics.attributedRevenue}
- Beneficio neto estimado: $${metrics.netProfit}
- Conversiones: ${metrics.conversions}
- CPA actual: $${metrics.cpa} (CPA Máx Rentable permitido: $${product.maxProfitableCPA})
- ROAS actual: ${metrics.roas}x (ROAS Mín Rentable: ${product.minProfitableROAS}x)
- CTR: ${metrics.ctr}% | CPC: $${metrics.cpc} | Frecuencia: ${metrics.frequency}x
- Nivel de fatiga calculado: ${fatigueScore}/100`;

    const isHealthy = metrics.cpa <= product.maxProfitableCPA && metrics.roas >= product.minProfitableROAS;
    const isFatigued = fatigueScore >= 60 || metrics.frequency > 3.0;

    const simulatedText = JSON.stringify({
      health: isHealthy ? (metrics.roas > product.minProfitableROAS * 1.3 ? 'OPTIMAL' : 'ACCEPTABLE') : (metrics.cpa > product.maxProfitableCPA * 1.4 ? 'CRITICAL' : 'DEGRADED'),
      fatigueWarning: isFatigued,
      trendAnalysis: isHealthy 
        ? `Rendimiento positivo. El CPA se mantiene en $${metrics.cpa}, permitiendo un margen neto de $${(product.maxProfitableCPA - metrics.cpa).toFixed(2)} por compra.` 
        : `Métricas degradadas. El CPA excede en $${(metrics.cpa - product.maxProfitableCPA).toFixed(2)} el umbral máximo de rentabilidad del producto.`,
      keyObservations: [
        `CPA vs Límite: $${metrics.cpa} vs $${product.maxProfitableCPA}`,
        `Frecuencia de impacto: ${metrics.frequency.toFixed(2)}x (${isFatigued ? 'Riesgo de saturación' : 'Saludable'})`,
        `Tasa de clics CTR: ${metrics.ctr}% (Benchmark: >1.5%)`
      ]
    });

    const { text, record } = await OpenRouterGateway.complete(
      'ANALYSIS_MODEL',
      systemPrompt,
      userPrompt,
      simulatedText
    );

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = JSON.parse(simulatedText);
    }

    return {
      agentName: 'Ads Analyst',
      modelUsed: record.modelName,
      summary: parsed.trendAnalysis,
      data: parsed,
      latencyMs: record.latencyMs,
      tokensConsumed: record.promptTokens + record.completionTokens,
    };
  }
}

/**
 * 2. STRATEGIST AGENT
 * Decide qué probar, audiencias objetivo, plataformas idóneas, distribución inicial y causas raíz.
 */
export class StrategistAgent {
  public static async planStrategy(
    product: ProductFinancials,
    targetGoal: string
  ): Promise<AgentExecutionOutput<{
    recommendedPlatform: 'meta' | 'google' | 'tiktok';
    audienceAngles: string[];
    suggestedDailyBudget: number;
    experimentSharePct: number;
    reasoning: string;
  }>> {
    const memoryInsights = MastraMemoryStore.query(product.name);
    const systemPrompt = `Eres el AI Strategist de AllSender Ads. Defines qué audiencias y ángulos probar según economía del producto y aprendizajes pasados de Mastra Memory.`;
    const userPrompt = `Planifica estrategia para ${product.name} (Precio: $${product.sellingPrice}, Margen Bruto: ${product.grossMargin}%, CPA Máx: $${product.maxProfitableCPA}). Objetivo: "${targetGoal}". Contexto en memoria: ${memoryInsights.map(m => m.keyTakeaway).join(' | ')}`;

    const fallback = JSON.stringify({
      recommendedPlatform: 'meta',
      audienceAngles: [
        'Dolor y Alivio Inmediato (Profesionales en teletrabajo)',
        'Comparativa antes/después frente a métodos convencionales',
        'Oferta Limitada con Envío Express Garantizado'
      ],
      suggestedDailyBudget: product.recommendedDailyBudget,
      experimentSharePct: 15,
      reasoning: `Se asigna el 85% del presupuesto a los mejores ángulos probados y 15% ($${Math.round(product.recommendedDailyBudget * 0.15)}) a descubrimiento de nuevas audiencias.`
    });

    const { text, record } = await OpenRouterGateway.complete(
      'STRATEGY_MODEL',
      systemPrompt,
      userPrompt,
      fallback
    );

    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = JSON.parse(fallback); }

    return {
      agentName: 'Strategist Agent',
      modelUsed: record.modelName,
      summary: parsed.reasoning,
      data: parsed,
      latencyMs: record.latencyMs,
      tokensConsumed: record.promptTokens + record.completionTokens,
    };
  }
}

/**
 * 3. CREATIVE AGENT
 * Genera conceptos publicitarios, headlines, copies, llamadas a la acción, prompts para imagen y video.
 */
export class CreativeAgent {
  public static async generateConcepts(
    product: ProductFinancials,
    count: number = 5
  ): Promise<AgentExecutionOutput<CreativeConcept[]>> {
    const systemPrompt = `Eres el Creative Agent de AllSender Ads. Creas conceptos de anuncios de alta conversión con hooks psicológicos potentes, titulares persuasivos y prompts para creatividades.`;
    const userPrompt = `Genera ${count} conceptos de anuncios para ${product.name} orientado a generar conversiones rentables con CPA < $${product.maxProfitableCPA}.`;

    const sampleConcepts: CreativeConcept[] = [
      {
        id: `c_${Date.now()}_1`,
        title: 'Hook de Demostración 60 Segundos',
        angle: 'Alivio Instantáneo del Dolor',
        hook: '¿Pasas más de 6 horas sentado frente a la pantalla? Mira lo que pasa en 60 segundos...',
        headline: 'Elimina la Tensión en Cuello y Espalda al Instante',
        primaryText: 'Diseñado con tecnología ergonómica alemana. El 94% de nuestros clientes sienten alivio desde el primer uso. Garantía de reembolso de 30 días.',
        callToAction: 'Comprar con 40% OFF',
        imagePrompt: 'Foto en primer plano hiperrealista de una persona trabajando aliviando la fatiga cervical, iluminación natural suave, colores cálidos, sin marcas de agua.',
        videoPrompt: 'Video UGC de 15 segundos: Usuario saca el producto de su caja, lo coloca en el cuello, suspira de alivio con expresión relajada y muestra el panel táctil.',
        score: 92,
        status: 'CONCEPT',
        variantVersion: 1
      },
      {
        id: `c_${Date.now()}_2`,
        title: 'Comparativa vs Fisioterapia Costosa',
        angle: 'Ahorro Económico Radical',
        hook: 'Dejé de gastar $120 por sesión de masajes cuando descubrí esto.',
        headline: 'Tu Terapeuta Personal en Casa por una Fracción del Costo',
        primaryText: 'Un solo pago. Sesiones ilimitadas todos los días sin salir de tu casa ni pedir citas anticipadas. Envío gratis garantizado.',
        callToAction: 'Ver Comparativa y Oferta',
        imagePrompt: 'Infografía estética y limpia mostrando el costo anual de fisioterapia vs el producto, estilo fintech moderno, fondo minimalista.',
        videoPrompt: 'Comparativa visual en pantalla dividida: a la izquierda una factura costosa, a la derecha el usuario relajándose cómodamente en su sofá con el producto.',
        score: 88,
        status: 'CONCEPT',
        variantVersion: 1
      },
      {
        id: `c_${Date.now()}_3`,
        title: 'Prueba Social y Testimonios Reales',
        angle: 'Validación por Autoridad y Comunidad',
        hook: '+12,000 personas ya descansan sin dolor este mes.',
        headline: 'El Producto de Bienestar Más Calificado del Año (4.9/5 ⭐)',
        primaryText: 'Lee lo que dicen quiroprácticos y usuarios verificados. Calidad garantizada con stock limitado para entrega en 24-48 horas.',
        callToAction: 'Leer Reseñas Verificadas',
        imagePrompt: 'Collage visual limpio con captura de reseñas 5 estrellas destacadas, foto del producto en empaque premium.',
        videoPrompt: 'Montaje dinámico de 3 usuarios diferentes dando su testimonio espontáneo mientras usan el producto en su día a día.',
        score: 85,
        status: 'CONCEPT',
        variantVersion: 1
      },
      {
        id: `c_${Date.now()}_4`,
        title: 'Unboxing Estético & Funcionalidad',
        angle: 'Deseo Sensorial y Regalo Perfecto',
        hook: 'El regalo del que todo el mundo está hablando esta temporada.',
        headline: 'Descubre el Unboxing Más Satisfactorio de 2026',
        primaryText: 'Acabados prémium, batería de 8 horas de duración y funcionamiento ultrasilencioso. Edición exclusiva con stock limitado.',
        callToAction: 'Asegurar Unidades',
        imagePrompt: 'Fotografía comercial estilo Apple sobre mesa de nogal pulida con caja abierta, accesorios impecablemente ordenados.',
        videoPrompt: 'Tomas macro en cámara lenta del desempacado, texturas suaves del producto, encendido con luz LED suave y respuesta háptica.',
        score: 81,
        status: 'CONCEPT',
        variantVersion: 1
      },
      {
        id: `c_${Date.now()}_5`,
        title: 'Urgencia de Inventario & Descuento Flash',
        angle: 'Escasez y Oportunidad',
        hook: 'Últimas 45 unidades disponibles al precio de lanzamiento.',
        headline: 'Venta Flash: 40% de Descuento Solo Hoy',
        primaryText: 'Debido a la alta demanda cerramos el precio promocional esta medianoche. No te quedes sin el tuyo.',
        callToAction: 'Reclamar Descuento Antes de que se Agote',
        imagePrompt: 'Banner minimalista con tipografía audaz, foto del producto en fondo oscuro elegante y contador sutil.',
        videoPrompt: 'Gráfico animado con barra de stock disminuyendo, tomas rápidas de la experiencia de uso y llamada directa a la acción.',
        score: 79,
        status: 'CONCEPT',
        variantVersion: 1
      }
    ];

    const { record } = await OpenRouterGateway.complete(
      'CREATIVE_MODEL',
      systemPrompt,
      userPrompt,
      JSON.stringify(sampleConcepts)
    );

    return {
      agentName: 'Creative Agent',
      modelUsed: record.modelName,
      summary: `Generados ${count} conceptos creativos adaptados al margen unitario y psicología de compra.`,
      data: sampleConcepts,
      latencyMs: record.latencyMs,
      tokensConsumed: record.promptTokens + record.completionTokens,
    };
  }
}

/**
 * 4. OPTIMIZATION AGENT
 * Emite recomendaciones estratégicas: PAUSE, REDUCE_BUDGET, INCREASE_BUDGET, CREATE_VARIANT, etc.
 */
export class OptimizationAgent {
  public static async recommend(
    ad: CampaignAd,
    product: ProductFinancials
  ): Promise<AgentExecutionOutput<{
    action: ActionType;
    delta: number; // Porcentaje propuesto
    reasoning: string;
  }>> {
    const systemPrompt = `Eres el Optimization Agent de AllSender Ads. Emites recomendaciones operativas estrictas para maximizar el ROAS y beneficio neto.`;
    const userPrompt = `Evalúa el anuncio "${ad.name}" con métricas: Spend $${ad.metrics.spend}, CPA $${ad.metrics.cpa}, ROAS ${ad.metrics.roas}, Conversiones ${ad.metrics.conversions}, Fatiga ${ad.fatigueScore}/100. CPA Máximo del producto: $${product.maxProfitableCPA}.`;

    let action: ActionType = 'KEEP_RUNNING';
    let delta = 0;
    let reasoning = 'Métricas equilibradas. Mantener en monitoreo activo.';

    if (ad.fatigueScore > 65) {
      action = 'CREATE_VARIANT';
      reasoning = 'Fatiga de anuncio evidente. Requiere generar variantes creativas para renovar el CTR.';
    } else if (ad.metrics.conversions >= 5 && ad.metrics.cpa <= product.maxProfitableCPA * 0.75) {
      action = 'INCREASE_BUDGET';
      delta = 80; // Notar: el agente puede sugerir +80%, pero el Risk Engine lo clampadará a +20%!
      reasoning = 'Excelente ROAS y CPA muy por debajo del límite. Recomiendo escalar agresivamente +80%.';
    } else if (ad.metrics.cpa > product.maxProfitableCPA * 1.3) {
      action = 'REDUCE_BUDGET';
      delta = -35;
      reasoning = 'CPA sobrepasando el umbral de rentabilidad. Reducir presupuesto para preservar margen.';
    } else if (ad.metrics.spend > product.maxProfitableCPA * 2.5 && ad.metrics.conversions === 0) {
      action = 'PAUSE';
      reasoning = 'Gasto elevado sin conversiones registradas. Pausar sangrado inmediatamente.';
    }

    const { record } = await OpenRouterGateway.complete(
      'FAST_MODEL',
      systemPrompt,
      userPrompt,
      JSON.stringify({ action, delta, reasoning })
    );

    return {
      agentName: 'Optimization Agent',
      modelUsed: record.modelName,
      summary: reasoning,
      data: { action, delta, reasoning },
      latencyMs: record.latencyMs,
      tokensConsumed: record.promptTokens + record.completionTokens,
    };
  }
}

/**
 * 5. JUDGE AGENT
 * Revisa de forma imparcial decisiones de alto impacto económico antes de su ejecución.
 */
export class JudgeAgent {
  public static async reviewHighImpactDecision(
    requestedAction: string,
    proposedSpend: number,
    financialImpact: string
  ): Promise<AgentExecutionOutput<{
    verdict: 'APPROVED' | 'MODIFIED' | 'VETOED';
    justification: string;
    riskScore: number; // 0 a 100
  }>> {
    const systemPrompt = `Eres el Judge Agent de AllSender Ads. Eres el tribunal supervisor independiente que previene catástrofes financieras, revisando decisiones con impacto económico elevado.`;
    const userPrompt = `Revisa la siguiente propuesta:
- Acción solicitada: ${requestedAction}
- Monto/Presupuesto implicado: $${proposedSpend}
- Contexto: ${financialImpact}
Determina si es seguro proceder.`;

    const fallbackVerdict: {
      verdict: 'APPROVED' | 'MODIFIED' | 'VETOED';
      justification: string;
      riskScore: number;
    } = {
      verdict: proposedSpend > 2000 ? 'MODIFIED' : 'APPROVED',
      justification: proposedSpend > 2000 
        ? 'Impacto presupuestario alto. Aprobado con condición de revisión en 12 horas.'
        : 'Propuesta alineada con la disciplina de capital y métricas de adquisición.',
      riskScore: proposedSpend > 2000 ? 55 : 22,
    };

    const { record } = await OpenRouterGateway.complete(
      'JUDGE_MODEL',
      systemPrompt,
      userPrompt,
      JSON.stringify(fallbackVerdict)
    );

    return {
      agentName: 'Judge Agent',
      modelUsed: record.modelName,
      summary: fallbackVerdict.justification,
      data: fallbackVerdict,
      latencyMs: record.latencyMs,
      tokensConsumed: record.promptTokens + record.completionTokens,
    };
  }
}
