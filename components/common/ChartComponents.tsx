
import React from 'react';
import { ResponsiveContainer, TooltipProps } from 'recharts';

// --- Shared Gradients ---
// Include this inside your composed charts (e.g., inside <BarChart> or <AreaChart>)
export const ChartGradients: React.FC = () => (
    <defs>
        <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
        </linearGradient>
        <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
        </linearGradient>
        <linearGradient id="colorAmber" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
        </linearGradient>
        <linearGradient id="colorTeal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
        </linearGradient>
        
        {/* Horizontal Gradients for Bars */}
        <linearGradient id="gradIndigo" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="gradEmerald" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
        <linearGradient id="gradAmber" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
    </defs>
);

// --- Beautiful Tooltip ---
export const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-3 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl transition-all">
                {label && <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>}
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm font-medium flex items-center gap-2" style={{ color: entry.color }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                        {entry.name}: <span className="font-bold">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// --- Container Wrapper ---
// FIX: Changed children type to 'any' to robustly satisfy Recharts ResponsiveContainer type requirements
// which expects a specific ReactElement shape, avoiding TS2322 errors during build.
export const ChartContainer: React.FC<{ title: string; subtitle?: string; children: any; height?: number }> = ({ title, subtitle, children, height = 300 }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 hc-text-primary">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 hc-text-secondary">{subtitle}</p>}
            </div>
            <div className="flex-grow w-full" style={{ minHeight: height }}>
                <ResponsiveContainer width="100%" height="100%">
                    {children}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
