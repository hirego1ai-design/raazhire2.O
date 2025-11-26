import React from 'react';
import Button from '../components/Button';
import { Plus, Eye, FileText, CreditCard, Trash, Edit, Settings, Check } from 'lucide-react';

const ButtonShowcase: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-space-dark to-space-blue p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Platform Button System
                    </h1>
                    <p className="text-gray-400">
                        8 Standardized Button Variants • 4 Size Options • Consistent Design
                    </p>
                </div>

                {/* All Variants - Medium Size */}
                <div className="glass p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6">All Variants (Medium Size)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-3">
                            <Button variant="primary" size="md" icon={<Check size={18} />}>
                                Primary
                            </Button>
                            <p className="text-xs text-gray-400">Default actions</p>
                        </div>

                        <div className="space-y-3">
                            <Button variant="secondary" size="md" icon={<Settings size={18} />}>
                                Secondary
                            </Button>
                            <p className="text-xs text-gray-400">Premium features</p>
                        </div>

                        <div className="space-y-3">
                            <Button variant="ghost" size="md" icon={<Eye size={18} />}>
                                Ghost
                            </Button>
                            <p className="text-xs text-gray-400">Subtle actions</p>
                        </div>

                        <div className="space-y-3">
                            <Button variant="danger" size="md" icon={<Trash size={18} />}>
                                Danger
                            </Button>
                            <p className="text-xs text-gray-400">Destructive actions</p>
                        </div>

                        <div className="space-y-3">
                            <Button variant="success" size="md" icon={<Plus size={18} />}>
                                Success
                            </Button>
                            <p className="text-xs text-gray-400">Positive actions</p>
                        </div>

                        <div className="space-y-3">
                            <Button variant="warning" size="md" icon={<CreditCard size={18} />}>
                                Warning
                            </Button>
                            <p className="text-xs text-gray-400">Caution actions</p>
                        </div>

                        <div className="space-y-3">
                            <Button variant="info" size="md" icon={<Plus size={18} />}>
                                Info
                            </Button>
                            <p className="text-xs text-gray-400">Informational</p>
                        </div>

                        <div className="space-y-3">
                            <Button variant="purple" size="md" icon={<FileText size={18} />}>
                                Purple
                            </Button>
                            <p className="text-xs text-gray-400">Special features</p>
                        </div>
                    </div>
                </div>

                {/* Size Variations */}
                <div className="glass p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6">Size Variations</h2>
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-4">
                            <Button variant="success" size="xs" icon={<Plus size={14} />}>
                                Extra Small
                            </Button>
                            <Button variant="success" size="sm" icon={<Plus size={16} />}>
                                Small
                            </Button>
                            <Button variant="success" size="md" icon={<Plus size={18} />}>
                                Medium (Default)
                            </Button>
                            <Button variant="success" size="lg" icon={<Plus size={20} />}>
                                Large
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Common Use Cases */}
                <div className="glass p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6">Common Use Cases</h2>

                    {/* Employer Actions */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-neon-cyan mb-4">Employer Dashboard</h3>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="info" size="md" icon={<Plus size={18} />}>
                                Post Job (Subscription)
                            </Button>
                            <Button variant="success" size="md" icon={<Plus size={18} />}>
                                Post PPH Job
                            </Button>
                            <Button variant="purple" size="md" icon={<FileText size={18} />}>
                                New Agreement
                            </Button>
                            <Button variant="warning" size="md" icon={<CreditCard size={18} />}>
                                Pay Due
                            </Button>
                            <Button variant="ghost" size="md" icon={<Eye size={18} />}>
                                View Status
                            </Button>
                        </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold text-neon-purple mb-4">Admin Panel</h3>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="success" size="sm" icon={<Plus size={16} />}>
                                Add User
                            </Button>
                            <Button variant="info" size="sm" icon={<Edit size={16} />}>
                                Edit Settings
                            </Button>
                            <Button variant="danger" size="sm" icon={<Trash size={16} />}>
                                Delete
                            </Button>
                            <Button variant="purple" size="sm" icon={<Settings size={16} />}>
                                Configure API
                            </Button>
                        </div>
                    </div>

                    {/* Candidate Actions */}
                    <div>
                        <h3 className="text-lg font-semibold text-green-400 mb-4">Candidate Dashboard</h3>
                        <div className="flex flex-wrap gap-4">
                            <Button variant="success" size="md">
                                Apply Now
                            </Button>
                            <Button variant="ghost" size="sm">
                                Save for Later
                            </Button>
                            <Button variant="primary" size="lg">
                                Start Assessment
                            </Button>
                        </div>
                    </div>
                </div>

                {/* States */}
                <div className="glass p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6">Button States</h2>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="primary" size="md">
                            Normal
                        </Button>
                        <Button variant="primary" size="md" disabled>
                            Disabled
                        </Button>
                        <Button variant="success" size="md" fullWidth>
                            Full Width
                        </Button>
                    </div>
                </div>

                {/* Code Example */}
                <div className="glass p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold text-white mb-4">Usage Example</h2>
                    <pre className="bg-black/40 p-4 rounded-lg text-sm overflow-x-auto">
                        <code className="text-neon-cyan">{`import Button from '../components/Button';
import { Plus } from 'lucide-react';

<Button variant="success" size="md" icon={<Plus size={18} />}>
    Post Job
</Button>`}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default ButtonShowcase;
