import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, ...props }) => {
    return (
        <div
            className={cn("bg-card text-card-foreground rounded-lg border shadow-sm transition-colors", className)}
            {...props}
        >
            {children}
        </div>
    );
};
