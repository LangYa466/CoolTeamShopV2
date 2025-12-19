import React, { useState, useEffect } from 'react';
import { api, setAuthToken, getAuthToken, removeAuthToken } from '../services/api';
import { Category, Product, Order } from '../types';
import { Button, Input, Textarea, Card, Modal, Badge, Markdown } from '../components/ui';
import { Trash2, Edit, Plus, Upload, LogOut, Package, Grid, CreditCard, List, Check, Search, Eye } from 'lucide-react';

const Admin: React.FC = () => {
  const [token, setToken] = useState(getAuthToken());
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'settings'>('products');

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await api.login(loginPass);
      if (res.success && res.token) {
        setAuthToken(res.token);
        setToken(res.token);
      } else {
        setLoginError('密码错误');
      }
    } catch (e) { setLoginError('登录请求失败'); }
  };

  const handleLogout = () => {
    removeAuthToken();
    setToken(null);
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Card className="w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-6 text-center">管理员登录</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <Input type="password" placeholder="请输入密码" value={loginPass} onChange={e => {
                    setLoginPass(e.target.value);
                    setLoginError('');
                }} />
                {loginError && <p className="text-red-500 text-xs mt-2">{loginError}</p>}
            </div>
            <Button type="submit" className="w-full">登录</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">管理后台</h1>
        <Button variant="secondary" onClick={handleLogout}><LogOut size={16} className="mr-2"/> 退出登录</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        {[
          { id: 'products', label: '商品管理', icon: <Package size={16}/> },
          { id: 'categories', label: '分类管理', icon: <Grid size={16}/> },
          { id: 'orders', label: '订单管理', icon: <List size={16}/> },
          { id: 'settings', label: '系统设置', icon: <Edit size={16}/> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white text-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
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
  
  // Form State
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const loadData = async () => {
    const res = await api.getCategories();
    if(res.success && res.data) setCategories(res.data);
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
    if(confirm('确认删除分类？该分类下的所有商品也将被删除。')) {
      await api.deleteCategory(id);
      loadData();
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd}><Plus size={16} className="mr-2"/> 添加分类</Button>
      </div>
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg border border-zinc-800">
            <div>
              <div className="font-semibold">{cat.name}</div>
              <div className="text-sm text-zinc-500">{cat.description}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => openEdit(cat)}><Edit size={14}/></Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(cat.id)}><Trash2 size={14}/></Button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCat ? '编辑分类' : '添加分类'}>
        <div className="space-y-4">
          <Input label="名称" value={name} onChange={e => setName(e.target.value)} />
          <Input label="描述" value={desc} onChange={e => setDesc(e.target.value)} />
          <Button onClick={handleSubmit} className="w-full">保存</Button>
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
  
  // Form Fields
  const [formData, setFormData] = useState<any>({});
  
  // Card Management
  const [currentCards, setCurrentCards] = useState<string[]>([]);
  const [newCards, setNewCards] = useState('');

  const loadData = async () => {
    const [pRes, cRes] = await Promise.all([api.getProducts(), api.getCategories()]);
    if(pRes.success && pRes.data) setProducts(pRes.data);
    if(cRes.success && cRes.data) setCategories(cRes.data);
  };

  useEffect(() => { loadData(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadStatus('上传中...');
      const res = await api.uploadImage(e.target.files[0]);
      if (res.success && res.url) {
        setFormData({ ...formData, image: res.url });
        setUploadStatus('上传成功');
      } else {
        setUploadStatus('上传失败');
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
    if(confirm('确认删除商品？')) {
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
    if(res.success && res.data) setCurrentCards(res.data);
    setNewCards('');
    setIsCardModalOpen(true);
  };

  const handleAddCards = async () => {
    if(!editingProduct || !newCards) return;
    await api.addCards(editingProduct.id, newCards);
    const res = await api.getCards(editingProduct.id);
    if(res.success && res.data) setCurrentCards(res.data);
    setNewCards('');
    loadData(); // Update count
  };

  const handleDeleteCard = async (idx: number) => {
    if(!editingProduct) return;
    await api.deleteCard(editingProduct.id, idx);
    const res = await api.getCards(editingProduct.id);
    if(res.success && res.data) setCurrentCards(res.data);
    loadData(); // Update count
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd}><Plus size={16} className="mr-2"/> 添加商品</Button>
      </div>
      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-zinc-900 rounded-lg border border-zinc-800 gap-4">
            <div className="flex items-center gap-4">
              {p.image && <img src={p.image} className="w-12 h-12 object-cover rounded bg-black" />}
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-zinc-500">¥{p.price} | 库存: {p.card_count}</div>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="secondary" size="sm" onClick={() => openCards(p)}><CreditCard size={14} className="mr-1"/> 卡密</Button>
              <Button variant="secondary" size="sm" onClick={() => openEdit(p)}><Edit size={14}/></Button>
              <Button variant="danger" size="sm" onClick={() => handleDelete(p.id)}><Trash2 size={14}/></Button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? '编辑商品' : '添加商品'}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
           <Input label="名称" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
           <div className="space-y-2">
             <label className="text-sm text-zinc-400">分类</label>
             <select 
               className="w-full bg-black border border-zinc-800 rounded p-2 text-sm"
               value={formData.category_id}
               onChange={e => setFormData({...formData, category_id: e.target.value})}
             >
               {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
           </div>
           <Input label="价格" type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
           <Input label="简述" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
           
           <div className="space-y-2">
              <label className="text-sm text-zinc-400">图片</label>
              <div className="flex gap-2">
                <Input type="text" placeholder="图片 URL" value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} />
                <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded flex items-center justify-center border border-zinc-700 min-w-[3rem]">
                   <Upload size={16} />
                   <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                </label>
              </div>
              {uploadStatus && <p className="text-xs text-zinc-500">{uploadStatus}</p>}
           </div>

           <div className="space-y-2">
             <div className="flex items-center justify-between">
               <label className="text-sm text-zinc-400">详情 (支持 Markdown)</label>
               <Button 
                 variant={showContentPreview ? 'primary' : 'secondary'} 
                 size="sm" 
                 onClick={() => setShowContentPreview(!showContentPreview)}
               >
                 <Eye size={14} className="mr-1" /> {showContentPreview ? '编辑' : '预览'}
               </Button>
             </div>
             {showContentPreview ? (
               <div className="min-h-[8rem] p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                 {formData.content ? <Markdown content={formData.content} /> : <p className="text-zinc-500 text-sm">暂无内容</p>}
               </div>
             ) : (
               <Textarea className="h-32" value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} />
             )}
           </div>

           <Textarea 
             label="发货信息 (支付成功后显示)" 
             placeholder="支付成功后显示给用户的信息"
             className="h-20" 
             value={formData.delivery_info || ''} 
             onChange={e => setFormData({...formData, delivery_info: e.target.value})} 
           />
           
           <Button onClick={handleSaveProduct} className="w-full">保存商品</Button>
        </div>
      </Modal>

      {/* Cards Modal */}
      <Modal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} title={`管理卡密 - ${editingProduct?.name}`}>
         <div className="space-y-4">
            <div className="bg-black p-2 rounded max-h-48 overflow-y-auto space-y-1 border border-zinc-800 custom-scrollbar">
               {currentCards.length === 0 && <div className="text-zinc-500 text-sm text-center">暂无卡密</div>}
               {currentCards.map((card, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm p-1 hover:bg-zinc-900 rounded">
                     <span className="truncate mr-2 font-mono">{card}</span>
                     <button onClick={() => handleDeleteCard(idx)} className="text-red-500 hover:text-red-400"><Trash2 size={12}/></button>
                  </div>
               ))}
            </div>
            <Textarea 
              label="添加卡密 (一行一个)" 
              placeholder="卡密1\n卡密2"
              value={newCards}
              onChange={e => setNewCards(e.target.value)}
            />
            <Button onClick={handleAddCards} className="w-full">添加卡密</Button>
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
  
  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await api.getOrders({ status: filterStatus, keyword });
    if(res.success && res.data) setOrders(res.data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [filterStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleViewDetail = async (orderNo: string) => {
      // First check if we already have full details in the list, otherwise fetch
      // For now, assuming list might be partial or we just use list data.
      // But user added getOrderDetail, let's use it for completeness or just show local data.
      // Usually getOrderDetail is for users to check status, but admin might use it too.
      // Since the list already has most info, let's just show what we have, or fetch if needed.
      // Let's fetch to be safe and use the new API.
      const res = await api.getOrderDetail(orderNo);
      if(res.success && res.data) {
          setSelectedOrder(res.data);
          setIsDetailOpen(true);
      }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex gap-2">
            <Button variant={filterStatus === '' ? 'primary' : 'secondary'} onClick={() => setFilterStatus('')} size="sm">全部</Button>
            <Button variant={filterStatus === 'paid' ? 'primary' : 'secondary'} onClick={() => setFilterStatus('paid')} size="sm">已支付</Button>
            <Button variant={filterStatus === 'pending' ? 'primary' : 'secondary'} onClick={() => setFilterStatus('pending')} size="sm">待支付</Button>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                  <input 
                    type="text" 
                    placeholder="搜订单号/QQ/商品..." 
                    className="h-9 w-64 rounded-md border border-zinc-800 bg-black px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                  />
                  <Search size={14} className="absolute right-3 top-2.5 text-zinc-500" />
              </div>
              <Button type="submit" size="sm" isLoading={loading}>搜索</Button>
          </form>
      </div>

      <div className="space-y-3">
         {orders.length === 0 && !loading && <div className="text-zinc-500 text-center py-8">暂无订单</div>}
         {orders.map(o => (
           <div key={o.order_no} className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-sm hover:border-zinc-700 transition-colors">
              <div className="flex justify-between mb-2">
                 <div className="flex items-center gap-2">
                     <span className="font-mono text-zinc-400">{o.order_no}</span>
                     <Badge variant={o.status === 'paid' ? 'success' : 'warning'}>{o.status === 'paid' ? '已支付' : '待支付'}</Badge>
                 </div>
                 <button onClick={() => handleViewDetail(o.order_no)} className="text-zinc-500 hover:text-white"><Eye size={16} /></button>
              </div>
              <div className="font-semibold text-white text-base mb-1">{o.product_name} <span className="text-zinc-500 text-sm font-normal">x {o.quantity}</span></div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-zinc-500 mt-2">
                 <span className="flex items-center gap-1"><CreditCard size={12}/> {o.pay_type || '未支付'}</span>
                 <span>QQ: {o.contact_qq}</span>
                 <span>金额: ¥{o.total_price}</span>
                 <span className="ml-auto">{o.created_at}</span>
              </div>
           </div>
         ))}
      </div>

      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="订单详情">
          {selectedOrder && (
              <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                          <label className="text-zinc-500 text-xs">订单号</label>
                          <div className="font-mono">{selectedOrder.order_no}</div>
                      </div>
                      <div>
                          <label className="text-zinc-500 text-xs">状态</label>
                          <div><Badge variant={selectedOrder.status === 'paid' ? 'success' : 'warning'}>{selectedOrder.status === 'paid' ? '已支付' : '待支付'}</Badge></div>
                      </div>
                      <div>
                          <label className="text-zinc-500 text-xs">商品</label>
                          <div>{selectedOrder.product_name}</div>
                      </div>
                      <div>
                          <label className="text-zinc-500 text-xs">金额</label>
                          <div>¥{selectedOrder.total_price}</div>
                      </div>
                      <div>
                          <label className="text-zinc-500 text-xs">联系QQ</label>
                          <div>{selectedOrder.contact_qq}</div>
                      </div>
                      <div>
                          <label className="text-zinc-500 text-xs">创建时间</label>
                          <div>{selectedOrder.created_at}</div>
                      </div>
                  </div>
                  
                  {selectedOrder.status === 'paid' && (
                      <div className="border-t border-zinc-800 pt-4">
                          <label className="text-zinc-500 text-xs mb-2 block">发货内容</label>
                          <div className="bg-black p-3 rounded border border-zinc-800 font-mono text-xs break-all max-h-40 overflow-y-auto custom-scrollbar">
                              {selectedOrder.cards && selectedOrder.cards.length > 0 ? (
                                  selectedOrder.cards.map((c, i) => <div key={i} className="mb-1 last:mb-0 border-b border-zinc-900 last:border-0 pb-1 last:pb-0">{c}</div>)
                              ) : (
                                  <span className="text-zinc-600">无卡密信息</span>
                              )}
                          </div>
                      </div>
                  )}
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
    api.getNotice().then(res => { if(res.success && res.data) setNotice(res.data); });
  }, []);

  const saveNotice = async () => {
    await api.setNotice(notice);
    setMsg('公告已更新');
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <div className="max-w-xl">
      <Card className="space-y-4">
         <h3 className="font-semibold">店铺公告设置</h3>
         <div className="flex gap-2 mb-2">
           <Button 
             variant={!showPreview ? 'primary' : 'secondary'} 
             size="sm" 
             onClick={() => setShowPreview(false)}
           >
             编辑
           </Button>
           <Button 
             variant={showPreview ? 'primary' : 'secondary'} 
             size="sm" 
             onClick={() => setShowPreview(true)}
           >
             <Eye size={14} className="mr-1" /> 预览
           </Button>
         </div>
         {showPreview ? (
           <div className="min-h-[10rem] p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
             {notice ? <Markdown content={notice} /> : <p className="text-zinc-500 text-sm">暂无内容</p>}
           </div>
         ) : (
           <Textarea className="h-40" value={notice} onChange={e => setNotice(e.target.value)} label="内容 (支持 Markdown)" />
         )}
         <div className="flex items-center gap-2">
            <Button onClick={saveNotice}>更新公告</Button>
            {msg && <span className="text-green-500 text-sm flex items-center"><Check size={14} className="mr-1" />{msg}</span>}
         </div>
      </Card>
    </div>
  );
};

export default Admin;