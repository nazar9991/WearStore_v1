import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X, GripVertical } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { Badge } from '@/shared/components/ui/Badge';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  parent?: { id: string; name: string; slug: string };
  _count?: { products: number; children: number };
}

interface CategoryFormData {
  name: string;
  description: string;
  imageUrl: string;
  parentId: string;
  sortOrder: number;
  isActive: boolean;
}

const initialFormData: CategoryFormData = {
  name: '',
  description: '',
  imageUrl: '',
  parentId: '',
  sortOrder: 0,
  isActive: true,
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/categories');
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const payload = {
        ...data,
        sortOrder: Number(data.sortOrder),
        parentId: data.parentId || undefined,
        imageUrl: data.imageUrl || undefined,
        description: data.description || undefined,
      };
      return apiClient.post('/admin/categories', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategoryFormData> }) => {
      const payload = {
        ...data,
        sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
        parentId: data.parentId || null,
        imageUrl: data.imageUrl || undefined,
        description: data.description || undefined,
      };
      return apiClient.put(`/admin/categories/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeleteConfirm(null);
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      parentId: category.parentId || '',
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Get available parent categories (exclude current category and its children)
  const getAvailableParents = () => {
    if (!editingCategory) return categories;

    const excludeIds = new Set<string>([editingCategory.id]);
    // Add all children recursively
    const addChildren = (parentId: string) => {
      categories.forEach((cat) => {
        if (cat.parentId === parentId && !excludeIds.has(cat.id)) {
          excludeIds.add(cat.id);
          addChildren(cat.id);
        }
      });
    };
    addChildren(editingCategory.id);

    return categories.filter((cat) => !excludeIds.has(cat.id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Категорії</h1>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Додати категорію
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 mb-4">Категорій поки немає</p>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Створити першу категорію
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Назва</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Slug</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Батьківська</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Товарів</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Статус</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-500">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {category.imageUrl && (
                        <img
                          src={category.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      )}
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{category.slug}</td>
                  <td className="px-6 py-4 text-sm">{category.parent?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm">{category._count?.products || 0}</td>
                  <td className="px-6 py-4">
                    <Badge variant={category.isActive ? 'success' : 'neutral'}>
                      {category.isActive ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 text-neutral-400 hover:text-primary-500 transition-colors"
                        title="Редагувати"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {deleteConfirm === category.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            disabled={deleteMutation.isPending}
                          >
                            Так
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-xs bg-neutral-200 rounded hover:bg-neutral-300"
                          >
                            Ні
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(category.id)}
                          className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                          title="Видалити"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold">
                {editingCategory ? 'Редагувати категорію' : 'Нова категорія'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-neutral-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Назва категорії *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Введіть назву"
                required
              />

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Опис
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Опис категорії..."
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                />
              </div>

              <Input
                label="URL зображення"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
              />

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Батьківська категорія
                </label>
                <select
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Без батьківської (головна)</option>
                  {getAvailableParents().map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Порядок сортування"
                name="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={handleInputChange}
                placeholder="0"
              />

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="ml-2">Активна (відображається на сайті)</span>
              </label>

              {(createMutation.isError || updateMutation.isError) && (
                <div className="text-sm text-red-500">
                  <p>
                    {((createMutation.error || updateMutation.error) as any)?.response?.data?.message ||
                      'Помилка збереження'}
                  </p>
                  {((createMutation.error || updateMutation.error) as any)?.response?.data?.errors && (
                    <ul className="mt-1 list-disc list-inside">
                      {Object.entries(
                        ((createMutation.error || updateMutation.error) as any)?.response?.data?.errors || {}
                      ).map(([field, messages]) => (
                        <li key={field}>
                          {field}: {(messages as string[]).join(', ')}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {deleteMutation.isError && (
                <p className="text-sm text-red-500">
                  {(deleteMutation.error as any)?.response?.data?.message || 'Помилка видалення'}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={closeModal}>
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingCategory ? 'Зберегти' : 'Створити'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
