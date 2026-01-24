import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Plus, Edit, Trash2, Eye, CheckCircle, XCircle,
    Search, Filter, Clock, Users, Star, Layers, Video, FileText,
    Award, TrendingUp, X, Save, Upload, Image, Loader
} from 'lucide-react';
import AdminButton3D from '../../components/AdminButton3D';
import { endpoints } from '../../lib/api';
import { supabase } from '../../lib/supabase';

// Types
interface Course {
    id: string;
    title: string;
    description: string;
    category: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    lessons: number;
    enrollments: number;
    rating: number;
    status: 'Published' | 'Draft' | 'Archived';
    thumbnail: string;
    instructor: string;
    createdAt: string;
    price: number;
    isFree: boolean;
}

interface Lesson {
    id: string;
    courseId: string;
    title: string;
    type: 'Video' | 'Article' | 'Quiz' | 'Assignment';
    duration: string;
    order: number;
    isPublished: boolean;
}

const UpskillCourseManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'courses' | 'lessons' | 'categories'>('courses');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showLessons, setShowLessons] = useState(false);
    const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course | null>(null);
    const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);

    // Fetch Courses from API
    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase!.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(endpoints.admin.upskill.courses, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCourses(data.courses);
                }
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchLessons = async (courseId: string) => {
        setIsLoading(true);
        try {
            const { data: { session } } = await supabase!.auth.getSession();
            const token = session?.access_token;

            // Using placeholders as actual lesson endpoint might be nested
            const response = await fetch(`${endpoints.admin.upskill.courses}/${courseId}/lessons`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCourseLessons(data.lessons);
                }
            } else {
                // Fallback demo data
                setCourseLessons([
                    { id: 'L1', courseId, title: 'Introduction', type: 'Video', duration: '5:00', order: 1, isPublished: true },
                    { id: 'L2', courseId, title: 'Basics', type: 'Video', duration: '10:00', order: 2, isPublished: true },
                ]);
            }
        } catch (error) {
            console.error('Error fetching lessons:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const categories = ['Web Development', 'AI/ML', 'Computer Science', 'Data Science', 'Mobile Development', 'Cloud Computing', 'Cybersecurity', 'Design'];

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteCourse = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;

        try {
            const { data: { session } } = await supabase!.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`${endpoints.admin.upskill.courses}/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (response.ok) {
                setCourses(courses.filter(c => c.id !== id));
            } else {
                console.error('Failed to delete course:', response.statusText);
                alert('Failed to delete course');
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Failed to delete course');
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {

            const course = courses.find(c => c.id === id);
            if (!course) return;

            const newStatus = course.status === 'Published' ? 'Draft' : 'Published';

            const { data: { session } } = await supabase!.auth.getSession();
            const token = session?.access_token;

            const response = await fetch(`${endpoints.admin.upskill.courses}/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                setCourses(courses.map(c =>
                    c.id === id ? { ...c, status: newStatus } : c
                ));
            } else {
                console.error('Failed to update status:', response.statusText);
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const StatusBadge = ({ status }: { status: Course['status'] }) => {
        const colors = {
            Published: 'bg-green-500/20 text-green-400 border-green-500/30',
            Draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            Archived: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs border ${colors[status]}`}>
                {status}
            </span>
        );
    };

    const LevelBadge = ({ level }: { level: Course['level'] }) => {
        const colors = {
            Beginner: 'bg-blue-500/20 text-blue-400',
            Intermediate: 'bg-purple-500/20 text-purple-400',
            Advanced: 'bg-red-500/20 text-red-400'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs ${colors[level]}`}>
                {level}
            </span>
        );
    };

    // Course Editor Modal
    const CourseEditor = ({ course, onClose }: { course: Course | null, onClose: () => void }) => {
        const [formData, setFormData] = useState<Partial<Course>>(course || {
            title: '',
            description: '',
            category: 'Web Development',
            level: 'Beginner',
            duration: '',
            instructor: '',
            price: 0,
            isFree: false,
            status: 'Draft'
        });

        const handleSave = async () => {
            try {
                const { data: { session } } = await supabase!.auth.getSession();
                const token = session?.access_token;

                const payload = { ...formData, lessons: course ? course.lessons : 0 }; // Preserve or init lessons

                const response = await fetch(endpoints.admin.upskill.courses, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        ...payload,
                        id: course?.id // Send ID if editing
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.course) {
                        if (course) {
                            setCourses(courses.map(c => c.id === course.id ? data.course : c));
                        } else {
                            setCourses([...courses, data.course]);
                        }
                        onClose();
                    } else {
                        alert('Failed to save course: ' + (data.error || 'Unknown error'));
                    }
                } else {
                    const error = await response.json();
                    alert('Error saving course: ' + (error.error || 'Server error'));
                }
            } catch (error) {
                console.error('Error saving course:', error);
                alert('Network error while saving course');
            }
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#0f111a] z-10">
                        <h2 className="text-2xl font-bold text-white">
                            {course ? 'Edit Course' : 'Create New Course'}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-sm text-gray-400 block mb-2">Course Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                                    placeholder="Enter course title"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="text-sm text-gray-400 block mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none h-24 resize-none"
                                    placeholder="Course description..."
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Level</label>
                                <select
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value as Course['level'] })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Duration</label>
                                <input
                                    type="text"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                                    placeholder="e.g., 40 hours"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Instructor</label>
                                <input
                                    type="text"
                                    value={formData.instructor}
                                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                                    placeholder="Instructor name"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Price (₹)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                                    placeholder="0 for free"
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                                <input
                                    type="checkbox"
                                    checked={formData.isFree}
                                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked, price: e.target.checked ? 0 : formData.price })}
                                    className="w-5 h-5 accent-neon-cyan"
                                />
                                <span className="text-gray-300">Free Course</span>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Thumbnail</label>
                                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-neon-cyan/50 transition-colors cursor-pointer">
                                    <Upload className="mx-auto text-gray-500 mb-2" size={32} />
                                    <p className="text-sm text-gray-500">Click to upload thumbnail</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 block mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Course['status'] })}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan focus:outline-none"
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Published">Published</option>
                                    <option value="Archived">Archived</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 flex justify-end gap-4 sticky bottom-0 bg-[#0f111a]">
                        <button onClick={onClose} className="px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                            Cancel
                        </button>
                        <AdminButton3D
                            onClick={handleSave}
                            variant="success"
                            size="md"
                            icon={<Save size={18} />}
                        >
                            {course ? 'Save Changes' : 'Create Course'}
                        </AdminButton3D>
                    </div>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-neon-cyan to-electric-indigo-500 bg-clip-text text-transparent">
                        Upskill Course Management
                    </h1>
                    <p className="text-gray-400">Create, manage, and organize learning courses and content</p>
                </div>
                <AdminButton3D
                    onClick={() => { setSelectedCourse(null); setIsEditing(true); }}
                    variant="primary"
                    size="md"
                    icon={<Plus size={18} />}
                >
                    Create New Course
                </AdminButton3D>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Courses', value: courses.length, icon: BookOpen, color: 'text-neon-cyan' },
                    { label: 'Published', value: courses.filter(c => c.status === 'Published').length, icon: CheckCircle, color: 'text-green-400' },
                    { label: 'Total Enrollments', value: courses.reduce((acc, c) => acc + c.enrollments, 0), icon: Users, color: 'text-purple-400' },
                    { label: 'Avg. Rating', value: (courses.reduce((acc, c) => acc + c.rating, 0) / courses.length).toFixed(1), icon: Star, color: 'text-yellow-400' }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-xl glass border border-white/10"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <stat.icon className={stat.color} size={24} />
                            <span className="text-3xl font-bold text-white">{stat.value}</span>
                        </div>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-white/20 transition-colors"
                />
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl glass border border-white/10 overflow-hidden hover:border-neon-cyan/30 transition-all group"
                    >
                        {/* Thumbnail */}
                        <div className="h-40 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <BookOpen className="text-white/30" size={48} />
                            </div>
                            <div className="absolute top-3 right-3">
                                <StatusBadge status={course.status} />
                            </div>
                            <div className="absolute top-3 left-3">
                                <LevelBadge level={course.level} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            <h3 className="font-bold text-lg text-white line-clamp-1">{course.title}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2">{course.description}</p>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Layers size={14} /> {course.lessons} lessons
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={14} /> {course.duration}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <Users size={14} className="text-gray-500" />
                                    <span className="text-sm text-gray-400">{course.enrollments} enrolled</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                    <span className="text-sm text-white font-medium">{course.rating}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className={course.isFree ? 'text-green-400 font-bold' : 'text-white font-bold'}>
                                    {course.isFree ? 'FREE' : `₹${course.price}`}
                                </span>
                                <span className="text-gray-500">{course.instructor}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={() => { setSelectedCourse(course); setIsEditing(true); }}
                                    className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => { setSelectedCourseForLessons(course); setShowLessons(true); fetchLessons(course.id); }}
                                    className="flex-1 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                                >
                                    <Layers size={14} /> Lessons
                                </button>
                                <button
                                    onClick={() => handleToggleStatus(course.id)}
                                    className={`p-2 rounded-lg transition-colors ${course.status === 'Published' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}
                                    title={course.status === 'Published' ? 'Unpublish' : 'Publish'}
                                >
                                    {course.status === 'Published' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                </button>
                                <button
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {showLessons && selectedCourseForLessons && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Manage Lessons</h2>
                                <p className="text-sm text-gray-400">{selectedCourseForLessons.title}</p>
                            </div>
                            <button onClick={() => setShowLessons(false)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {courseLessons.map((lesson) => (
                                <div key={lesson.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)] font-bold">
                                            {lesson.order}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{lesson.title}</h4>
                                            <p className="text-xs text-gray-500 flex items-center gap-2">
                                                {lesson.type === 'Video' ? <Video size={12} /> : <FileText size={12} />}
                                                {lesson.duration} • {lesson.type}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400"><Edit size={16} /></button>
                                        <button className="p-2 hover:bg-red-500/10 rounded-lg text-red-400"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}

                            {/* Add Lesson Form */}
                            <div className="p-6 rounded-xl border border-dashed border-white/20 space-y-4">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Plus size={18} className="text-neon-cyan" /> Add New Lesson
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Lesson Title"
                                        className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                    />
                                    <select className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white">
                                        <option>Video</option>
                                        <option>Article</option>
                                        <option>Quiz</option>
                                    </select>
                                    <div className="col-span-2">
                                        <label className="block text-xs text-gray-400 mb-2">Video Content (YouTube)</label>
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                placeholder="YouTube URL or Upload Video"
                                                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white"
                                            />
                                            <label className={`px-4 py-2 rounded-lg ${isUploadingVideo ? 'bg-gray-600' : 'bg-red-600 hover:bg-red-700'} text-white text-sm font-bold flex items-center gap-2 cursor-pointer transition-all`}>
                                                {isUploadingVideo ? <Loader className="animate-spin" size={16} /> : <Upload size={16} />}
                                                {isUploadingVideo ? 'Uploading...' : 'Upload to YT'}
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="video/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setIsUploadingVideo(true);
                                                        try {
                                                            const formData = new FormData();
                                                            formData.append('video', file);
                                                            formData.append('courseId', selectedCourseForLessons.id);
                                                            formData.append('lessonTitle', 'New Lesson');

                                                            const { data: { session } } = await supabase!.auth.getSession();
                                                            const response = await fetch(`${endpoints.test.replace('/test', '')}/admin/upskill/lessons/upload-video`, {
                                                                method: 'POST',
                                                                headers: {
                                                                    ...(session ? { 'Authorization': `Bearer ${session.access_token}` } : {})
                                                                },
                                                                body: formData
                                                            });

                                                            if (response.ok) {
                                                                const data = await response.json();
                                                                alert(`✅ Upload Successful!\nYouTube URL: ${data.videoUrl}`);
                                                            }
                                                        } catch (err) {
                                                            console.error('Upload failed:', err);
                                                        } finally {
                                                            setIsUploadingVideo(false);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full py-2 bg-[var(--primary)] text-white font-bold rounded-lg shadow-lg">
                                    Add Lesson
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default UpskillCourseManagement;
