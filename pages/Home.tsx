import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Category, Product } from '../types';
import { Badge, Markdown } from '../components/ui';
import { Layers, Loader2, ArrowRight, ShoppingCart } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, prodRes, noticeRes] = await Promise.all([
          api.getCategories(),
          api.getProducts(),
          api.getNotice()
        ]);

        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
        if (prodRes.success && prodRes.data) setProducts(prodRes.data);
        if (noticeRes.success && noticeRes.data) setNotice(noticeRes.data);

      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-zinc-500 text-sm">
        <Loader2 className="animate-spin mr-2" /> 正在加载资源...
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Notice Section */}
      {notice && (
        <div className="relative overflow-hidden rounded-2xl bg-zinc-900/30 border border-zinc-800/50 p-1">
          <div className="relative bg-black/40 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="text-sm font-bold text-zinc-300">系统公告</span>
            </div>
            <div className="text-zinc-300 text-sm leading-relaxed">
              <Markdown content={notice} />
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">精选商品</h2>
            <p className="text-sm text-zinc-500 mt-1">浏览并选择您需要的服务</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedCategory === null
                  ? 'bg-white text-black shadow-lg shadow-white/5'
                  : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
            >
              全部
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedCategory === cat.id
                    ? 'bg-white text-black shadow-lg shadow-white/5'
                    : 'bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="group cursor-pointer rounded-2xl bg-zinc-900/20 border border-zinc-800/50 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 flex flex-col overflow-hidden"
              >
                {/* Image Area */}
                <div className="aspect-video w-full overflow-hidden bg-black/50 relative">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-zinc-900/50 text-zinc-700 text-xs">
                      暂无预览
                    </div>
                  )}

                  {/* Floating Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`px-2.5 py-1 rounded-md text-xs font-bold backdrop-blur-md ${product.card_count > 0
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                      {product.card_count > 0 ? '库存充足' : '暂时缺货'}
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 flex flex-col flex-1 gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-zinc-100 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-dashed border-zinc-800/50">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-zinc-500">CNY</span>
                      <span className="text-lg font-bold text-white">¥{Number(product.price).toFixed(2)}</span>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                      <ShoppingCart size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-zinc-500 border border-dashed border-zinc-900 rounded-2xl bg-zinc-900/10">
              <Layers className="h-12 w-12 opacity-20 mb-3" />
              <p className="text-sm">该分类下暂无商品</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
