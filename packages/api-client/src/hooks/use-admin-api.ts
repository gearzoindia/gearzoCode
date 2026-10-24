import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createApiClient } from '../create-api-client';
import { useAuthStore } from '../auth-store';
import type {
  AdminTotpInput,
  AuthResponse,
} from '@gearzo/schemas';

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4003/v1';
export const adminApi = createApiClient({ baseURL, audience: 'admin' });

// ==================== Admin Auth ====================

export interface AdminLoginResponse {
  challengeId?: string;
  next?: string;
  maskedPhone?: string;
  message?: string;
  requiresTotp?: boolean;
  tempToken?: string;
  tokens?: AuthResponse['tokens'];
  user?: AuthResponse['user'];
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: async (input: { email?: string; identifier?: string; password: string }): Promise<AdminLoginResponse> => {
      const res = await adminApi.post(
        '/admin/auth/login',
        {
          identifier: input.identifier || input.email,
          password: input.password,
        }
      );
      const data = (res.data as any)?.data || res.data;
      return data;
    },
  });
}

export function useAdminVerifyOtp() {
  const { signIn } = useAuthStore();
  return useMutation({
    mutationFn: async ({ challengeId, otp }: { challengeId: string; otp: string }) => {
      const res = await adminApi.post('/admin/auth/otp/verify', { challengeId, otp });
      const data = (res.data as any)?.data || res.data;
      if (data.tokens && (data.admin || data.user)) {
        await signIn(data.tokens, data.admin || data.user);
      }
      return data;
    },
  });
}

export function useAdminVerifyTotp() {
  const { signIn } = useAuthStore();
  return useMutation({
    mutationFn: async ({ code, tempToken, challengeId }: AdminTotpInput & { tempToken?: string; challengeId?: string }) => {
      const res = await adminApi.post('/admin/auth/2fa/verify', { code, tempToken, challengeId });
      const data = (res.data as any)?.data || res.data;
      if (data.tokens && (data.admin || data.user)) {
        await signIn(data.tokens, data.admin || data.user);
      }
      return data;
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
      const res = await adminApi.get('/admin/dashboard/metrics');
      const d = (res.data as any)?.data || res.data || {};
      const m = d?.metrics || d;
      return {
        totalBookingsToday: m.totalBookings ?? m.totalBookingsToday ?? 0,
        activeMechanicsCount: m.onlineMechanics ?? m.activeMechanicsCount ?? 0,
        revenueTodayPaise: m.totalRevenuePaise ?? m.revenueTodayPaise ?? 0,
        openDisputesCount: m.openDisputes ?? m.openDisputesCount ?? 0,
        pendingKycCount: m.pendingKycCount ?? 0,
      };
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
      const res = await adminApi.get('/admin/live-map');
      const d = (res.data as any)?.data || res.data;
      return Array.isArray(d) ? d : (d?.items || []);
    },
    refetchInterval: 10000,
  });
}

// ==================== Bookings Management ====================

export function useAdminBookings(filters?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ['admin', 'bookings', filters],
    queryFn: async (): Promise<any[]> => {
      const res = await adminApi.get('/admin/bookings', { params: filters });
      const d = (res.data as any)?.data || res.data;
      const items = Array.isArray(d) ? d : (d?.items || []);
      return items.map((b: any) => ({
        ...b,
        id: b.id,
        code: b.code || b.id.slice(0, 8),
        serviceName: b.instructions || b.serviceName || 'Vehicle Service',
        vehicleSummary: b.vehicleSnapshot
          ? `${b.vehicleSnapshot.brand} ${b.vehicleSnapshot.model} (${b.vehicleSnapshot.registrationNumber})`
          : (b.vehicleSummary || 'Vehicle'),
        scheduledAt: b.scheduledAt || b.createdAt,
        status: b.status,
        totalAmountPaise: b.estimatedTotalPaise || b.finalTotalPaise || b.totalAmountPaise || 0,
      }));
    },
  });
}

export function useAdminBookingDetail(bookingId: string) {
  return useQuery({
    queryKey: ['admin', 'bookings', bookingId],
    queryFn: async (): Promise<any> => {
      const res = await adminApi.get(`/admin/bookings/${bookingId}`);
      const b = (res.data as any)?.data || res.data;
      if (!b) return null;
      return {
        ...b,
        id: b.id,
        code: b.code || b.id.slice(0, 8),
        serviceName: b.instructions || b.serviceName || 'Vehicle Service',
        vehicleSummary: b.vehicleSnapshot
          ? `${b.vehicleSnapshot.brand} ${b.vehicleSnapshot.model} (${b.vehicleSnapshot.registrationNumber})`
          : (b.vehicleSummary || 'Vehicle'),
        scheduledAt: b.scheduledAt || b.createdAt,
        status: b.status,
        totalAmountPaise: b.estimatedTotalPaise || b.finalTotalPaise || b.totalAmountPaise || 0,
      };
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
      const res = await adminApi.get('/admin/mechanics', { params: { search } });
      const d = (res.data as any)?.data || res.data;
      const items = Array.isArray(d) ? d : (d?.items || []);
      return items.map((m: any) => ({
        id: m.id,
        name: m.name || 'Unnamed Mechanic',
        phone: m.phone,
        type: m.registrationType || m.type || 'INDIVIDUAL',
        kycStatus: m.status || m.kycStatus || 'SUBMITTED',
        rating: m.profile?.ratingAvg || m.rating || 5.0,
        isOnline: m.presences?.[0]?.status === 'ONLINE_AVAILABLE' || m.isOnline || false,
        totalJobs: m.totalBookings || m.totalJobs || 0,
      }));
    },
  });
}

export function useAdminMechanicDetail(mechanicId: string) {
  return useQuery({
    queryKey: ['admin', 'mechanics', mechanicId],
    queryFn: async (): Promise<any> => {
      const res = await adminApi.get(`/admin/mechanics/${mechanicId}`);
      const m = (res.data as any)?.data || res.data;
      if (!m) return null;
      return {
        id: m.id,
        name: m.name || 'Unnamed Mechanic',
        phone: m.phone,
        type: m.registrationType || m.type || 'INDIVIDUAL',
        kycStatus: m.status || m.kycStatus || 'SUBMITTED',
        rating: m.profile?.ratingAvg || m.rating || 5.0,
        isOnline: m.presences?.[0]?.status === 'ONLINE_AVAILABLE' || m.isOnline || false,
        totalJobs: m.totalBookings || m.totalJobs || 0,
        ...m,
      };
    },
    enabled: !!mechanicId,
  });
}

export function useAdminKycQueue() {
  return useQuery({
    queryKey: ['admin', 'kyc-queue'],
    queryFn: async (): Promise<AdminMechanicRow[]> => {
      const res = await adminApi.get('/admin/mechanics/kyc-queue');
      const d = (res.data as any)?.data || res.data;
      const items = Array.isArray(d) ? d : (d?.items || []);
      return items.map((m: any) => ({
        id: m.id,
        name: m.name || 'Unnamed Mechanic',
        phone: m.phone,
        type: m.registrationType || m.type || 'INDIVIDUAL',
        kycStatus: m.status || m.kycStatus || 'PENDING_REVIEW',
        rating: m.rating || 0,
        isOnline: false,
        totalJobs: 0,
      }));
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
      return (res.data as any)?.data || res.data;
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

export interface AdminCustomerDetail {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  status: string;
  city?: { id: string; name: string } | string | null;
  createdAt: string;
  updatedAt?: string;
  totalBookings: number;
  totalSpentPaise: number;
  vehicles: Array<{
    id: string;
    model: string;
    reg: string;
    type: string;
  }>;
  addresses: Array<{
    id: string;
    label?: string;
    area?: { id: string; name: string };
    isDefault?: boolean;
  }>;
  bookings: Array<{
    id: string;
    code: string;
    status: string;
    serviceMode: string;
    estimatedTotalPaise: number;
    createdAt: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
  }>;
}

export function useAdminCustomers(search?: string) {
  return useQuery({
    queryKey: ['admin', 'customers', search],
    queryFn: async (): Promise<AdminCustomerRow[]> => {
      const res = await adminApi.get('/admin/customers', { params: { search } });
      const d = (res.data as any)?.data || res.data;
      const items = Array.isArray(d) ? d : (d?.items || []);
      return items.map((c: any) => ({
        id: c.id,
        name: c.name || c.phone || 'Unnamed Customer',
        phone: c.phone,
        email: c.email || undefined,
        totalBookings: c.bookingCount ?? c.totalBookings ?? 0,
        totalSpentPaise: c.totalSpentPaise ?? 0,
        createdAt: c.createdAt,
      }));
    },
  });
}

export function useAdminCustomerDetail(customerId: string) {
  return useQuery({
    queryKey: ['admin', 'customers', customerId],
    queryFn: async (): Promise<AdminCustomerDetail | null> => {
      const res = await adminApi.get(`/admin/customers/${customerId}`);
      const c = (res.data as any)?.data || res.data;
      if (!c) return null;
      return {
        ...c,
        id: c.id,
        name: c.name || null,
        phone: c.phone || '',
        email: c.email || null,
        status: c.status || 'ACTIVE',
        city: c.city?.name || c.city || null,
        totalBookings: c.bookingCount ?? c.bookings?.length ?? 0,
        totalSpentPaise: c.totalSpentPaise ?? (c.bookings?.reduce((acc: number, b: any) => acc + (b.estimatedTotalPaise || 0), 0) ?? 0),
        vehicles: (c.vehicles || []).map((v: any) => ({
          id: v.id,
          model: v.model?.name ? `${v.brand?.name || ''} ${v.model.name}`.trim() : (v.model || 'Vehicle'),
          reg: v.registrationNumber || v.regNo || 'No registration',
          type: v.type || 'TWO_WHEELER',
        })),
        addresses: c.addresses || [],
        bookings: c.bookings || [],
        reviews: c.reviews || [],
        createdAt: c.createdAt,
      };
    },
    enabled: !!customerId,
  });
}

export function useAdminBlockCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, reason }: { customerId: string; reason?: string }) => {
      const res = await adminApi.post(`/admin/customers/${customerId}/block`, {
        reason: reason || 'Administrative action',
      });
      return (res.data as any)?.data || res.data;
    },
    onSuccess: (_, { customerId }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'customers', customerId] });
    },
  });
}

export function useAdminUnblockCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId, reason }: { customerId: string; reason?: string }) => {
      const res = await adminApi.post(`/admin/customers/${customerId}/unblock`, {
        reason: reason || 'Administrative review completed',
      });
      return (res.data as any)?.data || res.data;
    },
    onSuccess: (_, { customerId }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'customers', customerId] });
    },
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
      const res = await adminApi.get('/admin/disputes');
      const d = (res.data as any)?.data || res.data;
      const items = Array.isArray(d) ? d : (d?.items || []);
      return items.map((disp: any) => ({
        id: disp.id,
        bookingId: disp.booking?.code || disp.bookingId || '',
        customerName: disp.booking?.customer?.name || disp.customerName || 'Customer',
        mechanicName: disp.booking?.mechanic?.name || disp.mechanicName || 'Mechanic',
        reason: disp.reason || 'General Dispute',
        status: disp.status || 'OPEN',
        amountPaise: disp.claimAmountPaise || disp.amountPaise || 0,
        createdAt: disp.createdAt,
      }));
    },
  });
}

export function useAdminDisputeDetail(disputeId: string) {
  return useQuery({
    queryKey: ['admin', 'disputes', disputeId],
    queryFn: async (): Promise<any> => {
      const res = await adminApi.get(`/admin/disputes/${disputeId}`);
      return (res.data as any)?.data || res.data;
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
      return (res.data as any)?.data || res.data;
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
      const d = (res.data as any)?.data || res.data;
      return Array.isArray(d) ? d : (d?.items || []);
    },
  });
}

export function useAdminPayouts() {
  return useQuery({
    queryKey: ['admin', 'payouts'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/finance/payouts');
      const d = (res.data as any)?.data || res.data;
      return Array.isArray(d) ? d : (d?.items || []);
    },
  });
}

export function useAdminPayoutRunDetail(runId: string) {
  return useQuery({
    queryKey: ['admin', 'payout-runs', runId],
    queryFn: async () => {
      const res = await adminApi.get(`/finance/payout-runs/${runId}`);
      return (res.data as any)?.data || res.data;
    },
    enabled: !!runId,
  });
}

// ==================== Staff Administrators ====================

export function useAdminStaffList() {
  return useQuery({
    queryKey: ['admin', 'staff'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/admins');
      const d = (res.data as any)?.data || res.data;
      return Array.isArray(d) ? d : (d?.items || []);
    },
  });
}

export function useAdminStaffDetail(staffId: string) {
  return useQuery({
    queryKey: ['admin', 'staff', staffId],
    queryFn: async () => {
      const res = await adminApi.get(`/admin/admins/${staffId}`);
      return (res.data as any)?.data || res.data;
    },
    enabled: !!staffId,
  });
}

// ==================== Super Admin & Master Data ====================

export function useAdminCatalogueCategories() {
  return useQuery({
    queryKey: ['admin', 'catalogue', 'categories'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/catalogue/categories');
      const d = (res.data as any)?.data || res.data;
      return Array.isArray(d) ? d : (d?.items || []);
    },
  });
}

export function useAdminCatalogueServices() {
  return useQuery({
    queryKey: ['admin', 'catalogue', 'services'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/catalogue/services');
      const d = (res.data as any)?.data || res.data;
      return Array.isArray(d) ? d : (d?.items || []);
    },
  });
}

export function useAdminCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      categoryId: string;
      name: string;
      description?: string;
      durationMin: number;
      priceType?: 'FIXED' | 'HOURLY' | 'CUSTOM_QUOTE';
      vehicleTypes: string[];
      allowedModes: string[];
      price?: number;
      basePricePaise?: number;
      includes?: string[];
      excludes?: string[];
    }) => {
      const res = await adminApi.post('/admin/catalogue/services', payload);
      return (res.data as any)?.data || res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'catalogue', 'services'] });
    },
  });
}

export function useAdminVehicleBrands() {
  return useQuery({
    queryKey: ['admin', 'vehicles', 'brands'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/vehicles/brands');
      const d = (res.data as any)?.data || res.data;
      return Array.isArray(d) ? d : (d?.items || []);
    },
  });
}

export function useAdminSystemHealth() {
  return useQuery({
    queryKey: ['admin', 'system-health'],
    queryFn: async () => {
      const res = await adminApi.get('/admin/system/health');
      const d = (res.data as any)?.data || res.data || {};
      return {
        status: d.status || 'ok',
        uptime: d.uptime || 86400,
        redis: d.redis || 'connected',
        db: d.db || 'connected',
        ...d,
      };
    },
  });
}
