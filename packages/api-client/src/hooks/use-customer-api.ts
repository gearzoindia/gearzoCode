import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createApiClient } from '../create-api-client';
import { useAuthStore } from '../auth-store';
import type {
  ServiceItem,
  ServiceCategory,
  Vehicle,
  AddVehicleInput,
  Booking,
  CreateBookingInput,
  AuthResponse,
  SendOtpInput,
  VerifyOtpInput,
  RegisterCustomerInput,
  SubscriptionPlan,
} from '@gearzo/schemas';

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
export const customerApi = createApiClient({ baseURL, audience: 'customer' });

// ==================== Auth Hooks ====================

export function useCustomerSendOtp() {
  return useMutation({
    mutationFn: async (input: SendOtpInput) => {
      const res = await customerApi.post<{ success: boolean; message: string }>('/auth/send-otp', input);
      return res.data;
    },
  });
}

export function useCustomerVerifyOtp() {
  const { signIn } = useAuthStore();
  return useMutation({
    mutationFn: async (input: VerifyOtpInput) => {
      const res = await customerApi.post<AuthResponse>('/auth/verify-otp', input);
      await signIn(res.data.tokens, res.data.user);
      return res.data;
    },
  });
}

export function useCustomerRegister() {
  const { setUser } = useAuthStore();
  return useMutation({
    mutationFn: async (input: RegisterCustomerInput) => {
      const res = await customerApi.post<{ user: AuthResponse['user'] }>('/customer/profile', input);
      setUser(res.data.user);
      return res.data;
    },
  });
}

// ==================== Home & Services ====================

export interface HomeFeedData {
  featuredServices: ServiceItem[];
  quickServices: ServiceItem[];
  categories: ServiceCategory[];
  activeBookings: Booking[];
  bannerText?: string;
}

export function useHome() {
  return useQuery({
    queryKey: ['customer', 'home'],
    queryFn: async (): Promise<HomeFeedData> => {
      const res = await customerApi.get<HomeFeedData>('/customer/home');
      return res.data;
    },
  });
}

export function useServices(categoryId?: string, vehicleType?: string) {
  return useQuery({
    queryKey: ['customer', 'services', { categoryId, vehicleType }],
    queryFn: async (): Promise<ServiceItem[]> => {
      const res = await customerApi.get<ServiceItem[]>('/customer/services', {
        params: { categoryId, vehicleType },
      });
      return res.data;
    },
  });
}

export function useServiceDetail(serviceId: string) {
  return useQuery({
    queryKey: ['customer', 'services', serviceId],
    queryFn: async (): Promise<ServiceItem> => {
      const res = await customerApi.get<ServiceItem>(`/customer/services/${serviceId}`);
      return res.data;
    },
    enabled: !!serviceId,
  });
}

export function useSearchServices(query: string) {
  return useQuery({
    queryKey: ['customer', 'search', query],
    queryFn: async (): Promise<ServiceItem[]> => {
      const res = await customerApi.get<ServiceItem[]>('/customer/services/search', {
        params: { q: query },
      });
      return res.data;
    },
    enabled: query.length > 1,
  });
}

export interface ProductItem {
  id: string;
  name: string;
  specification: string;
  pricePaise: number;
  originalPricePaise?: number;
  discountText?: string | null;
  category: string;
  compatibleVehicleTypes: string[];
}

export function useProducts(vehicleType?: string) {
  return useQuery({
    queryKey: ['customer', 'products', vehicleType],
    queryFn: async (): Promise<ProductItem[]> => {
      const res = await customerApi.get<ProductItem[]>('/customer/products', {
        params: { vehicleTypeId: vehicleType },
      });
      return res.data;
    },
  });
}

// ==================== Vehicles ====================

export function useVehicles() {
  return useQuery({
    queryKey: ['customer', 'vehicles'],
    queryFn: async (): Promise<Vehicle[]> => {
      const res = await customerApi.get<any>('/customer/vehicles');
      const data = res.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.vehicles)) return data.vehicles;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
}

export function useVehicleDetail(vehicleId: string) {
  return useQuery({
    queryKey: ['customer', 'vehicles', vehicleId],
    queryFn: async (): Promise<Vehicle> => {
      const res = await customerApi.get<Vehicle>(`/customer/vehicles/${vehicleId}`);
      return res.data;
    },
    enabled: !!vehicleId,
  });
}

export function useAddVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddVehicleInput): Promise<Vehicle> => {
      const res = await customerApi.post<Vehicle>('/customer/vehicles', input);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customer', 'vehicles'] });
    },
  });
}

export function useSetDefaultVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicleId: string): Promise<Vehicle> => {
      const res = await customerApi.patch<Vehicle>(`/customer/vehicles/${vehicleId}/default`);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customer', 'vehicles'] });
    },
  });
}

// ==================== Bookings ====================

export function useBookings(statusFilter?: string) {
  return useQuery({
    queryKey: ['customer', 'bookings', statusFilter],
    queryFn: async (): Promise<Booking[]> => {
      const res = await customerApi.get<Booking[]>('/customer/bookings', {
        params: { status: statusFilter },
      });
      return res.data;
    },
  });
}

export function useBookingDetail(bookingId: string) {
  return useQuery({
    queryKey: ['customer', 'bookings', bookingId],
    queryFn: async (): Promise<Booking> => {
      const res = await customerApi.get<Booking>(`/customer/bookings/${bookingId}`);
      return res.data;
    },
    enabled: !!bookingId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && ['SEARCHING', 'ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(data.status)) {
        return 5000;
      }
      return false;
    },
  });
}

export function useQuote(serviceId?: string, vehicleId?: string) {
  return useQuery({
    queryKey: ['customer', 'quote', { serviceId, vehicleId }],
    queryFn: async () => {
      const res = await customerApi.post<{
        basePaise: number;
        taxesPaise: number;
        platformFeePaise: number;
        discountPaise: number;
        totalPaise: number;
      }>('/customer/bookings/quote', { serviceId, vehicleId });
      return res.data;
    },
    enabled: !!serviceId && !!vehicleId,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBookingInput): Promise<Booking> => {
      const res = await customerApi.post<Booking>('/customer/bookings', input);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customer', 'bookings'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason: string }): Promise<Booking> => {
      const res = await customerApi.post<Booking>(`/customer/bookings/${bookingId}/cancel`, { reason });
      return res.data;
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['customer', 'bookings', variables.bookingId] });
      void queryClient.invalidateQueries({ queryKey: ['customer', 'bookings'] });
    },
  });
}

// ==================== Subscriptions ====================

export function useSubscriptions() {
  return useQuery({
    queryKey: ['customer', 'subscriptions'],
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const res = await customerApi.get<SubscriptionPlan[]>('/customer/subscriptions/plans');
      return res.data;
    },
  });
}


// ==================== Addresses ====================

export interface CustomerAddressItem {
  id: string;
  label: 'HOME' | 'WORK' | 'OTHER' | string;
  line1: string;
  line2?: string;
  landmark?: string;
  lat: number;
  lng: number;
  isDefault: boolean;
  createdAt: string;
  area?: { id: string; name: string };
}

export function useAddresses() {
  return useQuery({
    queryKey: ['customer', 'addresses'],
    queryFn: async (): Promise<CustomerAddressItem[]> => {
      const res = await customerApi.get<CustomerAddressItem[]>('/addresses');
      return res.data || [];
    },
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      label?: string;
      line1: string;
      line2?: string;
      landmark?: string;
      lat: number;
      lng: number;
      isDefault?: boolean;
    }) => {
      const res = await customerApi.post('/addresses', payload);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customer', 'addresses'] });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await customerApi.delete(`/addresses/${id}`);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customer', 'addresses'] });
    },
  });
}
