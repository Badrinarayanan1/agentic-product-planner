'use client';
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard'; // Using standard Card style now
import { BacklogItem, groomItem } from '@/lib/api';
import { Plus, Trash2, ArrowRight, CheckCircle2, Circle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PriorityBadge = ({ score }: { score: number }) => {
    let color = "bg-slate-100 text-slate-600";
    let label = "Low";

    if (score > 80) {
        color = "bg-green-100 text-green-700 border-green-200";
        label = "High";
    } else if (score > 50) {
        color = "bg-yellow-100 text-yellow-700 border-yellow-200";
        label = "Medium";
    }

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
            {label} ({score})
        </span>
    );
};

export const BacklogBoard = () => {
    const [items, setItems] = useState<BacklogItem[]>([]);
    const [newItemTitle, setNewItemTitle] = useState('');
    const [loading, setLoading] = useState(false);

    // Persistence
    useEffect(() => {
        const saved = localStorage.getItem('smart-pm-backlog');
        if (saved) {
            try { setItems(JSON.parse(saved)); } catch (e) { console.error(e); }
        }
    }, []);

    useEffect(() => {
        if (items.length > 0) {
            localStorage.setItem('smart-pm-backlog', JSON.stringify(items));
        }
    }, [items]);

    const handleAddItem = async () => {
        if (!newItemTitle.trim()) return;

        const newItem: BacklogItem = {
            id: Date.now().toString(),
            title: newItemTitle,
            description: "",
            type: 'feature',
            status: 'backlog',
            quality_issues: []
        };

        setLoading(true);
        try {
            // Optimistic add
            const tempItems = [...items, newItem];
            setItems(tempItems);
            setNewItemTitle('');

            // Background grooming
            const groomed = await groomItem(newItem);
            setItems(prev => prev.map(i => i.id === newItem.id ? groomed : i));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center pb-4 border-b">
                <h2 className="text-xl font-semibold tracking-tight">Active Issues</h2>
                <div className="text-sm text-muted-foreground">{items.length} issues</div>
            </div>

            {/* Quick Add Bar */}
            <div className="flex gap-3">
                <input
                    className="input-base flex-1"
                    placeholder="Create new issue... (Press Enter)"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                    disabled={loading}
                />
                <button
                    onClick={handleAddItem}
                    disabled={loading || !newItemTitle.trim()}
                    className="btn-primary"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Issue"}
                </button>
            </div>

            {/* List View */}
            <div className="space-y-1">
                <AnimatePresence>
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="bg-card hover:bg-secondary/40 transition-colors border group rounded-md p-4 flex items-start gap-4"
                        >
                            <div className="mt-1 text-muted-foreground">
                                {item.type === 'bug' ? <AlertCircle className="w-4 h-4 text-red-500" /> : <Circle className="w-4 h-4" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-sm text-foreground truncate">{item.title}</span>
                                    {item.quality_score !== undefined && <PriorityBadge score={item.quality_score} />}
                                </div>

                                {(item.description || item.refined_description) && (
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                        {item.refined_description || item.description}
                                    </p>
                                )}

                                {item.quality_issues.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {item.quality_issues.map((issue, idx) => (
                                            <span key={idx} className="inline-flex items-center text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-100">
                                                {issue.issue_type}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleDelete(item.id)}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {items.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                        No active issues. Create one above.
                    </div>
                )}
            </div>
        </div>
    );
};
