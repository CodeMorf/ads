import { ProductFinancials } from '../types';

export interface ProductInput {
  id?: string;
  name: string;
  sku: string;
  cost: number;
  sellingPrice: number;
  salePrice?: number;
  stock: number;
  shippingCost: number;
  platformFee: number;
  otherCosts: number;
  minProfitTarget: number;
  images?: string[];
  videos?: string[];
  landingPage?: string;
  currency?: string;
  category?: string;
}

/**
 * Motor Financiero Determinista de AllSender Ads
 * Calcula márgenes y umbrales matemáticos exactos requeridos antes de cualquier acción publicitaria.
 */
export class FinancialEngine {
  /**
   * Calcula todas las métricas financieras derivadas para un producto.
   */
  public static calculateProductMetrics(input: ProductInput): ProductFinancials {
    const effectivePrice = (input.salePrice && input.salePrice > 0) ? input.salePrice : input.sellingPrice;
    
    // Total de costos directos antes de publicidad (Costo de adquisición de inventario + Envío + Comisiones + Otros)
    const directCosts = input.cost + input.shippingCost + input.platformFee + input.otherCosts;

    // Beneficio neto antes de inversión publicitaria
    const profitBeforeAds = Math.max(0, effectivePrice - directCosts);

    // Margen bruto porcentual sobre el precio efectivo
    const grossMargin = effectivePrice > 0 
      ? Number(((profitBeforeAds / effectivePrice) * 100).toFixed(2)) 
      : 0;

    // CPA Máximo Rentable: lo máximo que podemos gastar en adquirir un cliente 
    // garantizando que aún nos quede el beneficio mínimo deseado por unidad
    const maxProfitableCPA = Math.max(0, profitBeforeAds - input.minProfitTarget);

    // ROAS Mínimo Rentable: ingresos generados divididos entre el CPA máximo admisible
    // ROAS = Precio / CPA Max
    const minProfitableROAS = maxProfitableCPA > 0 
      ? Number((effectivePrice / maxProfitableCPA).toFixed(2)) 
      : 99.0;

    // Presupuesto diario inicial recomendado:
    // Permite buscar entre 3 y 5 ventas diarias iniciales + un 15% de holgura para experimentación
    const targetDailyConversions = 4;
    const recommendedDailyBudget = Math.round(maxProfitableCPA * targetDailyConversions * 1.15);

    return {
      id: input.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: input.name,
      sku: input.sku,
      cost: input.cost,
      sellingPrice: input.sellingPrice,
      salePrice: input.salePrice,
      stock: input.stock,
      shippingCost: input.shippingCost,
      platformFee: input.platformFee,
      otherCosts: input.otherCosts,
      minProfitTarget: input.minProfitTarget,
      images: input.images || [],
      videos: input.videos || [],
      landingPage: input.landingPage || '',
      currency: input.currency || 'USD',
      category: input.category || 'General',
      grossMargin,
      profitBeforeAds,
      maxProfitableCPA,
      minProfitableROAS,
      recommendedDailyBudget,
    };
  }

  /**
   * Calcula el beneficio neto real generado por una campaña publicitaria:
   * Beneficio Neto = (Conversiones * Beneficio antes de Ads) - Gasto publicitario
   */
  public static calculateCampaignNetProfit(
    conversions: number,
    profitBeforeAds: number,
    adSpend: number
  ): number {
    const grossGeneratedProfit = conversions * profitBeforeAds;
    return Number((grossGeneratedProfit - adSpend).toFixed(2));
  }

  /**
   * Evalúa la salud financiera de una métrica de campaña contra los umbrales del producto
   */
  public static evaluateFinancialHealth(
    currentCPA: number,
    currentROAS: number,
    maxCPA: number,
    minROAS: number
  ): {
    status: 'EXCELLENT' | 'HEALTHY' | 'WARNING' | 'CRITICAL';
    cpaMargin: number; // Positivo si estamos por debajo del CPA max (bueno)
    roasBuffer: number; // Positivo si estamos por encima del ROAS min (bueno)
    summary: string;
  } {
    const cpaMargin = maxCPA - currentCPA;
    const roasBuffer = currentROAS - minROAS;

    if (currentCPA <= maxCPA * 0.75 && currentROAS >= minROAS * 1.3) {
      return {
        status: 'EXCELLENT',
        cpaMargin,
        roasBuffer,
        summary: 'Rendimiento altamente rentable. Margen amplio para escalar.',
      };
    }

    if (currentCPA <= maxCPA && currentROAS >= minROAS) {
      return {
        status: 'HEALTHY',
        cpaMargin,
        roasBuffer,
        summary: 'Operando dentro del umbral de rentabilidad.',
      };
    }

    if (currentCPA <= maxCPA * 1.2 || currentROAS >= minROAS * 0.85) {
      return {
        status: 'WARNING',
        cpaMargin,
        roasBuffer,
        summary: 'CPA rozando el límite máximo o ROAS degradado. Requiere optimización.',
      };
    }

    return {
      status: 'CRITICAL',
      cpaMargin,
      roasBuffer,
      summary: 'Pérdida por adquisición. CPA supera el beneficio unitario admisible.',
    };
  }
}
