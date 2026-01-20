'use client';
import React, { useState } from 'react';
import { BacklogBoard } from '@/components/BacklogBoard';
import { FeedbackHub } from '@/components/FeedbackHub';
import { RoadmapView } from '@/components/RoadmapView';
import { List, MessageSquare, Map, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const tabs = [
  { id: 'backlog', label: 'Backlog', icon: List },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
] as const;

type TabId = typeof tabs[number]['id'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('backlog');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Minimal Header */}
      <header className="border-b bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Box className="w-5 h-5" />
            </div>
            <span className="font-semibold text-sm tracking-tight">Smart PM Agent</span>
          </div>

          <nav className="flex space-x-6 h-full items-center">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative h-full flex items-center gap-2 text-sm font-medium transition-colors border-b-2 
                      ${isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground font-medium">Gemini 2.0 Connected</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'backlog' && <BacklogBoard />}
            {activeTab === 'feedback' && <FeedbackHub />}
            {activeTab === 'roadmap' && <RoadmapView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
