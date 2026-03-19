/**
 * Performance Monitoring System for HireGo Dashboards
 * Implements comprehensive metrics collection, analytics, and monitoring
 * 
 * Features:
 * - Page load time tracking
 * - API response time monitoring
 * - Error rate tracking
 * - User interaction analytics
 * - Core Web Vitals measurement
 * - Custom business metrics
 */

// ==================== TYPES ====================

interface PerformanceMetrics {
    // Timing Metrics
    pageLoadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    timeToInteractive: number;
    cumulativeLayoutShift: number;
    
    // API Metrics
    apiResponseTime: number;
    apiSuccessRate: number;
    apiErrorCount: number;
    
    // User Interactions
    clickEvents: number;
    navigationEvents: number;
    formSubmissions: number;
    
    // Business Metrics
    dashboardType: 'admin' | 'candidate' | 'employer' | 'educator' | 'universal';
    userRole: string;
    sessionId: string;
    timestamp: number;
}

interface ErrorReport {
    message: string;
    stack?: string;
    component: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: number;
    userId?: string;
    metadata?: Record<string, any>;
}

// ==================== PERFORMANCE MONITOR ====================

class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: Map<string, PerformanceMetrics> = new Map();
    private errors: ErrorReport[] = [];
    private sessionStart: number = Date.now();
    private apiTimings: Map<string, number[]> = new Map();
    
    private constructor() {
        this.initializeCoreWebVitals();
        this.setupApiInterceptors();
        this.startSessionTracking();
    }

    public static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    // ==================== CORE WEB VITALS ====================

    private initializeCoreWebVitals() {
        // First Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const fcp = entries[entries.length - 1];
            this.recordMetric('firstContentfulPaint', fcp.startTime);
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lcp = entries[entries.length - 1];
            this.recordMetric('largestContentfulPaint', lcp.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries() as any[]) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            this.recordMetric('cumulativeLayoutShift', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });

        // Time to Interactive (approximation)
        window.addEventListener('load', () => {
            setTimeout(() => {
                const tti = performance.now() - this.sessionStart;
                this.recordMetric('timeToInteractive', tti);
            }, 0);
        });
    }

    // ==================== API MONITORING ====================

    private setupApiInterceptors() {
        // Simple API timing tracking without complex proxy
        const trackApiCall = (endpoint: string, duration: number, success: boolean) => {
            this.recordApiTiming(endpoint, duration, success);
        };

        // Monkey-patch fetch for performance monitoring
        const originalFetch = window.fetch;
        window.fetch = function(input: any, init?: any) {
            const startTime = performance.now();
            const endpoint = typeof input === 'string' ? input : String(input);
            
            return originalFetch.apply(this, arguments as any).then((response: Response) => {
                const duration = performance.now() - startTime;
                trackApiCall(endpoint, duration, response.ok);
                return response;
            }).catch((error: any) => {
                const duration = performance.now() - startTime;
                trackApiCall(endpoint, duration, false);
                throw error;
            });
        };
    }

    private recordApiTiming(endpoint: string, duration: number, success: boolean) {
        if (!this.apiTimings.has(endpoint)) {
            this.apiTimings.set(endpoint, []);
        }
        this.apiTimings.get(endpoint)!.push(duration);

        // Calculate rolling average
        const timings = this.apiTimings.get(endpoint)!;
        const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
        
        this.sendMetrics({
            apiResponseTime: avgTime,
            apiSuccessRate: success ? 100 : 0,
            apiErrorCount: success ? 0 : 1,
            dashboardType: this.detectDashboardType(),
            userRole: this.getUserRole(),
            sessionId: this.getSessionId(),
            timestamp: Date.now()
        } as PerformanceMetrics);
    }

    // ==================== ERROR TRACKING ====================

    public reportError(error: ErrorReport) {
        this.errors.push(error);
        
        // Auto-report critical errors
        if (error.severity === 'critical') {
            this.sendToMonitoringService('critical_error', error);
        }

        // Keep only last 100 errors in memory
        if (this.errors.length > 100) {
            this.errors = this.errors.slice(-100);
        }
    }

    // ==================== METRICS RECORDING ====================

    public recordMetric(name: string, value: number) {
        const currentMetrics = this.getCurrentMetrics();
        const updatedMetrics = {
            ...currentMetrics,
            [name]: value
        };
        this.metrics.set(this.getSessionId(), updatedMetrics);
        
        // Send to analytics every 30 seconds or on significant events
        if (this.shouldSendMetrics()) {
            this.sendMetrics(updatedMetrics);
        }
    }

    private getCurrentMetrics(): PerformanceMetrics {
        const existing = this.metrics.get(this.getSessionId());
        return existing || {
            pageLoadTime: performance.now() - this.sessionStart,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0,
            timeToInteractive: 0,
            cumulativeLayoutShift: 0,
            apiResponseTime: 0,
            apiSuccessRate: 100,
            apiErrorCount: 0,
            clickEvents: 0,
            navigationEvents: 0,
            formSubmissions: 0,
            dashboardType: this.detectDashboardType(),
            userRole: this.getUserRole(),
            sessionId: this.getSessionId(),
            timestamp: Date.now()
        };
    }

    // ==================== USER INTERACTION TRACKING ====================

    public trackInteraction(type: 'click' | 'navigation' | 'form_submit', metadata?: Record<string, any>) {
        const metrics = this.getCurrentMetrics();
        
        switch (type) {
            case 'click':
                metrics.clickEvents++;
                break;
            case 'navigation':
                metrics.navigationEvents++;
                break;
            case 'form_submit':
                metrics.formSubmissions++;
                break;
        }

        this.metrics.set(this.getSessionId(), metrics);
        this.sendMetrics(metrics);
    }

    // ==================== SESSION MANAGEMENT ====================

    private startSessionTracking() {
        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveSessionMetrics();
            } else {
                this.restoreSessionMetrics();
            }
        });

        // Save before unload
        window.addEventListener('beforeunload', () => {
            this.saveSessionMetrics();
        });

        // Periodic cleanup
        setInterval(() => {
            this.cleanupOldMetrics();
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    private getSessionId(): string {
        let sessionId = sessionStorage.getItem('performance_session_id');
        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('performance_session_id', sessionId);
        }
        return sessionId;
    }

    // ==================== HELPERS ====================

    private extractEndpoint(url: string): string {
        try {
            const urlObj = new URL(url);
            return urlObj.pathname.replace(/^\/api\//, '');
        } catch {
            return 'unknown';
        }
    }

    private detectDashboardType(): PerformanceMetrics['dashboardType'] {
        const path = window.location.pathname;
        if (path.includes('/admin')) return 'admin';
        if (path.includes('/candidate')) return 'candidate';
        if (path.includes('/employer')) return 'employer';
        if (path.includes('/educator')) return 'educator';
        return 'universal';
    }

    private getUserRole(): string {
        try {
            const userStr = localStorage.getItem('sb-user');
            if (!userStr) return 'anonymous';
            const user = JSON.parse(userStr);
            return user.user_metadata?.role || 'user';
        } catch {
            return 'unknown';
        }
    }

    private shouldSendMetrics(): boolean {
        // Send every 30 seconds or if we have significant changes
        return Math.random() < 0.1; // 10% sampling rate for continuous metrics
    }

    private sendMetrics(metrics: PerformanceMetrics) {
        // Send to your analytics service
        if (typeof window !== 'undefined' && (window as any).analytics) {
            (window as any).analytics.track('dashboard_performance', metrics);
        }

        // Also send to backend for storage
        fetch('/api/metrics/performance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metrics)
        }).catch(console.error);
    }

    private sendToMonitoringService(type: string, data: any) {
        // Integration with Sentry, Datadog, New Relic, etc.
        if ((window as any).Sentry) {
            (window as any).Sentry.captureException(data);
        }
        
        console.log(`[${type}]`, data);
    }

    private saveSessionMetrics() {
        const metrics = this.getCurrentMetrics();
        sessionStorage.setItem('performance_metrics', JSON.stringify(metrics));
    }

    private restoreSessionMetrics() {
        const saved = sessionStorage.getItem('performance_metrics');
        if (saved) {
            try {
                const metrics = JSON.parse(saved);
                this.metrics.set(this.getSessionId(), metrics);
            } catch (e) {
                console.error('Failed to restore metrics:', e);
            }
        }
    }

    private cleanupOldMetrics() {
        const now = Date.now();
        for (const [sessionId, metrics] of this.metrics.entries()) {
            if (now - metrics.timestamp > 30 * 60 * 1000) { // 30 minutes
                this.metrics.delete(sessionId);
            }
        }
    }

    // ==================== PUBLIC API ====================

    public getMetrics(): PerformanceMetrics | undefined {
        return this.metrics.get(this.getSessionId());
    }

    public getErrors(): ErrorReport[] {
        return [...this.errors];
    }

    public reset() {
        this.metrics.clear();
        this.errors = [];
        this.sessionStart = Date.now();
    }
}

// ==================== REACT HOOK ====================

import { useEffect, useCallback } from 'react';

export function usePerformanceMonitor(componentName: string) {
    const monitor = PerformanceMonitor.getInstance();

    useEffect(() => {
        // Track component mount
        const startTime = performance.now();
        
        return () => {
            // Track component unmount
            const duration = performance.now() - startTime;
            monitor.recordMetric(`${componentName}_render_time`, duration);
        };
    }, [componentName]);

    const trackInteraction = useCallback((type: 'click' | 'navigation' | 'form_submit') => {
        monitor.trackInteraction(type, { component: componentName });
    }, [monitor, componentName]);

    const reportError = useCallback((error: Error, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
        monitor.reportError({
            message: error.message,
            stack: error.stack,
            component: componentName,
            severity,
            timestamp: Date.now()
        });
    }, [monitor, componentName]);

    return {
        trackInteraction,
        reportError
    };
}

// ==================== EXPORTS ====================

export default PerformanceMonitor;
export { PerformanceMonitor };
