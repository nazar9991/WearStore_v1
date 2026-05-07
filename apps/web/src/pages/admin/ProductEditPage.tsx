import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Upload,
  Link as LinkIcon,
  X,
  Star,
  Trash2,
  Plus,
  RefreshCw,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { apiClient } from '@/shared/api/client';
import { cn, SIZE_LABELS } from '@/shared/lib/utils';

interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  priceAddon: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Images are proxied through Vite, so we use relative URLs

export default function ProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    basePrice: '',
    salePrice: '',
    material: '',
    careInstructions: '',
    isFeatured: false,
    isActive: true,
  });

  // Image states
  const [imageUrl, setImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState('');

  // Variant state
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    size: 'M',
    color: '',
    stock: 0,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await apiClient.get('/catalog/categories');
      return response.data.data;
    },
  });

  // Fetch product if editing
  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/products/${id}`);
      return response.data.data;
    },
    enabled: isEditMode,
  });

  // Fill form when product is loaded
  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        categoryId: product.categoryId || '',
        basePrice: product.basePrice?.toString() || '',
        salePrice: product.salePrice?.toString() || '',
        material: product.material || '',
        careInstructions: product.careInstructions || '',
        isFeatured: product.isFeatured || false,
        isActive: product.isActive ?? true,
      });
    }
  }, [product]);

  // Generate SKU mutation
  const generateSkuMutation = useMutation({
    mutationFn: async (categoryId?: string) => {
      const params = categoryId ? `?categoryId=${categoryId}` : '';
      const response = await apiClient.get(`/admin/products/generate-sku${params}`);
      return response.data.data.sku;
    },
    onSuccess: (sku) => {
      setFormData((prev) => ({ ...prev, sku }));
    },
  });

  // Create/Update product mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        basePrice: parseFloat(data.basePrice),
        salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
        sku: data.sku || undefined, // Let backend generate if empty
      };

      if (isEditMode) {
        return apiClient.put(`/admin/products/${id}`, payload);
      } else {
        return apiClient.post('/admin/products', payload);
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      if (!isEditMode) {
        // Navigate to edit mode for newly created product
        navigate(`/admin/products/${response.data.data.id}/edit`, { replace: true });
      }
    },
  });

  // Add image by URL mutation
  const addImageMutation = useMutation({
    mutationFn: async ({ url, isPrimary }: { url: string; isPrimary?: boolean }) => {
      return apiClient.post(`/admin/products/${id}/images`, { url, isPrimary });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] });
      setImageUrl('');
      setImageError('');
    },
    onError: (error: any) => {
      setImageError(error.response?.data?.message || 'Помилка додавання зображення');
    },
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async ({ file, isPrimary }: { file: File; isPrimary?: boolean }) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('isPrimary', isPrimary ? 'true' : 'false');

      return apiClient.post(`/admin/products/${id}/images/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] });
      setImageError('');
    },
    onError: (error: any) => {
      setImageError(error.response?.data?.message || 'Помилка завантаження зображення');
    },
  });

  // Delete image mutation
  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      return apiClient.delete(`/admin/products/${id}/images/${imageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] });
    },
  });

  // Set primary image mutation
  const setPrimaryImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      // Delete and re-add as primary
      const image = product?.images.find((img: ProductImage) => img.id === imageId);
      if (!image) return;

      // Add as primary (service handles removing other primary flags)
      return apiClient.post(`/admin/products/${id}/images`, {
        url: image.url,
        altText: image.altText,
        isPrimary: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] });
    },
  });

  // Add variant mutation
  const addVariantMutation = useMutation({
    mutationFn: async (data: typeof newVariant) => {
      return apiClient.post(`/admin/products/${id}/variants`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] });
      setShowVariantForm(false);
      setNewVariant({ size: 'M', color: '', stock: 0 });
    },
  });

  // Delete variant mutation
  const deleteVariantMutation = useMutation({
    mutationFn: async (variantId: string) => {
      return apiClient.delete(`/admin/products/${id}/variants/${variantId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] });
    },
  });

  // Update variant mutation
  const updateVariantMutation = useMutation({
    mutationFn: async ({ variantId, stock }: { variantId: string; stock: number }) => {
      return apiClient.patch(`/admin/products/${id}/variants/${variantId}`, { stock });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-product', id] });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    setImageError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const isPrimary = !product?.images?.length && i === 0;
        await uploadImageMutation.mutateAsync({ file: files[i], isPrimary });
      }
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddImageByUrl = () => {
    if (!imageUrl.trim()) return;
    const isPrimary = !product?.images?.length;
    addImageMutation.mutate({ url: imageUrl.trim(), isPrimary });
  };

  const getImageUrl = (url: string) => {
    // URL is either full http URL or relative /uploads/... path
    // Both work because Vite proxies /uploads to API
    return url;
  };

  if (isEditMode && isLoadingProduct) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/admin/products"
        className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад до товарів
      </Link>

      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Редагування товару' : 'Новий товар'}
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold mb-4">Основна інформація</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Артикул (SKU)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        placeholder="Автоматично"
                        className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => generateSkuMutation.mutate(formData.categoryId)}
                        disabled={generateSkuMutation.isPending}
                      >
                        <RefreshCw
                          className={cn('w-4 h-4', generateSkuMutation.isPending && 'animate-spin')}
                        />
                      </Button>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Залиште порожнім для автогенерації
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Категорія *
                    </label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">Виберіть категорію</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Назва товару *"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Введіть назву товару"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Короткий опис
                  </label>
                  <textarea
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Короткий опис для каталогу..."
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Повний опис *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Детальний опис товару..."
                    required
                    className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Матеріал"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    placeholder="Наприклад: Бавовна 100%"
                  />
                  <Input
                    label="Догляд"
                    name="careInstructions"
                    value={formData.careInstructions}
                    onChange={handleInputChange}
                    placeholder="Інструкції з догляду"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold mb-4">Ціна</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Базова ціна (грн) *"
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
                <Input
                  label="Ціна зі знижкою (грн)"
                  type="number"
                  name="salePrice"
                  value={formData.salePrice}
                  onChange={handleInputChange}
                  placeholder="Залиште порожнім, якщо немає знижки"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Images - only show for existing products */}
            {isEditMode && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold mb-4">Зображення</h2>

                {/* Current images */}
                {product?.images?.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {product.images.map((image: ProductImage) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={getImageUrl(image.url)}
                          alt={image.altText || 'Product image'}
                          className="w-full aspect-square object-cover rounded-lg border border-neutral-200"
                        />
                        {image.isPrimary && (
                          <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                            Головне
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!image.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setPrimaryImageMutation.mutate(image.id)}
                              className="p-1.5 bg-white rounded-lg shadow hover:bg-neutral-100"
                              title="Зробити головним"
                            >
                              <Star className="w-4 h-4 text-amber-500" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteImageMutation.mutate(image.id)}
                            className="p-1.5 bg-white rounded-lg shadow hover:bg-red-50"
                            title="Видалити"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload options */}
                <div className="space-y-4">
                  {/* File upload */}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors"
                    >
                      {isUploadingImage ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-neutral-400" />
                          <span className="text-neutral-600">
                            Натисніть для завантаження або перетягніть файли
                          </span>
                        </>
                      )}
                    </button>
                    <p className="text-xs text-neutral-500 mt-1 text-center">
                      PNG, JPG, WebP до 10MB
                    </p>
                  </div>

                  {/* URL input */}
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Або вставте URL зображення..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-neutral-300 focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddImageByUrl}
                      disabled={!imageUrl.trim() || addImageMutation.isPending}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Додати
                    </Button>
                  </div>

                  {imageError && <p className="text-sm text-red-500">{imageError}</p>}
                </div>
              </div>
            )}

            {/* Variants - only show for existing products */}
            {isEditMode && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Варіанти (розмір/колір)</h2>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowVariantForm(!showVariantForm)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Додати варіант
                  </Button>
                </div>

                {/* Add variant form */}
                {showVariantForm && (
                  <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Розмір
                        </label>
                        <select
                          value={newVariant.size}
                          onChange={(e) =>
                            setNewVariant((prev) => ({ ...prev, size: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-primary-500 focus:outline-none"
                        >
                          {Object.entries(SIZE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Колір
                        </label>
                        <input
                          type="text"
                          value={newVariant.color}
                          onChange={(e) =>
                            setNewVariant((prev) => ({ ...prev, color: e.target.value }))
                          }
                          placeholder="Чорний"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Кількість
                        </label>
                        <input
                          type="number"
                          value={newVariant.stock}
                          onChange={(e) =>
                            setNewVariant((prev) => ({ ...prev, stock: parseInt(e.target.value) || 0 }))
                          }
                          min="0"
                          className="w-full px-3 py-2 rounded-lg border border-neutral-300 focus:border-primary-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowVariantForm(false)}
                      >
                        Скасувати
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addVariantMutation.mutate(newVariant)}
                        disabled={!newVariant.color.trim() || addVariantMutation.isPending}
                      >
                        Додати
                      </Button>
                    </div>
                  </div>
                )}

                {/* Variants list */}
                {product?.variants?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-neutral-200">
                          <th className="text-left py-2 px-3 text-sm font-medium text-neutral-600">
                            Розмір
                          </th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-neutral-600">
                            Колір
                          </th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-neutral-600">
                            Кількість
                          </th>
                          <th className="text-right py-2 px-3 text-sm font-medium text-neutral-600">
                            Дії
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.variants.map((variant: ProductVariant) => (
                          <tr key={variant.id} className="border-b border-neutral-100">
                            <td className="py-2 px-3">{SIZE_LABELS[variant.size] || variant.size}</td>
                            <td className="py-2 px-3">{variant.color}</td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                defaultValue={variant.stock}
                                min="0"
                                className="w-20 px-2 py-1 rounded border border-neutral-200 focus:border-primary-500 focus:outline-none"
                                onBlur={(e) => {
                                  const newStock = parseInt(e.target.value) || 0;
                                  if (newStock !== variant.stock) {
                                    updateVariantMutation.mutate({
                                      variantId: variant.id,
                                      stock: newStock,
                                    });
                                  }
                                }}
                              />
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => deleteVariantMutation.mutate(variant.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-neutral-500 text-center py-4">
                    Варіанти не додані. Додайте хоча б один варіант для продажу товару.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold mb-4">Статус</h2>

              <div className="space-y-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-2">Активний (відображається в каталозі)</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="ml-2">Рекомендований товар</span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={saveMutation.isPending}
                  isLoading={saveMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Зберегти зміни' : 'Створити товар'}
                </Button>

                <Link to="/admin/products" className="block">
                  <Button type="button" variant="ghost" className="w-full">
                    Скасувати
                  </Button>
                </Link>
              </div>

              {saveMutation.isError && (
                <p className="text-sm text-red-500 mt-3">
                  {(saveMutation.error as any)?.response?.data?.message || 'Помилка збереження'}
                </p>
              )}

              {saveMutation.isSuccess && (
                <p className="text-sm text-green-600 mt-3">Товар успішно збережено!</p>
              )}
            </div>

            {/* Help */}
            {!isEditMode && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>Підказка:</strong> Спочатку створіть товар, потім ви зможете додати
                  зображення та варіанти (розміри/кольори).
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
