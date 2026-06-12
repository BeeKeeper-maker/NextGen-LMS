// ============================================================
// NextGen Global LMS - React Query Data Hooks
// All data fetching hooks for real API integration
// ============================================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

// ─── Helper to get current tenant ID ─────────────────────────
function useTenantId() {
  const tenant = useAppStore((s) => s.currentTenant);
  return tenant?.id || '';
}

function useCurrentUser() {
  const user = useAppStore((s) => s.currentUser);
  return user;
}

// ─── Courses ──────────────────────────────────────────────────

export function useCourses(tenantId?: string) {
  const params = tenantId ? `?tenantId=${tenantId}` : '';
  return useQuery({
    queryKey: ['courses', tenantId],
    queryFn: () => apiGet<any[]>(`/courses${params}`),
  });
}

export function useCourse(courseId: string | null) {
  return useQuery({
    queryKey: ['courses', courseId],
    queryFn: () => apiGet<any>(`/courses/${courseId}`),
    enabled: !!courseId,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost('/courses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully');
    },
    onError: () => toast.error('Failed to create course'),
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiPut(`/courses/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course updated successfully');
    },
    onError: () => toast.error('Failed to update course'),
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully');
    },
    onError: () => toast.error('Failed to delete course'),
  });
}

// ─── Modules ──────────────────────────────────────────────────

export function useCreateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, ...data }: any) => apiPost(`/courses/${courseId}/modules`, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses', variables.courseId] });
      toast.success('Module created successfully');
    },
    onError: () => toast.error('Failed to create module'),
  });
}

export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, moduleId, ...data }: any) => apiPut(`/courses/${courseId}/modules/${moduleId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Module updated successfully');
    },
    onError: () => toast.error('Failed to update module'),
  });
}

export function useDeleteModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, moduleId }: { courseId: string; moduleId: string }) =>
      apiDelete(`/courses/${courseId}/modules/${moduleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Module deleted successfully');
    },
    onError: () => toast.error('Failed to delete module'),
  });
}

// ─── Lessons ──────────────────────────────────────────────────

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, moduleId, ...data }: any) =>
      apiPost(`/courses/${courseId}/modules/${moduleId}/lessons`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Lesson created successfully');
    },
    onError: () => toast.error('Failed to create lesson'),
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, moduleId, lessonId, ...data }: any) =>
      apiPut(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Lesson updated successfully');
    },
    onError: () => toast.error('Failed to update lesson'),
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, moduleId, lessonId }: { courseId: string; moduleId: string; lessonId: string }) =>
      apiDelete(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Lesson deleted successfully');
    },
    onError: () => toast.error('Failed to delete lesson'),
  });
}

// ─── Enrollments ──────────────────────────────────────────────

export function useEnrollments(userId?: string) {
  const params = userId ? `?userId=${userId}` : '';
  return useQuery({
    queryKey: ['enrollments', userId],
    queryFn: () => apiGet<any[]>(`/enrollments${params}`),
  });
}

export function useEnroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { userId: string; courseId: string; tenantId: string }) =>
      apiPost('/enrollments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Enrolled successfully!');
    },
    onError: (err: any) => {
      const msg = err?.message || 'Failed to enroll';
      toast.error(msg);
    },
  });
}

// ─── Community ────────────────────────────────────────────────

export function useCommunityPosts(tenantId?: string) {
  const params = tenantId ? `?tenantId=${tenantId}` : '';
  return useQuery({
    queryKey: ['community', tenantId],
    queryFn: () => apiGet<{ posts: any[]; categories: any[] }>(`/community${params}`),
  });
}

export function useCreateCommunityPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost('/community', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
      toast.success('Post created successfully');
    },
    onError: () => toast.error('Failed to create post'),
  });
}

export function useDeleteCommunityPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => apiDelete(`/community/${postId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
      toast.success('Post deleted successfully');
    },
    onError: () => toast.error('Failed to delete post'),
  });
}

export function useUpdateCommunityPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiPut(`/community/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
      toast.success('Post updated successfully');
    },
    onError: () => toast.error('Failed to update post'),
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, ...data }: any) => apiPost(`/community/${postId}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
      toast.success('Comment added');
    },
    onError: () => toast.error('Failed to add comment'),
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, ...data }: any) => apiPost(`/community/${postId}/reactions`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community'] });
    },
    onError: () => toast.error('Failed to toggle reaction'),
  });
}

// ─── Course Reviews ────────────────────────────────────────────

export function useCommunityReviews(params?: {
  status?: string;
  courseId?: string;
  rating?: string;
  sort?: string;
  tenantId?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params?.courseId) searchParams.set('courseId', params.courseId);
  if (params?.rating) searchParams.set('rating', params.rating);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.tenantId) searchParams.set('tenantId', params.tenantId);

  const qs = searchParams.toString();
  const path = `/community/reviews${qs ? `?${qs}` : ''}`;

  return useQuery({
    queryKey: ['community-reviews', params],
    queryFn: () => apiGet<{ reviews: any[] }>(path),
  });
}

export function useModerateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, action, reason, adminName }: {
      reviewId: string;
      action: 'approved' | 'rejected' | 'flagged';
      reason?: string;
      adminName?: string;
    }) =>
      fetch(`/api/community/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason, adminName }),
      }).then(async (res) => {
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-reviews'] });
      toast.success('Review moderated successfully');
    },
    onError: () => toast.error('Failed to moderate review'),
  });
}

export function useRespondToReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, adminResponse }: { reviewId: string; adminResponse: string }) =>
      fetch(`/api/community/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'respond', adminResponse }),
      }).then(async (res) => {
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-reviews'] });
      toast.success('Response sent successfully');
    },
    onError: () => toast.error('Failed to send response'),
  });
}

// ─── Assessments ──────────────────────────────────────────────

export function useAssessments(courseId?: string) {
  const params = courseId ? `?courseId=${courseId}` : '';
  return useQuery({
    queryKey: ['assessments', courseId],
    queryFn: () => apiGet<any[]>(`/assessments${params}`),
  });
}

export function useAssessment(assessmentId: string | null) {
  return useQuery({
    queryKey: ['assessments', assessmentId],
    queryFn: () => apiGet<any>(`/assessments/${assessmentId}`),
    enabled: !!assessmentId,
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost('/assessments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast.success('Assessment created successfully');
    },
    onError: () => toast.error('Failed to create assessment'),
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiPut(`/assessments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast.success('Assessment updated successfully');
    },
    onError: () => toast.error('Failed to update assessment'),
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/assessments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      toast.success('Assessment deleted successfully');
    },
    onError: () => toast.error('Failed to delete assessment'),
  });
}

export function useSubmitQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assessmentId, ...data }: any) =>
      apiPost(`/assessments/${assessmentId}/submit`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['quiz-submissions'] });
      toast.success('Quiz submitted successfully');
    },
    onError: () => toast.error('Failed to submit quiz'),
  });
}

export function useQuizSubmissions(userId?: string, assessmentId?: string) {
  const params = new URLSearchParams();
  if (userId) params.set('userId', userId);
  if (assessmentId) params.set('assessmentId', assessmentId);
  const qs = params.toString();

  return useQuery({
    queryKey: ['quiz-submissions', userId, assessmentId],
    queryFn: () => apiGet<any[]>(`/quiz-submissions${qs ? `?${qs}` : ''}`),
    enabled: !!userId,
  });
}

// ─── Certificates ─────────────────────────────────────────────

export function useCertificates(tenantId?: string) {
  const params = tenantId ? `?tenantId=${tenantId}` : '';
  return useQuery({
    queryKey: ['certificates', tenantId],
    queryFn: () => apiGet<any[]>(`/certificates${params}`),
  });
}

export function useCreateCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost('/certificates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Certificate template created');
    },
    onError: () => toast.error('Failed to create certificate template'),
  });
}

export function useUpdateCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiPut(`/certificates/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Certificate template updated');
    },
    onError: () => toast.error('Failed to update certificate template'),
  });
}

export function useDeleteCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/certificates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Certificate template deleted');
    },
    onError: () => toast.error('Failed to delete certificate template'),
  });
}

export function useAwardCertificate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ certificateId, ...data }: any) =>
      apiPost(`/certificates/${certificateId}/award`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      queryClient.invalidateQueries({ queryKey: ['certificate-awards'] });
      toast.success('Certificate awarded');
    },
    onError: () => toast.error('Failed to award certificate'),
  });
}

export function useCertificateAwards(tenantId?: string) {
  const params = tenantId ? `?tenantId=${tenantId}` : '';
  return useQuery({
    queryKey: ['certificate-awards', tenantId],
    queryFn: () => apiGet<any[]>(`/certificates/awards${params}`),
  });
}

// ─── Analytics ────────────────────────────────────────────────

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiGet<{ metrics: any[] }>('/analytics'),
  });
}

export function useAnalyticsEvents(params?: {
  tenantId?: string;
  eventType?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.tenantId) searchParams.set('tenantId', params.tenantId);
  if (params?.eventType) searchParams.set('eventType', params.eventType);
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.userId) searchParams.set('userId', params.userId);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const qs = searchParams.toString();
  const path = `/analytics/events${qs ? `?${qs}` : ''}`;

  return useQuery({
    queryKey: ['analytics-events', params],
    queryFn: () => apiGet<{ events: any[]; summary?: Record<string, number>; pagination: { page: number; limit: number; total: number; totalPages: number } }>(path),
    enabled: !!params?.tenantId,
  });
}

export function useTrackEvent() {
  return useMutation({
    mutationFn: (data: any) => apiPost('/analytics/events', data),
  });
}

// ─── Achievements ─────────────────────────────────────────────

export function useAchievements(tenantId?: string) {
  const tid = tenantId || '';
  const params = tid ? `?tenantId=${tid}` : '';
  return useQuery({
    queryKey: ['achievements', tid],
    queryFn: () => apiGet<any[]>(`/achievements${params}`),
    enabled: !!tid,
  });
}

// ─── Users ────────────────────────────────────────────────────

export function useUsers(tenantId?: string) {
  const tid = tenantId || '';
  const params = tid ? `?tenantId=${tid}` : '';
  return useQuery({
    queryKey: ['users', tid],
    queryFn: () => apiGet<{ users: any[] }>(`/users${params}`),
    enabled: !!tid,
  });
}

export function useUser(userId: string | null) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => apiGet<any>(`/users/${userId}`),
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiPut(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
    },
    onError: () => toast.error('Failed to update user'),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: () => toast.error('Failed to delete user'),
  });
}

// ─── Progress ─────────────────────────────────────────────────

export function useLessonProgress(userId?: string) {
  const params = userId ? `?userId=${userId}` : '';
  return useQuery({
    queryKey: ['progress', userId],
    queryFn: () => apiGet<any[]>(`/progress${params}`),
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost('/progress', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}

// ─── Tenants ──────────────────────────────────────────────────

export function useTenant(tenantId: string | null) {
  return useQuery({
    queryKey: ['tenants', tenantId],
    queryFn: () => apiGet<any>(`/tenants/${tenantId}`),
    enabled: !!tenantId,
  });
}

export function useUpdateTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiPut(`/tenants/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Settings saved successfully');
    },
    onError: () => toast.error('Failed to save settings'),
  });
}

// ─── Learning Paths ────────────────────────────────────────────

export function useLearningPaths(tenantId?: string) {
  const params = tenantId ? `?tenantId=${tenantId}` : '';
  return useQuery({
    queryKey: ['learning-paths', tenantId],
    queryFn: () => apiGet<any[]>(`/learning-paths${params}`),
  });
}

export function useLearningPath(pathId: string | null) {
  return useQuery({
    queryKey: ['learning-paths', pathId],
    queryFn: () => apiGet<any>(`/learning-paths/${pathId}`),
    enabled: !!pathId,
  });
}

export function useCreateLearningPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost('/learning-paths', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      toast.success('Learning path created successfully');
    },
    onError: () => toast.error('Failed to create learning path'),
  });
}

export function useUpdateLearningPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiPut(`/learning-paths/${id}`, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      queryClient.invalidateQueries({ queryKey: ['learning-paths', variables.id] });
      toast.success('Learning path updated successfully');
    },
    onError: () => toast.error('Failed to update learning path'),
  });
}

export function useDeleteLearningPath() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/learning-paths/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      toast.success('Learning path deleted successfully');
    },
    onError: () => toast.error('Failed to delete learning path'),
  });
}

// ─── Bulk Operations ──────────────────────────────────────────

export function useBulkOperation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost('/bulk-operations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Bulk operation completed');
    },
    onError: () => toast.error('Bulk operation failed'),
  });
}

// ─── Lesson Discussions ────────────────────────────────────────

export function useLessonDiscussions(params?: { lessonId?: string; courseId?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.lessonId) searchParams.set('lessonId', params.lessonId);
  if (params?.courseId) searchParams.set('courseId', params.courseId);

  const qs = searchParams.toString();
  const path = `/discussions${qs ? `?${qs}` : ''}`;

  return useQuery({
    queryKey: ['discussions', params],
    queryFn: () => apiGet<{ discussions: any[] }>(path),
    enabled: !!(params?.lessonId || params?.courseId),
  });
}

export function useCreateDiscussion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost('/discussions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions'] });
      toast.success('Discussion posted');
    },
    onError: () => toast.error('Failed to post discussion'),
  });
}

// ─── Live Cohorts ────────────────────────────────────────────

export function useLiveCohorts(tenantId?: string) {
  const params = tenantId ? `?tenantId=${tenantId}` : '';
  return useQuery({
    queryKey: ['live-cohorts', tenantId],
    queryFn: () => apiGet<any[]>(`/live-cohorts${params}`),
  });
}

export function useLiveCohort(cohortId: string | null) {
  return useQuery({
    queryKey: ['live-cohorts', cohortId],
    queryFn: () => apiGet<any>(`/live-cohorts/${cohortId}`),
    enabled: !!cohortId,
  });
}

export function useCreateLiveCohort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost('/live-cohorts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-cohorts'] });
      toast.success('Live cohort created successfully');
    },
    onError: () => toast.error('Failed to create live cohort'),
  });
}

export function useUpdateLiveCohort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => apiPut(`/live-cohorts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-cohorts'] });
      toast.success('Live cohort updated successfully');
    },
    onError: () => toast.error('Failed to update live cohort'),
  });
}

export function useDeleteLiveCohort() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/live-cohorts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-cohorts'] });
      toast.success('Live cohort deleted successfully');
    },
    onError: () => toast.error('Failed to delete live cohort'),
  });
}

// ─── Live Cohort RSVPs ──────────────────────────────────────

export function useLiveCohortRSVPs(userId?: string) {
  return useQuery({
    queryKey: ['live-cohort-rsvps', userId],
    queryFn: () => apiGet<any[]>(`/live-cohorts/rsvp?userId=${userId}`),
    enabled: !!userId,
  });
}

export function useToggleRSVP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { cohortId: string; userId: string; tenantId: string; status: string }) =>
      apiPost('/live-cohorts/rsvp', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-cohort-rsvps'] });
      queryClient.invalidateQueries({ queryKey: ['live-cohorts'] });
    },
  });
}

// ─── Products ────────────────────────────────────────────────

export function useProducts(tenantId?: string) {
  const params = tenantId ? `?tenantId=${tenantId}` : '';
  return useQuery({
    queryKey: ['products', tenantId],
    queryFn: () => apiGet<any[]>(`/products${params}`),
  });
}

// ─── Orders ──────────────────────────────────────────────────

export function useOrders(userId?: string, tenantId?: string) {
  const searchParams = new URLSearchParams();
  if (userId) searchParams.set('userId', userId);
  if (tenantId) searchParams.set('tenantId', tenantId);
  const qs = searchParams.toString();
  const path = `/orders${qs ? `?${qs}` : ''}`;

  return useQuery({
    queryKey: ['orders', userId, tenantId],
    queryFn: () => apiGet<any[]>(path),
    enabled: !!userId || !!tenantId,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost('/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order created successfully');
    },
    onError: () => toast.error('Failed to create order'),
  });
}

// ─── Data Exports ─────────────────────────────────────────────

export function useDataExports(tenantId?: string) {
  const params = tenantId ? `?tenantId=${tenantId}` : '';
  return useQuery({
    queryKey: ['data-exports', tenantId],
    queryFn: () => apiGet<any[]>(`/data-exports${params}`),
    enabled: !!tenantId,
  });
}

export function useCreateDataExport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost('/data-exports', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-exports'] });
    },
    onError: () => toast.error('Failed to create data export'),
  });
}

export function useDeleteDataExport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/data-exports?id=${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-exports'] });
      toast.success('Export deleted');
    },
    onError: () => toast.error('Failed to delete data export'),
  });
}

// ─── Data Imports ─────────────────────────────────────────────

export function useDataImports(tenantId?: string) {
  const params = tenantId ? `?tenantId=${tenantId}` : '';
  return useQuery({
    queryKey: ['data-imports', tenantId],
    queryFn: () => apiGet<any[]>(`/data-imports${params}`),
    enabled: !!tenantId,
  });
}

export function useCreateDataImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost('/data-imports', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-imports'] });
    },
    onError: () => toast.error('Failed to create data import'),
  });
}

// ─── Backups ──────────────────────────────────────────────────

export function useBackups(tenantId?: string) {
  const params = tenantId ? `?tenantId=${tenantId}` : '';
  return useQuery({
    queryKey: ['backups', tenantId],
    queryFn: () => apiGet<any[]>(`/backups${params}`),
    enabled: !!tenantId,
  });
}

export function useCreateBackup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiPost('/backups', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
      toast.success('Backup created successfully');
    },
    onError: () => toast.error('Failed to create backup'),
  });
}
