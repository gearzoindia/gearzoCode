import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createApiClient } from '../create-api-client';
import { useAuthStore } from '../auth-store';
import type {
  AdminLoginInput,
  AdminTotpInput,
  AuthResponse,
  Booking,
} from '@gearzo/schemas';

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3003/api/v1';
export const adminApi = createApiClient({ baseURL, audience: 'admin' });

// ==================== Admin Auth ====================

export function useAdminLogin() {
  return useMutation({
    mutationFn: async (input: AdminLoginInput) => {
      const res = await adminApi.post<{ requiresTotp: boolean; tempToken?: string; tokens?: AuthResponse['tokens']; user?: AuthResponse['user'] }>(
        '/admin/auth/login',
        input
      );
      return res.data;
    },
  });
}

export function useAdminVerifyTotp() {
  const { signIn } = useAuthStore();
  return useMutation({
    mutationFn: async ({ code, tempToken }: AdminTotpInput & { tempToken: string }) => {
      const res = await adminApi.post<AuthResponse>('/admin/auth/totp/verify', { code, tempToken });
      await signIn(res.data.tokens, res.data.user);
      return res.data;
    },
  });
}

// ==================== Dashboard & Live Map ====================

export interface AdminDashboardMetrics {
  totalBookingsToday: number;
  activeMechanicsCount: number;
  revenueTodayPaise: number;
  openDisputesCount: number;
  pendingKycCount: number;
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async (): Promise<AdminDashboardMetrics> => {
      const res = await adminApi.get<AdminDashboardMetrics>('/admin/dashboard/metrics');
      return res.data;
    },
  });
}

export interface LiveMapEntity {
  id: string;
  name: string;
  type: 'mechanic' | 'customer';
  latitude: number;
  longitude: number;
  status: string;
}

export function useAdminLiveMap() {
  return useQuery({
    queryKey: ['admin', 'live-map'],
    queryFn: async (): Promise<LiveMapEntity[]> => {
      const res = await adminApi.get<LiveMapEntity[]>('/admin/live-map');
      return res.data;
    },
    refetchInterval: 10000,
  });
}

// ==================== Bookings Management ====================

export function useAdminBookings(filters?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ['admin', 'bookings', filters],
    queryFn: async (): Promise<Booking[]> => {
      const res = await adminApi.get<Booking[]>('/admin/bookings', { params: filters });
      return res.data;
    },
  });
}

export function useAdminBookingDetail(bookingId: string) {
  return useQuery({
    queryKey: ['admin', 'bookings', bookingId],
    queryFn: async (): Promise<Booking> => {
      const res = await adminApi.get<Booking>(`/admin/bookings/${bookingId}`);
      return res.data;
    },
    enabled: !!bookingId,
  });
}

// ==================== Mechanics & KYC ====================

export interface AdminMechanicRow {
  id: string;
  name: string;
  phone: string;
  type: string;
  kycStatus: string;
  rating: number;
  isOnline: boolean;
  totalJobs: number;
}

export function useAdminMechanics(search?: string) {
  return useQuery({
    queryKey: ['admin', 'mechanics', search],
    queryFn: async (): Promise<AdminMechanicRow[]> => {
      const res = await adminApi.get<AdminMechanicRow[]>('/admin/mechanics', { params: { search } });
      return res.data;
    },
  });
}

export function useAdminMechanicDetail(mechanicId: string) {
  return useQuery({
    queryKey: ['admin', 'mechanics', mechanicId],
    queryFn: async (): Promise<AdminMechanicRow> => {
      const res = await adminApi.get<AdminMechanicRow>(`/admin/mechanics/${mechanicId}`);
      return res.data;
    },
    enabled: !!mechanicId,
  });
}

export function useAdminKycQueue() {
  return useQuery({
    queryKey: ['admin', 'kyc-queue'],
    queryFn: async (): Promise<AdminMechanicRow[]> => {
      const res = await adminApi.get<AdminMechanicRow[]>('/admin/mechanics/kyc/queue');
      return res.data;
    },
  });
}

export function useAdminReviewKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      mechanicId,
      status,
      notes,
    }: {
      mechanicId: string;
      status: 'VERIFIED' | 'REJECTED';
      notes?: string;
    }) => {
      const res = await adminApi.post(`/admin/mechanics/${mechanicId}/kyc/review`, { status, notes });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'kyc-queue'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'mechanics'] });
    },
  });
}

// ==================== Customers Management ====================

export interface AdminCustomerRow {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalBookings: number;
  totalSpentPaise: number;
  createdAt: string;
}

export function useAdminCustomers(search?: string) {
  return useQuery({
    queryKey: ['admin', 'customers', search],
    queryFn: async (): Promise<AdminCustomerRow[]> => {
      const res = await adminApi.get<AdminCustomerRow[]>('/admin/customers', { params: { search } });
      return res.data;
    },
  });
}

export function useAdminCustomerDetail(customerId: string) {
  return useQuery({
    queryKey: ['admin', 'customers', customerId],
    queryFn: async (): Promise<AdminCustomerRow> => {
      const res = await adminApi.get<AdminCustomerRow>(`/admin/customers/${customerId}`);
      return res.data;
    },
    enabled: !!customerId,
  });
}

// ==================== Disputes ====================

export interface AdminDisputeRow {
  id: string;
  bookingId: string;
  customerName: string;
  mechanicName: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'REJECTED';
  amountPaise: number;
  createdAt: string;
}

export function useAdminDisputes() {
  return useQuery({
    queryKey: ['admin', 'disputes'],
    queryFn: async (): Promise<AdminDisputeRow[]> => {
      const res = await adminApi.get<AdminDisputeRow[]>('/admin/disputes');
      return res.data;
    },
  });
}

export function useAdminDisputeDetail(disputeId: string) {
  return useQuery({
    queryKey: ['admin', 'disputes', disputeId],
    queryFn: async (): Promise<AdminDisputeRow> => {
      const res = await adminApi.get<AdminDisputeRow>(`/admin/disputes/${disputeId}`);
      return res.data;
    },
    enabled: !!disputeId,
  });
}

export function useAdminResolveDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      disputeId,
      resolution,
      refundPaise,
    }: {
      disputeId: string;
      resolution: string;
      refundPaise?: number;
    }) => {
      const res = await adminApi.post(`/admin/disputes/${disputeId}/resolve`, { resolution, refundPaise });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'disputes'] });
    },
  });
}

// ==================== Finance ====================

export function useAdminRefunds() {
  return useQuery({
    queryKey: ['admin', 'refunds'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/finance/refunds');
      return res.data;
    },
  });
}

export function useAdminPayouts() {
  return useQuery({
    queryKey: ['admin', 'payouts'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/finance/payouts');
      return res.data;
    },
  });
}

// ==================== Super Admin & Master Data ====================

export function useAdminCatalogueCategories() {
  return useQuery({
    queryKey: ['admin', 'catalogue', 'categories'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/catalogue/categories');
      return res.data;
    },
  });
}

export function useAdminCatalogueServices() {
  return useQuery({
    queryKey: ['admin', 'catalogue', 'services'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/catalogue/services');
      return res.data;
    },
  });
}

export function useAdminVehicleBrands() {
  return useQuery({
    queryKey: ['admin', 'vehicles', 'brands'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/vehicles/brands');
      return res.data;
    },
  });
}

export function useAdminSystemHealth() {
  return useQuery({
    queryKey: ['admin', 'system-health'],
    queryFn: async () => {
      const res = await adminApi.get<{ status: string; uptime: number; redis: string; db: string }>('/admin/system/health');
      return res.data;
    },
  });
}
