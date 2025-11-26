import React, { useState, useRef, useEffect } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchableMultiSelectProps {
    label: string;
    placeholder: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    maxItems?: number;
}

export default function SearchableMultiSelect({
    label,
    placeholder,
    options,
    selected,
    onChange,
    maxItems = 10
}: SearchableMultiSelectProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter options based on query and exclude already selected
    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(query.toLowerCase()) && !selected.includes(opt)
    );

    const handleSelect = (item: string) => {
        if (selected.length >= maxItems) return;
        onChange([...selected, item]);
        setQuery('');
    };

    const handleRemove = (item: string) => {
        onChange(selected.filter(i => i !== item));
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="space-y-3" ref={containerRef}>
            <label className="block font-bold text-gray-300 text-sm">{label}</label>

            <div className="relative group">
                <div
                    className="min-h-[3.5rem] w-full rounded-xl bg-[#0f172a] border border-gray-700 p-2.5 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all shadow-inner items-center"
                    onClick={() => setIsOpen(true)}
                >
                    <Search className="text-gray-500 ml-1" size={18} />

                    {/* Selected Tags */}
                    <AnimatePresence mode="popLayout">
                        {selected.map(item => (
                            <motion.span
                                key={item}
                                layout
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 font-medium"
                            >
                                {item}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemove(item); }}
                                    className="hover:text-white bg-blue-500/20 rounded-full p-0.5 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </motion.span>
                        ))}
                    </AnimatePresence>

                    {/* Input Field */}
                    <input
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
                        onFocus={() => setIsOpen(true)}
                        placeholder={selected.length === 0 ? placeholder : ""}
                        className="bg-transparent outline-none text-white placeholder-gray-500 flex-1 min-w-[120px] h-8 text-sm ml-1"
                    />
                </div>

                {/* Dropdown Suggestions */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 left-0 right-0 mt-2 bg-[#1e293b] border border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl"
                        >
                            {filteredOptions.length > 0 ? (
                                <div className="p-2 space-y-1">
                                    {filteredOptions.map(option => (
                                        <button
                                            key={option}
                                            onClick={() => handleSelect(option)}
                                            className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-between group"
                                        >
                                            <span className="font-medium">{option}</span>
                                            <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-gray-500 text-center text-sm flex flex-col items-center gap-2">
                                    <Search size={24} className="opacity-50" />
                                    <span>No matches found for "{query}"</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Predefined Options (Chips) - "Pick & Drop Style" */}
            <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Suggested Options</p>
                <div className="flex flex-wrap gap-2">
                    {options.filter(opt => !selected.includes(opt)).slice(0, 10).map(option => (
                        <button
                            key={option}
                            onClick={() => handleSelect(option)}
                            className="px-4 py-2 rounded-lg bg-[#1e293b] border border-gray-700 text-gray-400 text-sm hover:border-blue-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all flex items-center gap-2"
                        >
                            <Plus size={12} /> {option}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
