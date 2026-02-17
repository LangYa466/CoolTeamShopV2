import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Order } from '../types';
import { Button, Input, Card, Badge } from '../components/ui';
import { Search, Copy, CheckCircle, Clock, Archive, HelpCircle } from 'lucide-react';

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
      const lastQQ = localStorage.getItem('last_qq') || localStorage.getItem('last_contact_qq');
      if (lastQQ) {
        setContactQQ(lastQQ);
      }

      const lastPwd = localStorage.getItem('last_query_pwd');
      if (lastPwd) {
        setPassword(lastPwd);
      } else {
        const lastOrderStr = localStorage.getItem('order_history');
        if (lastOrderStr) {
          const history = JSON.parse(lastOrderStr);
          if (history.length > 0) {
            const last = history[history.length - 1];
            setPassword(last.query_password);
          }
        }
      }
    } catch (e) { }
  }, []);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrders([]);

    try {
      const res = await api.getOrder(contactQQ, password);
      if (res.success && res.data) {
        const results = Array.isArray(res.data) ? res.data : [res.data];
        if (results.length === 0) {
          setError('未找到匹配的订单，请检查输入是否正确');
        } else {
          setOrders(results);
        }
      } else {
        setError(res.message || '未找到订单或查询密码错误');
      }
    } catch (err) {
      setError('网络连接错误，请稍后再试');
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
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-white tracking-tight">订单查询</h1>
        <p className="text-zinc-500 text-sm">输入您的下单信息，获取购买的商品卡密</p>
      </div>

      <Card className="bg-zinc-900/40 border-zinc-800/50 shadow-2xl shadow-black/20">
        <form onSubmit={handleQuery} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="联系方式 (QQ)"
              value={contactQQ}
              onChange={e => setContactQQ(e.target.value)}
              placeholder="填写下单时的QQ号"
              required
            />
            <Input
              label="查询密码"
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="下单时设置的密码"
              required
            />
          </div>
          <Button type="submit" className="w-full h-12 text-base font-bold shadow-lg shadow-white/5" isLoading={loading}>
            {!loading && <Search className="mr-2 h-4 w-4" />} 立即查询
          </Button>
          <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-600">
            <HelpCircle size={12} />
            <span>忘记密码？请联系客服协助找回</span>
          </div>
        </form>
      </Card>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {orders.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 text-zinc-400 pb-2 border-b border-zinc-900 ml-1">
            <Archive size={16} />
            <span className="text-sm font-bold tracking-tight">查询结果 ({orders.length})</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {orders.map((order) => (
              <div key={order.order_no} className="group rounded-2xl border border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all duration-300 overflow-hidden">
                <div className="p-6 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{order.product_name}</h2>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono break-all">#{order.order_no}</span>
                        <span>•</span>
                        <span>{order.created_at}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-600 block uppercase font-bold">付款金额</span>
                        <span className="text-lg font-bold text-white">¥{Number(order.total_price).toFixed(2)}</span>
                      </div>
                      <Badge variant={order.status === 'paid' ? 'success' : 'warning'}>
                        {order.status === 'paid' ? '已支付' : '待支付'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                      {order.status === 'paid' ? (
                        <><CheckCircle size={16} className="text-green-500" /> <span>提取卡密</span></>
                      ) : (
                        <><Clock size={16} className="text-amber-500" /> <span>尚未付款</span></>
                      )}
                    </div>

                    {order.status === 'paid' ? (
                      <div className="grid grid-cols-1 gap-3">
                        {order.cards && order.cards.length > 0 ? order.cards.map((card, idx) => {
                          const uniqueId = `${order.order_no}-${idx}`;
                          return (
                            <div key={uniqueId} className="flex items-center gap-3 group/item">
                              <div className="flex-1 p-3.5 bg-black/40 rounded-xl border border-zinc-800/80 font-mono text-sm break-all text-zinc-300 group-hover/item:border-zinc-600 transition-colors">
                                {card}
                              </div>
                              <button
                                onClick={() => copyToClipboard(card, uniqueId)}
                                className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all ${copiedIndex === uniqueId
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                  : 'bg-zinc-800 text-zinc-400 hover:bg-white hover:text-black border border-transparent'
                                  }`}
                                title="复制卡密"
                              >
                                {copiedIndex === uniqueId ? <CheckCircle size={18} /> : <Copy size={18} />}
                              </button>
                            </div>
                          );
                        }) : (
                          <div className="text-zinc-600 italic py-4 text-center rounded-xl bg-black/20 border border-dashed border-zinc-800 text-sm">
                            该订单暂无可用卡密，请联系管理员核实
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-6 bg-amber-500/5 rounded-2xl border border-dashed border-amber-500/20 text-center">
                        <p className="text-amber-500/80 text-sm">该订单正处于支付确认阶段</p>
                        <p className="text-xs text-zinc-600 mt-2">如果您已成功扣款，请稍候并刷新查询结果</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderQuery;