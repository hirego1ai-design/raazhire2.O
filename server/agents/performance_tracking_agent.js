/**
 * System Performance Tracking Agent
 * 
 * Responsibilities:
 * - Track hiring success rate
 * - Monitor interview-to-selection ratio
 * - Measure agent performance
 * - Track model accuracy improvement over time
 * - Monitor API usage and costs
 * - Generate performance reports
 */

/**
 * Update daily performance metrics
 * @param {object} supabase - Supabase client
 * @returns {object} Updated metrics
 */
export async function updateDailyMetrics(supabase) {
    console.log('[Performance Tracking Agent] Updating daily metrics...');

    const today = new Date().toISOString().split('T')[0];

    try {
        // Collect all metrics
        const hiringMetrics = await collectHiringMetrics(supabase);
        const agentMetrics = await collectAgentPerformance(supabase);
        const modelMetrics = await collectModelAccuracy(supabase);
        const costMetrics = await collectCostMetrics(supabase);
        const feedbackMetrics = await collectFeedbackMetrics(supabase);

        // Combine all metrics
        const dailyMetrics = {
            metric_date: today,

            // Hiring Metrics
            total_applications: hiringMetrics.totalApplications,
            total_interviews: hiringMetrics.totalInterviews,
            total_hires: hiringMetrics.totalHires,
            hiring_success_rate: hiringMetrics.successRate,
            interview_to_selection_ratio: hiringMetrics.interviewToSelectionRatio,

            // Agent Performance
            avg_screening_time: agentMetrics.avgScreeningTime,
            avg_technical_analysis_time: agentMetrics.avgTechnicalTime,
            avg_behavioral_analysis_time: agentMetrics.avgBehavioralTime,
            avg_video_processing_time: agentMetrics.avgVideoProcessingTime,

            // Model Accuracy
            model_accuracy: modelMetrics.accuracy,
            prediction_accuracy: modelMetrics.predictionAccuracy,
            false_positive_rate: modelMetrics.falsePositiveRate,
            false_negative_rate: modelMetrics.falseNegativeRate,

            // Cost Metrics
            total_api_calls: costMetrics.totalCalls,
            gemini_api_calls: costMetrics.geminiCalls,
            gpt4_api_calls: costMetrics.gpt4Calls,
            estimated_cost: costMetrics.estimatedCost,

            // Feedback Metrics
            feedback_submission_rate: feedbackMetrics.submissionRate,
            avg_feedback_rating: feedbackMetrics.avgRating
        };

        // Upsert metrics
        const { data, error } = await supabase
            .from('system_performance_metrics')
            .upsert(dailyMetrics, {
                onConflict: 'metric_date'
            })
            .select();

        if (error) throw error;

        console.log('[Performance Tracking Agent] Daily metrics updated successfully');
        return data[0];

    } catch (error) {
        console.error('[Performance Tracking Agent] Error updating metrics:', error);
        throw error;
    }
}

/**
 * Collect hiring metrics
 */
async function collectHiringMetrics(supabase) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

    // Total applications (evaluations)
    const { data: evaluations } = await supabase
        .from('candidate_evaluations')
        .select('id')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

    // Total interviews
    const { data: interviews } = await supabase
        .from('interviews')
        .select('id')
        .gte('date', startOfDay)
        .lte('date', endOfDay);

    // Total hires
    const { data: hires } = await supabase
        .from('employer_feedback')
        .select('id')
        .eq('hiring_decision', 'hire')
        .gte('submitted_at', startOfDay)
        .lte('submitted_at', endOfDay);

    const totalApplications = evaluations?.length || 0;
    const totalInterviews = interviews?.length || 0;
    const totalHires = hires?.length || 0;

    const successRate = totalApplications > 0
        ? (totalHires / totalApplications) * 100
        : 0;

    const interviewToSelectionRatio = totalInterviews > 0
        ? (totalHires / totalInterviews) * 100
        : 0;

    return {
        totalApplications,
        totalInterviews,
        totalHires,
        successRate: Math.round(successRate * 100) / 100,
        interviewToSelectionRatio: Math.round(interviewToSelectionRatio * 100) / 100
    };
}

/**
 * Collect agent performance metrics
 */
async function collectAgentPerformance(supabase) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();

    // Get processing times from evaluations
    const { data: evaluations } = await supabase
        .from('candidate_evaluations')
        .select('processing_time')
        .gte('created_at', startOfDay);

    // Get video processing times
    const { data: videoAnalysis } = await supabase
        .from('video_analysis_results')
        .select('processing_time')
        .gte('created_at', startOfDay);

    const avgProcessingTime = evaluations && evaluations.length > 0
        ? evaluations.reduce((sum, e) => sum + (e.processing_time || 0), 0) / evaluations.length
        : 0;

    const avgVideoProcessingTime = videoAnalysis && videoAnalysis.length > 0
        ? videoAnalysis.reduce((sum, v) => sum + (v.processing_time || 0), 0) / videoAnalysis.length
        : 0;

    // Estimate individual layer times (in production, track these separately)
    return {
        avgScreeningTime: Math.round(avgProcessingTime * 0.3),
        avgTechnicalTime: Math.round(avgProcessingTime * 0.4),
        avgBehavioralTime: Math.round(avgProcessingTime * 0.3),
        avgVideoProcessingTime: Math.round(avgVideoProcessingTime)
    };
}

/**
 * Collect model accuracy metrics
 */
async function collectModelAccuracy(supabase) {
    // Get latest training log
    const { data: latestTraining } = await supabase
        .from('model_training_logs')
        .select('accuracy_after, improvement')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

    const modelAccuracy = latestTraining && latestTraining.length > 0
        ? latestTraining[0].accuracy_after
        : 75.0;

    // Calculate prediction accuracy from recent feedback
    const { data: recentFeedback } = await supabase
        .from('employer_feedback')
        .select('candidate_id, hiring_decision')
        .order('submitted_at', { ascending: false })
        .limit(100);

    const { data: recentEvaluations } = await supabase
        .from('candidate_evaluations')
        .select('candidate_id, final_score')
        .order('evaluation_date', { ascending: false })
        .limit(100);

    let correctPredictions = 0;
    let totalPredictions = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    if (recentFeedback && recentEvaluations) {
        recentFeedback.forEach(fb => {
            const evaluation = recentEvaluations.find(e => e.candidate_id === fb.candidate_id);
            if (!evaluation) return;

            totalPredictions++;

            const aiPredicted = evaluation.final_score > 75 ? 'hire' : 'reject';
            const actualDecision = fb.hiring_decision;

            if (aiPredicted === actualDecision) {
                correctPredictions++;
            } else if (aiPredicted === 'hire' && actualDecision === 'reject') {
                falsePositives++;
            } else if (aiPredicted === 'reject' && actualDecision === 'hire') {
                falseNegatives++;
            }
        });
    }

    const predictionAccuracy = totalPredictions > 0
        ? (correctPredictions / totalPredictions) * 100
        : modelAccuracy;

    const falsePositiveRate = totalPredictions > 0
        ? (falsePositives / totalPredictions) * 100
        : 0;

    const falseNegativeRate = totalPredictions > 0
        ? (falseNegatives / totalPredictions) * 100
        : 0;

    return {
        accuracy: modelAccuracy,
        predictionAccuracy: Math.round(predictionAccuracy * 100) / 100,
        falsePositiveRate: Math.round(falsePositiveRate * 100) / 100,
        falseNegativeRate: Math.round(falseNegativeRate * 100) / 100
    };
}

/**
 * Collect cost metrics
 */
async function collectCostMetrics(supabase) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();

    // Count evaluations (each uses AI calls)
    const { data: evaluations } = await supabase
        .from('candidate_evaluations')
        .select('id')
        .gte('created_at', startOfDay);

    // Count video analyses
    const { data: videoAnalysis } = await supabase
        .from('video_analysis_results')
        .select('id')
        .gte('created_at', startOfDay);

    const evaluationCount = evaluations?.length || 0;
    const videoCount = videoAnalysis?.length || 0;

    // Estimate API calls (3 per evaluation: screening, technical, behavioral)
    // Plus video processing calls
    const geminiCalls = evaluationCount * 2 + videoCount * 2; // Gemini for screening, technical, video
    const gpt4Calls = evaluationCount * 1; // GPT-4 for behavioral
    const totalCalls = geminiCalls + gpt4Calls;

    // Estimate costs (approximate)
    // Gemini: $0.001 per call, GPT-4: $0.03 per call
    const estimatedCost = (geminiCalls * 0.001) + (gpt4Calls * 0.03);

    return {
        totalCalls,
        geminiCalls,
        gpt4Calls,
        estimatedCost: Math.round(estimatedCost * 100) / 100
    };
}

/**
 * Collect feedback metrics
 */
async function collectFeedbackMetrics(supabase) {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();

    // Get interviews conducted
    const { data: interviews } = await supabase
        .from('interviews')
        .select('id')
        .gte('date', startOfDay);

    // Get feedback submitted
    const { data: feedback } = await supabase
        .from('employer_feedback')
        .select('overall_rating')
        .gte('submitted_at', startOfDay);

    const interviewCount = interviews?.length || 0;
    const feedbackCount = feedback?.length || 0;

    const submissionRate = interviewCount > 0
        ? (feedbackCount / interviewCount) * 100
        : 0;

    const avgRating = feedback && feedback.length > 0
        ? feedback.reduce((sum, fb) => sum + (fb.overall_rating || 0), 0) / feedback.length
        : 0;

    return {
        submissionRate: Math.round(submissionRate * 100) / 100,
        avgRating: Math.round(avgRating * 100) / 100
    };
}

/**
 * Get performance metrics for a date range
 */
export async function getPerformanceMetrics(startDate, endDate, supabase) {
    const { data, error } = await supabase
        .from('system_performance_metrics')
        .select('*')
        .gte('metric_date', startDate)
        .lte('metric_date', endDate)
        .order('metric_date', { ascending: true });

    if (error) {
        console.error('[Performance Tracking Agent] Error fetching metrics:', error);
        throw error;
    }

    return data || [];
}

/**
 * Get performance summary
 */
export async function getPerformanceSummary(supabase) {
    // Get last 30 days of metrics
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const metrics = await getPerformanceMetrics(startDate, endDate, supabase);

    if (metrics.length === 0) {
        return null;
    }

    // Calculate averages and trends
    const summary = {
        period: {
            start: startDate,
            end: endDate,
            days: metrics.length
        },
        hiring: {
            avgSuccessRate: calculateAverage(metrics, 'hiring_success_rate'),
            avgInterviewToSelection: calculateAverage(metrics, 'interview_to_selection_ratio'),
            totalApplications: sumMetrics(metrics, 'total_applications'),
            totalHires: sumMetrics(metrics, 'total_hires'),
            trend: calculateTrend(metrics, 'hiring_success_rate')
        },
        performance: {
            avgScreeningTime: calculateAverage(metrics, 'avg_screening_time'),
            avgTechnicalTime: calculateAverage(metrics, 'avg_technical_analysis_time'),
            avgBehavioralTime: calculateAverage(metrics, 'avg_behavioral_analysis_time'),
            avgVideoTime: calculateAverage(metrics, 'avg_video_processing_time')
        },
        accuracy: {
            currentAccuracy: metrics[metrics.length - 1].model_accuracy,
            avgPredictionAccuracy: calculateAverage(metrics, 'prediction_accuracy'),
            improvement: calculateImprovement(metrics, 'model_accuracy'),
            falsePositiveRate: calculateAverage(metrics, 'false_positive_rate'),
            falseNegativeRate: calculateAverage(metrics, 'false_negative_rate')
        },
        costs: {
            totalApiCalls: sumMetrics(metrics, 'total_api_calls'),
            totalCost: sumMetrics(metrics, 'estimated_cost'),
            avgDailyCost: calculateAverage(metrics, 'estimated_cost')
        },
        feedback: {
            avgSubmissionRate: calculateAverage(metrics, 'feedback_submission_rate'),
            avgRating: calculateAverage(metrics, 'avg_feedback_rating')
        }
    };

    return summary;
}

/**
 * Helper: Calculate average of a metric
 */
function calculateAverage(metrics, field) {
    const values = metrics.map(m => m[field] || 0);
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 100) / 100;
}

/**
 * Helper: Sum a metric
 */
function sumMetrics(metrics, field) {
    return metrics.reduce((sum, m) => sum + (m[field] || 0), 0);
}

/**
 * Helper: Calculate trend (positive/negative/stable)
 */
function calculateTrend(metrics, field) {
    if (metrics.length < 2) return 'stable';

    const firstHalf = metrics.slice(0, Math.floor(metrics.length / 2));
    const secondHalf = metrics.slice(Math.floor(metrics.length / 2));

    const firstAvg = calculateAverage(firstHalf, field);
    const secondAvg = calculateAverage(secondHalf, field);

    const diff = secondAvg - firstAvg;

    if (diff > 2) return 'improving';
    if (diff < -2) return 'declining';
    return 'stable';
}

/**
 * Helper: Calculate improvement
 */
function calculateImprovement(metrics, field) {
    if (metrics.length < 2) return 0;

    const first = metrics[0][field] || 0;
    const last = metrics[metrics.length - 1][field] || 0;

    return Math.round((last - first) * 100) / 100;
}

/**
 * Generate performance report
 */
export async function generatePerformanceReport(supabase) {
    console.log('[Performance Tracking Agent] Generating performance report...');

    const summary = await getPerformanceSummary(supabase);

    if (!summary) {
        return {
            status: 'no_data',
            message: 'Insufficient data to generate report'
        };
    }

    const report = {
        generatedAt: new Date().toISOString(),
        period: summary.period,

        highlights: [
            {
                metric: 'Hiring Success Rate',
                value: `${summary.hiring.avgSuccessRate}%`,
                trend: summary.hiring.trend,
                description: `Average success rate over ${summary.period.days} days`
            },
            {
                metric: 'Model Accuracy',
                value: `${summary.accuracy.currentAccuracy}%`,
                improvement: `+${summary.accuracy.improvement}%`,
                description: 'Current model accuracy with improvement'
            },
            {
                metric: 'Total Cost',
                value: `$${summary.costs.totalCost.toFixed(2)}`,
                avgDaily: `$${summary.costs.avgDailyCost.toFixed(2)}/day`,
                description: 'API usage costs'
            },
            {
                metric: 'Feedback Rate',
                value: `${summary.feedback.avgSubmissionRate}%`,
                avgRating: `${summary.feedback.avgRating}/5`,
                description: 'Employer feedback submission and satisfaction'
            }
        ],

        detailedMetrics: summary
    };

    return report;
}
