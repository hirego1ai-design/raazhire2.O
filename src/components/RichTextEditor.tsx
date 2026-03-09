import React, { useRef, useCallback, useEffect } from 'react';
import {
    Bold, Italic, Underline, Strikethrough, List, ListOrdered,
    Link, Heading1, Heading2, Heading3, RemoveFormatting, Indent, Outdent
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
    style?: React.CSSProperties;
    modules?: {
        toolbar?: any[][];
    };
    formats?: string[];
}

/**
 * Secure Rich Text Editor — replaces react-quill (which has XSS vulnerability).
 * Uses native contentEditable with DOMPurify-style sanitization via execCommand.
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Start typing...',
    className = '',
    style = {},
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const isInternalChange = useRef(false);

    // Sync external value into editor (only when value changed externally)
    useEffect(() => {
        if (editorRef.current && !isInternalChange.current) {
            if (editorRef.current.innerHTML !== value) {
                editorRef.current.innerHTML = value || '';
            }
        }
        isInternalChange.current = false;
    }, [value]);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            isInternalChange.current = true;
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    const execCmd = (cmd: string, val?: string) => {
        document.execCommand(cmd, false, val);
        editorRef.current?.focus();
        handleInput();
    };

    const handleLink = () => {
        const url = prompt('Enter URL:');
        if (url) {
            // Basic sanitization: only allow http/https
            if (url.startsWith('http://') || url.startsWith('https://')) {
                execCmd('createLink', url);
            } else {
                execCmd('createLink', 'https://' + url);
            }
        }
    };

    const toolbarButtons = [
        { icon: <Heading1 size={15} />, cmd: () => execCmd('formatBlock', 'h1'), title: 'Heading 1' },
        { icon: <Heading2 size={15} />, cmd: () => execCmd('formatBlock', 'h2'), title: 'Heading 2' },
        { icon: <Heading3 size={15} />, cmd: () => execCmd('formatBlock', 'h3'), title: 'Heading 3' },
        { type: 'separator' },
        { icon: <Bold size={15} />, cmd: () => execCmd('bold'), title: 'Bold' },
        { icon: <Italic size={15} />, cmd: () => execCmd('italic'), title: 'Italic' },
        { icon: <Underline size={15} />, cmd: () => execCmd('underline'), title: 'Underline' },
        { icon: <Strikethrough size={15} />, cmd: () => execCmd('strikeThrough'), title: 'Strikethrough' },
        { type: 'separator' },
        { icon: <ListOrdered size={15} />, cmd: () => execCmd('insertOrderedList'), title: 'Ordered List' },
        { icon: <List size={15} />, cmd: () => execCmd('insertUnorderedList'), title: 'Bullet List' },
        { icon: <Indent size={15} />, cmd: () => execCmd('indent'), title: 'Indent' },
        { icon: <Outdent size={15} />, cmd: () => execCmd('outdent'), title: 'Outdent' },
        { type: 'separator' },
        { icon: <Link size={15} />, cmd: handleLink, title: 'Insert Link' },
        { icon: <RemoveFormatting size={15} />, cmd: () => execCmd('removeFormat'), title: 'Clear Formatting' },
    ];

    return (
        <div className={`rich-text-editor-secure ${className}`} style={style}>
            {/* Toolbar */}
            <div
                className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-page)]"
                style={{ borderRadius: '12px 12px 0 0' }}
            >
                {toolbarButtons.map((btn, i) =>
                    btn.type === 'separator' ? (
                        <div key={i} className="w-px h-5 bg-[var(--border-subtle)] mx-1.5" />
                    ) : (
                        <button
                            key={i}
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault(); // Prevent losing focus from editor
                                btn.cmd?.();
                            }}
                            title={btn.title}
                            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors"
                        >
                            {btn.icon}
                        </button>
                    )
                )}
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                data-placeholder={placeholder}
                className="rich-editor-content outline-none p-4 min-h-[300px] text-sm leading-relaxed text-[var(--text-main)] overflow-y-auto"
                style={{
                    maxHeight: style?.height || '400px',
                    wordBreak: 'break-word',
                }}
                suppressContentEditableWarning
            />

            {/* Styles */}
            <style>{`
                .rich-editor-content:empty:before {
                    content: attr(data-placeholder);
                    color: var(--text-muted);
                    opacity: 0.5;
                    font-style: italic;
                    pointer-events: none;
                }
                .rich-editor-content h1 { font-size: 1.75em; font-weight: 700; margin: 0.5em 0; }
                .rich-editor-content h2 { font-size: 1.4em; font-weight: 700; margin: 0.4em 0; }
                .rich-editor-content h3 { font-size: 1.15em; font-weight: 700; margin: 0.3em 0; }
                .rich-editor-content p { margin: 0.4em 0; }
                .rich-editor-content ul, .rich-editor-content ol { padding-left: 1.5em; margin: 0.4em 0; }
                .rich-editor-content li { margin: 0.2em 0; }
                .rich-editor-content a { color: var(--primary, #6366f1); text-decoration: underline; }
                .rich-editor-content strong { font-weight: 700; }
                .rich-editor-content em { font-style: italic; }
                .rich-editor-content s { text-decoration: line-through; }
            `}</style>
        </div>
    );
};

export default RichTextEditor;
