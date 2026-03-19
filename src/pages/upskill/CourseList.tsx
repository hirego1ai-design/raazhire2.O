import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Clock,
    Users,
    Star,
    Play,
    Award,
    TrendingUp,
    Brain,
    Code,
    Briefcase,
    MessageSquare,
    Database,
    Lightbulb
} from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';


// ============================================
// PREMIUM COURSE CARD
// ============================================
interface CourseCardProps {
    id: string;
    title: string;
    instructor: string;
    category: string;
    duration: string;
    students: string;
    rating: number;
    level: string;
    thumbnail: string;
    delay: number;
}

const CourseCard: React.FC<CourseCardProps> = ({
    id,
    title,
    instructor,
    category,
    duration,
    students,
    rating,
    level,
    delay
}) => {
    const navigate = useNavigate();

    const categoryColors: { [key: string]: string } = {
        'Data & Analytics': 'from-electric-indigo-500 to-electric-indigo-700',
        'AI & ML': 'from-ai-cyan-500 to-ai-cyan-700',
        'Coding': 'from-soft-emerald-500 to-soft-emerald-700',
        'Business': 'from-electric-indigo-400 to-ai-cyan-500',
        'Communication': 'from-ai-cyan-400 to-soft-emerald-500',
        'Design': 'from-soft-emerald-400 to-electric-indigo-500'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
            whileHover={{ y: -8 }}
            onClick={() => navigate(`/upskill/course/${id}`)}
            className="bg-white rounded-card-xl shadow-premium hover:shadow-premium-lg transition-all duration-500 cursor-pointer overflow-hidden group"
        >
            {/* Thumbnail with Gradient Overlay */}
            <div className="relative h-48 bg-gradient-to-br from-electric-indigo-100 to-ai-cyan-100 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
                <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${categoryColors[category] || categoryColors['Coding']} opacity-0 group-hover:opacity-90 transition-opacity duration-500`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-pill flex items-center justify-center group-hover:bg-white/30 transition-colors"
                    >
                        <Play className="w-8 h-8 text-white" fill="white" />
                    </motion.div>
                </div>
                <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-pill text-xs font-semibold text-gray-700">
                        {category}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-electric-indigo-600 transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">by {instructor}</p>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{students}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span>{level}</span>
                    </div>
                </div>

                {/* Rating & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-gray-900">{rating}</span>
                        <span className="text-sm text-gray-500">/ 5.0</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gradient-indigo text-white rounded-pill text-sm font-semibold shadow-soft hover:shadow-glow-indigo transition-all"
                    >
                        Start Course
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

// ============================================
// MAIN COMPONENT
// ============================================
const CourseList: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [liveClasses, setLiveClasses] = useState<any[]>([]);
    const [loadingAI, setLoadingAI] = useState(true);

    // API State
    const [courses, setCourses] = useState<any[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Fetch Courses from API
    React.useEffect(() => {
        const fetchCourses = async () => {
            setLoadingCourses(true);
            setFetchError(null);
            try {
                // Build query params
                const params = new URLSearchParams();
                if (selectedCategory !== 'All') params.append('category', selectedCategory);
                if (searchQuery) params.append('search', searchQuery);

                const response = await fetch(`${API_BASE_URL}/api/upskill/courses?${params.toString()}`);

                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();

                if (data.success) {
                    setCourses(data.courses);
                } else {
                    setFetchError('Failed to load courses');
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
                setFetchError('Could not connect to server. Ensure backend is running.');
                // Fallback to empty
                setCourses([]);
            } finally {
                setLoadingCourses(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(() => fetchCourses(), 300);
        return () => clearTimeout(timeoutId);
    }, [selectedCategory, searchQuery]);

    // Fetch Initial AI Data
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch AI Recommendations
                const recParams = await fetch(`${API_BASE_URL}/api/upskill/recommendations/1`);
                const recData = await recParams.json();
                if (recData.success && recData.data?.recommendations) {
                    setRecommendations(recData.data.recommendations);
                }

                // Fetch Live Classes
                const liveParams = await fetch(`${API_BASE_URL}/api/upskill/live-classes`);
                const liveData = await liveParams.json();
                if (liveData.success) {
                    setLiveClasses(liveData.classes);
                }
            } catch (error) {
                console.error('Error fetching AI data:', error);
            } finally {
                setLoadingAI(false);
            }
        };

        fetchData();
    }, []);

    const categories = [
        { name: 'All', icon: TrendingUp },
        { name: 'Data & Analytics', icon: Database },
        { name: 'AI & ML', icon: Brain },
        { name: 'Coding', icon: Code },
        { name: 'Business', icon: Briefcase },
        { name: 'Communication', icon: MessageSquare },
        { name: 'Design', icon: Lightbulb }
    ];

    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            {/* Header */}
            <section className="bg-gradient-premium pt-32 pb-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
                            Explore Courses
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Choose from expert-led courses designed to accelerate your career
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="max-w-2xl mx-auto"
                    >
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search courses, instructors, topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-white rounded-pill border-2 border-transparent focus:border-electric-indigo-300 outline-none shadow-soft-lg focus:shadow-premium transition-all text-gray-700 placeholder-gray-400"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Category Filter Pills */}
            <section className="py-8 px-4 bg-white shadow-soft sticky top-20 z-40">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        {categories.map((category, index) => (
                            <motion.button
                                key={category.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedCategory(category.name)}
                                className={`
                                    px-6 py-3 rounded-pill font-semibold text-sm whitespace-nowrap
                                    flex items-center gap-2 transition-all duration-300
                                    ${selectedCategory === category.name
                                        ? 'bg-gradient-indigo text-white shadow-glow-indigo'
                                        : 'bg-cloud-grey text-gray-700 hover:bg-deep-grey'
                                    }
                                `}
                            >
                                <category.icon className="w-4 h-4" />
                                {category.name}
                            </motion.button>
                        ))}
                    </div>
                </div>
            </section>

            {/* AI Recommendations Section */}
            {!loadingAI && recommendations.length > 0 && (
                <section className="py-12 px-4 bg-gradient-to-br from-indigo-50 to-white">
                    <div className="container mx-auto max-w-7xl">
                        <div className="flex items-center gap-2 mb-6">
                            <Brain className="w-6 h-6 text-electric-indigo-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Recommended For You</h2>
                            <span className="px-3 py-1 bg-electric-indigo-100 text-electric-indigo-700 text-xs font-bold rounded-pill">AI POWERED</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recommendations.slice(0, 4).map((rec, index) => {
                                // Fallback mapping if recommendation object is simple
                                return (
                                    <CourseCard
                                        key={rec.courseId || rec.id}
                                        id={rec.courseId || rec.id}
                                        title={rec.courseTitle || rec.title}
                                        instructor={rec.instructor || 'AI Instructor'}
                                        category={rec.category || 'General'}
                                        duration={rec.duration || rec.duration_hours + ' hours'}
                                        students={rec.students || rec.enrolled_count + ' Students'}
                                        rating={rec.rating || 4.5}
                                        level={rec.level || rec.difficulty}
                                        thumbnail={rec.thumbnail || 'https://via.placeholder.com/800'}
                                        delay={index * 0.1}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* Live Classes Section */}
            {!loadingAI && liveClasses.length > 0 && (
                <section className="py-12 px-4">
                    <div className="container mx-auto max-w-7xl">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <h2 className="text-2xl font-bold text-gray-900">Live Now & Upcoming</h2>
                        </div>
                        <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
                            {liveClasses.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="min-w-[320px] bg-white rounded-card-xl shadow-premium overflow-hidden group cursor-pointer"
                                    onClick={() => window.open(item.watchUrl, '_blank')}
                                >
                                    <div className="relative h-44 bg-gray-900">
                                        <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute top-4 left-4">
                                            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-pill flex items-center gap-1">
                                                <Play className="w-3 h-3 fill-current" />
                                                LIVE
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{item.title}</h3>
                                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span>{new Date(item.scheduledStartTime).toLocaleDateString()}</span>
                                            <span className="text-electric-indigo-600 font-semibold">Join Class</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Course Grid */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {courses.length} Courses
                            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                        </h2>
                    </div>

                    {loadingCourses ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-indigo-600"></div>
                        </div>
                    ) : fetchError ? (
                        <div className="text-center py-20 text-red-500">
                            <p>{fetchError}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-electric-indigo-100 text-electric-indigo-700 rounded-pill hover:bg-electric-indigo-200"
                            >
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {courses.map((course, index) => (
                                <CourseCard
                                    key={course.id}
                                    id={course.id}
                                    title={course.title}
                                    instructor={course.instructor || 'HireGo Expert'}
                                    category={course.category}
                                    duration={course.duration_hours ? `${course.duration_hours} hours` : 'Flexible'}
                                    students={course.enrolled_count ? `${(course.enrolled_count / 1000).toFixed(1)}k` : 'New'}
                                    rating={course.rating || 5.0}
                                    level={course.difficulty || 'All Levels'}
                                    thumbnail={course.thumbnail || 'https://via.placeholder.com/800'}
                                    delay={index * 0.05}
                                />
                            ))}
                        </div>
                    )}

                    {!loadingCourses && !fetchError && courses.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-24 h-24 mx-auto bg-cloud-grey rounded-card-xl flex items-center justify-center mb-6">
                                <Search className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
                            <p className="text-gray-600">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default CourseList;
