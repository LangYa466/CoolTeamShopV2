import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Product, PayType, OrderCreationResult } from '../types';
import { Button, Input, Modal, Markdown, Badge } from '../components/ui';
import { ArrowLeft, CheckCircle, Copy, Loader2 } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [contactQQ, setContactQQ] = useState('');
  const [payType, setPayType] = useState<PayType>(PayType.ALIPAY);
  const [buying, setBuying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<OrderCreationResult | null>(null);

  useEffect(() => {
    // Load persisted contact info
    const savedQQ = localStorage.getItem('last_contact_qq');
    if (savedQQ) setContactQQ(savedQQ);

    if (!id) return;
    setLoading(true);
    api.getProduct(id).then(res => {
      if (res.success && res.data) {
        // API 返回的是数组，取第一个元素
        const productData = Array.isArray(res.data) ? res.data[0] : res.data;
        if (productData) {
          setProduct(productData);
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
      setLoading(false);
    });
  }, [id, navigate]);

  const handleBuy = async () => {
    setErrorMsg('');
    if (!product) return;
    
    if (!contactQQ) {
      setErrorMsg('请输入联系QQ，用于查询订单');
      return;
    }

    // Save contact info
    localStorage.setItem('last_contact_qq', contactQQ);

    setBuying(true);
    try {
      const res = await api.createOrder({
        product_id: product.id,
        quantity,
        pay_type: payType,
        contact_qq: contactQQ
      });

      if (res.success && res.data) {
        // Save order info locally
        const history = JSON.parse(localStorage.getItem('order_history') || '[]');
        history.push({
            order_no: res.data.order_no,
            query_password: res.data.query_password,
            date: new Date().toISOString()
        });
        localStorage.setItem('order_history', JSON.stringify(history));
        
        setOrderSuccess(res.data);
      } else {
        setErrorMsg(res.message || '创建订单失败');
      }
    } catch (error) {
      setErrorMsg('网络错误，请重试');
    } finally {
      setBuying(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset state after a short delay
    setTimeout(() => {
        setOrderSuccess(null);
        setErrorMsg('');
        setQuantity(1);
    }, 300);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) return (
    <div className="flex h-[50vh] items-center justify-center text-zinc-500">
      <Loader2 className="animate-spin mr-2" /> 加载中...
    </div>
  );
  if (!product) return null;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-6 -ml-4 text-zinc-400 hover:text-white">
        <ArrowLeft size={16} className="mr-2" /> 返回主页
      </Button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Left: Image & Info */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 aspect-video md:aspect-square relative">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-700">暂无图片</div>
            )}
             <div className="absolute top-4 right-4">
                 <Badge variant={product.card_count > 0 ? 'success' : 'warning'}>
                      {product.card_count > 0 ? `库存: ${product.card_count}` : '暂时缺货'}
                 </Badge>
             </div>
          </div>
        </div>

        {/* Right: Details & Action */}
        <div className="space-y-8">
          <div>
            <div className="text-zinc-500 text-sm mb-2">{product.category?.name}</div>
            <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>
            <div className="text-4xl font-bold text-white">¥{Number(product.price).toFixed(2)}</div>
          </div>

          <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-4">商品详情</h3>
            {(product.content || product.description) ? (
              <Markdown content={product.content || product.description} />
            ) : (
              <p className="text-zinc-500 text-sm">暂无详细描述</p>
            )}
          </div>

          <Button 
            className="w-full h-12 text-lg" 
            onClick={() => setIsModalOpen(true)}
            disabled={product.card_count <= 0}
          >
            {product.card_count > 0 ? '立即购买' : '已售罄'}
          </Button>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={orderSuccess ? "订单创建成功" : "确认订单"}
      >
        {orderSuccess ? (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center py-4 text-green-500 space-y-2">
                <CheckCircle size={48} />
                <span className="font-semibold text-lg text-white">下单成功</span>
            </div>
            
            <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 space-y-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <code className="flex-1 bg-black p-2 rounded border border-zinc-800 text-sm font-mono text-zinc-300">
                            {orderSuccess.order_no}
                        </code>
                        <Button size="icon" variant="secondary" onClick={() => copyToClipboard(orderSuccess.order_no)}>
                            <Copy size={14} />
                        </Button>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-zinc-500">查询密码 (请保存)</label>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 bg-black p-2 rounded border border-zinc-800 text-sm font-mono text-zinc-300">
                            {orderSuccess.query_password}
                        </code>
                         <Button size="icon" variant="secondary" onClick={() => copyToClipboard(orderSuccess.query_password)}>
                            <Copy size={14} />
                        </Button>
                    </div>
                </div>
            </div>

            <p className="text-xs text-zinc-500 text-center">
                请务必保存以上信息用于查询订单和卡密。
            </p>

            <Button className="w-full" onClick={() => window.location.href = orderSuccess.pay_url}>
                立即支付 ¥{orderSuccess.total_price}
            </Button>
          </div>
        ) : (
            <div className="space-y-4">
            <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                <div className="text-sm text-zinc-400">商品名称</div>
                <div className="font-medium text-white">{product.name}</div>
                <div className="text-sm text-zinc-400 mt-1">单价: ¥{product.price}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="购买数量" 
                    type="number" 
                    min={1} 
                    max={product.card_count}
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))} 
                />
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">总价</label>
                    <div className="flex h-10 w-full items-center rounded-md border border-zinc-800 bg-zinc-900 px-3 text-white">
                        ¥{(quantity * product.price).toFixed(2)}
                    </div>
                </div>
            </div>

            <div className="space-y-1">
                <Input 
                    label="联系QQ (用于查询订单)" 
                    placeholder="请输入QQ号"
                    value={contactQQ}
                    onChange={(e) => {
                        setContactQQ(e.target.value);
                        if(errorMsg) setErrorMsg('');
                    }}
                    className={errorMsg ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">支付方式</label>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => setPayType(PayType.ALIPAY)}
                        className={`p-3 rounded-lg border text-sm transition-all ${payType === PayType.ALIPAY ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'bg-black border-zinc-800 text-zinc-400 hover:bg-zinc-900'}`}
                    >
                        支付宝
                    </button>
                    <button 
                        onClick={() => setPayType(PayType.WXPAY)}
                        className={`p-3 rounded-lg border text-sm transition-all ${payType === PayType.WXPAY ? 'bg-green-900/20 border-green-500 text-green-400' : 'bg-black border-zinc-800 text-zinc-400 hover:bg-zinc-900'}`}
                    >
                        微信支付
                    </button>
                </div>
            </div>

            <Button 
                className="w-full mt-4" 
                onClick={handleBuy} 
                isLoading={buying}
            >
                支付 ¥{(quantity * product.price).toFixed(2)}
            </Button>
            </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductDetail;
