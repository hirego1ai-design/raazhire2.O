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

    const categories = [
        { name: 'All', icon: TrendingUp },
        { name: 'Data & Analytics', icon: Database },
        { name: 'AI & ML', icon: Brain },
        { name: 'Coding', icon: Code },
        { name: 'Business', icon: Briefcase },
        { name: 'Communication', icon: MessageSquare },
        { name: 'Design', icon: Lightbulb }
    ];

    const courses = [
        {
            id: '1',
            title: 'Data Science Fundamentals with Python',
            instructor: 'Dr. Sarah Chen',
            category: 'Data & Analytics',
            duration: '12 weeks',
            students: '45K',
            rating: 4.8,
            level: 'Beginner',
            thumbnail: ''
        },
        {
            id: '2',
            title: 'Machine Learning A-Z: Build AI Models',
            instructor: 'Prof. James Wilson',
            category: 'AI & ML',
            duration: '16 weeks',
            students: '78K',
            rating: 4.9,
            level: 'Intermediate',
            thumbnail: ''
        },
        {
            id: '3',
            title: 'Full-Stack Web Development Bootcamp',
            instructor: 'Alex Martinez',
            category: 'Coding',
            duration: '20 weeks',
            students: '92K',
            rating: 4.7,
            level: 'Beginner',
            thumbnail: ''
        },
        {
            id: '4',
            title: 'Business Analytics & Data Visualization',
            instructor: 'Emily Thompson',
            category: 'Business',
            duration: '10 weeks',
            students: '34K',
            rating: 4.6,
            level: 'Intermediate',
            thumbnail: ''
        },
        {
            id: '5',
            title: 'Effective Communication for Leaders',
            instructor: 'Michael Roberts',
            category: 'Communication',
            duration: '8 weeks',
            students: '56K',
            rating: 4.8,
            level: 'All Levels',
            thumbnail: ''
        },
        {
            id: '6',
            title: 'UI/UX Design Masterclass',
            instructor: 'Lisa Anderson',
            category: 'Design',
            duration: '14 weeks',
            students: '67K',
            rating: 4.9,
            level: 'Intermediate',
            thumbnail: ''
        },
        {
            id: '7',
            title: 'Advanced SQL & Database Design',
            instructor: 'David Kumar',
            category: 'Data & Analytics',
            duration: '10 weeks',
            students: '41K',
            rating: 4.7,
            level: 'Advanced',
            thumbnail: ''
        },
        {
            id: '8',
            title: 'Natural Language Processing with Python',
            instructor: 'Dr. Priya Sharma',
            category: 'AI & ML',
            duration: '12 weeks',
            students: '29K',
            rating: 4.8,
            level: 'Advanced',
            thumbnail: ''
        }
    ];

    const filteredCourses = courses.filter(course => {
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

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
                            Choose from 100+ expert-led courses designed to accelerate your career
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

            {/* Course Grid */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {filteredCourses.length} Courses
                            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCourses.map((course, index) => (
                            <CourseCard key={course.id} {...course} delay={index * 0.1} />
                        ))}
                    </div>

                    {filteredCourses.length === 0 && (
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
