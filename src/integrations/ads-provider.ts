import { PlatformType, Campaign, CampaignAd, AdPerformanceMetrics, CreativeConcept } from '../types';

export interface AdAccountInfo {
  id: string;
  name: string;
  platform: PlatformType;
  currency: string;
  timezone: string;
  status: 'ACTIVE' | 'DISABLED' | 'PENDING';
  dailyBudgetCap: number;
  balance?: number;
}

export interface CreateCampaignPayload {
  name: string;
  productId: string;
  objective: string;
  dailyBudget: number;
  platform: PlatformType;
  country: string;
  creatives: CreativeConcept[];
}

export interface UpdateBudgetPayload {
  campaignId: string;
  adId?: string;
  newDailyBudget: number;
  reason: string;
}

/**
 * Interfaz unificada de abstracción para proveedores de publicidad digital.
 * Desacopla la lógica de AllSender Ads de APIs externas específicas (Zernio, Meta, Google, TikTok).
 */
export interface AdsProvider {
  readonly providerId: string;
  readonly providerName: string;
  readonly isLiveMode: boolean;

  // Cuentas
  getAccounts(): Promise<AdAccountInfo[]>;
  
  // Campañas
  getCampaigns(accountId: string): Promise<Campaign[]>;
  createCampaign(accountId: string, payload: CreateCampaignPayload): Promise<Campaign>;
  pauseCampaign(campaignId: string): Promise<boolean>;
  resumeCampaign(campaignId: string): Promise<boolean>;

  // Anuncios y Creatividades
  getAds(campaignId: string): Promise<CampaignAd[]>;
  pauseAd(adId: string): Promise<boolean>;
  scaleAdBudget(payload: UpdateBudgetPayload): Promise<boolean>;
  deployCreativeVariant(campaignId: string, variant: CreativeConcept): Promise<CampaignAd>;

  // Métricas & Insights
  getInsights(campaignId: string, timeRange?: string): Promise<AdPerformanceMetrics>;
  
  // Audiencias
  syncAudience(accountId: string, name: string, criteria: Record<string, any>): Promise<string>;
}
