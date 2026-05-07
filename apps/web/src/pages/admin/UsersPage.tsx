import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, MoreVertical, Shield, ShieldAlert, ShieldCheck, Ban, CheckCircle, Trash2 } from 'lucide-react';
import { apiClient } from '@/shared/api/client';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { Badge } from '@/shared/components/ui/Badge';
import { Pagination } from '@/shared/components/common/Pagination';
import { formatDate } from '@/shared/lib/utils';

type UserRole = 'CLIENT' | 'MANAGER' | 'ADMIN';
type UserStatus = 'ACTIVE' | 'BANNED';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  ordersCount: number;
  createdAt: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  CLIENT: 'Клієнт',
  MANAGER: 'Менеджер',
  ADMIN: 'Адміністратор',
};

const ROLE_VARIANTS: Record<UserRole, 'neutral' | 'warning' | 'error'> = {
  CLIENT: 'neutral',
  MANAGER: 'warning',
  ADMIN: 'error',
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search, roleFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);
      const response = await apiClient.get(`/admin/users?${params.toString()}`);
      return response.data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      return apiClient.patch(`/admin/users/${id}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setOpenMenuId(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: UserStatus }) => {
      return apiClient.patch(`/admin/users/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setOpenMenuId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setDeleteConfirm(null);
    },
  });

  const handleRoleChange = (userId: string, role: UserRole) => {
    updateRoleMutation.mutate({ id: userId, role });
  };

  const handleStatusChange = (userId: string, status: UserStatus) => {
    updateStatusMutation.mutate({ id: userId, status });
  };

  const handleDelete = (userId: string) => {
    deleteMutation.mutate(userId);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Користувачі</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Пошук за email або ім'ям..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as UserRole | '');
              setPage(1);
            }}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
          >
            <option value="">Всі ролі</option>
            <option value="CLIENT">Клієнти</option>
            <option value="MANAGER">Менеджери</option>
            <option value="ADMIN">Адміністратори</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as UserStatus | '');
              setPage(1);
            }}
            className="px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-primary-500"
          >
            <option value="">Всі статуси</option>
            <option value="ACTIVE">Активні</option>
            <option value="BANNED">Заблоковані</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">Користувачів не знайдено</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Користувач</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Email</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Телефон</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Роль</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Замовлень</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Статус</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-500">Дата реєстрації</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-neutral-500">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data?.data?.map((user: User) => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-sm">{user.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <Badge variant={ROLE_VARIANTS[user.role]}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm">{user.ordersCount}</td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === 'ACTIVE' ? 'success' : 'error'}>
                      {user.status === 'ACTIVE' ? 'Активний' : 'Заблокований'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                        className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {openMenuId === user.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-neutral-200 z-20 py-1">
                            <div className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase">
                              Змінити роль
                            </div>
                            <button
                              onClick={() => handleRoleChange(user.id, 'CLIENT')}
                              disabled={user.role === 'CLIENT' || updateRoleMutation.isPending}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2 disabled:opacity-50"
                            >
                              <Shield className="w-4 h-4" />
                              Клієнт
                              {user.role === 'CLIENT' && <span className="ml-auto text-primary-500">✓</span>}
                            </button>
                            <button
                              onClick={() => handleRoleChange(user.id, 'MANAGER')}
                              disabled={user.role === 'MANAGER' || updateRoleMutation.isPending}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2 disabled:opacity-50"
                            >
                              <ShieldCheck className="w-4 h-4 text-blue-500" />
                              Менеджер
                              {user.role === 'MANAGER' && <span className="ml-auto text-primary-500">✓</span>}
                            </button>
                            <button
                              onClick={() => handleRoleChange(user.id, 'ADMIN')}
                              disabled={user.role === 'ADMIN' || updateRoleMutation.isPending}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2 disabled:opacity-50"
                            >
                              <ShieldAlert className="w-4 h-4 text-red-500" />
                              Адміністратор
                              {user.role === 'ADMIN' && <span className="ml-auto text-primary-500">✓</span>}
                            </button>

                            <div className="border-t border-neutral-200 my-1" />

                            <div className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase">
                              Статус
                            </div>
                            {user.status === 'ACTIVE' ? (
                              <button
                                onClick={() => handleStatusChange(user.id, 'BANNED')}
                                disabled={updateStatusMutation.isPending}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2 text-red-600 disabled:opacity-50"
                              >
                                <Ban className="w-4 h-4" />
                                Заблокувати
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStatusChange(user.id, 'ACTIVE')}
                                disabled={updateStatusMutation.isPending}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2 text-green-600 disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Розблокувати
                              </button>
                            )}

                            <div className="border-t border-neutral-200 my-1" />

                            {deleteConfirm === user.id ? (
                              <div className="px-3 py-2">
                                <p className="text-sm text-red-600 mb-2">Видалити користувача?</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDelete(user.id)}
                                    disabled={deleteMutation.isPending}
                                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                  >
                                    Так
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="px-3 py-1 text-xs bg-neutral-200 rounded hover:bg-neutral-300"
                                  >
                                    Ні
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(user.id)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 flex items-center gap-2 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                                Видалити
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="border-t border-neutral-200 px-6 py-4">
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Error display */}
      {(updateRoleMutation.isError || updateStatusMutation.isError || deleteMutation.isError) && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg">
          {((updateRoleMutation.error || updateStatusMutation.error || deleteMutation.error) as any)?.response?.data?.message ||
            'Помилка виконання операції'}
        </div>
      )}
    </div>
  );
}
