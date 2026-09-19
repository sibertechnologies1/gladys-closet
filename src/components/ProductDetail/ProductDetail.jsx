import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer"
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';
import { pesewasToCedisInput } from '../../lib/format';
import { FiShoppingBag, FiCheck, FiBell } from 'react-icons/fi';
import PreOrderModal from '../PreOrderModal/PreOrderModal';
import SizeGuideModal from '../SizeGuideModal/SizeGuideModal';

export default function ProductDetail() {
  const { addToCart } = useCart();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [isPreOrderOpen, setIsPreOrderOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    async function fetchProductData() {
      if (!id) return;
      setLoading(true);

      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      const { data: variantsData } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', id);

      const { data: imagesData } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id);

      if (productData) {
        setProduct(productData);
      }

      if (variantsData && variantsData.length > 0) {
        setVariants(variantsData);
        const defaultVariant = variantsData.find((v) => (v.stock_quantity || 0) > 0) || variantsData[0];
        setSelectedVariant(defaultVariant);
      }

      // Consolidate images from product, variants, and gallery
      const collectedImages = [];
      if (imagesData && imagesData.length > 0) {
        collectedImages.push(...imagesData.map((i) => i.image_url));
      }
      if (productData?.image_urls && productData.image_urls.length > 0) {
        collectedImages.push(...productData.image_urls);
      }
      if (productData?.image_url) {
        collectedImages.push(productData.image_url);
      }

      const uniqueImages = Array.from(new Set(collectedImages)).filter(Boolean);
      setImages(uniqueImages);

      const primary = imagesData?.find((img) => img.is_primary)?.image_url;
      setActiveImage(primary || uniqueImages[0] || 'https://via.placeholder.com/400');

      setLoading(false);
    }

    fetchProductData();
  }, [id]);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setQuantity(1);

    const variantImg = variant.color_image_url || variant.image_url;
    if (variantImg && images.includes(variantImg)) {
      setActiveImage(variantImg);
    }
  };

  const formatPrice = (pesewas) => {
    if (typeof pesewasToCedisInput === 'function') {
      return Number(pesewasToCedisInput(pesewas));
    }
    return (Number(pesewas) || 0) / 100;
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.is_preorder) {
      setIsPreOrderOpen(true);
      return;
    }

    const displayPrice = formatPrice(product.price_pesewas);
    const mainImage = activeImage || 'https://via.placeholder.com/400';

    addToCart({
      ...product,
      id: product.id,
      name: `${product.name}${selectedVariant?.color_name ? ` (${selectedVariant.color_name})` : ''}`,
      price: displayPrice,
      price_pesewas: product.price_pesewas,
      image: mainImage,
      selected_variant_id: selectedVariant?.id || null,
      selected_color: selectedVariant?.color_name || selectedVariant?.color || null,
      selected_size: selectedVariant?.size || null,
      quantity,
      is_preorder: Boolean(product.is_preorder)
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return <div className="p-12 text-center text-purple-600 font-semibold">Loading product details...</div>;
  }

  if (!product) {
    return <div className="p-12 text-center text-gray-500">Product not found.</div>;
  }

  const priceGHS = formatPrice(product.price_pesewas);
  const currentStock = selectedVariant ? (selectedVariant.stock_quantity || 0) : (product.stock || 0);
  const isPreorder = Boolean(product.is_preorder);
  const isOutOfStock = !isPreorder && currentStock === 0;

  return (
    <div>
      <Navbar />
         <div className="min-h-screen flex items-center justify-center">
       <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
      {/* Left Column: Gallery */}
      <div className="flex flex-col gap-4">
        <div className="w-full h-96 border border-gray-100 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
          <img src={activeImage} alt={product.name} className="max-h-full max-w-full object-contain" />
        </div>

        {images.length > 1 && (
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {images.map((url, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(url)}
                className={`w-16 h-16 border-2 rounded-xl overflow-hidden shrink-0 cursor-pointer transition ${
                  activeImage === url ? 'border-purple-600' : 'border-gray-200'
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Info & Actions */}
      <div className="flex flex-col justify-start space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-purple-600">{product.category}</span>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-xs font-bold text-purple-600 hover:underline"
            >
              📏 Size Guide
            </button>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1">{product.name}</h1>
          <p className="text-2xl font-black text-gray-900 mt-2">GH₵ {Number(priceGHS).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">{product.description}</p>
        </div>

        {/* Color Options */}
        {variants.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Color: <span className="text-gray-900">{selectedVariant?.color_name || 'Select option'}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => {
                const outOfStock = !isPreorder && (variant.stock_quantity || 0) === 0;
                const isSelected = selectedVariant?.id === variant.id;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => handleVariantSelect(variant)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    } ${outOfStock ? 'opacity-50' : ''}`}
                  >
                    {variant.color_name || variant.color}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Stock Status */}
        <div>
          {isPreorder ? (
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
              Pre-Order Available
            </span>
          ) : isOutOfStock ? (
            <p className="text-sm font-semibold text-red-600">Out of Stock</p>
          ) : currentStock <= 5 ? (
            <p className="text-sm font-semibold text-amber-600">Only {currentStock} left!</p>
          ) : (
            <p className="text-sm font-semibold text-emerald-600">In Stock</p>
          )}
        </div>

        {/* Actions */}
        {!isOutOfStock ? (
          <div className="space-y-4">
            {!isPreorder && (
              <div className="flex items-center space-x-3">
                <label className="text-xs font-bold text-gray-500 uppercase">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-sm font-semibold outline-none focus:border-purple-600"
                >
                  {Array.from({ length: Math.min(currentStock, 10) }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${
                added ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {added ? (
                <><FiCheck className="w-5 h-5" /> Added to Cart</>
              ) : isPreorder ? (
                'Pre-Order Now'
              ) : (
                <><FiShoppingBag className="w-5 h-5" /> Add to Cart</>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button disabled className="w-full bg-gray-100 text-gray-400 py-3.5 rounded-xl font-bold cursor-not-allowed">
              Out of Stock
            </button>
            <button
              type="button"
              onClick={() => alert('Subscribed to back-in-stock notification!')}
              className="w-full border border-gray-200 text-gray-800 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <FiBell className="w-4 h-4" /> Notify Me
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {isPreOrderOpen && (
        <PreOrderModal product={product} onClose={() => setIsPreOrderOpen(false)} />
      )}
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
    </div>

    <Footer />
    </div>
   
   
  );
}