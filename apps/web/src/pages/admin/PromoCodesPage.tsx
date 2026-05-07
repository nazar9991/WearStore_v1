import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { Badge } from '@/shared/components/ui/Badge';
import { formatPrice, formatDate } from '@/shared/lib/utils';

interface PromoCode {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  startsAt?: string;
  expiresAt?: string;
  isActive: boolean;
}

interface PromoFormData {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: string;
  minOrderAmount: string;
  maxUses: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
}

const initialFormData: PromoFormData = {
  code: '',
  type: 'PERCENTAGE',
  value: '',
  minOrderAmount: '',
  maxUses: '',
  startsAt: '',
  expiresAt: '',
  isActive: true,
};

export default function PromoCodesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState<PromoFormData>(initialFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'promo-codes'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/promo-codes');
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: PromoFormData) => {
      const payload = {
        code: data.code.toUpperCase(),
        type: data.type,
        value: Number(data.value),
        minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : undefined,
        maxUses: data.maxUses ? Number(data.maxUses) : undefined,
        startsAt: data.startsAt || undefined,
        expiresAt: data.expiresAt || undefined,
        isActive: data.isActive,
      };
      return apiClient.post('/admin/promo-codes', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PromoFormData }) => {
      const payload = {
        code: data.code.toUpperCase(),
        type: data.type,
        value: Number(data.value),
        minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : undefined,
        maxUses: data.maxUses ? Number(data.maxUses) : undefined,
        startsAt: data.startsAt || undefined,
        expiresAt: data.expiresAt || undefined,
        isActive: data.isActive,
      };
      return apiClient.put(`/admin/promo-codes/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/admin/promo-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'promo-codes'] });
      setDeleteConfirm(null);
    },
  });

  const openCreateModal = () => {
    setEditingPromo(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      type: promo.type,
      value: String(promo.value),
      minOrderAmount: promo.minOrderAmount ? String(promo.minOrderAmount) : '',
      maxUses: promo.maxUses ? String(promo.maxUses) : '',
      startsAt: promo.startsAt ? promo.startsAt.slice(0, 16) : '',
      expiresAt: promo.expiresAt ? promo.expiresAt.slice(0, 16) : '',
      isActive: promo.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPromo(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPromo) {
      updateMutation.mutate({ id: editingPromo.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    setFormData((prev) => ({ ...prev, code }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Промокоди</h1>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Додати промокод
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500 mb-4">Промокодів поки немає</p>
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Створити перший промокод
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Код</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Тип</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Значення</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Мін. сума</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Використано</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Діє до</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Статус</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-500">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data?.data?.map((promo: PromoCode) => (
                <tr key={promo.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-mono font-bold">{promo.code}</td>
                  <td className="px-6 py-4 text-sm">
                    {promo.type === 'PERCENTAGE' ? 'Відсотки' : 'Фіксована сума'}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {promo.type === 'PERCENTAGE'
                      ? `${promo.value}%`
                      : formatPrice(promo.value)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {promo.minOrderAmount ? formatPrice(promo.minOrderAmount) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {promo.usedCount}{promo.maxUses ? ` / ${promo.maxUses}` : ''}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {promo.expiresAt ? formatDate(promo.expiresAt) : 'Безстроково'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={promo.isActive ? 'success' : 'neutral'}>
                      {promo.isActive ? 'Активний' : 'Неактивний'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(promo)}
                        className="p-2 text-neutral-400 hover:text-primary-500 transition-colors"
                        title="Редагувати"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {deleteConfirm === promo.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(promo.id)}
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
                          onClick={() => setDeleteConfirm(promo.id)}
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
                {editingPromo ? 'Редагувати промокод' : 'Новий промокод'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-neutral-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Код промокоду *
                </label>
                <div className="flex gap-2">
                  <input
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="SUMMER2024"
                    required
                    minLength={3}
                    maxLength={20}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-primary-500 focus:outline-none uppercase"
                  />
                  <Button type="button" variant="secondary" onClick={generateCode}>
                    Згенерувати
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Тип знижки *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-primary-500 focus:outline-none"
                >
                  <option value="PERCENTAGE">Відсотки (%)</option>
                  <option value="FIXED_AMOUNT">Фіксована сума (₴)</option>
                </select>
              </div>

              <Input
                label={formData.type === 'PERCENTAGE' ? 'Розмір знижки (%) *' : 'Сума знижки (₴) *'}
                name="value"
                type="number"
                value={formData.value}
                onChange={handleInputChange}
                placeholder={formData.type === 'PERCENTAGE' ? '10' : '100'}
                required
                min={1}
                max={formData.type === 'PERCENTAGE' ? 100 : undefined}
              />

              <Input
                label="Мінімальна сума замовлення (₴)"
                name="minOrderAmount"
                type="number"
                value={formData.minOrderAmount}
                onChange={handleInputChange}
                placeholder="500"
                min={0}
              />

              <Input
                label="Максимальна кількість використань"
                name="maxUses"
                type="number"
                value={formData.maxUses}
                onChange={handleInputChange}
                placeholder="Без обмежень"
                min={1}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Діє з
                  </label>
                  <input
                    name="startsAt"
                    type="datetime-local"
                    value={formData.startsAt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Діє до
                  </label>
                  <input
                    name="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="ml-2">Активний</span>
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

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={closeModal}>
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingPromo ? 'Зберегти' : 'Створити'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
