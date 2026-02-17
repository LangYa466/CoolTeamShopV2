import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Product, OrderResponse } from '../types';
import { Button, Modal, Markdown } from '../components/ui';
import { ArrowLeft, CreditCard, CheckCircle, Package, AlertCircle, ShoppingCart, Loader2 } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Order Form State
  const [email, setEmail] = useState('');
  const [contactQQ, setContactQQ] = useState(localStorage.getItem('last_qq') || '');
  const [password, setPassword] = useState(localStorage.getItem('last_query_pwd') || '');
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wxpay'>('alipay');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<OrderResponse | null>(null);

  useEffect(() => {
    if (id) {
      api.getProduct(id).then(res => {
        if (res.success && res.data) {
          setProduct(res.data);
        }
      }).finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (contactQQ) localStorage.setItem('last_qq', contactQQ);
    if (password) localStorage.setItem('last_query_pwd', password);
  }, [contactQQ, password]);

  const handleCreateOrder = async () => {
    if (!contactQQ || !product) {
      setErrorMsg('请输入联系方式 (QQ)');
      return;
    }
    if (product.query_pwd_mode === 1 && !password) {
      setErrorMsg('该商品需要设置查询密码');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.createOrder({
        product_id: product.id,
        quantity,
        payment_method: paymentMethod,
        contact_type: 1, // QQ
        contact_info: contactQQ,
        query_password: password
      });

      if (res.success && res.data) {
        setOrderSuccess(res.data);
      } else {
        setErrorMsg(res.message || '创建订单失败');
      }
    } catch (e: any) {
      setErrorMsg(e.message || '创建订单请求失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>;
  if (!product) return <div className="text-center py-20 text-zinc-500">商品不存在</div>;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6 text-zinc-500 hover:text-white pl-0 gap-2"
      >
        <ArrowLeft size={16} /> 返回列表
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Image */}
        <div className="space-y-6">
          <div className="aspect-square w-full rounded-2xl bg-zinc-900/30 border border-zinc-800/50 overflow-hidden relative group">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700">
                <Package size={64} strokeWidth={1} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-zinc-500 mb-1">库存状态</span>
              <span className={`text-lg font-bold ${product.card_count > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {product.card_count > 0 ? `剩余 ${product.card_count} 件` : '缺货中'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-white mb-4 leading-tight">{product.name}</h1>

          <div className="flex items-baseline gap-2 mb-8 pb-8 border-b border-zinc-900">
            <span className="text-2xl font-bold text-white">¥{Number(product.price).toFixed(2)}</span>
            <span className="text-zinc-500">/ 件</span>
          </div>

          <div className="prose prose-invert prose-zinc max-w-none text-sm text-zinc-400 mb-8 flex-1">
            <h3 className="text-white font-bold text-sm uppercase tracking-wide mb-3">商品详情</h3>
            <div className="bg-zinc-900/20 rounded-xl p-4 border border-zinc-800/50">
              <Markdown content={product.description || '暂无描述'} />
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <Button
              variant="primary"
              size="lg"
              className="w-full h-14 text-base font-bold shadow-lg shadow-blue-500/10 rounded-xl"
              onClick={() => setIsModalOpen(true)}
              disabled={product.card_count <= 0}
            >
              {product.card_count > 0 ? '立即购买' : '暂时缺货'}
            </Button>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setOrderSuccess(null);
          setErrorMsg('');
        }}
        title={orderSuccess ? "订单创建成功" : "确认订单"}
      >
        {orderSuccess ? (
          <div className="py-6 space-y-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                <CheckCircle size={40} />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">订单已创建</h3>
              <p className="text-zinc-500 mt-2 text-sm">订单号: {orderSuccess.order_no}</p>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              <p className="text-xs text-zinc-500 mb-1">应付金额</p>
              <div className="text-2xl font-bold text-white">¥{orderSuccess.total_price}</div>
            </div>

            <Button
              className="w-full h-12 text-base font-bold rounded-xl"
              onClick={() => window.location.href = orderSuccess.pay_url}
            >
              前往支付
            </Button>
          </div>
        ) : (
          <div className="space-y-5 py-2">

            {/* Quantity */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">购买数量</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white transition-colors"
                >-</button>
                <span className="flex-1 text-center font-bold text-xl text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.card_count, quantity + 1))}
                  className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white transition-colors"
                >+</button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">联系方式 (QQ)</label>
              <input
                type="text"
                placeholder="请输入您的QQ号，用于查询订单"
                value={contactQQ}
                onChange={(e) => {
                  setContactQQ(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className={`w-full bg-zinc-900/50 border rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errorMsg ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800 focus:border-zinc-700'
                  }`}
              />
            </div>

            {/* Query Password (Optional) */}
            {product.query_pwd_mode === 1 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">查询密码 (必填)</label>
                <input
                  type="text"
                  placeholder="请设置订单查询密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-700 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            )}

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">支付方式</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('alipay')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${paymentMethod === 'alipay'
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                    : 'bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                >
                  <span className="font-bold">支付宝</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('wxpay')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${paymentMethod === 'wxpay'
                    ? 'bg-green-600/10 border-green-500 text-green-400'
                    : 'bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                >
                  <span className="font-bold">微信支付</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle size={16} />
                {errorMsg}
              </div>
            )}

            <Button
              variant="primary"
              className="w-full h-12 text-base font-bold rounded-xl mt-4"
              onClick={handleCreateOrder}
              isLoading={submitting}
            >
              {submitting ? '正在提交...' : `确认支付 ¥${(Number(product.price) * quantity).toFixed(2)}`}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductDetail;
