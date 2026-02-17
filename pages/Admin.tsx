import React, { useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken, removeAuthToken } from '../services/api';
import { Category, Product, Order } from '../types';
import { Button, Input, Textarea, Card, Modal, Badge, Markdown } from '../components/ui';
import { Trash2, Edit, Plus, Upload, LogOut, Package, Grid, CreditCard, List, Check, Search, Eye, Settings, LayoutDashboard, ChevronRight, ShieldCheck, Clock } from 'lucide-react';

const Admin: React.FC = () => {
  const [token, setToken] = useState(getAuthToken());
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'settings'>('products');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await api.login(loginPass);
      if (res.success && res.token) {
        setAuthToken(res.token);
        setToken(res.token);
      } else {
        setLoginError('登录密码有误，请重试');
      }
    } catch (e) { setLoginError('系统连接失败'); }
  };

  const handleLogout = () => {
    removeAuthToken();
    setToken(null);
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-black mb-4 shadow-xl">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">管理员登录</h2>
            <p className="text-zinc-500 text-sm mt-2">请验证您的身份以继续管理店铺</p>
          </div>
          <Card className="bg-zinc-900/40 border-zinc-800/50 p-8 shadow-2xl">
            <form onSubmit={handleLogin} className="space-y-6">
              <Input
                type="password"
                label="安全令牌"
                placeholder="请输入管理密码"
                value={loginPass}
                onChange={e => {
                  setLoginPass(e.target.value);
                  setLoginError('');
                }}
              />
              {loginError && <p className="text-red-500 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">{loginError}</p>}
              <Button type="submit" className="w-full h-12 font-bold" isLoading={false}>验证进入</Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-zinc-500" />
            后台管理
          </h1>
          <p className="text-sm text-zinc-500 mt-2">欢迎回来，您可以管理您的商品、订单及系统设置</p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleLogout} className="rounded-xl">
          <LogOut size={16} className="mr-2" /> 退出管理
        </Button>
      </div>

      {/* Modern Tabs */}
      <div className="flex gap-2 p-1.5 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 overflow-x-auto no-scrollbar">
        {[
          { id: 'products', label: '商品管理', icon: <Package size={18} /> },
          { id: 'categories', label: '分类管理', icon: <Grid size={18} /> },
          { id: 'orders', label: '订单管理', icon: <List size={18} /> },
          { id: 'settings', label: '全局设置', icon: <Settings size={18} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 min-w-fit ${activeTab === tab.id
              ? 'bg-white text-black shadow-lg shadow-white/5'
              : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
              }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'products' && <ProductsManager />}
        {activeTab === 'categories' && <CategoriesManager />}
        {activeTab === 'orders' && <OrdersManager />}
        {activeTab === 'settings' && <SettingsManager />}
      </div>
    </div>
  );
};

// --- Sub Components ---

const CategoriesManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const loadData = async () => {
    const res = await api.getCategories();
    if (res.success && res.data) setCategories(res.data);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async () => {
    if (editingCat) {
      await api.editCategory({ id: editingCat.id, name, description: desc });
    } else {
      await api.addCategory({ name, description: desc });
    }
    setIsModalOpen(false);
    loadData();
  };

  const openAdd = () => {
    setEditingCat(null);
    setName('');
    setDesc('');
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setDesc(cat.description);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确认删除分类？该分类下的所有商品也将被删除。')) {
      await api.deleteCategory(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-zinc-500 font-bold text-xs uppercase tracking-widest pl-1">CATEGORY_LIST</div>
        <Button onClick={openAdd} size="sm"><Plus size={16} className="mr-1" /> 新增分类</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-5 bg-zinc-900/30 rounded-2xl border border-zinc-800/80 hover:bg-zinc-900/50 transition-colors group">
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{cat.name}</div>
              <div className="text-xs text-zinc-600 mt-1 truncate">{cat.description || '暂无描述'}</div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => openEdit(cat)}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:bg-white hover:text-black transition-all"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-900 rounded-3xl text-zinc-600">
            暂无分类，请点击上方按钮添加
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCat ? '编辑分类' : '新增分类'}>
        <div className="space-y-6">
          <Input label="分类名称" value={name} onChange={e => setName(e.target.value)} placeholder="如：系统礼包" />
          <Textarea label="分类描述" value={desc} onChange={e => setDesc(e.target.value)} placeholder="简单介绍一下这个分类" className="min-h-[100px]" />
          <Button onClick={handleSubmit} className="w-full">完成保存</Button>
        </div>
      </Modal>
    </div>
  );
};

const ProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [currentCards, setCurrentCards] = useState<string[]>([]);
  const [newCards, setNewCards] = useState('');

  const loadData = async () => {
    const [pRes, cRes] = await Promise.all([api.getProducts(), api.getCategories()]);
    if (pRes.success && pRes.data) setProducts(pRes.data);
    if (cRes.success && cRes.data) setCategories(cRes.data);
  };

  useEffect(() => { loadData(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadStatus('正在上传...');
      const res = await api.uploadImage(e.target.files[0]);
      if (res.success && res.url) {
        setFormData({ ...formData, image: res.url });
        setUploadStatus('上传成功 ✓');
      } else {
        setUploadStatus('失败 ×');
      }
      setTimeout(() => setUploadStatus(''), 2000);
    }
  };

  const handleSaveProduct = async () => {
    if (editingProduct) {
      await api.editProduct({ ...formData, id: editingProduct.id });
    } else {
      await api.addProduct(formData);
    }
    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确认删除此商品？操作不可撤销。')) {
      await api.deleteProduct(id);
      loadData();
    }
  };

  const openAdd = () => {
    setEditingProduct(null);
    setFormData({ category_id: categories[0]?.id || '', price: 0 });
    setShowContentPreview(false);
    setIsModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category_id: p.category_id,
      price: p.price,
      description: p.description,
      content: p.content,
      image: p.image,
      delivery_info: p.delivery_info
    });
    setShowContentPreview(false);
    setIsModalOpen(true);
  };

  const openCards = async (p: Product) => {
    setEditingProduct(p);
    const res = await api.getCards(p.id);
    if (res.success && res.data) setCurrentCards(res.data);
    setNewCards('');
    setIsCardModalOpen(true);
  };

  const handleAddCards = async () => {
    if (!editingProduct || !newCards) return;
    await api.addCards(editingProduct.id, newCards);
    const res = await api.getCards(editingProduct.id);
    if (res.success && res.data) setCurrentCards(res.data);
    setNewCards('');
    loadData();
  };

  const handleDeleteCard = async (idx: number) => {
    if (!editingProduct) return;
    await api.deleteCard(editingProduct.id, idx);
    const res = await api.getCards(editingProduct.id);
    if (res.success && res.data) setCurrentCards(res.data);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-zinc-500 font-bold text-xs uppercase tracking-widest pl-1">PRODUCT_MANAGEMENT</div>
        <Button onClick={openAdd} size="sm"><Plus size={16} className="mr-1" /> 添加商品</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {products.map(p => (
          <div key={p.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/80 hover:bg-zinc-900/50 transition-all group gap-4">
            <div className="flex items-center gap-5 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-xl bg-black border border-zinc-800 overflow-hidden shrink-0">
                {p.image ? (
                  <img src={p.image} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700"><Package size={24} /></div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors truncate">{p.name}</div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-sm font-bold text-white">¥{Number(p.price).toFixed(2)}</span>
                  <span className="text-zinc-700">|</span>
                  <span className={`text-xs font-medium ${p.card_count > 0 ? 'text-zinc-500' : 'text-red-500'}`}>
                    库存: {p.card_count}
                  </span>
                  <span className="bg-zinc-800 text-[10px] text-zinc-500 px-2 py-0.5 rounded uppercase font-bold">
                    {categories.find(c => c.id === p.category_id)?.name || '未分类'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto shrink-0">
              <Button variant="secondary" size="sm" onClick={() => openCards(p)} className="rounded-xl flex-1 md:flex-none">
                <CreditCard size={14} className="mr-2" /> 管理卡密
              </Button>
              <button
                onClick={() => openEdit(p)}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:bg-white hover:text-black transition-all"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-3xl text-zinc-600">
            暂无商品，点击添加您的首个商品
          </div>
        )}
      </div>

      {/* Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? '编辑商品信息' : '发布新商品'}>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          <Input label="商品名称" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="如：系统正式版卡号" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 ml-1">所属分类</label>
              <div className="relative">
                <select
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-white transition-all"
                  value={formData.category_id}
                  onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600"><Plus size={14} /></div>
              </div>
            </div>
            <Input label="销售单价" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
          </div>

          <Input label="首页简单描述" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="显示在商品列表的小字介绍" />

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400 ml-1">商品配图</label>
            <div className="flex gap-3">
              <div className="flex-1"><Input placeholder="输入图片 URL" value={formData.image || ''} onChange={e => setFormData({ ...formData, image: e.target.value })} /></div>
              <label className="shrink-0 cursor-pointer bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 h-12 w-12 rounded-xl flex items-center justify-center transition-all">
                <Upload size={18} />
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            </div>
            {uploadStatus && <p className="text-[11px] font-bold text-zinc-600 ml-1 animate-pulse">{uploadStatus}</p>}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
              <label className="text-sm font-medium text-zinc-400">商品详情说明 (Markdown)</label>
              <button
                onClick={() => setShowContentPreview(!showContentPreview)}
                className="text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1.5"
              >
                {showContentPreview ? <><Edit size={12} /> 返回编辑</> : <><Eye size={12} /> 点击预览</>}
              </button>
            </div>
            {showContentPreview ? (
              <div className="min-h-[140px] p-5 bg-black/40 border border-zinc-800 rounded-2xl">
                {formData.content ? <Markdown content={formData.content} /> : <p className="text-zinc-700 text-sm italic">预览区域为空...</p>}
              </div>
            ) : (
              <Textarea className="min-h-[140px]" placeholder="详细介绍您的商品，支持样式展示" value={formData.content || ''} onChange={e => setFormData({ ...formData, content: e.target.value })} />
            )}
          </div>

          <Textarea
            label="订单完成后提示 (发货后可见)"
            placeholder="用户购买支付成功后会显示的内容，如：使用说明、售后群号等"
            className="min-h-[100px]"
            value={formData.delivery_info || ''}
            onChange={e => setFormData({ ...formData, delivery_info: e.target.value })}
          />

          <Button onClick={handleSaveProduct} className="w-full h-12">发布商品</Button>
        </div>
      </Modal>

      {/* Cards Modal */}
      <Modal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} title={`管理卡密 - ${editingProduct?.name}`}>
        <div className="space-y-6">
          <div className="bg-black/60 p-4 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-500 ml-1">当前库存内容</span>
              <span className="text-[10px] text-zinc-700 uppercase font-bold">Total: {currentCards.length}</span>
            </div>
            <div className="max-h-56 overflow-y-auto pr-2 custom-scrollbar space-y-1.5">
              {currentCards.length === 0 && <div className="text-zinc-700 text-sm text-center py-8 italic border border-dashed border-zinc-900 rounded-xl">暂无卡密，请在下方批量添加</div>}
              {currentCards.map((card, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-900 hover:border-zinc-700 transition-colors">
                  <span className="truncate mr-4 font-mono text-zinc-300">{card}</span>
                  <button onClick={() => handleDeleteCard(idx)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          <Textarea
            label="批量添加新卡密"
            placeholder="请输入卡密信息，每个卡密占据一行"
            className="min-h-[150px]"
            value={newCards}
            onChange={e => setNewCards(e.target.value)}
          />
          <Button onClick={handleAddCards} className="w-full h-12" variant="primary">同步至服务器</Button>
        </div>
      </Modal>
    </div>
  );
};

const OrdersManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await api.getOrders({ status: filterStatus, keyword });
    if (res.success && res.data) setOrders(res.data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [filterStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleViewDetail = async (orderNo: string) => {
    const res = await api.getOrderDetail(orderNo);
    if (res.success && res.data) {
      setSelectedOrder(res.data);
      setIsDetailOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
        <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === '' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
          >全部</button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === 'paid' ? 'bg-green-500 text-white' : 'text-zinc-500 hover:text-white'}`}
          >已支付</button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === 'pending' ? 'bg-amber-500 text-white' : 'text-zinc-500 hover:text-white'}`}
          >待支付</button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-80">
            <input
              type="text"
              placeholder="搜订单号 / 联系QQ / 商品名称..."
              className="h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-white focus:ring-4 focus:ring-white/5 transition-all"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
          </div>
          <Button type="submit" size="default" isLoading={loading} className="px-8 font-bold">搜索数据</Button>
        </form>
      </div>

      <div className="space-y-4">
        {orders.length === 0 && !loading && (
          <div className="py-32 text-center border-2 border-dashed border-zinc-900 rounded-3xl text-zinc-600">
            没有找到匹配的订单记录
          </div>
        )}

        {orders.map(o => (
          <div key={o.order_no} className="p-6 bg-zinc-900/30 rounded-2xl border border-zinc-800/80 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all flex flex-col sm:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-zinc-500 text-xs tracking-tight">#{o.order_no}</span>
                <Badge variant={o.status === 'paid' ? 'success' : 'warning'}>{o.status === 'paid' ? '已支付' : '待支付'}</Badge>
                <span className="text-[10px] uppercase font-bold text-zinc-700 px-2 py-0.5 rounded-md border border-zinc-800">{o.pay_type || 'NONE'}</span>
              </div>

              <div>
                <h3 className="font-bold text-white text-lg leading-tight">{o.product_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-zinc-500 text-sm">数量: {o.quantity}</span>
                  <span className="text-zinc-800">/</span>
                  <span className="text-sm font-bold text-white">¥{Number(o.total_price).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-zinc-500 font-medium">
                <span className="flex items-center gap-2 px-2.5 py-1.5 bg-black/40 rounded-lg border border-zinc-800/50"><Search size={12} /> QQ: {o.contact_qq}</span>
                <span className="flex items-center gap-2 px-2.5 py-1.5 opacity-60"><Clock size={12} /> {o.created_at}</span>
              </div>
            </div>

            <div className="flex sm:flex-col justify-end gap-2 shrink-0">
              <button
                onClick={() => handleViewDetail(o.order_no)}
                className="h-11 px-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
              >
                <Eye size={16} /> 详情
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="详细订单凭据">
        {selectedOrder && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-1">
                <label className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest pl-0.5">订单编号</label>
                <div className="font-mono text-sm text-zinc-300 bg-black/40 p-2.5 rounded-xl border border-zinc-800/50 tracking-tight">{selectedOrder.order_no}</div>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest pl-0.5">当前状态</label>
                <div className="h-10.5 flex items-center"><Badge variant={selectedOrder.status === 'paid' ? 'success' : 'warning'}>{selectedOrder.status === 'paid' ? '交易成功' : '等待付款'}</Badge></div>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest pl-0.5">商品名称</label>
                <div className="text-sm font-bold text-white">{selectedOrder.product_name}</div>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest pl-0.5">订单金额</label>
                <div className="text-lg font-bold text-blue-400">¥{Number(selectedOrder.total_price).toFixed(2)}</div>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest pl-0.5">联系信息</label>
                <div className="text-sm text-zinc-300">QQ: {selectedOrder.contact_qq}</div>
              </div>
              <div className="space-y-1">
                <label className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest pl-0.5">下单时间</label>
                <div className="text-[11px] text-zinc-500">{selectedOrder.created_at}</div>
              </div>
            </div>

            {selectedOrder.status === 'paid' && (
              <div className="space-y-3 pt-6 border-t border-zinc-900">
                <label className="text-zinc-500 text-xs font-bold block ml-1">发货卡密内容 (已加密传输)</label>
                <div className="bg-zinc-950/80 p-5 rounded-2xl border border-zinc-800 font-mono text-xs text-zinc-400 space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                  {selectedOrder.cards && selectedOrder.cards.length > 0 ? (
                    selectedOrder.cards.map((c, i) => (
                      <div key={i} className="flex gap-3 pb-2 border-b border-zinc-900 last:border-0 last:pb-0 group/card">
                        <span className="text-zinc-700 select-none">[{i + 1}]</span>
                        <span className="break-all text-zinc-300 group-hover/card:text-white transition-colors">{c}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-zinc-800 text-center py-4 italic">无库存卡密数据</div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-zinc-500 text-xs font-bold block ml-1">操作日志</label>
              <div className="text-[11px] text-zinc-600 italic">
                * 系统于 {selectedOrder.created_at} 记录该订单并生成哈希索引。
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const SettingsManager = () => {
  const [notice, setNotice] = useState('');
  const [msg, setMsg] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    api.getNotice().then(res => { if (res.success && res.data) setNotice(res.data); });
  }, []);

  const saveNotice = async () => {
    await api.setNotice(notice);
    setMsg('公告更新成功');
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <div className="max-w-2xl animate-in slide-in-from-left duration-500">
      <Card className="p-8 space-y-8 bg-zinc-900/30 border-zinc-800/80 shadow-xl">
        <div>
          <h3 className="text-xl font-bold text-white mb-2">全站公告管理</h3>
          <p className="text-zinc-500 text-sm">更新店铺首页显示的系统公告内容，支持基础 Markdown 语法渲染。</p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-900 w-fit">
            <button
              onClick={() => setShowPreview(false)}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${!showPreview ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
            >编辑源码</button>
            <button
              onClick={() => setShowPreview(true)}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${showPreview ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
            ><Eye size={12} /> 实时预览</button>
          </div>

          {showPreview ? (
            <div className="min-h-[220px] p-6 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 animate-in fade-in duration-300">
              {notice ? <Markdown content={notice} /> : <p className="text-zinc-800 text-sm italic">当前公告内容为空，预览已禁用。</p>}
            </div>
          ) : (
            <Textarea
              className="min-h-[220px] bg-zinc-950/30 font-mono text-zinc-300"
              value={notice}
              onChange={e => setNotice(e.target.value)}
              placeholder="请输入店铺公告内容..."
            />
          )}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-zinc-900">
          <Button onClick={saveNotice} size="lg" className="px-10 font-bold shadow-xl shadow-white/5">发布最新公告</Button>
          {msg && <span className="text-emerald-500 text-sm font-bold flex items-center gap-1.5 animate-in slide-in-from-left"><Check size={16} /> {msg}</span>}
        </div>
      </Card>
    </div>
  );
};

export default Admin;