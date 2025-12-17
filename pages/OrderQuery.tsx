import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Order } from '../types';
import { Button, Input, Card, Badge } from '../components/ui';
import { Search, Copy, CheckCircle, Clock, Archive } from 'lucide-react';

const OrderQuery: React.FC = () => {
  const [contactQQ, setContactQQ] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  // Auto-fill from local storage
  useEffect(() => {
    try {
        // First try to get the contact QQ directly
        const lastQQ = localStorage.getItem('last_contact_qq');
        if (lastQQ) {
            setContactQQ(lastQQ);
        }

        // Try to get password from history
        const lastOrderStr = localStorage.getItem('order_history');
        if (lastOrderStr) {
            const history = JSON.parse(lastOrderStr);
            if(history.length > 0) {
                const last = history[history.length - 1];
                setPassword(last.query_password);
                // If we didn't have a contact QQ saved separately, we rely on user input or update logic to save it elsewhere
            }
        }
    } catch (e) {}
  }, []);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrders([]);

    try {
      const res = await api.getOrder(contactQQ, password);
      if (res.success && res.data) {
        // Handle array response
        const results = Array.isArray(res.data) ? res.data : [res.data];
        if (results.length === 0) {
           setError('未找到匹配的订单');
        } else {
           setOrders(results);
        }
      } else {
        setError(res.message || '未找到订单或密码错误');
      }
    } catch (err) {
      setError('网络请求错误');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">查询订单</h1>
        <p className="text-zinc-400">使用下单QQ和查询密码获取卡密</p>
      </div>

      <Card>
        <form onSubmit={handleQuery} className="space-y-4">
          <Input 
            label="联系QQ" 
            value={contactQQ} 
            onChange={e => setContactQQ(e.target.value)} 
            placeholder="请输入下单时填写的QQ" 
            required
          />
          <Input 
            label="查询密码" 
            type="password"
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="请输入查询密码" 
            required
          />
          <Button type="submit" className="w-full" isLoading={loading}>
            <Search className="mr-2 h-4 w-4" /> 查询订单
          </Button>
        </form>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/20 border border-red-900/50 text-red-400 text-center animate-in fade-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 text-zinc-400 pb-2 border-b border-white/10">
            <Archive size={16} />
            <span className="text-sm font-medium">查询结果 ({orders.length})</span>
          </div>

          {orders.map((order) => (
            <Card key={order.order_no} className="space-y-6 relative overflow-hidden">
               {/* Status Indicator Bar */}
               <div className={`absolute left-0 top-0 bottom-0 w-1 ${order.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                 <div>
                    <h2 className="text-xl font-semibold text-white">{order.product_name}</h2>
                    <div className="text-sm text-zinc-500 mt-1 font-mono">订单号: {order.order_no}</div>
                 </div>
                 <div className="flex items-center gap-4">
                     <div className="text-right">
                        <div className="text-sm text-zinc-500">{order.created_at}</div>
                        <div className="font-bold text-white">¥{order.total_price}</div>
                     </div>
                     <Badge variant={order.status === 'paid' ? 'success' : 'warning'}>
                       {order.status === 'paid' ? '已支付' : '待支付'}
                     </Badge>
                 </div>
              </div>

              <div className="pt-2">
                 <h3 className="font-medium mb-3 flex items-center gap-2 text-zinc-300">
                   {order.status === 'paid' ? <CheckCircle size={16} className="text-green-500" /> : <Clock size={16} className="text-yellow-500" />}
                   {order.status === 'paid' ? '卡密信息' : '等待支付'}
                 </h3>
                 
                 {order.status === 'paid' ? (
                   <div className="space-y-3">
                     {order.cards && order.cards.length > 0 ? order.cards.map((card, idx) => {
                       const uniqueId = `${order.order_no}-${idx}`;
                       return (
                         <div key={uniqueId} className="relative group">
                           <div className="p-3 bg-zinc-900 rounded border border-zinc-800 font-mono text-sm break-all pr-12 text-zinc-300">
                             {card}
                           </div>
                           <button 
                             onClick={() => copyToClipboard(card, uniqueId)}
                             className={`absolute right-2 top-2 p-1.5 rounded transition-colors ${
                               copiedIndex === uniqueId 
                                 ? 'text-green-400 bg-green-900/30' 
                                 : 'text-zinc-500 hover:text-white bg-zinc-900 hover:bg-zinc-800'
                             }`}
                             title="复制"
                           >
                             {copiedIndex === uniqueId ? <CheckCircle size={14} /> : <Copy size={14} />}
                           </button>
                         </div>
                       );
                     }) : (
                       <div className="text-zinc-500 italic pl-6 text-sm">暂无卡密 (请联系客服)</div>
                     )}
                   </div>
                 ) : (
                   <div className="text-center py-4 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                      <p className="text-zinc-400 text-sm">订单尚未支付</p>
                      <p className="text-xs text-zinc-600 mt-1">如果您已完成支付，请稍候刷新。</p>
                   </div>
                 )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderQuery;