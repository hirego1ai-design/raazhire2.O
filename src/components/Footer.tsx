import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="py-12 bg-white border-t border-slate-200 text-slate-500 font-outfit">
            <div className="container mx-auto max-w-6xl px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-2">
                        {/* Logo Placeholder or Text if image missing */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
                            <span className="text-xl font-bold text-slate-900">HireGo AI</span>
                        </div>

                        <p className="max-w-sm mb-8 leading-relaxed text-slate-600 font-medium">
                            The global standard for autonomous AI recruitment. Building the future of work with intelligence.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-slate-900 font-bold mb-6">Platform</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link to="/features" className="hover:text-blue-600 transition-colors">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
                            <li><Link to="/enterprise" className="hover:text-blue-600 transition-colors">Enterprise</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-slate-900 font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link to="/about" className="hover:text-blue-600 transition-colors">About</Link></li>
                            <li><Link to="/careers" className="hover:text-blue-600 transition-colors">Careers</Link></li>
                            <li><Link to="/blog" className="hover:text-blue-600 transition-colors">Blog</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <p>© 2026 HireGo AI. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
                        <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
                        <a href="/sitemap.xml" className="hover:text-blue-600 transition-colors">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
