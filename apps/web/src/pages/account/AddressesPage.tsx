import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, MapPin, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/shared/api/client';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';

interface Address {
  id: string;
  label: string;
  city: string;
  street: string;
  building: string;
  apartment?: string;
  postalCode: string;
  isDefault: boolean;
}

interface AddressFormData {
  label: string;
  city: string;
  street: string;
  building: string;
  apartment: string;
  postalCode: string;
  isDefault: boolean;
}

const initialFormData: AddressFormData = {
  label: '',
  city: '',
  street: '',
  building: '',
  apartment: '',
  postalCode: '',
  isDefault: false,
};

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await apiClient.get('/profile/addresses');
      return response.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AddressFormData) => {
      const payload = {
        ...data,
        apartment: data.apartment || undefined,
      };
      return apiClient.post('/profile/addresses', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Адресу додано');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка збереження');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AddressFormData }) => {
      const payload = {
        ...data,
        apartment: data.apartment || undefined,
      };
      return apiClient.patch(`/profile/addresses/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Адресу оновлено');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка збереження');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/profile/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Адресу видалено');
      setDeleteConfirm(null);
    },
    onError: () => {
      toast.error('Помилка видалення');
    },
  });

  const openCreateModal = () => {
    setEditingAddress(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      city: address.city,
      street: address.street,
      building: address.building,
      apartment: address.apartment || '',
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    setFormData(initialFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Адреси доставки</h1>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Додати адресу
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : addresses?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address: Address) => (
            <div
              key={address.id}
              className="bg-white rounded-xl border border-neutral-200 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{address.label}</span>
                  {address.isDefault && (
                    <Badge variant="primary">
                      <Star className="w-3 h-3 mr-1" />
                      За замовчуванням
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(address)}
                    className="p-2 text-neutral-400 hover:text-primary-500 transition-colors"
                    title="Редагувати"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {deleteConfirm === address.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => deleteMutation.mutate(address.id)}
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
                      onClick={() => setDeleteConfirm(address.id)}
                      className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                      title="Видалити"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-neutral-600">
                {address.city}, {address.street}, {address.building}
                {address.apartment && `, кв. ${address.apartment}`}
              </p>
              {address.postalCode && (
                <p className="text-sm text-neutral-500 mt-1">{address.postalCode}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <MapPin className="w-16 h-16 mx-auto text-neutral-300 mb-4" />
          <h2 className="text-xl font-medium mb-2">Адрес поки немає</h2>
          <p className="text-neutral-600 mb-6">
            Додайте адресу для швидкого оформлення замовлень
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Додати першу адресу
          </Button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <h2 className="text-xl font-semibold">
                {editingAddress ? 'Редагувати адресу' : 'Нова адреса'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-neutral-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Назва адреси *"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                placeholder="Дім, Офіс, тощо"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Місто *"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Київ"
                  required
                />
                <Input
                  label="Поштовий індекс *"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="01001"
                  required
                />
              </div>

              <Input
                label="Вулиця *"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="вул. Хрещатик"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Будинок *"
                  name="building"
                  value={formData.building}
                  onChange={handleInputChange}
                  placeholder="1"
                  required
                />
                <Input
                  label="Квартира"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleInputChange}
                  placeholder="1"
                />
              </div>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="ml-2">Використовувати за замовчуванням</span>
              </label>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={closeModal}>
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingAddress ? 'Зберегти' : 'Додати'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
