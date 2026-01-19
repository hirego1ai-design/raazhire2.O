import React from 'react';
import PageHero from '../components/PageHero';
import { motion } from 'framer-motion';
import Button3D from '../components/Button3D';
import { MapPin, ArrowRight } from 'lucide-react';

const CareersPage = () => {
    const [dbContent, setDbContent] = React.useState<string | null>(null);

    React.useEffect(() => {
        fetch('http://localhost:3000/api/pages/careers')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.page && data.page.content) {
                    setDbContent(data.page.content);
                }
            })
            .catch(err => console.error(err));
    }, []);

    if (dbContent) {
        return <div className="min-h-screen bg-soft-white font-outfit pt-20" dangerouslySetInnerHTML={{ __html: dbContent }} />;
    }

    const jobs = [
        { title: "Senior AI Engineer", department: "Engineering", location: "Remote", type: "Full-time" },
        { title: "Product Designer", department: "Design", location: "New York, NY", type: "Full-time" },
        { title: "Customer Success Manager", department: "Sales", location: "London, UK", type: "Full-time" },
        { title: "Marketing Specialist", department: "Marketing", location: "Remote", type: "Contract" },
    ];

    return (
        <div className="min-h-screen bg-soft-white font-outfit">
            <PageHero
                title="Join Our Team"
                subtitle="Help us build the future of autonomous hiring."
                image="/images/full_page_world_map_hero.png"
                height="50vh"
            />

            <section className="py-24 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Open Positions</h2>
                        <p className="text-xl text-gray-600">Come do the best work of your career with us.</p>
                    </div>

                    <div className="grid gap-6">
                        {jobs.map((job, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col md:flex-row items-center justify-between gap-4"
                            >
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                    <div className="flex items-center gap-4 text-gray-500 mt-2 text-sm">
                                        <span className="bg-gray-100 px-3 py-1 rounded-full">{job.department}</span>
                                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                                        <span>{job.type}</span>
                                    </div>
                                </div>
                                <Button3D size="sm" variant="outline" className="min-w-[120px]">
                                    Apply Now
                                </Button3D>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CareersPage;
