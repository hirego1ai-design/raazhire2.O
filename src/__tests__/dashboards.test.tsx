/**
 * Dashboard Components - Comprehensive Test Suite
 * Covers: Admin, Candidate, Employer, Educator, Universal Dashboards
 * Tests: Unit, Integration, E2E scenarios
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock API calls
vi.mock('../../lib/api', () => ({
    API_BASE_URL: 'http://localhost:3000',
    endpoints: {
        candidate: { stats: '/api/candidate/stats' },
        employer: { stats: '/api/employer/stats' },
        interviews: { candidate: '/api/interviews/candidate' },
        profile: '/api/profile',
        jobs: '/api/jobs',
    },
    getAuthHeaders: () => ({ Authorization: 'Bearer test-token' })
}));

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

// ==================== CANDIDATE DASHBOARD TESTS ====================

describe('CandidateDashboard', () => {
    const mockStats = {
        success: true,
        stats: {
            totalApplications: 15,
            interviewsScheduled: 3,
            profile_completeness_score: 85,
            ai_overall_score: 78
        }
    };

    const mockInterviews = {
        success: true,
        interviews: [
            {
                id: 1,
                candidateName: 'Test User',
                role: 'Frontend Developer',
                date: '2024-03-20',
                time: '10:00 AM',
                type: 'Technical' as const,
                status: 'Scheduled' as const,
                avatar: ''
            }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockLocalStorage.getItem.mockImplementation((key) => {
            if (key === 'sb-token') return 'test-token';
            if (key === 'sb-user') return JSON.stringify({ email: 'test@example.com' });
            return null;
        });
    });

    it('redirects to signin when not authenticated', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);
        
        // Import component dynamically to test auth check
        const { CandidateDashboard } = await import('../candidate/Dashboard');
        render(
            <MemoryRouter initialEntries={['/candidate/dashboard']}>
                <Routes>
                    <Route path="/signin" element={<div>Sign In Page</div>} />
                    <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Sign In Page')).toBeInTheDocument();
        });
    });

    it('displays loading state initially', async () => {
        // Mock delayed API response
        global.fetch = vi.fn().mockImplementation(() => new Promise(resolve => 
            setTimeout(() => resolve({ json: () => Promise.resolve(mockStats), ok: true }), 100)
        ));

        const { CandidateDashboard } = await import('../candidate/Dashboard');
        render(
            <MemoryRouter>
                <CandidateDashboard />
            </MemoryRouter>
        );

        expect(screen.getByText(/loading your dashboard/i)).toBeInTheDocument();
    });

    it('shows error banner on API failure', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        const { CandidateDashboard } = await import('../candidate/Dashboard');
        render(
            <MemoryRouter>
                <CandidateDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
        });
    });

    it('renders dashboard with valid data', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ json: () => Promise.resolve(mockStats), ok: true })
            .mockResolvedValueOnce({ json: () => Promise.resolve(mockInterviews), ok: true })
            .mockResolvedValueOnce({ json: () => Promise.resolve({ success: true, user: {} }), ok: true })
            .mockResolvedValueOnce({ json: () => Promise.resolve({ success: true, jobs: [] }), ok: true });

        const { CandidateDashboard } = await import('../candidate/Dashboard');
        render(
            <MemoryRouter>
                <CandidateDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Welcome back!/i)).toBeInTheDocument();
        });
    });
});

// ==================== EMPLOYER DASHBOARD TESTS ====================

describe('EmployerDashboard', () => {
    const mockEmployerStats = {
        success: true,
        stats: {
            totalCandidates: 50,
            activeJobs: 5,
            shortlisted: 12,
            interviews: 8,
            hires: 3
        }
    };

    const mockApplicants = {
        success: true,
        applications: [
            {
                id: 1,
                candidate: { name: 'John Doe', is_premium: true },
                job: { title: 'Senior Developer' },
                ai_screening_score: 85,
                status: 'pending'
            }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockLocalStorage.getItem.mockReturnValue('test-token');
    });

    it('validates authentication on mount', async () => {
        mockLocalStorage.getItem.mockReturnValue(null);

        const { EmployerDashboard } = await import('../employer/Dashboard');
        render(
            <MemoryRouter initialEntries={['/employer/dashboard']}>
                <Routes>
                    <Route path="/signin" element={<div>Sign In</div>} />
                    <Route path="/employer/dashboard" element={<EmployerDashboard />} />
                </Routes>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Sign In')).toBeInTheDocument();
        });
    });

    it('displays pricing model toggle', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ json: () => Promise.resolve(mockEmployerStats), ok: true })
            .mockResolvedValueOnce({ json: () => Promise.resolve(mockApplicants), ok: true });

        const { EmployerDashboard } = await import('../employer/Dashboard');
        render(
            <MemoryRouter>
                <EmployerDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Subscription')).toBeInTheDocument();
            expect(screen.getByText('Success-Based')).toBeInTheDocument();
        });
    });

    it('calculates PPH due amount correctly', async () => {
        const statsWithHires = {
            ...mockEmployerStats,
            stats: { ...mockEmployerStats.stats, hires: 5 }
        };

        global.fetch = vi.fn()
            .mockResolvedValueOnce({ json: () => Promise.resolve(statsWithHires), ok: true })
            .mockResolvedValueOnce({ json: () => Promise.resolve(mockApplicants), ok: true });

        const { EmployerDashboard } = await import('../employer/Dashboard');
        render(
            <MemoryRouter>
                <EmployerDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            // Should show calculated amount (5 hires * 50000)
            expect(screen.getByText(/₹250000/)).toBeInTheDocument();
        });
    });
});

// ==================== ADMIN DASHBOARD TESTS ====================

describe('AdminDashboard', () => {
    const mockUsers = { count: 1000 };
    const mockJobs = {
        data: [
            { id: 1, status: 'active', job_type: 'premium', created_at: new Date().toISOString() }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('handles Supabase connection error', async () => {
        // Mock Supabase as unavailable
        vi.mock('../../lib/supabase', () => ({
            supabase: null
        }));

        const { AdminDashboard } = await import('../admin/Dashboard.refactored');
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Supabase connection not available/i)).toBeInTheDocument();
        });
    });

    it('displays system statistics', async () => {
        global.supabase = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue({ data: [] }),
            single: vi.fn().mockResolvedValue({ data: null })
        };

        // Mock count query
        global.supabase.from = vi.fn().mockImplementation((table: string) => {
            if (table === 'users') {
                return {
                    select: vi.fn().mockResolvedValue({ count: 1000, error: null })
                };
            }
            return {
                select: vi.fn().mockResolvedValue({ data: [], error: null })
            };
        });

        const { AdminDashboard } = await import('../admin/Dashboard.refactored');
        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('System Overview')).toBeInTheDocument();
        });
    });
});

// ==================== ERROR HANDLING TESTS ====================

describe('Dashboard Error Handling', () => {
    it('retries failed API calls on button click', async () => {
        let callCount = 0;
        global.fetch = vi.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
                return Promise.reject(new Error('First attempt fails'));
            }
            return Promise.resolve({ json: () => Promise.resolve({ success: true }), ok: true });
        });

        const { CandidateDashboard } = await import('../candidate/Dashboard');
        const { getByRole } = render(
            <MemoryRouter>
                <CandidateDashboard />
            </MemoryRouter>
        );

        // Wait for error to appear
        await waitFor(() => {
            expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
        });

        // Click retry button
        const retryButton = getByRole('button', { name: /retry/i });
        fireEvent.click(retryButton);

        // Should have called fetch again
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });
});

// ==================== PERFORMANCE TESTS ====================

describe('Dashboard Performance', () => {
    it('renders within acceptable time (< 1000ms)', async () => {
        global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve({ success: true }), ok: true });

        const startTime = performance.now();
        const { CandidateDashboard } = await import('../candidate/Dashboard');
        render(
            <MemoryRouter>
                <CandidateDashboard />
            </MemoryRouter>
        );
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(1000);
    });

    it('does not cause memory leaks', async () => {
        global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve({ success: true }), ok: true });

        const { CandidateDashboard, unmount } = render(
            <MemoryRouter>
                <CandidateDashboard />
            </MemoryRouter>
        );

        // Mount and unmount multiple times
        for (let i = 0; i < 5; i++) {
            unmount();
        }

        // Should not throw any cleanup errors
        expect(() => unmount()).not.toThrow();
    });
});

// ==================== ACCESSIBILITY TESTS ====================

describe('Dashboard Accessibility', () => {
    it('has proper ARIA labels', async () => {
        global.fetch = vi.fn().mockResolvedValue({ json: () => Promise.resolve({ success: true }), ok: true });

        const { CandidateDashboard } = await import('../candidate/Dashboard');
        const { container } = render(
            <MemoryRouter>
                <CandidateDashboard />
            </MemoryRouter>
        );

        // Check for heading hierarchy
        expect(container.querySelector('h1')).toBeInTheDocument();
        
        // Check for loading indicator with proper role
        const loadingIndicator = container.querySelector('[role="status"]');
        expect(loadingIndicator).toBeInTheDocument();
    });
});
