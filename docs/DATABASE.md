# Modelo de Datos & Esquema — AllSender Ads

Este documento describe la estructura de datos relacional y de documentos utilizada por AllSender Ads para soportar la persistencia de productos, campañas, creatividades y registros de auditoría.

---

## 1. Entidades Principales

### `Product`
- `id`: string (UUID)
- `name`: string
- `sku`: string (Unique)
- `cost`: decimal
- `sellingPrice`: decimal
- `salePrice`: decimal (nullable)
- `stock`: integer
- `shippingCost`: decimal
- `platformFee`: decimal
- `otherCosts`: decimal
- `minProfitTarget`: decimal
- `landingPage`: string
- `grossMargin`: decimal (Calculado)
- `profitBeforeAds`: decimal (Calculado)
- `maxProfitableCPA`: decimal (Calculado)
- `minProfitableROAS`: decimal (Calculado)
- `recommendedDailyBudget`: decimal (Calculado)

### `Campaign`
- `id`: string
- `productId`: string (FK -> Product.id)
- `name`: string
- `objective`: string (e.g. CONVERSIONS, SEARCH_PURCHASE)
- `platform`: enum ('meta', 'google', 'tiktok')
- `dailyBudget`: decimal
- `experimentalBudgetPercent`: integer (Default: 15)
- `status`: enum ('ACTIVE', 'PAUSED', 'LEARNING', 'TESTING', 'FATIGUED')

### `CampaignAd`
- `id`: string
- `campaignId`: string (FK -> Campaign.id)
- `name`: string
- `status`: enum ('ACTIVE', 'PAUSED', 'TESTING')
- `fatigueScore`: integer (0 - 100)
- `isWinner`: boolean
- `isExperimental`: boolean
- `budgetAllocated`: decimal

### `AIActionLog`
- `id`: string
- `timestamp`: ISO-8601 string
- `accountId`: string
- `productId`: string
- `campaignId`: string
- `adId`: string (nullable)
- `aiAgent`: string
- `aiModel`: string
- `metricsBefore`: JSON (`cpa`, `roas`, `spend`, `conversions`, `frequency`)
- `reasoning`: text
- `requestedAction`: JSON (`type`, `delta`)
- `approvedAction`: JSON (`type`, `delta`, `riskClamped`, `clampingReason`)
- `executedAction`: text
- `status`: enum ('EXECUTED', 'PENDING_APPROVAL', 'USER_APPROVED', 'USER_REJECTED')
- `metricsAfter`: JSON (nullable)

### `MastraMemory`
- `id`: string
- `date`: date
- `category`: enum ('CREATIVE_WINNER', 'AUDIENCE_INSIGHT', 'FATIGUE_PATTERN', 'SEASONALITY')
- `productId`: string
- `summary`: text
- `confidenceScore`: decimal (0.00 - 1.00)
- `keyTakeaway`: text
- `metricsProof`: text
