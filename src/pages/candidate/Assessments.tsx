import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, AlertCircle, Play, Timer, CheckCircle, Calendar } from 'lucide-react';
import ProctoringWrapper from '../../components/ProctoringWrapper';

const Assessments: React.FC = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [activeAssessmentId, setActiveAssessmentId] = useState<number | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);

    const assessments = [
        {
            id: 1,
            title: 'Frontend Development Assessment',
            type: 'Technical',
            duration: '45 mins',
            questions: 15,
            status: 'pending',
            dueDate: '2025-11-25',
            difficulty: 'Hard',
        },
        {
            id: 2,
            title: 'React.js Proficiency Test',
            type: 'Technical',
            duration: '30 mins',
            questions: 10,
            status: 'completed',
            score: 92,
            date: '2025-11-18',
            difficulty: 'Medium',
        },
        {
            id: 3,
            title: 'Cognitive Ability Test',
            type: 'Aptitude',
            duration: '20 mins',
            questions: 20,
            status: 'pending',
            dueDate: '2025-11-26',
            difficulty: 'Medium',
        },
        {
            id: 4,
            title: 'Node.js Backend Test',
            type: 'Technical',
            duration: '40 mins',
            questions: 12,
            status: 'completed',
            score: 88,
            date: '2025-11-15',
            difficulty: 'Hard',
        },
        {
            id: 5,
            title: 'Soft Skills Assessment',
            type: 'Behavioral',
            duration: '25 mins',
            questions: 18,
            status: 'pending',
            dueDate: '2025-11-27',
            difficulty: 'Easy',
        },
        {
            id: 6,
            title: 'TypeScript Advanced',
            type: 'Technical',
            duration: '35 mins',
            questions: 14,
            status: 'completed',
            score: 95,
            date: '2025-11-10',
            difficulty: 'Hard',
        },
    ];

    const mockQuestions = [
        {
            id: 1,
            text: "What is the primary difference between React's useMemo and useCallback hooks?",
            options: [
                "useMemo memoizes a value, while useCallback memoizes a function.",
                "useMemo is for side effects, while useCallback is for state updates.",
                "There is no difference, they are interchangeable.",
                "useCallback is only used in class components."
            ]
        },
        {
            id: 2,
            text: "Which of the following is NOT a valid dependency in a useEffect hook?",
            options: [
                "A state variable",
                "A prop",
                "A ref.current value",
                "A context value"
            ]
        },
        {
            id: 3,
            text: "Explain the concept of 'Prop Drilling' and how to avoid it.",
            options: [
                "Passing props down multiple levels; avoid using Context or Redux.",
                "Drilling holes in props; avoid using a drill.",
                "Passing props up to parents; avoid using callbacks.",
                "Passing props sideways; avoid using siblings."
            ]
        }
    ];

    const tabs = [
        { id: 'all', label: 'All Assessments' },
        { id: 'pending', label: 'Pending' },
        { id: 'completed', label: 'Completed' },
    ];

    const filteredAssessments = assessments.filter(a =>
        activeTab === 'all' || a.status === activeTab
    );

    const handleStartTest = (id: number) => {
        if (window.confirm("Starting this assessment will enable proctoring mode. Full screen will be requested, and tab switching will be monitored. Do you want to proceed?")) {
            setActiveAssessmentId(id);
            setCurrentQuestion(0);
        }
    };

    const handleViolation = (message: string) => {
        console.log("Proctoring Violation:", message);
    };

    const handleSubmitTest = () => {
        setActiveAssessmentId(null);
        alert("Assessment submitted successfully!");
    };

    if (activeAssessmentId) {
        return (
            <ProctoringWrapper isActive={true} onViolation={handleViolation}>
                <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Frontend Development Assessment</h2>
                            <p className="text-[var(--text-secondary)] text-sm">Question {currentQuestion + 1} of {mockQuestions.length}</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--glass-border)] text-neon-cyan font-mono">
                            <Timer size={20} />
                            <span>44:30</span>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 rounded-xl glass border border-[var(--glass-border)] min-h-[400px] flex flex-col justify-between">
                        <div className="space-y-6">
                            <h3 className="text-lg md:text-xl font-medium leading-relaxed text-[var(--text-primary)]">
                                {mockQuestions[currentQuestion].text}
                            </h3>

                            <div className="space-y-3">
                                {mockQuestions[currentQuestion].options.map((option, idx) => (
                                    <label key={idx} className="flex items-center gap-4 p-4 rounded-lg border border-[var(--glass-border)] hover:bg-[var(--glass-border)] cursor-pointer transition-colors group">
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-500 group-hover:border-neon-cyan flex items-center justify-center flex-shrink-0">
                                            <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] text-sm md:text-base">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-6 border-t border-[var(--glass-border)] mt-6">
                            <button
                                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                disabled={currentQuestion === 0}
                                className="btn-3d btn-secondary"
                            >
                                Previous
                            </button>

                            {currentQuestion < mockQuestions.length - 1 ? (
                                <button
                                    onClick={() => setCurrentQuestion(currentQuestion + 1)}
                                    className="btn-3d btn-primary"
                                >
                                    Next Question
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmitTest}
                                    className="btn-3d btn-primary"
                                >
                                    Submit Assessment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </ProctoringWrapper>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-8 px-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <h1 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Assessments</h1>
                <p className="text-[var(--text-secondary)]">Complete these assessments to verify your skills and increase your hiring chances.</p>
            </motion.div>

            {/* Tab Navigation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 p-2 rounded-xl glass border border-[var(--glass-border)] overflow-x-auto"
            >
                <div className="flex gap-2 min-w-max">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`btn-3d px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${activeTab === tab.id
                                ? 'btn-primary'
                                : 'btn-ghost'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Assessment Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssessments.map((assessment, index) => (
                    <motion.div
                        key={assessment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-5 rounded-xl glass border border-[var(--glass-border)] hover:border-[var(--glass-border)] hover:shadow-lg transition-all flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-4">
                            <div className={`p-3 rounded-lg flex-shrink-0 ${assessment.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-neon-purple/20 text-neon-purple'
                                }`}>
                                {assessment.status === 'completed' ? <CheckCircle size={24} /> : <FileText size={24} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold mb-1 text-[var(--text-primary)] line-clamp-2">{assessment.title}</h3>
                                <span className="text-xs text-[var(--text-secondary)] bg-[var(--card-bg)] px-2 py-1 rounded">
                                    {assessment.type}
                                </span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 mb-4 flex-1">
                            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                <Clock size={14} />
                                <span>{assessment.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                <AlertCircle size={14} />
                                <span>{assessment.questions} Questions</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs border ${assessment.difficulty === 'Hard' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                                    assessment.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                                        'border-green-500/30 text-green-400 bg-green-500/10'
                                    }`}>
                                    {assessment.difficulty}
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        {assessment.status === 'completed' ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                    <span className="text-sm text-green-400">Score</span>
                                    <span className="text-2xl font-bold text-green-400">{assessment.score}%</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                    <Calendar size={12} />
                                    <span>Completed on {assessment.date}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-2">
                                    <Calendar size={12} />
                                    <span>Due: {assessment.dueDate}</span>
                                </div>
                                <button
                                    onClick={() => handleStartTest(assessment.id)}
                                    className="btn-3d btn-primary w-full flex items-center justify-center gap-1.5"
                                >
                                    <Play size={14} />
                                    Start Test
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {filteredAssessments.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                >
                    <FileText size={48} className="mx-auto mb-4 text-[var(--text-secondary)] opacity-50" />
                    <p className="text-[var(--text-secondary)]">No {activeTab} assessments found.</p>
                </motion.div>
            )}
        </div>
    );
};

export default Assessments;
