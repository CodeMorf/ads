# Roadmap de Desarrollo — AllSender Ads

Plan de evolución estratégica y técnica para consolidar AllSender Ads como la plataforma líder en optimización publicitaria autónoma.

---

## Fase 1: Base Modular y Verificación Local (Completada ✅)
- [x] Motor financiero determinista con cálculo de márgenes, CPA Máximo y ROAS Mínimo.
- [x] Decision Engine determinista con puntuación de confianza estadística.
- [x] Risk Engine soberano con clamping de presupuesto (+20% máx por 24h).
- [x] Abstracción `AdsProvider` y módulo `ZernioProvider` con modo Sandbox.
- [x] Gateway OpenRouter con perfiles de modelos (DeepSeek, Claude, Gemini, OpenAI, Qwen, Kimi).
- [x] Framework multi-agente Mastra (Analyst, Strategist, Creative, Optimizer, Judge).
- [x] Memoria persistente Mastra Memory para aprendizajes de creatividades y fatiga.
- [x] Testing dinámico 10 → 5 → 3 → Ganador con regla 85/15.
- [x] Detección de fatiga y rotación de variantes.
- [x] Log de auditoría de actividad de IA con métricas antes y después.
- [x] Asistente conversacional "Ask AllSender" con contexto financiero real.
- [x] Suite de tests y verificación en tiempo real de invariantes de seguridad.

---

## Fase 2: Integraciones Nativas y Expansión Zernio (En Progreso 🔄)
- [ ] Conexión en vivo con webhooks de Zernio para ingesta de atribución en tiempo real por minuto.
- [ ] Sincronización bidireccional con catálogos de Shopify, WooCommerce y Amazon.
- [ ] Integración de APIs nativas directas (`MetaDirectProvider`, `GoogleDirectProvider`, `TikTokDirectProvider`) como alternativa a Zernio.
- [ ] Exportación de reportes ejecutivos en PDF y CSV para juntas directivas.

---

## Fase 3: Modelos Predictivos y Multi-Cuenta Enterprise
- [ ] Integración de análisis predictivo de valor de vida del cliente (LTV) dentro del Decision Engine.
- [ ] Gobernanza multi-organización (Agencias gestionando múltiples marcas con límites independientes).
- [ ] Generación multimodal autónoma de activos de video UGC mediante modelos de síntesis de video.
