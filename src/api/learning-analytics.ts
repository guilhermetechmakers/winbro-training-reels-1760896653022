/**
 * Learning Analytics API functions for Winbro Training Reels
 */

import { supabase } from '@/lib/supabase';
import type { 
  LearningAnalyticsEvent,
  LearningAnalyticsInsert,
  LearningAnalyticsFilters,
  LearningAnalyticsSummary,
  CourseAnalytics,
  UserLearningProfile,
  QuizAnalytics,
  LearningAnalyticsDashboard
} from '@/types/learning-analytics';

// Log a learning analytics event
export async function logLearningEvent(eventData: LearningAnalyticsInsert): Promise<LearningAnalyticsEvent> {
  const { data, error } = await supabase
    .from('learning_analytics')
    .insert(eventData)
    .select()
    .single();

  if (error) throw error;
  return data as LearningAnalyticsEvent;
}

// Get learning analytics events with filters
export async function getLearningAnalytics(filters: LearningAnalyticsFilters = {}): Promise<{
  events: LearningAnalyticsEvent[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}> {
  const { limit = 20, offset = 0, ...queryFilters } = filters;
  
  let query = supabase
    .from('learning_analytics')
    .select('*', { count: 'exact' });

  // Apply filters
  if (queryFilters.user_id) {
    query = query.eq('user_id', queryFilters.user_id);
  }
  if (queryFilters.course_id) {
    query = query.eq('course_id', queryFilters.course_id);
  }
  if (queryFilters.module_id) {
    query = query.eq('module_id', queryFilters.module_id);
  }
  if (queryFilters.quiz_id) {
    query = query.eq('quiz_id', queryFilters.quiz_id);
  }
  if (queryFilters.event_type) {
    query = query.eq('event_type', queryFilters.event_type);
  }
  if (queryFilters.device_type) {
    query = query.eq('device_type', queryFilters.device_type);
  }
  if (queryFilters.session_id) {
    query = query.eq('session_id', queryFilters.session_id);
  }
  if (queryFilters.date_from) {
    query = query.gte('created_at', queryFilters.date_from);
  }
  if (queryFilters.date_to) {
    query = query.lte('created_at', queryFilters.date_to);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    events: data as LearningAnalyticsEvent[],
    total: count || 0,
    page: Math.floor(offset / limit) + 1,
    limit,
    has_more: (count || 0) > offset + limit
  };
}

// Get learning analytics summary
export async function getLearningAnalyticsSummary(filters: Partial<LearningAnalyticsFilters> = {}): Promise<LearningAnalyticsSummary> {
  const { data, error } = await supabase
    .from('learning_analytics')
    .select('*');

  if (error) throw error;

  const events = data as LearningAnalyticsEvent[];
  const filteredEvents = events.filter(event => {
    if (filters.user_id && event.user_id !== filters.user_id) return false;
    if (filters.course_id && event.course_id !== filters.course_id) return false;
    if (filters.event_type && event.event_type !== filters.event_type) return false;
    if (filters.date_from && new Date(event.created_at) < new Date(filters.date_from)) return false;
    if (filters.date_to && new Date(event.created_at) > new Date(filters.date_to)) return false;
    return true;
  });

  const uniqueUsers = new Set(filteredEvents.map(e => e.user_id)).size;
  const uniqueCourses = new Set(filteredEvents.map(e => e.course_id)).size;
  const uniqueSessions = new Set(filteredEvents.filter(e => e.session_id).map(e => e.session_id)).size;
  
  const totalDuration = filteredEvents.reduce((sum, e) => sum + e.duration, 0);
  const averageDuration = filteredEvents.length > 0 ? totalDuration / filteredEvents.length : 0;

  // Calculate completion rate (course_completed / course_started)
  const courseStarted = filteredEvents.filter(e => e.event_type === 'course_started').length;
  const courseCompleted = filteredEvents.filter(e => e.event_type === 'course_completed').length;
  const completionRate = courseStarted > 0 ? (courseCompleted / courseStarted) * 100 : 0;

  // Calculate engagement score (weighted average of different activities)
  const engagementWeights = {
    'video_played': 1,
    'video_completed': 3,
    'quiz_started': 2,
    'quiz_completed': 4,
    'bookmark_created': 2,
    'note_added': 2,
    'search_performed': 1
  };

  const engagementScore = filteredEvents.reduce((score, event) => {
    const weight = engagementWeights[event.event_type as keyof typeof engagementWeights] || 1;
    return score + weight;
  }, 0) / Math.max(filteredEvents.length, 1);

  // Top events
  const eventCounts = filteredEvents.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topEvents = Object.entries(eventCounts)
    .map(([event_type, count]) => ({
      event_type: event_type as any,
      count,
      percentage: (count / filteredEvents.length) * 100
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Device breakdown
  const deviceCounts = filteredEvents.reduce((acc, event) => {
    if (event.device_type) {
      acc[event.device_type] = (acc[event.device_type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const deviceBreakdown = Object.entries(deviceCounts)
    .map(([device_type, count]) => ({
      device_type: device_type as any,
      count,
      percentage: (count / filteredEvents.length) * 100
    }))
    .sort((a, b) => b.count - a.count);

  // Time series (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const timeSeries = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayEvents = filteredEvents.filter(e => 
      e.created_at.startsWith(dateStr)
    );
    
    timeSeries.push({
      date: dateStr,
      events: dayEvents.length,
      users: new Set(dayEvents.map(e => e.user_id)).size
    });
  }

  return {
    total_events: filteredEvents.length,
    unique_users: uniqueUsers,
    unique_courses: uniqueCourses,
    unique_sessions: uniqueSessions,
    average_duration: Math.round(averageDuration),
    completion_rate: Math.round(completionRate),
    engagement_score: Math.round(engagementScore),
    top_events: topEvents,
    device_breakdown: deviceBreakdown,
    time_series: timeSeries
  };
}

// Get course analytics
export async function getCourseAnalytics(courseId: string): Promise<CourseAnalytics> {
  const { data: events, error: eventsError } = await supabase
    .from('learning_analytics')
    .select('*')
    .eq('course_id', courseId);

  if (eventsError) throw eventsError;

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('title')
    .eq('id', courseId)
    .single();

  if (courseError) throw courseError;

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('course_id', courseId);

  if (enrollmentsError) throw enrollmentsError;

  const courseEvents = events as LearningAnalyticsEvent[];
  const totalEnrollments = enrollments.length;
  const totalCompletions = courseEvents.filter(e => e.event_type === 'course_completed').length;
  const completionRate = totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0;

  const scores = courseEvents
    .filter(e => e.score !== null && e.score !== undefined)
    .map(e => e.score!);
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;

  const totalTimeSpent = courseEvents.reduce((sum, e) => sum + e.duration, 0);
  const averageTimeSpent = courseEvents.length > 0 ? totalTimeSpent / courseEvents.length : 0;

  // Engagement metrics
  const engagementMetrics = {
    video_views: courseEvents.filter(e => e.event_type === 'video_played').length,
    quiz_attempts: courseEvents.filter(e => e.event_type === 'quiz_started').length,
    search_queries: courseEvents.filter(e => e.event_type === 'search_performed').length,
    bookmarks_created: courseEvents.filter(e => e.event_type === 'bookmark_created').length,
    notes_added: courseEvents.filter(e => e.event_type === 'note_added').length
  };

  // User progress
  const userProgress = enrollments.map(enrollment => {
    const userEvents = courseEvents.filter(e => e.user_id === enrollment.user_id);
    const lastEvent = userEvents.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
    
    return {
      user_id: enrollment.user_id,
      user_name: 'User', // Would need to join with user_profiles
      progress_percentage: enrollment.progress_percentage,
      last_accessed: lastEvent?.created_at || enrollment.last_accessed_at,
      time_spent: userEvents.reduce((sum, e) => sum + e.duration, 0)
    };
  });

  return {
    course_id: courseId,
    course_title: course.title,
    total_enrollments: totalEnrollments,
    total_completions: totalCompletions,
    completion_rate: Math.round(completionRate),
    average_score: averageScore,
    average_time_spent: Math.round(averageTimeSpent),
    drop_off_points: [], // Would need more complex analysis
    engagement_metrics: engagementMetrics,
    user_progress: userProgress
  };
}

// Get user learning profile
export async function getUserLearningProfile(userId: string): Promise<UserLearningProfile> {
  const { data: events, error: eventsError } = await supabase
    .from('learning_analytics')
    .select('*')
    .eq('user_id', userId);

  if (eventsError) throw eventsError;

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('course_enrollments')
    .select('*')
    .eq('user_id', userId);

  if (enrollmentsError) throw enrollmentsError;

  const { data: certificates, error: certificatesError } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (certificatesError) throw certificatesError;

  const userEvents = events as LearningAnalyticsEvent[];
  const totalCoursesEnrolled = enrollments.length;
  const totalCoursesCompleted = userEvents.filter(e => e.event_type === 'course_completed').length;
  const totalCertificatesEarned = certificates.length;

  const scores = userEvents
    .filter(e => e.score !== null && e.score !== undefined)
    .map(e => e.score!);
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;

  const totalTimeSpent = userEvents.reduce((sum, e) => sum + e.duration, 0);

  // Learning streak (consecutive days with activity)
  const uniqueDays = new Set(
    userEvents.map(e => e.created_at.split('T')[0])
  ).size;
  const learningStreak = uniqueDays; // Simplified calculation

  // Device type preference
  const deviceCounts = userEvents.reduce((acc, event) => {
    if (event.device_type) {
      acc[event.device_type] = (acc[event.device_type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const preferredDeviceType = Object.entries(deviceCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] as any || 'desktop';

  // Learning patterns
  const hours = userEvents.map(e => new Date(e.created_at).getHours());
  const hourCounts = hours.reduce((acc, hour) => {
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const mostActiveHours = Object.entries(hourCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));

  const contentTypes = userEvents.map(e => e.event_type);
  const contentTypeCounts = contentTypes.reduce((acc, type) => {
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const preferredContentTypes = Object.entries(contentTypeCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type);

  const sessionDurations = userEvents
    .filter(e => e.session_id)
    .reduce((acc, event) => {
      if (!acc[event.session_id!]) {
        acc[event.session_id!] = 0;
      }
      acc[event.session_id!] += event.duration;
      return acc;
    }, {} as Record<string, number>);

  const averageSessionDuration = Object.values(sessionDurations).length > 0
    ? Math.round(Object.values(sessionDurations).reduce((sum, duration) => sum + duration, 0) / Object.values(sessionDurations).length)
    : 0;

  return {
    user_id: userId,
    total_courses_enrolled: totalCoursesEnrolled,
    total_courses_completed: totalCoursesCompleted,
    total_certificates_earned: totalCertificatesEarned,
    average_score: averageScore,
    total_time_spent: totalTimeSpent,
    learning_streak: learningStreak,
    preferred_device_type: preferredDeviceType,
    learning_patterns: {
      most_active_hours: mostActiveHours,
      preferred_content_types: preferredContentTypes,
      average_session_duration: averageSessionDuration
    },
    achievements: [], // Would need to implement achievement system
    recent_activity: userEvents
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
  };
}

// Get quiz analytics
export async function getQuizAnalytics(quizId: string): Promise<QuizAnalytics> {
  const { data: events, error: eventsError } = await supabase
    .from('learning_analytics')
    .select('*')
    .eq('quiz_id', quizId);

  if (eventsError) throw eventsError;

  const { data: quiz, error: quizError } = await supabase
    .from('course_quizzes')
    .select('question')
    .eq('id', quizId)
    .single();

  if (quizError) throw eventsError;

  const { data: attempts, error: attemptsError } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId);

  if (attemptsError) throw attemptsError;

  const quizEvents = events as LearningAnalyticsEvent[];
  const totalAttempts = attempts.length;
  const uniqueAttempts = new Set(attempts.map(a => a.user_id)).size;

  const scores = attempts.map(a => a.score);
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;

  const passRate = attempts.filter(a => a.score >= 80).length / totalAttempts * 100;

  const totalTimeSpent = quizEvents.reduce((sum, e) => sum + e.duration, 0);
  const averageTimeSpent = quizEvents.length > 0 ? totalTimeSpent / quizEvents.length : 0;

  return {
    quiz_id: quizId,
    quiz_title: quiz.question,
    total_attempts: totalAttempts,
    unique_attempts: uniqueAttempts,
    average_score: averageScore,
    pass_rate: Math.round(passRate),
    average_time_spent: Math.round(averageTimeSpent),
    question_analytics: [], // Would need more complex analysis
    difficulty_analysis: {
      easy_questions: 0,
      medium_questions: 0,
      hard_questions: 0,
      overall_difficulty: 3
    },
    user_performance: attempts.map(attempt => ({
      user_id: attempt.user_id,
      user_name: 'User', // Would need to join with user_profiles
      best_score: attempt.score,
      attempts: 1, // Would need to count attempts per user
      last_attempt: attempt.created_at
    }))
  };
}

// Get learning analytics dashboard data
export async function getLearningAnalyticsDashboard(filters: Partial<LearningAnalyticsFilters> = {}): Promise<LearningAnalyticsDashboard> {
  const [overview, recentEvents] = await Promise.all([
    getLearningAnalyticsSummary(filters),
    getLearningAnalytics({ ...filters, limit: 10 })
  ]);

  // Get top courses (simplified)
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title')
    .limit(5);

  if (coursesError) throw coursesError;

  const topCourses = await Promise.all(
    courses.map(course => getCourseAnalytics(course.id))
  );

  return {
    overview,
    top_courses: topCourses,
    recent_events: recentEvents.events,
    user_engagement: {
      daily_active_users: 0, // Would need more complex calculation
      weekly_active_users: 0,
      monthly_active_users: 0,
      retention_rate: 0
    },
    content_performance: {
      most_viewed_videos: [], // Would need video analytics
      most_attempted_quizzes: [] // Would need quiz analytics
    }
  };
}
