import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock API client - must be before imports
vi.mock('../../src/shared/api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { useAuthStore } from '../../src/features/auth/store/authStore';
import { apiClient } from '../../src/shared/api/client';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isLoading: false,
      isAuthenticated: false,
    });
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('has correct initial state', () => {
    const state = useAuthStore.getState();

    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
  });

  describe('login', () => {
    it('sets user and token on successful login', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT',
      };

      // Mock login response
      vi.mocked(apiClient.post).mockResolvedValue({
        data: {
          data: {
            accessToken: 'test-token',
          },
        },
      });

      // Mock fetchMe response
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          data: mockUser,
        },
      });

      await useAuthStore.getState().login('test@test.com', 'password');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe('test-token');
      expect(state.isAuthenticated).toBe(true);
    });

    it('throws error on failed login', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        useAuthStore.getState().login('test@test.com', 'wrong')
      ).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('clears user and token', async () => {
      // Set initial logged in state
      useAuthStore.setState({
        user: { id: 'user-1', email: 'test@test.com' } as any,
        accessToken: 'token',
        isAuthenticated: true,
      });

      vi.mocked(apiClient.post).mockResolvedValue({});

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('clears state even if logout API fails', async () => {
      useAuthStore.setState({
        user: { id: 'user-1', email: 'test@test.com' } as any,
        accessToken: 'token',
        isAuthenticated: true,
      });

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('setUser', () => {
    it('updates user in state', () => {
      const mockUser = {
        id: 'user-1',
        email: 'new@test.com',
        firstName: 'Jane',
        lastName: 'Doe',
        role: 'CLIENT',
      };

      useAuthStore.getState().setUser(mockUser as any);

      expect(useAuthStore.getState().user).toEqual(mockUser);
    });
  });

  describe('setAccessToken', () => {
    it('updates access token in state', () => {
      useAuthStore.getState().setAccessToken('new-token');

      expect(useAuthStore.getState().accessToken).toBe('new-token');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('sets isAuthenticated to false when token is null', () => {
      useAuthStore.setState({ isAuthenticated: true });
      useAuthStore.getState().setAccessToken(null);

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('fetchMe', () => {
    it('fetches and sets user data', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@test.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT',
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { data: mockUser },
      });

      await useAuthStore.getState().fetchMe();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('clears auth state on fetchMe failure', async () => {
      useAuthStore.setState({
        accessToken: 'token',
        isAuthenticated: true,
      });

      vi.mocked(apiClient.get).mockRejectedValue(new Error('Unauthorized'));

      await useAuthStore.getState().fetchMe();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
