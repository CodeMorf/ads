# Integración con Zernio & Abstracción AdsProvider

## 1. Arquitectura de Desacoplamiento

La plataforma AllSender Ads nunca acopla su lógica comercial ni el Decision Engine directamente a un SDK propietario. Toda la interacción se realiza mediante la abstracción unificada `AdsProvider`.

```text
               ┌───────────────────────────────┐
               │    AllSender Ads Core Logic   │
               └───────────────┬───────────────┘
                               │
               ┌───────────────▼───────────────┐
               │      interface AdsProvider    │
               └───────────────┬───────────────┘
                               │
       ┌───────────────────────┼────────────────────────┐
       │                       │                        │
┌──────▼────────┐     ┌────────▼───────┐     ┌──────────▼────────┐
│ ZernioProvider│     │MetaDirect (fut)│     │GoogleDirect (fut) │
└──────┬────────┘     └────────────────┘     └───────────────────┘
       │
┌──────▼────────────────────────────────┐
│ Zernio Omni-Ads Hub                   │
│ (Meta Ads, Google Ads, TikTok Ads)    │
└───────────────────────────────────────┘
```

---

## 2. Servicios del Módulo `/integrations/zernio`

1. **`accounts`**: Listado de cuentas publicitarias vinculadas, monedas, husos horarios y techos diarios.
2. **`campaigns`**: Creación, consulta, pausa y reactivación de campañas publicitarias.
3. **`adsets` & `ads`**: Gestión de conjuntos y anuncios individuales, control de estado y presupuestos.
4. **`creatives`**: Despliegue de nuevas variantes de anuncios (hooks, copies, llamadas a la acción e imágenes).
5. **`insights`**: Obtención de métricas en tiempo real (impresiones, clics, CTR, CPC, gasto, conversiones, CPA, ROAS, frecuencia).
6. **`audiences`**: Sincronización de audiencias personalizadas y lookalikes.
7. **`budgets`**: Ejecución segura de cambios presupuestarios aprobados por el Risk Engine.

---

## 3. Modo Sandbox vs Modo Producción

- **Sandbox / Demo Simulator**: Permite pruebas y simulaciones completas sin consumir saldo publicitario ni requerir API Keys vivas.
- **Producción**: Autenticación Bearer Token mediante HTTPS seguro contra el endpoint oficial de Zernio.
