
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    Video,
    Brain,
    TrendingUp,
    Award,
    Calendar,
    Clock,
    PlayCircle,
    CheckCircle2,
    Zap,
    Trophy,
    Flame,
    Target,
    MoreHorizontal,
    Search,
    Filter,
    ArrowRight,
    Sparkles,
    Youtube
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    progress?: number;
    instructor: string;
    duration_hours: number;
    category: string;
}

interface LiveClass {
    id: string;
    title: string;
    description: string;
    scheduledStartTime: string;
    thumbnailUrl: string;
    instructor: string;
    channelTitle?: string;
}

interface Recommendation {
    id: string;
    title: string;
    description: string;
    reason: string;
    confidence: number;
    thumbnail: string;
    type: 'course' | 'video' | 'article';
}

// ============================================
// SUB-COMPONENTS
// ============================================

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active
            ? 'bg-electric-indigo-50 text-electric-indigo-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-electric-indigo-600' : 'text-gray-500'}`} />
        {label}
        {active && <motion.div layoutId="activeSidebar" className="ml-auto w-1.5 h-1.5 rounded-full bg-electric-indigo-600" />}
    </button>
);

const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
        </div>
    </div>
);

const CourseCard = ({ course, onResume }: { course: Course; onResume: () => void }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 rounded-xl shadow-soft border border-gray-100 flex gap-4 hover:shadow-premium transition-all group"
    >
        <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <PlayCircle className="w-8 h-8 text-white" />
            </div>
        </div>
        <div className="flex-1 flex flex-col justify-between">
            <div>
                <span className="text-xs font-semibold text-electric-indigo-600 bg-electric-indigo-50 px-2 py-1 rounded-md mb-2 inline-block">
                    {course.category}
                </span>
                <h3 className="font-bold text-gray-900 leading-tight group-hover:text-electric-indigo-600 transition-colors">
                    {course.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{course.instructor}</p>
            </div>
            <div className="mt-3">
                <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                    <span>{course.progress}% Complete</span>
                    <span>{Math.round(course.duration_hours * (1 - (course.progress || 0) / 100))}h remaining</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-electric-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${course.progress}%` }}
                    />
                </div>
            </div>
        </div>
    </motion.div>
);

const LiveClassCard = ({ session }: { session: LiveClass }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl overflow-hidden shadow-soft border border-gray-100 group cursor-pointer"
    >
        <div className="relative h-48">
            <img src={session.thumbnailUrl} alt={session.title} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center gap-1 animate-pulse">
                    <Video className="w-3 h-3" /> LIVE
                </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">{session.title}</h3>
                <p className="text-gray-300 text-sm mt-1">{session.channelTitle || session.instructor}</p>
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Youtube className="w-12 h-12 text-red-600 drop-shadow-lg" />
            </div>
        </div>
        <div className="p-4">
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{session.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(session.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button className="text-electric-indigo-600 font-semibold hover:underline">Join Now</button>
            </div>
        </div>
    </motion.div>
);

const AIRecommendationCard = ({ rec }: { rec: Recommendation }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-br from-indigo-900 to-violet-900 text-white p-6 rounded-2xl relative overflow-hidden shadow-premium"
    >
        <div className="absolute top-0 right-0 p-3 opacity-10">
            <Sparkles className="w-24 h-24" />
        </div>

        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3 text-indigo-200 text-sm font-medium">
                <Brain className="w-4 h-4" />
                AI Recommended
                <span className="bg-white/20 px-2 py-0.5 rounded text-xs text-white ml-auto">
                    {rec.confidence}% Match
                </span>
            </div>

            <h3 className="text-xl font-bold mb-2">{rec.title}</h3>
            <p className="text-indigo-200 text-sm mb-4 line-clamp-2">{rec.description}</p>

            <div className="bg-white/10 rounded-lg p-3 mb-4 backdrop-blur-sm border border-white/10">
                <p className="text-xs text-indigo-100 italic">"{rec.reason}"</p>
            </div>

            <button className="w-full py-2 bg-white text-indigo-900 rounded-lg font-bold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2">
                Start Learning <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    </motion.div>
);

// ============================================
// MAIN COMPONENT
// ============================================

const UpskillDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);

    // State for data
    const [myCourses, setMyCourses] = useState<Course[]>([]);
    const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        streak: 5,
        xp: 1250,
        courses_completed: 2,
        rank_percentile: 85
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Mock User ID
                const userId = 'user-1';

                // 1. Fetch My Courses (Enrollments)
                const enrollRes = await fetch(`http://localhost:3000/api/upskill/enrollments/${userId}`);
                const enrollData = await enrollRes.json();
                if (enrollData.success) {
                    setMyCourses(enrollData.enrollments.map((e: any) => ({
                        id: e.course.id,
                        title: e.course.title,
                        description: e.course.description,
                        thumbnail: e.course.thumbnail,
                        progress: e.progress_percent,
                        instructor: e.course.instructor,
                        duration_hours: e.course.duration_hours,
                        category: e.course.category
                    })));
                }

                // 2. Fetch Live Classes (YouTube)
                const liveRes = await fetch('http://localhost:3000/api/upskill/live-classes');
                const liveData = await liveRes.json();
                if (liveData.success) {
                    setLiveClasses(liveData.classes);
                }

                // 3. Fetch Recommendations (DeepSeek)
                const recRes = await fetch(`http://localhost:3000/api/upskill/recommendations/${userId}`);
                const recData = await recRes.json();

                // If the deepseek route fails or returns empty, fallback/mock is handled in backend usually
                // But let's check structure
                if (recData.success && recData.data) {
                    // Normalize data
                    setRecommendations(recData.data.courses || recData.data || []);
                } else if (recData.success && recData.recommendations) {
                    // Fallback structure
                    setRecommendations(recData.recommendations);
                }

            } catch (error) {
                console.error("Dashboard data fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Tab Content Renderers
    const renderOverview = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            {/* Stats Components */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={Flame} label="Day Streak" value={stats.streak} color="bg-orange-500" />
                <StatCard icon={Zap} label="Total XP" value={`${stats.xp}`} color="bg-yellow-500" />
                <StatCard icon={CheckCircle2} label="Completed" value={stats.courses_completed} color="bg-green-500" />
                <StatCard icon={Trophy} label="Top Rank" value={`Top ${100 - stats.rank_percentile}%`} color="bg-indigo-500" />
            </div>

            {/* AI Recommendations Highlight */}
            {Array.isArray(recommendations) && recommendations.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-electric-indigo-600" />
                            AI Recommended for You
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {Array.isArray(recommendations) && recommendations.slice(0, 3).map((rec: any, i: number) => (
                            <AIRecommendationCard
                                key={i}
                                rec={{
                                    id: rec.id || `rec-${i}`,
                                    title: rec.title,
                                    description: rec.description,
                                    reason: rec.reason || rec.recommendation_reason || "Aligned with your goals",
                                    confidence: rec.confidence || rec.relevance_score || 90,
                                    thumbnail: rec.thumbnail || '',
                                    type: 'course'
                                }}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Continue Learning */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    Continue Learning
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {myCourses.slice(0, 4).map(course => (
                        <CourseCard key={course.id} course={course} onResume={() => navigate(`/upskill/course/${course.id}`)} />
                    ))}
                    {myCourses.length === 0 && (
                        <div className="col-span-2 p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
                            <button onClick={() => navigate('/upskill/courses')} className="text-electric-indigo-600 font-bold hover:underline">
                                Browse Courses
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </motion.div>
    );

    const renderLiveClasses = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Live Classes</h2>
                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
                    YouTube Live Integration
                </span>
            </div>

            {liveClasses.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                    {liveClasses.map(session => (
                        <LiveClassCard key={session.id} session={session} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">No live classes scheduled</h3>
                    <p className="text-gray-500">Check back later for upcoming streams.</p>
                </div>
            )}
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-soft-white font-outfit pt-20">
            <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col lg:flex-row gap-8">

                {/* SIDEBAR NAVIGATION */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-24">
                        <div className="flex items-center gap-3 mb-8 px-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-electric-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                JD
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">John Doe</h3>
                                <p className="text-xs text-gray-500">Pro Member</p>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <SidebarItem
                                icon={LayoutDashboard}
                                label="Overview"
                                active={activeTab === 'overview'}
                                onClick={() => setActiveTab('overview')}
                            />
                            <SidebarItem
                                icon={BookOpen}
                                label="My Learning"
                                active={activeTab === 'learning'}
                                onClick={() => setActiveTab('learning')}
                            />
                            <SidebarItem
                                icon={Video}
                                label="Live Classes"
                                active={activeTab === 'live'}
                                onClick={() => setActiveTab('live')}
                            />
                            <SidebarItem
                                icon={Brain}
                                label="AI Insights"
                                active={activeTab === 'insights'}
                                onClick={() => setActiveTab('insights')}
                            />
                            <div className="my-4 border-t border-gray-100" />
                            <SidebarItem
                                icon={Target}
                                label="Skill Assessment"
                                active={false}
                                onClick={() => navigate('/upskill/assessment')}
                            />
                        </nav>
                    </div>
                </aside>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 min-w-0">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-indigo-600"></div>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'overview' && renderOverview()}
                                {activeTab === 'learning' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                        <h2 className="text-2xl font-bold text-gray-900">My Learning Path</h2>
                                        <div className="grid gap-4">
                                            {myCourses.map(course => (
                                                <CourseCard key={course.id} course={course} onResume={() => navigate(`/upskill/course/${course.id}`)} />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                                {activeTab === 'live' && renderLiveClasses()}
                                {activeTab === 'insights' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                        <h2 className="text-2xl font-bold text-gray-900">AI Skill Insights</h2>
                                        <p className="text-gray-600">Detailed analysis of your progress and AI recommendations.</p>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {Array.isArray(recommendations) && recommendations.map((rec: any, i: number) => (
                                                <AIRecommendationCard
                                                    key={i}
                                                    rec={{
                                                        id: rec.id || `rec-${i}`,
                                                        title: rec.title,
                                                        description: rec.description,
                                                        reason: rec.reason || rec.recommendation_reason || "Aligned with your goals",
                                                        confidence: rec.confidence || rec.relevance_score || 90,
                                                        thumbnail: rec.thumbnail || '',
                                                        type: 'course'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default UpskillDashboard;
