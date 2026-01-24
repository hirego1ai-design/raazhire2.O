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
        <div className="space-y-4" ref={containerRef}>
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{label}</label>

            <div className="relative group">
                <div
                    className="min-h-[3.5rem] w-full rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3 flex flex-wrap gap-2 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-600/5 transition-all shadow-sm items-center cursor-text"
                    onClick={() => setIsOpen(true)}
                >
                    <Search className="text-[var(--text-muted)] ml-2" size={16} />

                    {/* Selected Tags */}
                    <AnimatePresence mode="popLayout">
                        {selected.map(item => (
                            <motion.span
                                key={item}
                                layout
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="bg-indigo-600/10 text-indigo-600 border border-indigo-600/20 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 font-bold"
                            >
                                {item}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemove(item); }}
                                    className="hover:text-red-500 transition-colors"
                                >
                                    <X size={14} />
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
                        className="bg-transparent outline-none text-[var(--text-main)] placeholder-[var(--text-muted)]/50 flex-1 min-w-[150px] h-8 text-sm font-bold ml-2"
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
                            className="absolute z-50 left-0 right-0 mt-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl p-2"
                        >
                            {filteredOptions.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredOptions.map(option => (
                                        <button
                                            key={option}
                                            onClick={() => handleSelect(option)}
                                            className="w-full text-left px-4 py-3 rounded-xl text-[var(--text-main)] hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-between group font-bold text-xs uppercase tracking-wider"
                                        >
                                            <span>{option}</span>
                                            <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-[var(--text-muted)] text-center text-xs flex flex-col items-center gap-3">
                                    <Search size={24} className="opacity-20" />
                                    <span className="font-bold uppercase tracking-widest">Digital Void: "{query}" Not Found</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Quick Chips - SaaS Style */}
            <div className="space-y-3">
                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] ml-1">Universal Suggestions</p>
                <div className="flex flex-wrap gap-2">
                    {options.filter(opt => !selected.includes(opt)).slice(0, 8).map(option => (
                        <button
                            key={option}
                            onClick={() => handleSelect(option)}
                            className="px-4 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest hover:border-indigo-600/50 hover:text-indigo-600 hover:bg-indigo-600/5 transition-all flex items-center gap-2"
                        >
                            <Plus size={12} /> {option}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
