import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Category, Product } from '../types';
import { Button, Badge, Markdown } from '../components/ui';
import { Layers, Loader2 } from 'lucide-react';

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
          if (catRes.data.length > 0) setSelectedCategory(catRes.data[0].id);
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
      <div className="flex h-[50vh] items-center justify-center text-zinc-500">
        <Loader2 className="animate-spin mr-2" /> 加载中...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4 mb-8">
        <div className="text-zinc-400 bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/50">
          {notice ? (
            <Markdown content={notice} />
          ) : (
            <p>选择您需要的商品开始购物</p>
          )}
        </div>
      </div>

      {/* Categories */}
      <section>
        <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-800 pb-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === null 
                ? 'bg-white text-black' 
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            全部商品
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white text-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className="group cursor-pointer rounded-xl border border-zinc-900 bg-zinc-950 overflow-hidden transition-all hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-900/50"
              >
                {product.image && (
                  <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-900">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-white group-hover:text-blue-400 transition-colors">
                      {product.name}
                    </h3>
                    <Badge variant={product.card_count > 0 ? 'success' : 'warning'}>
                      {product.card_count > 0 ? '库存充足' : '已售罄'}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xl font-bold text-white">¥{Number(product.price).toFixed(2)}</span>
                    <Button variant="secondary" className="h-8 text-xs">
                      查看详情
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-zinc-500">
              <Layers className="mx-auto h-12 w-12 opacity-20 mb-4" />
              <p>该分类下暂无商品</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
