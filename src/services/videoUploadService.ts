/**
 * Video Upload Service for Winbro Training Reels
 * Handles video upload, processing, and customer-specific content management
 */

import { VideoAPI } from '@/api/videos';
import { CustomerContentAPI } from '@/api/customerContent';
import type { 
  Video, 
  CreateVideoInput, 
  VideoUploadProgress,
  VideoProcessingStatus,
  VideoStatus
} from '@/types/video';
import type { 
  ContentAssignmentRequest,
  CustomerContentSummary
} from '@/types/customer';

/**
 * Video Upload Service
 * Provides high-level video upload operations with customer content integration
 */
export class VideoUploadService {
  /**
   * Upload video with customer-specific content handling
   */
  static async uploadVideo(
    input: CreateVideoInput,
    customerId?: string,
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<Video> {
    try {
      // Upload video using the VideoAPI
      const video = await VideoAPI.uploadVideo(input, onProgress);

      // If customer ID is provided, assign content to customer
      if (customerId) {
        await this.assignVideoToCustomer(video.id, customerId, {
          assignment_type: 'manual',
          assignment_reason: 'Video upload assignment',
          is_featured: false,
          access_level: 'standard'
        });
      }

      // Auto-assign to customers based on machine model if video has machine_model
      if (video.machine_model) {
        await this.autoAssignVideoByMachineModel(video.id, video.machine_model);
      }

      return video;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error(`Video upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload video and assign to multiple customers
   */
  static async uploadVideoForCustomers(
    input: CreateVideoInput,
    customerIds: string[],
    assignmentOptions: {
      is_featured?: boolean;
      access_level?: 'standard' | 'premium' | 'exclusive';
      assignment_reason?: string;
    } = {},
    onProgress?: (progress: VideoUploadProgress) => void
  ): Promise<Video> {
    try {
      // Upload video
      const video = await VideoAPI.uploadVideo(input, onProgress);

      // Assign to all specified customers
      const assignments: ContentAssignmentRequest[] = customerIds.map(customerId => ({
        customer_id: customerId,
        video_ids: [video.id],
        assignment_type: 'manual',
        assignment_reason: assignmentOptions.assignment_reason || 'Bulk video assignment',
        is_featured: assignmentOptions.is_featured || false,
        access_level: assignmentOptions.access_level || 'standard',
        assigned_by: 'system'
      }));

      await CustomerContentAPI.bulkAssignContent({
        assignments,
        auto_assign_by_machines: true,
        notify_customers: true
      });

      return video;
    } catch (error) {
      console.error('Error uploading video for customers:', error);
      throw new Error(`Video upload for customers failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Assign existing video to customer
   */
  static async assignVideoToCustomer(
    videoId: string,
    customerId: string,
    options: {
      assignment_type?: 'manual' | 'automatic' | 'subscription';
      assignment_reason?: string;
      is_featured?: boolean;
      access_level?: 'standard' | 'premium' | 'exclusive';
      expires_at?: string | null;
    } = {}
  ): Promise<void> {
    try {
      const assignment: ContentAssignmentRequest = {
        customer_id: customerId,
        video_ids: [videoId],
        assignment_type: options.assignment_type || 'manual',
        assignment_reason: options.assignment_reason,
        is_featured: options.is_featured || false,
        access_level: options.access_level || 'standard',
        expires_at: options.expires_at,
        assigned_by: 'system'
      };

      await CustomerContentAPI.assignContent(assignment);
    } catch (error) {
      console.error('Error assigning video to customer:', error);
      throw new Error(`Failed to assign video to customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove video from customer library
   */
  static async removeVideoFromCustomer(
    videoId: string,
    customerId: string
  ): Promise<void> {
    try {
      await CustomerContentAPI.removeContentFromLibrary(customerId, videoId);
    } catch (error) {
      console.error('Error removing video from customer:', error);
      throw new Error(`Failed to remove video from customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Auto-assign video to customers based on machine model
   */
  static async autoAssignVideoByMachineModel(
    videoId: string,
    machineModel: string
  ): Promise<number> {
    try {
      // Get all customers that have this machine model
      const customers = await CustomerContentAPI.getCustomers(1, 1000);
      const customersWithMachine = [];

      for (const customer of customers.customers) {
        const machines = await CustomerContentAPI.getCustomerMachines(customer.id);
        const hasMachine = machines.some(machine => 
          machine.machine_model === machineModel && machine.status === 'active'
        );
        
        if (hasMachine) {
          customersWithMachine.push(customer.id);
        }
      }

      // Assign video to all customers with this machine model
      if (customersWithMachine.length > 0) {
        const assignments: ContentAssignmentRequest[] = customersWithMachine.map(customerId => ({
          customer_id: customerId,
          video_ids: [videoId],
          assignment_type: 'automatic',
          assignment_reason: `Auto-assignment based on machine model: ${machineModel}`,
          is_featured: false,
          access_level: 'standard',
          assigned_by: 'system'
        }));

        await CustomerContentAPI.bulkAssignContent({
          assignments,
          auto_assign_by_machines: false,
          notify_customers: false
        });
      }

      return customersWithMachine.length;
    } catch (error) {
      console.error('Error auto-assigning video by machine model:', error);
      throw new Error(`Failed to auto-assign video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get customer's accessible videos
   */
  static async getCustomerVideos(
    customerId: string,
    filters: {
      machine_model?: string;
      process_type?: string;
      tooling?: string;
      skill_level?: string;
      tags?: string[];
      is_featured?: boolean;
      search_query?: string;
      sort_by?: 'title' | 'duration' | 'created_at' | 'view_count' | 'display_order';
      sort_order?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<CustomerContentSummary[]> {
    try {
      return await CustomerContentAPI.getCustomerContent(customerId, filters);
    } catch (error) {
      console.error('Error fetching customer videos:', error);
      throw new Error(`Failed to fetch customer videos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user's accessible videos based on their company
   */
  static async getUserAccessibleVideos(
    userId: string,
    filters: {
      machine_model?: string;
      process_type?: string;
      tooling?: string;
      skill_level?: string;
      tags?: string[];
      is_featured?: boolean;
      search_query?: string;
      sort_by?: 'title' | 'duration' | 'created_at' | 'view_count' | 'display_order';
      sort_order?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<CustomerContentSummary[]> {
    try {
      return await CustomerContentAPI.getUserAccessibleContent(userId, filters);
    } catch (error) {
      console.error('Error fetching user accessible videos:', error);
      throw new Error(`Failed to fetch accessible videos: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if user has access to specific video
   */
  static async hasVideoAccess(
    userId: string,
    videoId: string
  ): Promise<boolean> {
    try {
      return await CustomerContentAPI.hasContentAccess(userId, videoId);
    } catch (error) {
      console.error('Error checking video access:', error);
      return false;
    }
  }

  /**
   * Update video customer assignments
   */
  static async updateVideoCustomerAssignments(
    videoId: string,
    customerAssignments: Array<{
      customer_id: string;
      is_featured?: boolean;
      access_level?: 'standard' | 'premium' | 'exclusive';
      display_order?: number;
      expires_at?: string | null;
    }>
  ): Promise<void> {
    try {
      // Get current assignments
      const video = await VideoAPI.getVideo(videoId);
      
      // Update each assignment
      for (const assignment of customerAssignments) {
        // Find existing assignment
        const existingAssignments = await CustomerContentAPI.getCustomerContent(assignment.customer_id, {
          search_query: video.title
        });
        
        const existingAssignment = existingAssignments.find(a => a.video_id === videoId);
        
        if (existingAssignment) {
          // Update existing assignment
          await CustomerContentAPI.updateContentAssignment(existingAssignment.library_id, {
            is_featured: assignment.is_featured,
            access_level: assignment.access_level,
            display_order: assignment.display_order,
            expires_at: assignment.expires_at
          });
        } else {
          // Create new assignment
          await this.assignVideoToCustomer(videoId, assignment.customer_id, {
            assignment_type: 'manual',
            assignment_reason: 'Video assignment update',
            is_featured: assignment.is_featured,
            access_level: assignment.access_level,
            expires_at: assignment.expires_at
          });
        }
      }
    } catch (error) {
      console.error('Error updating video customer assignments:', error);
      throw new Error(`Failed to update video assignments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get video processing status with customer context
   */
  static async getVideoProcessingStatus(
    videoId: string,
    customerId?: string
  ): Promise<{
    video: Video;
    processing_status: VideoProcessingStatus;
    processing_progress: number;
    processing_error: string | null;
    customer_assignments?: CustomerContentSummary[];
  }> {
    try {
      const video = await VideoAPI.getVideo(videoId);
      
      let customerAssignments: CustomerContentSummary[] = [];
      if (customerId) {
        customerAssignments = await CustomerContentAPI.getCustomerContent(customerId, {
          search_query: video.title
        });
      }

      return {
        video,
        processing_status: video.processing_status,
        processing_progress: video.processing_progress,
        processing_error: video.processing_error,
        customer_assignments: customerAssignments
      };
    } catch (error) {
      console.error('Error getting video processing status:', error);
      throw new Error(`Failed to get video processing status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update video metadata with customer context
   */
  static async updateVideoMetadata(
    videoId: string,
    updates: {
      title?: string;
      description?: string;
      machine_model?: string;
      process_type?: string;
      tooling?: string;
      skill_level?: 'beginner' | 'intermediate' | 'advanced';
      tags?: string[];
      visibility?: 'private' | 'public' | 'organization';
      customer_scope?: string[];
      status?: VideoStatus;
    }
  ): Promise<Video> {
    try {
      const updatedVideo = await VideoAPI.updateVideo(videoId, updates);

      // If machine model was updated, trigger auto-assignment
      if (updates.machine_model) {
        await this.autoAssignVideoByMachineModel(videoId, updates.machine_model);
      }

      return updatedVideo;
    } catch (error) {
      console.error('Error updating video metadata:', error);
      throw new Error(`Failed to update video metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete video and remove from all customer libraries
   */
  static async deleteVideo(videoId: string): Promise<void> {
    try {
      // Remove from all customer libraries
      const customers = await CustomerContentAPI.getCustomers(1, 1000);
      for (const customer of customers.customers) {
        try {
          await CustomerContentAPI.removeContentFromLibrary(customer.id, videoId);
        } catch (error) {
          console.warn(`Failed to remove video from customer ${customer.id}:`, error);
        }
      }

      // Delete the video
      await VideoAPI.deleteVideo(videoId);
    } catch (error) {
      console.error('Error deleting video:', error);
      throw new Error(`Failed to delete video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get video analytics with customer context
   */
  static async getVideoAnalytics(
    videoId: string,
    customerId?: string
  ): Promise<{
    video: Video;
    total_views: number;
    total_downloads: number;
    total_bookmarks: number;
    customer_analytics?: CustomerContentSummary[];
  }> {
    try {
      const video = await VideoAPI.getVideo(videoId);
      
      let customerAnalytics: CustomerContentSummary[] = [];
      if (customerId) {
        customerAnalytics = await CustomerContentAPI.getCustomerContent(customerId, {
          search_query: video.title
        });
      }

      return {
        video,
        total_views: video.view_count,
        total_downloads: video.download_count,
        total_bookmarks: video.bookmark_count,
        customer_analytics: customerAnalytics
      };
    } catch (error) {
      console.error('Error getting video analytics:', error);
      throw new Error(`Failed to get video analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Track video event with customer context
   */
  static async trackVideoEvent(
    videoId: string,
    eventType: 'view' | 'download' | 'bookmark' | 'complete' | 'share',
    userId?: string,
    eventData?: Record<string, any>
  ): Promise<void> {
    try {
      // Get user's customer context
      if (userId) {
        const { data: user } = await (await import('@/lib/supabase')).supabase
          .from('users')
          .select('company')
          .eq('id', userId)
          .single();

        if (user) {
          const customer = await CustomerContentAPI.getCustomerByUserCompany(user.company);
          if (customer) {
            await CustomerContentAPI.trackContentEvent({
              customer_id: customer.id,
              video_id: videoId,
              user_id: userId,
              event_type: eventType,
              event_data: eventData
            });
          }
        }
      }
    } catch (error) {
      console.error('Error tracking video event:', error);
      // Don't throw here as this is a background operation
    }
  }

  /**
   * Validate video for customer assignment
   */
  static validateVideoForCustomerAssignment(
    video: Video
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (video.status !== 'published') {
      errors.push('Video must be published before assigning to customers');
    }

    if (video.processing_status !== 'completed') {
      errors.push('Video must be fully processed before assigning to customers');
    }

    if (!video.machine_model) {
      errors.push('Video must have a machine model for customer assignment');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get video upload recommendations based on customer context
   */
  static async getUploadRecommendations(
    customerId?: string
  ): Promise<{
    recommended_machine_models: string[];
    recommended_process_types: string[];
    recommended_tooling: string[];
    recommended_tags: string[];
  }> {
    try {
      const recommendations = {
        recommended_machine_models: [] as string[],
        recommended_process_types: [] as string[],
        recommended_tooling: [] as string[],
        recommended_tags: [] as string[]
      };

      if (customerId) {
        // Get customer's machines
        const machines = await CustomerContentAPI.getCustomerMachines(customerId);
        recommendations.recommended_machine_models = machines
          .filter(m => m.status === 'active')
          .map(m => m.machine_model);

        // Get existing content to suggest similar metadata
        const existingContent = await CustomerContentAPI.getCustomerContent(customerId, { limit: 100 });
        
        const processTypes = [...new Set(existingContent.map((c: any) => c.process_type).filter(Boolean))];
        const tooling = [...new Set(existingContent.map((c: any) => c.tooling).filter(Boolean))];
        const tags = [...new Set(existingContent.flatMap((c: any) => c.tags))];

        recommendations.recommended_process_types = processTypes;
        recommendations.recommended_tooling = tooling;
        recommendations.recommended_tags = tags;
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting upload recommendations:', error);
      return {
        recommended_machine_models: [],
        recommended_process_types: [],
        recommended_tooling: [],
        recommended_tags: []
      };
    }
  }
}

// Export individual functions for convenience
export const {
  uploadVideo,
  uploadVideoForCustomers,
  assignVideoToCustomer,
  removeVideoFromCustomer,
  autoAssignVideoByMachineModel,
  getCustomerVideos,
  getUserAccessibleVideos,
  hasVideoAccess,
  updateVideoCustomerAssignments,
  getVideoProcessingStatus,
  updateVideoMetadata,
  deleteVideo,
  getVideoAnalytics,
  trackVideoEvent,
  validateVideoForCustomerAssignment,
  getUploadRecommendations
} = VideoUploadService;
