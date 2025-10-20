import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import EmailVerification from "@/pages/auth/EmailVerification";
import Dashboard from "@/pages/Dashboard";
import ContentLibrary from "@/pages/ContentLibrary";
import VideoPlayer from "@/pages/VideoPlayer";
import CourseBuilder from "@/pages/CourseBuilder";
import CoursePlayer from "@/pages/CoursePlayer";
import { QuizPlayerPage } from "@/pages/QuizPlayerPage";
import { QuizBuilderPage } from "@/pages/QuizBuilderPage";
import { QuizResultsPage } from "@/pages/QuizResultsPage";
import AdminDashboard from "@/pages/AdminDashboard";
import UserManagement from "@/pages/UserManagement";
import UserProfile from "@/components/UserProfile";
import UploadReel from "@/pages/UploadReel";
import EditReel from "@/pages/EditReel";
import ContentList from "@/pages/ContentList";
import CheckoutPage from "@/pages/CheckoutPage";
import BillingHistory from "@/pages/BillingHistory";
import HelpPage from "@/pages/HelpPage";
import NotFound from "@/pages/NotFound";

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <SignupPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <PasswordResetPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/verify-email" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <EmailVerification />
                </ProtectedRoute>
              } 
            />
            <Route path="/help" element={<HelpPage />} />
            
            {/* Protected routes with layout */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/library" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ContentLibrary />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/content-library" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ContentLibrary />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/video/:id" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <VideoPlayer />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/course-builder" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CourseBuilder />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/course/:id" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CoursePlayer />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/course/:courseId/quiz/:quizId" 
              element={
                <ProtectedRoute>
                  <QuizPlayerPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/course/:courseId/quiz/:quizId/results" 
              element={
                <ProtectedRoute>
                  <QuizResultsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/course/:courseId/builder/quiz" 
              element={
                <ProtectedRoute>
                  <QuizBuilderPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/course/:courseId/builder/quiz/:quizId" 
              element={
                <ProtectedRoute>
                  <QuizBuilderPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireRole="admin">
                  <MainLayout>
                    <AdminDashboard />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requireRole="admin">
                  <MainLayout>
                    <UserManagement />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <UploadReel />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit/:id" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <EditReel />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/content" 
              element={
                <ProtectedRoute requireRole="admin">
                  <MainLayout>
                    <ContentList />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CheckoutPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/billing" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <BillingHistory />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <UserProfile />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
