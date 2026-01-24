import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Plus, Edit, Trash2, Eye, CheckCircle, XCircle,
    Search, Filter, Clock, Users, Star, Layers, Video, FileText,
    Award, TrendingUp, X, Save, Upload, Image, Loader, Play
} from 'lucide-react';
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
    video_url?: string;
}

const EducatorCourseManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showLessons, setShowLessons] = useState(false);
    const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course | null>(null);
    const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
    const [isUploadingVideo, setIsUploadingVideo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);

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

            const response = await fetch(`${endpoints.admin.upskill.courses}/${courseId}/lessons`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCourseLessons(data.lessons);
                }
            } else {
                setCourseLessons([
                    { id: 'L1', courseId, title: 'Introduction', type: 'Video', duration: '5:00', order: 1, isPublished: true, video_url: 'https://www.youtube.com/watch?v=ubD2S9048b4' },
                    { id: 'L2', courseId, title: 'Basics of AI', type: 'Video', duration: '10:00', order: 2, isPublished: true, video_url: 'https://www.youtube.com/watch?v=PAtX8vW71vU' },
                ]);
            }
        } catch (error) {
            console.error('Error fetching lessons:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const StatusBadge = ({ status }: { status: Course['status'] }) => {
        const colors = {
            Published: 'bg-emerald-100 text-emerald-600 border-emerald-200',
            Draft: 'bg-amber-100 text-amber-600 border-amber-200',
            Archived: 'bg-slate-100 text-slate-400 border-slate-200'
        };
        return (
            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${colors[status]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manage Your Courses</h1>
                    <p className="text-slate-500 mt-1 font-medium">Build, edit, and publish world-class learning content.</p>
                </div>
                <button
                    onClick={() => { setSelectedCourse(null); setIsEditing(true); }}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95 text-sm uppercase tracking-widest"
                >
                    <Plus size={18} /> Create New Course
                </button>
            </div>

            {/* Courses Table/Grid */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-600 transition-all font-medium text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-4">Title & Details</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Metrics</th>
                                <th className="px-8 py-4">Price</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {courses.length > 0 ? courses.map((course) => (
                                <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                                                {course.thumbnail ? <img src={course.thumbnail} className="w-full h-full object-cover" /> : <BookOpen size={24} className="text-slate-300" />}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-base leading-tight">{course.title}</p>
                                                <p className="text-xs text-slate-400 font-bold mt-1.5 uppercase tracking-wider">{course.category} • {course.level}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <StatusBadge status={course.status} />
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-2">
                                            <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                                <Users size={14} className="text-slate-400" /> {course.enrollments} Learners
                                            </p>
                                            <p className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                                <Star size={14} className="text-amber-400 fill-amber-400" /> {course.rating} Avg.
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="font-black text-slate-900">{course.isFree ? 'FREE' : `₹${course.price}`}</p>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => { setSelectedCourseForLessons(course); setShowLessons(true); fetchLessons(course.id); }}
                                                className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm"
                                            >
                                                <Layers size={18} />
                                            </button>
                                            <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100 shadow-sm">
                                                <Edit size={18} />
                                            </button>
                                            <button className="p-3 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-sm">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <BookOpen className="text-slate-300" size={32} />
                                            </div>
                                            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No courses found</p>
                                            <p className="text-slate-400 text-sm mt-2">Start by creating your first course to share your knowledge with the world.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Lesson Management Modal */}
            <AnimatePresence>
                {showLessons && selectedCourseForLessons && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLessons(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-[3rem] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Curriculum Builder</h2>
                                    <p className="text-sm text-slate-500 font-medium">Managing lessons for: <span className="text-indigo-600 font-bold">{selectedCourseForLessons.title}</span></p>
                                </div>
                                <button onClick={() => setShowLessons(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400 border border-transparent hover:border-slate-100 transition-all">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-4">
                                {courseLessons.map((lesson) => (
                                    <div key={lesson.id} className="p-6 rounded-3xl bg-white border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:shadow-indigo-500/5 transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg">
                                                {lesson.order}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 text-lg leading-tight">{lesson.title}</h4>
                                                <div className="flex items-center gap-4 mt-1.5">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                                                        {lesson.type === 'Video' ? <Video size={12} className="text-rose-400" /> : <FileText size={12} className="text-blue-400" />}
                                                        {lesson.type} • {lesson.duration}
                                                    </p>
                                                    {lesson.video_url && (
                                                        <a href={lesson.video_url} target="_blank" className="text-[10px] font-black uppercase text-indigo-600 tracking-widest hover:underline flex items-center gap-1">
                                                            <Play size={10} /> Watch Preview
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-3 hover:bg-slate-50 rounded-xl text-slate-400 border border-transparent hover:border-slate-100 transition-all hover:text-indigo-600"><Edit size={16} /></button>
                                            <button className="p-3 hover:bg-rose-50 rounded-xl text-slate-400 border border-transparent hover:border-slate-100 transition-all hover:text-rose-500"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Lesson UI */}
                                <div className="p-10 rounded-[2.5rem] bg-indigo-50/30 border-2 border-dashed border-indigo-200 mt-10 space-y-8">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                                            <Plus size={16} />
                                        </div>
                                        Add New Lesson Unit
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Unit Title</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Setting up the environment"
                                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Unit Type</label>
                                            <select className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer">
                                                <option>🎥 HD Video Lesson</option>
                                                <option>📄 Reading Article</option>
                                                <option>🧠 Smart Quiz</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Video Source (YouTube)</label>
                                            <div className="flex gap-4">
                                                <input
                                                    type="text"
                                                    placeholder="Paste YouTube Link or Upload Video"
                                                    className="flex-1 bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:border-indigo-600 transition-all"
                                                />
                                                <label className={`px-8 py-4 rounded-2xl ${isUploadingVideo ? 'bg-slate-400' : 'bg-rose-500 hover:bg-rose-600 cursor-pointer'} text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95`}>
                                                    {isUploadingVideo ? <Loader className="animate-spin" size={16} /> : <Upload size={16} />}
                                                    {isUploadingVideo ? 'Wait...' : 'Direct Upload'}
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
                                                                formData.append('courseId', selectedCourseForLessons!.id);
                                                                formData.append('lessonTitle', 'Unit ' + (courseLessons.length + 1));

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
                                                                    alert(`✅ Video Uploaded to Private Storage!\nURL: ${data.videoUrl}`);
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
                                    <button className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest text-sm">
                                        SAVE UNIT TO CURRICULUM
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EducatorCourseManagement;
