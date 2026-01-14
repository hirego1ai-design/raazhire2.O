import React from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

interface GeneralPageProps {
    title: string;
    subtitle: string;
}

const GeneralPage: React.FC<GeneralPageProps> = ({ title, subtitle }) => {
    return (
        <div className="min-h-screen bg-gray-50 font-outfit">
            {/* Re-using the main navbar or a simplified one? We'll use the main one if we can, but since it's inside App.tsx which has Navbar outside routes in some cases... 
          Actually App.tsx has <Navbar /> outside <Routes>. So we don't need to include it here if this page is rendered inside the main Routes.
          Wait, looking at App.tsx:
          <div ...>
            <Navbar />
            <Routes> ...
          So Navbar is always there.
      */}

            <div className="pt-24 pb-16 container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <div className="inline-block p-4 rounded-2xl bg-white shadow-xl mb-8 border border-gray-100">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            {title}
                        </h1>
                    </div>

                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        {subtitle}
                    </p>

                    <div className="p-12 bg-white rounded-3xl border border-gray-200 shadow-sm">
                        <div className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Under Construction</h2>
                        <p className="text-gray-500">
                            We are currently building this page to bring you a premium experience.
                            Please check back soon!
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default GeneralPage;
