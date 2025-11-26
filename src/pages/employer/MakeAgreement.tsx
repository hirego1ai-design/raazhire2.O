import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, X, Eye, Send, Building2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AgreementFormData {
    companyName: string;
    contactPerson: string;
    designation: string;
    address: string;
    email: string;
    phone: string;
    modelType: 'pph' | 'subscription';
    billingCycle: 'monthly' | 'quarterly' | 'yearly';
    pricing: string;
    startDate: string;
    endDate: string;
    signatoryName: string;
    companyLogo?: File;
}

const MakeAgreement: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<AgreementFormData>({
        companyName: '',
        contactPerson: '',
        designation: '',
        address: '',
        email: '',
        phone: '',
        modelType: 'pph',
        billingCycle: 'monthly',
        pricing: '',
        startDate: '',
        endDate: '',
        signatoryName: '',
    });

    const [logoPreview, setLogoPreview] = useState<string>('');
    const [showPreview, setShowPreview] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, companyLogo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!acceptedTerms) {
            alert('Please accept the terms and conditions');
            return;
        }
        console.log('Agreement submitted:', formData);
        // Handle form submission
        alert('Agreement submitted successfully!');
        navigate('/employer/dashboard');
    };

    return (
        <div className="min-h-screen pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl mx-auto"
            >
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                            <FileText className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Create Service Agreement</h1>
                            <p className="text-gray-400">Fill in the details to generate your hiring agreement</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Company Information */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-6 rounded-xl glass border border-white/10"
                            >
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <Building2 className="text-neon-cyan" size={24} />
                                    Company Information
                                </h2>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Company Name *</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-neon-cyan focus:outline-none transition-colors"
                                            placeholder="Enter company name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Contact Person *</label>
                                        <input
                                            type="text"
                                            name="contactPerson"
                                            value={formData.contactPerson}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-neon-cyan focus:outline-none transition-colors"
                                            placeholder="Full name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Designation *</label>
                                        <input
                                            type="text"
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-neon-cyan focus:outline-none transition-colors"
                                            placeholder="e.g., HR Manager"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-neon-cyan focus:outline-none transition-colors"
                                            placeholder="company@example.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-neon-cyan focus:outline-none transition-colors"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Address *</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            required
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-neon-cyan focus:outline-none transition-colors resize-none"
                                            placeholder="Complete business address"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Agreement Details */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-6 rounded-xl glass border border-white/10"
                            >
                                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                    <FileText className="text-neon-purple" size={24} />
                                    Agreement Details
                                </h2>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Model Type *</label>
                                        <select
                                            name="modelType"
                                            value={formData.modelType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-neon-cyan focus:outline-none transition-colors"
                                        >
                                            <option value="pph">Pay-Per-Hire</option>
                                            <option value="subscription">Subscription</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Billing Cycle *</label>
                                        <select
                                            name="billingCycle"
                                            value={formData.billingCycle}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-neon-cyan focus:outline-none transition-colors"
                                        >
                                            <option value="monthly">Monthly</option>
                                            <option value="quarterly">Quarterly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Pricing (₹) *</label>
                                        <input
                                            type="number"
                                            name="pricing"
                                            value={formData.pricing}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-neon-cyan focus:outline-none transition-colors"
                                            placeholder="Enter amount"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Start Date *</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-neon-cyan focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">End Date *</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-neon-cyan focus:outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Signatory Name *</label>
                                        <input
                                            type="text"
                                            name="signatoryName"
                                            value={formData.signatoryName}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-neon-cyan focus:outline-none transition-colors"
                                            placeholder="Authorized person"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Company Logo */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="p-6 rounded-xl glass border border-white/10"
                            >
                                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                    <Upload className="text-yellow-400" size={24} />
                                    Company Logo (Optional)
                                </h2>

                                <div className="flex items-center gap-4">
                                    <label className="cursor-pointer flex-1">
                                        <div className="border-2 border-dashed border-white/20 rounded-lg p-6 hover:border-neon-cyan transition-colors text-center">
                                            {logoPreview ? (
                                                <div className="flex items-center justify-center gap-4">
                                                    <img src={logoPreview} alt="Logo Preview" className="h-16 object-contain" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setLogoPreview('');
                                                            setFormData(prev => ({ ...prev, companyLogo: undefined }));
                                                        }}
                                                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400">
                                                    <Upload size={32} className="mx-auto mb-2" />
                                                    <p className="text-sm">Click to upload company logo</p>
                                                    <p className="text-xs mt-1 text-gray-500">PNG, JPG up to 2MB</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </motion.div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(true)}
                                    className="flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold flex items-center justify-center gap-2"
                                >
                                    <Eye size={20} />
                                    Preview Agreement
                                </button>
                                <button
                                    type="submit"
                                    disabled={!acceptedTerms}
                                    className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-[0_4px_20px_rgba(79,70,229,0.4)] hover:shadow-[0_6px_25px_rgba(79,70,229,0.6)] transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Send size={20} />
                                    Submit Agreement
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Terms & Conditions Sidebar */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="sticky top-8 p-6 rounded-xl glass border border-white/10"
                        >
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <CheckCircle className="text-green-400" size={20} />
                                Terms & Conditions
                            </h3>

                            <div className="space-y-4 text-sm text-gray-400 max-h-[500px] overflow-y-auto custom-scrollbar">
                                <div>
                                    <h4 className="font-bold text-white mb-2">1. Service Agreement</h4>
                                    <p>This agreement is between HireGo AI and the employer for recruitment services.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-white mb-2">2. Payment Terms</h4>
                                    <p>Payment is due based on the selected billing cycle. Late payments may incur additional charges.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-white mb-2">3. Hiring Model</h4>
                                    <p>For Pay-Per-Hire: Payment is only required upon successful candidate hire.</p>
                                    <p>For Subscription: Monthly/Yearly access to the platform and candidate database.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-white mb-2">4. Cancellation Policy</h4>
                                    <p>Either party may terminate this agreement with 30 days written notice.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-white mb-2">5. Confidentiality</h4>
                                    <p>All candidate and company information will be kept confidential and not shared with third parties.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-white mb-2">6. Liability</h4>
                                    <p>HireGo AI provides screening and matching services but final hiring decisions rest with the employer.</p>
                                </div>

                                <div>
                                    <h4 className="font-bold text-white mb-2">7. Refund Policy</h4>
                                    <p>Refunds are subject to our refund policy and may be granted on a case-by-case basis.</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/10">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        className="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 checked:bg-neon-cyan focus:ring-2 focus:ring-neon-cyan"
                                    />
                                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                                        I have read and agree to the terms and conditions outlined above
                                    </span>
                                </label>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                    >
                        <div className="sticky top-0 bg-[#0f111a] border-b border-white/10 p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Agreement Preview</h2>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="text-center mb-8">
                                {logoPreview && <img src={logoPreview} alt="Company Logo" className="h-20 mx-auto mb-4" />}
                                <h1 className="text-3xl font-bold mb-2">SERVICE AGREEMENT</h1>
                                <p className="text-gray-400">HireGo AI - Recruitment Services</p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-4 rounded-lg bg-white/5">
                                    <h3 className="font-bold mb-3 text-neon-cyan">Company Details</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-gray-400">Company:</span> <span className="font-medium">{formData.companyName || 'N/A'}</span></p>
                                        <p><span className="text-gray-400">Contact:</span> <span className="font-medium">{formData.contactPerson || 'N/A'}</span></p>
                                        <p><span className="text-gray-400">Designation:</span> <span className="font-medium">{formData.designation || 'N/A'}</span></p>
                                        <p><span className="text-gray-400">Email:</span> <span className="font-medium">{formData.email || 'N/A'}</span></p>
                                        <p><span className="text-gray-400">Phone:</span> <span className="font-medium">{formData.phone || 'N/A'}</span></p>
                                        <p><span className="text-gray-400">Address:</span> <span className="font-medium">{formData.address || 'N/A'}</span></p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-white/5">
                                    <h3 className="font-bold mb-3 text-neon-purple">Agreement Terms</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-gray-400">Model:</span> <span className="font-medium">{formData.modelType === 'pph' ? 'Pay-Per-Hire' : 'Subscription'}</span></p>
                                        <p><span className="text-gray-400">Billing:</span> <span className="font-medium">{formData.billingCycle.charAt(0).toUpperCase() + formData.billingCycle.slice(1)}</span></p>
                                        <p><span className="text-gray-400">Pricing:</span> <span className="font-medium">₹{formData.pricing || 'N/A'}</span></p>
                                        <p><span className="text-gray-400">Start Date:</span> <span className="font-medium">{formData.startDate || 'N/A'}</span></p>
                                        <p><span className="text-gray-400">End Date:</span> <span className="font-medium">{formData.endDate || 'N/A'}</span></p>
                                        <p><span className="text-gray-400">Signatory:</span> <span className="font-medium">{formData.signatoryName || 'N/A'}</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-white/5">
                                <h3 className="font-bold mb-3">Agreement Summary</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    This agreement is made between HireGo AI and {formData.companyName || '[Company Name]'} for the provision of recruitment services under the {formData.modelType === 'pph' ? 'Pay-Per-Hire' : 'Subscription'} model. The agreement is valid from {formData.startDate || '[Start Date]'} to {formData.endDate || '[End Date]'}. Payment of ₹{formData.pricing || '[Amount]'} is due on a {formData.billingCycle} basis.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MakeAgreement;
