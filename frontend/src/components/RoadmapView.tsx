'use client';
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { BacklogItem, RoadmapPlan, generateRoadmap } from '@/lib/api';
import { Play, Loader2, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RiskBadge = ({ level }: { level: string }) => {
    let style = "bg-slate-100 text-slate-600 border-slate-200";
    if (level === 'high') style = "bg-rose-100 text-rose-700 border-rose-200";
    if (level === 'medium') style = "bg-amber-100 text-amber-700 border-amber-200";

    return (
        <span className={`uppercase text-[10px] font-bold px-1.5 py-0.5 rounded border ${style}`}>
            {level}
        </span>
    );
};

export const RoadmapView = () => {
    const [roadmap, setRoadmap] = useState<RoadmapPlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('smart-pm-backlog');
        if (saved) {
            try { setBacklogItems(JSON.parse(saved)); } catch (e) { console.error(e); }
        }
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        setRoadmap(null);
        try {
            // Use real items or defaults
            const itemsToUse = backlogItems.length > 0 ? backlogItems : [
                { id: '1', title: 'User Profile', description: '', type: 'feature' as const, status: 'backlog' as const, quality_issues: [] },
                { id: '2', title: 'Auth System', description: '', type: 'chore' as const, status: 'backlog' as const, quality_issues: [] },
                { id: '3', title: 'Payment Gateway', description: '', type: 'feature' as const, status: 'backlog' as const, quality_issues: [] },
            ];
            const result = await generateRoadmap(itemsToUse);
            setRoadmap(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Grouping
    const weekGroups = roadmap?.items.reduce((acc, item) => {
        if (!acc[item.week]) acc[item.week] = [];
        acc[item.week].push(item);
        return acc;
    }, {} as Record<number, typeof roadmap.items>) || {};

    const maxWeeks = Math.max(...Object.keys(weekGroups).map(Number), 4);

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center pb-6 border-b">
                <div>
                    <h2 className="text-xl font-semibold tracking-tight">Strategic Roadmap</h2>
                    <p className="text-sm text-muted-foreground mt-1">AI-generated sprint plan based on {backlogItems.length ? backlogItems.length : 'sample'} items.</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="btn-primary gap-2"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                    Generate Plan
                </button>
            </div>

            {!loading && !roadmap && (
                <div className="text-center py-20 bg-secondary/20 border-2 border-dashed rounded-xl">
                    <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="font-medium text-foreground">Ready to Plan</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-6">Generate a strategic roadmap from your backlog items.</p>
                    <button onClick={handleGenerate} className="btn-secondary">
                        Start Planning
                    </button>
                </div>
            )}

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="space-y-4">
                            <div className="h-6 bg-secondary rounded w-24 animate-pulse" />
                            <div className="h-32 bg-secondary/50 rounded-lg animate-pulse" />
                            <div className="h-24 bg-secondary/50 rounded-lg animate-pulse" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && roadmap && (
                <div className="space-y-8">
                    {/* Warnings */}
                    {roadmap.warnings.length > 0 && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <span className="font-semibold text-amber-800 text-sm">Planning Risks</span>
                            </div>
                            <ul className="list-disc list-inside text-sm text-amber-700/80 pl-1">
                                {roadmap.warnings.map((w, i) => <li key={i}>{w}</li>)}
                            </ul>
                        </div>
                    )}

                    {/* Timeline Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                        {/* Timeline Connector Line */}
                        <div className="absolute top-8 left-0 right-0 h-px bg-border hidden md:block -z-10" />

                        {Array.from({ length: maxWeeks }, (_, i) => i + 1).map((week) => {
                            const items = weekGroups[week] || [];
                            return (
                                <div key={week} className="space-y-4">
                                    <div className="flex items-center gap-3 bg-background pr-4 w-fit">
                                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                            {week}
                                        </div>
                                        <span className="text-sm font-medium text-muted-foreground">Week {week}</span>
                                    </div>

                                    <div className="space-y-3">
                                        <AnimatePresence>
                                            {items.map((item, idx) => {
                                                const title = backlogItems.find(i => i.id === item.item_id)?.title || `Item #${item.item_id}`;
                                                return (
                                                    <motion.div
                                                        key={item.item_id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                    >
                                                        <GlassCard className="p-3 hover:shadow-md transition-shadow group relative overflow-hidden">
                                                            {/* Side Accent */}
                                                            <div className={`absolute top-0 left-0 bottom-0 w-1 ${item.risk_level === 'high' ? 'bg-rose-500' : 'bg-slate-200'}`} />

                                                            <div className="pl-2">
                                                                <div className="flex justify-between items-start mb-2 gap-2">
                                                                    <span className="text-sm font-medium leading-tight">{title}</span>
                                                                    <RiskBadge level={item.risk_level} />
                                                                </div>

                                                                {item.dependencies.length > 0 && (
                                                                    <div className="text-[10px] text-muted-foreground flex flex-wrap gap-1 mt-2">
                                                                        <span className="font-medium">Deps:</span>
                                                                        {item.dependencies.map(d => (
                                                                            <span key={d} className="bg-secondary px-1 rounded">{d}</span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </GlassCard>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>

                                        {items.length === 0 && (
                                            <div className="h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-xs text-muted-foreground/50">
                                                Open Capacity
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
