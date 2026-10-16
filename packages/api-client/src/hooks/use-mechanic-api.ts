import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createApiClient } from '../create-api-client';
import { useAuthStore } from '../auth-store';
import type {
  AuthResponse,
  SendOtpInput,
  VerifyOtpInput,
  MechanicOnboardingProfileInput,
  MechanicSkillsInput,
  MechanicLocationInput,
  MechanicBankInput,
  MechanicJobOffer,
  Booking,
} from '@gearzo/schemas';

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002/api/v1';
export const mechanicApi = createApiClient({ baseURL, audience: 'mechanic' });

// ==================== Mechanic Auth ====================

export function useMechanicSendOtp() {
  return useMutation({
    mutationFn: async (input: SendOtpInput) => {
      const res = await mechanicApi.post<{ success: boolean; message: string }>('/auth/send-otp', input);
      return res.data;
    },
  });
}

export function useMechanicVerifyOtp() {
  const { signIn } = useAuthStore();
  return useMutation({
    mutationFn: async (input: VerifyOtpInput) => {
      const res = await mechanicApi.post<AuthResponse>('/auth/verify-otp', input);
      await signIn(res.data.tokens, res.data.user);
      return res.data;
    },
  });
}

// ==================== Onboarding ====================

export interface MechanicOnboardingState {
  step: 'TYPE' | 'PROFILE' | 'SKILLS' | 'LOCATION' | 'KYC' | 'BANK' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  isOnline: boolean;
}

export function useMechanicOnboardingState() {
  return useQuery({
    queryKey: ['mechanic', 'onboarding-state'],
    queryFn: async (): Promise<MechanicOnboardingState> => {
      const res = await mechanicApi.get<MechanicOnboardingState>('/mechanic/onboarding/status');
      return res.data;
    },
  });
}

export function useSaveMechanicType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (type: 'SHOP' | 'INDIVIDUAL' | 'DIRECT_JOB') => {
      const res = await mechanicApi.post('/mechanic/onboarding/type', { type });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mechanic', 'onboarding-state'] });
    },
  });
}

export function useSaveMechanicProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: MechanicOnboardingProfileInput) => {
      const res = await mechanicApi.post('/mechanic/onboarding/profile', input);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mechanic', 'onboarding-state'] });
    },
  });
}

export function useSaveMechanicSkills() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: MechanicSkillsInput) => {
      const res = await mechanicApi.post('/mechanic/onboarding/skills', input);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mechanic', 'onboarding-state'] });
    },
  });
}

export function useSaveMechanicLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: MechanicLocationInput) => {
      const res = await mechanicApi.post('/mechanic/onboarding/location', input);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mechanic', 'onboarding-state'] });
    },
  });
}

export function useSaveMechanicKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: { aadharNumber: string; panNumber: string; documentUrl?: string }) => {
      const res = await mechanicApi.post('/mechanic/onboarding/kyc', formData);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mechanic', 'onboarding-state'] });
    },
  });
}

export function useSaveMechanicBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: MechanicBankInput) => {
      const res = await mechanicApi.post('/mechanic/onboarding/bank', input);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mechanic', 'onboarding-state'] });
    },
  });
}

// ==================== Duty & Online Status ====================

export function useToggleDuty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (isOnline: boolean) => {
      const res = await mechanicApi.post<{ isOnline: boolean }>('/mechanic/duty/toggle', { isOnline });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mechanic', 'onboarding-state'] });
      void queryClient.invalidateQueries({ queryKey: ['mechanic', 'duty'] });
    },
  });
}

// ==================== Job Offers & Operations ====================

export function useJobOffer(offerId: string) {
  return useQuery({
    queryKey: ['mechanic', 'job-offers', offerId],
    queryFn: async (): Promise<MechanicJobOffer> => {
      const res = await mechanicApi.get<MechanicJobOffer>(`/mechanic/job-offers/${offerId}`);
      return res.data;
    },
    enabled: !!offerId,
  });
}

export function useAcceptJobOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (offerId: string) => {
      const res = await mechanicApi.post(`/mechanic/job-offers/${offerId}/accept`);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mechanic', 'jobs'] });
    },
  });
}

export function useRejectJobOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ offerId, reason }: { offerId: string; reason?: string }) => {
      const res = await mechanicApi.post(`/mechanic/job-offers/${offerId}/reject`, { reason });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mechanic', 'jobs'] });
    },
  });
}

export function useMechanicJobs(status?: string) {
  return useQuery({
    queryKey: ['mechanic', 'jobs', status],
    queryFn: async (): Promise<Booking[]> => {
      const res = await mechanicApi.get<Booking[]>('/mechanic/jobs', { params: { status } });
      return res.data;
    },
  });
}

export function useMechanicJobDetail(jobId: string) {
  return useQuery({
    queryKey: ['mechanic', 'jobs', jobId],
    queryFn: async (): Promise<Booking> => {
      const res = await mechanicApi.get<Booking>(`/mechanic/jobs/${jobId}`);
      return res.data;
    },
    enabled: !!jobId,
  });
}

export function useUpdateJobStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      jobId,
      step,
      notes,
      otp,
    }: {
      jobId: string;
      step: 'ON_THE_WAY' | 'ARRIVED' | 'IN_PROGRESS' | 'COMPLETED';
      notes?: string;
      otp?: string;
    }) => {
      const res = await mechanicApi.post(`/mechanic/jobs/${jobId}/step`, { step, notes, otp });
      return res.data;
    },
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: ['mechanic', 'jobs', vars.jobId] });
      void queryClient.invalidateQueries({ queryKey: ['mechanic', 'jobs'] });
    },
  });
}

// ==================== Earnings & Availability ====================

export interface MechanicEarningsSummary {
  todayPaise: number;
  thisWeekPaise: number;
  walletBalancePaise: number;
  completedJobsCount: number;
}

export function useMechanicEarnings() {
  return useQuery({
    queryKey: ['mechanic', 'earnings'],
    queryFn: async (): Promise<MechanicEarningsSummary> => {
      const res = await mechanicApi.get<MechanicEarningsSummary>('/mechanic/earnings');
      return res.data;
    },
  });
}

export function useMechanicAvailability() {
  return useQuery({
    queryKey: ['mechanic', 'availability'],
    queryFn: async () => {
      const res = await mechanicApi.get<{ days: string[]; hours: string }>('/mechanic/availability');
      return res.data;
    },
  });
}

export function useUpdateMechanicAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { days: string[]; hours: string }) => {
      const res = await mechanicApi.put('/mechanic/availability', payload);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['mechanic', 'availability'] });
    },
  });
}
