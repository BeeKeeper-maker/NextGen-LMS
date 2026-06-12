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

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => apiGet<any[]>('/courses'),
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

export function useCommunityPosts() {
  return useQuery({
    queryKey: ['community'],
    queryFn: () => apiGet<{ posts: any[]; categories: any[] }>('/community'),
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
      toast.success('Quiz submitted successfully');
    },
    onError: () => toast.error('Failed to submit quiz'),
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
      toast.success('Certificate awarded');
    },
    onError: () => toast.error('Failed to award certificate'),
  });
}

// ─── Analytics ────────────────────────────────────────────────

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiGet<{ metrics: any[] }>('/analytics'),
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
