import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductFinancials } from '../types';
import { FinancialEngine } from '../core/financial-engine';
import { 
  Plus, 
  Package, 
  TrendingUp, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Check, 
  DollarSign, 
  Calculator,
  ExternalLink
} from 'lucide-react';

export const ProductsTab: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    cost: 325,
    sellingPrice: 1290,
    salePrice: 1290,
    stock: 50,
    shippingCost: 250,
    platformFee: 0,
    otherCosts: 75,
    minProfitTarget: 350,
    landingPage: 'https://myshop.com/product',
    category: 'General',
  });

  // Cálculo en vivo instantáneo en el modal
  const livePreview = FinancialEngine.calculateProductMetrics({
    name: formData.name || 'Producto Nuevo',
    sku: formData.sku || 'SKU-00',
    cost: Number(formData.cost) || 0,
    sellingPrice: Number(formData.sellingPrice) || 0,
    salePrice: Number(formData.salePrice) || Number(formData.sellingPrice) || 0,
    stock: Number(formData.stock) || 0,
    shippingCost: Number(formData.shippingCost) || 0,
    platformFee: Number(formData.platformFee) || 0,
    otherCosts: Number(formData.otherCosts) || 0,
    minProfitTarget: Number(formData.minProfitTarget) || 0,
  });

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      sku: '',
      cost: 325,
      sellingPrice: 1290,
      salePrice: 1290,
      stock: 50,
      shippingCost: 250,
      platformFee: 0,
      otherCosts: 75,
      minProfitTarget: 350,
      landingPage: 'https://myshop.com/product',
      category: 'General',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: ProductFinancials) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      sku: p.sku,
      cost: p.cost,
      sellingPrice: p.sellingPrice,
      salePrice: p.salePrice || p.sellingPrice,
      stock: p.stock,
      shippingCost: p.shippingCost,
      platformFee: p.platformFee,
      otherCosts: p.otherCosts,
      minProfitTarget: p.minProfitTarget,
      landingPage: p.landingPage,
      category: p.category,
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) return;

    if (editingId) {
      updateProduct(editingId, formData);
    } else {
      addProduct(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Catálogo de Productos & Márgenes</h1>
          <p className="text-sm text-slate-400 mt-1">
            Motor financiero determinista: Cada producto define sus techos de CPA y ROAS antes de que cualquier agente IA recomiende gastar un dólar.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Añadir Producto</span>
        </button>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const isLowStock = product.stock <= 5;

          return (
            <div
              key={product.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                {/* Cabecera de Tarjeta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 font-mono tracking-wider">{product.sku}</span>
                    <h2 className="text-lg font-bold text-white tracking-tight">{product.name}</h2>
                    <div className="text-xs text-slate-400">
                      Categoría: {product.category}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(product)}
                      className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Precios e Inventario */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Precio Venta</span>
                    <span className="font-semibold text-white">${product.sellingPrice}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Costo Directo</span>
                    <span className="font-semibold text-slate-300">
                      ${(product.cost + product.shippingCost + product.platformFee + product.otherCosts).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Inventario</span>
                    <span className={`font-semibold ${isLowStock ? 'text-amber-400' : 'text-slate-200'}`}>
                      {product.stock} unids {isLowStock && '⚠️'}
                    </span>
                  </div>
                </div>

                {/* Métricas Financieras Calculadas Automáticamente (Sección 2) */}
                <div className="mt-4 p-3.5 bg-slate-950 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Margen Bruto:</span>
                    <span className="font-bold text-white">{product.grossMargin}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Beneficio Antes de Ads:</span>
                    <span className="font-bold text-emerald-400">${product.profitBeforeAds.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">CPA Máximo Rentable:</span>
                    <span className="font-bold text-sky-400">${product.maxProfitableCPA.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ROAS Mínimo Requerido:</span>
                    <span className="font-bold text-purple-300">{product.minProfitableROAS}x</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                    <span className="text-slate-400">Presupuesto Sugerido:</span>
                    <span className="font-semibold text-slate-200">${product.recommendedDailyBudget}/día</span>
                  </div>
                </div>

                {/* Alerta de Stock Crítico */}
                {isLowStock && (
                  <div className="mt-3 p-2 rounded bg-amber-950/40 border border-amber-800/50 text-[11px] text-amber-300 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>
                      Stock crítico ({product.stock} unids). El Risk Engine bloqueará automáticamente cualquier orden de escalado para evitar quiebre de stock.
                    </span>
                  </div>
                )}
              </div>

              {/* Enlace y botón */}
              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <a
                  href={product.landingPage}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-indigo-400 transition-colors flex items-center gap-1 text-[11px]"
                >
                  <span>Landing Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[11px] text-emerald-400 font-medium">Margen resguardado</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL INTERACTIVO: Añadir o Editar Producto con Calculadora en Tiempo Real */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">
                  {editingId ? 'Editar Parámetros de Producto' : 'Nuevo Producto & Calculadora Financiera'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                Cerrar ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5 mt-5 text-xs">
              {/* Información básica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Nombre del Producto</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Smart Massager Pro X"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">SKU / Código</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Ej. SMP-01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Precios y Costos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Precio Venta ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Costo Producto ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Costo Envío ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.shippingCost}
                    onChange={(e) => setFormData({ ...formData, shippingCost: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Otros Costos ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.otherCosts}
                    onChange={(e) => setFormData({ ...formData, otherCosts: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {/* Beneficio deseado e inventario */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Margen Mínimo Deseado ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.minProfitTarget}
                    onChange={(e) => setFormData({ ...formData, minProfitTarget: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                  <span className="text-[10px] text-slate-500">Beneficio limpio que debes ganar por venta</span>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Stock Inicial (unids)</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Landing Page URL</label>
                  <input
                    type="url"
                    value={formData.landingPage}
                    onChange={(e) => setFormData({ ...formData, landingPage: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {/* PREVIEW EN VIVO DE CÁLCULO FINANCIERO */}
              <div className="p-4 bg-indigo-950/30 border border-indigo-800/60 rounded-xl space-y-2">
                <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4" />
                  <span>Resultado Determinista Calculado por AllSender Financial Engine:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <div className="bg-slate-900/80 p-2 rounded">
                    <span className="text-slate-400 block text-[11px]">Beneficio Antes Ads</span>
                    <strong className="text-emerald-400">${livePreview.profitBeforeAds.toFixed(2)}</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded">
                    <span className="text-slate-400 block text-[11px]">CPA Máx Rentable</span>
                    <strong className="text-sky-400">${livePreview.maxProfitableCPA.toFixed(2)}</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded">
                    <span className="text-slate-400 block text-[11px]">ROAS Mínimo</span>
                    <strong className="text-purple-300">{livePreview.minProfitableROAS}x</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded">
                    <span className="text-slate-400 block text-[11px]">Presupuesto Sugerido</span>
                    <strong className="text-white">${livePreview.recommendedDailyBudget}/día</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Regla de seguridad: Si la campaña supera un CPA de <strong>${livePreview.maxProfitableCPA.toFixed(2)} USD</strong> en una muestra representativa, el Decision Engine marcará automáticamente reducción o pausa.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-sm"
                >
                  {editingId ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
