'use client';
import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { FeedbackItem, FeedbackCluster, clusterFeedback, BacklogItem } from '@/lib/api';
import { MessageSquare, RefreshCw, Layers, ThumbsUp, ThumbsDown, Minus, Upload, Loader2, Play, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';


const SentimentBar = ({ distribution }: { distribution: Record<string, number> }) => {
    const total = Object.values(distribution).reduce((a, b) => a + b, 0) || 1;
    const positive = (distribution.positive || 0) / total * 100;
    const neutral = (distribution.neutral || 0) / total * 100;
    const negative = (distribution.negative || 0) / total * 100;

    return (
        <div className="space-y-1.5 pt-2">
            <div className="flex h-1.5 rounded-full overflow-hidden bg-secondary">
                <div style={{ width: `${positive}%` }} className="bg-emerald-500" />
                <div style={{ width: `${neutral}%` }} className="bg-slate-400" />
                <div style={{ width: `${negative}%` }} className="bg-rose-500" />
            </div>
            <div className="flex justify-between text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
                <span className="text-emerald-600">{Math.round(positive)}% Pos</span>
                <span className="text-slate-500">{Math.round(neutral)}% Neu</span>
                <span className="text-rose-600">{Math.round(negative)}% Neg</span>
            </div>
        </div>
    );
};

export const FeedbackHub = () => {
    const [input, setInput] = useState('');
    const [clusters, setClusters] = useState<FeedbackCluster[]>([]);
    const [loading, setLoading] = useState(false);
    const [promotedIds, setPromotedIds] = useState<Set<string>>(new Set());

    const handleAnalyze = async () => {
        if (!input.trim()) return;
        setLoading(true);
        try {
            const rawItems = input.split('\n').filter(line => line.trim().length > 0);
            const feedbackItems: FeedbackItem[] = rawItems.map((content, idx) => ({
                id: `fb-${Date.now()}-${idx}`,
                content: content.trim(),
                source: 'User Paste'
            }));
            const result = await clusterFeedback(feedbackItems);
            setClusters(result);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handlePromoteToBacklog = (cluster: FeedbackCluster, idx: number) => {
        try {

            const newItem: BacklogItem = {
                id: `promoted-${Date.now()}-${idx}`,
                title: cluster.theme,
                description: `Derived from ${cluster.related_feedback_ids.length} user feedback items.\n\nSummary: ${cluster.description}`,
                type: 'feature',
                status: 'backlog',
                quality_issues: [],
                quality_score: 80 // Default high score for user-validated features
            };


            const existing = localStorage.getItem('smart-pm-backlog');
            const items = existing ? JSON.parse(existing) : [];
            items.push(newItem);
            localStorage.setItem('smart-pm-backlog', JSON.stringify(items));


            setPromotedIds(prev => new Set(prev).add(cluster.theme));


        } catch (e) {
            console.error("Failed to promote", e);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight mb-1">Raw User Feedback</h2>
                    <p className="text-sm text-muted-foreground">Paste feedback from support tickets, emails, or surveys.</p>
                </div>

                <div className="card-base p-1 bg-card">
                    <textarea
                        className="w-full min-h-[300px] p-4 text-sm bg-transparent border-0 focus:ring-0 resize-none placeholder:text-muted-foreground/60"
                        placeholder={`Example:\n"The search is too slow"\n"Login button doesn't work on mobile"\n"Love the new dashboard design!"`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <div className="flex justify-between items-center py-2 px-3 border-t bg-secondary/20">
                        <span className="text-xs text-muted-foreground">
                            {input ? input.split('\n').filter(l => l.trim()).length : 0} items
                        </span>
                        <button
                            onClick={handleAnalyze}
                            disabled={loading || !input.trim()}
                            className="btn-primary gap-2"
                        >
                            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                            Analyze Feedback
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight mb-1">Identified Themes</h2>
                    <p className="text-sm text-muted-foreground">AI-clustered insights and sentiment analysis.</p>
                </div>

                <div className="space-y-4">
                    {loading && (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="card-base p-5 space-y-3 animate-pulse">
                                    <div className="h-5 bg-secondary rounded w-1/3" />
                                    <div className="h-4 bg-secondary rounded w-full" />
                                    <div className="h-2 bg-secondary rounded w-full" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && clusters.length === 0 && (
                        <div className="card-base border-dashed p-12 flex flex-col items-center justify-center text-center">
                            <Layers className="w-10 h-10 text-muted-foreground/30 mb-4" />
                            <h3 className="font-semibold text-foreground">No themes yet</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                                Submit raw feedback to generate clustered themes and insights.
                            </p>
                        </div>
                    )}

                    <AnimatePresence>
                        {clusters.map((cluster, idx) => {
                            const isPromoted = promotedIds.has(cluster.theme);
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <GlassCard className="p-5 hover:border-primary/20 transition-colors group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-base">{cluster.theme}</h3>
                                            <span className="text-xs bg-secondary px-2 py-1 rounded-md font-medium text-secondary-foreground">
                                                {cluster.related_feedback_ids.length} items
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                            {cluster.description}
                                        </p>

                                        {cluster.sentiment_distribution && (
                                            <SentimentBar distribution={cluster.sentiment_distribution} />
                                        )}


                                        <div className="mt-4 pt-3 border-t flex justify-end">
                                            <button
                                                onClick={() => handlePromoteToBacklog(cluster, idx)}
                                                disabled={isPromoted}
                                                className={`text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${isPromoted
                                                    ? 'bg-green-100 text-green-700 cursor-default'
                                                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                    }`}
                                            >
                                                {isPromoted ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5" />
                                                        Added to Backlog
                                                    </>
                                                ) : (
                                                    <>
                                                        Promote to Issue
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
