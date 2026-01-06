// src/pages/Home/components/SalesPerformanceTable.tsx
// Redesigned with minimalist UI consistent with data-table design system
// Responsive: Desktop table view + Mobile card view

import React, { useState, useEffect } from 'react';
import { useFrappeGetCall } from 'frappe-react-sdk';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ChevronRight, Users, Calendar, FileText } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from 'react-router-dom';

import { useDialogStore, StatItem } from "@/store/dialogStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { formatDateWithOrdinal } from "@/utils/FormatDate";
import { TaskStatusIcon } from "@/components/ui/TaskStatusIcon";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface FrappeDoc {
    name: string;
    type?: string;
    start_date?: string;
    status?: string;
    task_profile?: string;
    remarks?: string;
    boq_status?: string;
    creation?: string;
    boq?: string;
    "contact.first_name"?: string;
    "contact.last_name"?: string;
    "company.company_name"?: string;
    company?: string;
    company_name?: string;
    priority?: string;
    last_meeting?: string;
    date_from?: string;
    date_to?: string;
    first_name?: string;
    [key: string]: any;
}

interface SalesPerformanceMetric {
    user_name: string;
    full_name: string;
    email?: string;
    IPM_this_week: FrappeDoc[];
    IPM_last_week: FrappeDoc[];
    IPM_last_30_days: FrappeDoc[];
    UMC_this_week: FrappeDoc[];
    UMC_last_week: FrappeDoc[];
    UMC_last_30_days: FrappeDoc[];
    BOQR_this_week: FrappeDoc[];
    BOQR_last_week: FrappeDoc[];
    BOQR_last_30_days: FrappeDoc[];
    TAC_this_week: FrappeDoc[];
    TAC_last_week: FrappeDoc[];
    TAC_last_30_days: FrappeDoc[];
}

interface SalesPerformanceTableProps {
    className?: string;
}

type Period = 'this_week' | 'last_week' | 'last_30_days';
type MetricType = 'IPM' | 'UMC' | 'BOQ' | 'TAC';

// ─────────────────────────────────────────────────────────────────────────────
// Formatters for Dialog Items
// ─────────────────────────────────────────────────────────────────────────────

const getBoqStatusClass = useStatusStyles("boq");

const boqNameFormatter = (item: FrappeDoc) => (
    <Card className="w-full shadow-none border border-border/60 hover:shadow-md transition-shadow">
        <CardHeader className="p-3 pb-2">
            <CardTitle className="text-base font-bold text-primary truncate" title={item.name}>
                {item.name}
                <span className="block text-sm text-muted-foreground font-normal">{item.company}</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pt-0 pb-3 flex justify-between items-center text-xs">
            <span className={cn(
                "font-medium px-2 py-1 rounded-full text-xs border",
                getBoqStatusClass(item.boq_status || '')
            )}>
                {item.boq_status || 'N/A'}
            </span>
            <span className="text-muted-foreground">
                Received: {formatDateWithOrdinal(item.creation)}
            </span>
        </CardContent>
    </Card>
);

const taskNameFormatter = (item: FrappeDoc) => (
    <div className="flex items-center gap-3 w-full p-2">
        <TaskStatusIcon status={item.status || 'Open'} className="flex-shrink-0" />
        <div className="flex flex-col flex-grow min-w-0">
            {item.task_profile === "Sales" ? (
                <span className="truncate text-sm">
                    <span className="font-semibold">{item?.type || 'Task'}</span>
                    {' with '}
                    <span className="font-semibold">{item.first_name || '--'}</span>
                    {' from '}
                    <span className="font-medium">{item["company.company_name"] || item.company || '--'}</span>
                </span>
            ) : (
                <span className="truncate text-sm">
                    <span className="font-semibold">{item?.type || 'Task'}</span>
                    {' for '}
                    <span className="font-semibold">{item?.boq || '--'}</span>
                </span>
            )}
            {item.start_date && (
                <span className="text-xs text-muted-foreground mt-1">
                    {formatDateWithOrdinal(item.start_date)}
                </span>
            )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </div>
);

const companyNameFormatter = (item: FrappeDoc) => (
    <div className="flex items-start gap-3 w-full p-3 border border-border/60 rounded-lg hover:shadow-md transition-shadow">
        <div className="flex flex-col flex-grow min-w-0">
            <Link
                to={`/companies/company?id=${item.name}`}
                className="font-semibold text-primary hover:underline"
            >
                {item.company_name || item.name || 'N/A'}
            </Link>
            {item.priority && (
                <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="text-muted-foreground">Priority:</span>
                    <span className={cn(
                        "font-medium px-2 py-0.5 rounded-full text-xs border",
                        item.priority === 'Hold'
                            ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                    )}>
                        {item.priority}
                    </span>
                </div>
            )}
            {item.last_meeting && (
                <span className="text-xs text-muted-foreground mt-1">
                    Last Meeting: {formatDateWithOrdinal(item.last_meeting)}
                </span>
            )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
    </div>
);

const formatItemsForDialog = (
    data: FrappeDoc[],
    nameFormatter: (item: FrappeDoc) => React.ReactNode,
    type: 'Task' | 'BOQ' | 'Company'
): StatItem[] => {
    return data.map(item => ({
        name: nameFormatter(item),
        id: item.name,
        type: type,
        data: item
    }));
};

// ─────────────────────────────────────────────────────────────────────────────
// Period Label Helper
// ─────────────────────────────────────────────────────────────────────────────

const getPeriodLabel = (period: Period): string => {
    const labels: Record<Period, string> = {
        'this_week': 'This Week',
        'last_week': 'Last Week',
        'last_30_days': '30 Days'
    };
    return labels[period];
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const SalesPerformanceTable: React.FC<SalesPerformanceTableProps> = ({ className }) => {
    const { openStatsDetailDialog } = useDialogStore();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const { data, isLoading, error } = useFrappeGetCall<SalesPerformanceMetric[]>(
        "nirmaan_crm.api.users.get_sales_performance.get_sales_performance_metrics",
        []
    );

    const performanceData = data?.message || [];

    // ─────────────────────────────────────────────────────────────────────────
    // Dialog Handler
    // ─────────────────────────────────────────────────────────────────────────

    const createDialogHandler = (
        user: SalesPerformanceMetric,
        metricType: MetricType,
        period: Period,
        data?: FrappeDoc[],
        count?: number
    ) => () => {
        let titlePrefix = "";
        let itemsToDisplay: FrappeDoc[] = data || [];
        let formatterToUse: (item: FrappeDoc) => React.ReactNode = taskNameFormatter;
        let dialogItemType: 'Task' | 'BOQ' | 'Company' = 'Task';
        const currentCount = count !== undefined ? count : itemsToDisplay.length;

        if (metricType === 'TAC') {
            titlePrefix = "Active Companies";
            itemsToDisplay = user[`TAC_${period}`] as FrappeDoc[];
            formatterToUse = companyNameFormatter;
            dialogItemType = 'Company';
        } else if (metricType === 'IPM') {
            titlePrefix = "Total Meetings";
            dialogItemType = 'Task';
        } else if (metricType === 'UMC') {
            titlePrefix = "Unique Meetings";
            dialogItemType = 'Task';
        } else if (metricType === 'BOQ') {
            titlePrefix = "BOQ Received";
            formatterToUse = boqNameFormatter;
            dialogItemType = 'BOQ';
        }

        if (currentCount > 0) {
            const dateSourceKey =
                metricType === 'BOQ' ? `BOQR_${period}` :
                    (metricType === 'TAC' ? `TAC_${period}` : `IPM_${period}`);

            const title = dateSourceKey.startsWith('TAC')
                ? `${user.full_name} - ${titlePrefix}`
                : `${user.full_name} - ${titlePrefix} (${getPeriodLabel(period)})`;

            const dateItemsForDialog = user[dateSourceKey as keyof SalesPerformanceMetric] as FrappeDoc[] || [];

            const dateRange = dateSourceKey.startsWith('TAC')
                ? `Up to ${formatDateWithOrdinal(dateItemsForDialog?.[0]?.date_to)}`
                : (dateItemsForDialog?.length > 0)
                    ? `${formatDateWithOrdinal(dateItemsForDialog?.[0]?.date_from)} to ${formatDateWithOrdinal(dateItemsForDialog?.[0]?.date_to)}`
                    : "--";

            const formattedItems = formatItemsForDialog(itemsToDisplay, formatterToUse, dialogItemType);

            openStatsDetailDialog({
                title: (
                    <div className="flex flex-col">
                        <span>{title}</span>
                        <span className="text-xs text-muted-foreground font-normal">({dateRange})</span>
                    </div>
                ),
                items: formattedItems,
            });
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Metric Badge Component
    // ─────────────────────────────────────────────────────────────────────────

    const MetricBadge: React.FC<{
        count: number;
        onClick?: () => void;
        variant?: 'default' | 'muted';
    }> = ({ count, onClick, variant = 'default' }) => {
        const isActive = count > 0;

        if (!isActive) {
            return (
                <span className="text-sm font-medium text-muted-foreground tabular-nums">
                    {count}
                </span>
            );
        }

        return (
            <span
                onClick={onClick}
                className={cn(
                    "inline-flex items-center justify-center",
                    "min-w-[24px] h-6 px-2 rounded-full",
                    "text-xs font-semibold tabular-nums",
                    "cursor-pointer transition-all duration-200",
                    variant === 'default'
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        : "bg-foreground text-background hover:bg-foreground/90"
                )}
            >
                {count}
            </span>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Desktop Cell Components
    // ─────────────────────────────────────────────────────────────────────────

    const MeetingsCellContent: React.FC<{
        user: SalesPerformanceMetric;
        period: Period;
    }> = ({ user, period }) => {
        const ipmItems = (user[`IPM_${period}`] as FrappeDoc[]) || [];
        const umcItems = (user[`UMC_${period}`] as FrappeDoc[]) || [];
        const tacItems = (user[`TAC_${period}`] as FrappeDoc[]) || [];

        const metrics = [
            { label: 'Total', count: ipmItems.length, items: ipmItems, type: 'IPM' as MetricType },
            { label: 'Unique', count: umcItems.length, items: umcItems, type: 'UMC' as MetricType },
            { label: 'Companies', count: tacItems.length, items: tacItems, type: 'TAC' as MetricType },
        ];

        return (
            <div className="flex flex-col gap-1.5">
                {metrics.map(({ label, count, items, type }) => (
                    <div key={label} className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-muted/30">
                        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
                        <MetricBadge
                            count={count}
                            onClick={createDialogHandler(user, type, period, items, count)}
                        />
                    </div>
                ))}
            </div>
        );
    };

    const BoqCellContent: React.FC<{
        user: SalesPerformanceMetric;
        period: Period;
    }> = ({ user, period }) => {
        const boqItems = user[`BOQR_${period}`] || [];
        const boqCount = boqItems.length;

        return (
            <div className="flex items-center justify-center h-full">
                <MetricBadge
                    count={boqCount}
                    onClick={createDialogHandler(user, 'BOQ', period, boqItems, boqCount)}
                />
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Mobile Card Component
    // ─────────────────────────────────────────────────────────────────────────

    const MobileUserCard: React.FC<{ user: SalesPerformanceMetric }> = ({ user }) => {
        const periods: Period[] = ['this_week', 'last_week', 'last_30_days'];

        // Calculate totals for quick overview
        const totalMeetings = periods.reduce((sum, p) =>
            sum + (user[`IPM_${p}`]?.length || 0), 0);
        const totalBOQs = periods.reduce((sum, p) =>
            sum + (user[`BOQR_${p}`]?.length || 0), 0);
        const activeCompanies = user.TAC_last_30_days?.length || 0;

        return (
            <div className="bg-card border border-border/60 rounded-lg overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-border/40">
                    <div className="flex items-center justify-between">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        to={`/team?memberId=${user.email}`}
                                        className="font-semibold text-primary hover:underline"
                                    >
                                        {user.full_name}
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{user.email}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{totalMeetings} meetings</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <FileText className="w-3.5 h-3.5" />
                            <span>{totalBOQs} BOQs</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span>{activeCompanies} active</span>
                        </div>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="p-3">
                    <div className="grid grid-cols-3 gap-2 text-center mb-2">
                        {periods.map(period => (
                            <span key={period} className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                {getPeriodLabel(period)}
                            </span>
                        ))}
                    </div>

                    {/* Meetings Row */}
                    <div className="mb-3">
                        <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Meetings
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {periods.map(period => {
                                const ipmItems = user[`IPM_${period}`] || [];
                                const umcItems = user[`UMC_${period}`] || [];
                                return (
                                    <div key={period} className="bg-muted/40 rounded-md p-2 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-muted-foreground">Total</span>
                                            <MetricBadge
                                                count={ipmItems.length}
                                                onClick={createDialogHandler(user, 'IPM', period, ipmItems, ipmItems.length)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-muted-foreground">Unique</span>
                                            <MetricBadge
                                                count={umcItems.length}
                                                onClick={createDialogHandler(user, 'UMC', period, umcItems, umcItems.length)}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* BOQ Row */}
                    <div className="mb-3">
                        <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                            <FileText className="w-3 h-3" /> BOQ Received
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {periods.map(period => {
                                const boqItems = user[`BOQR_${period}`] || [];
                                return (
                                    <div key={period} className="bg-muted/40 rounded-md p-2 flex items-center justify-center">
                                        <MetricBadge
                                            count={boqItems.length}
                                            onClick={createDialogHandler(user, 'BOQ', period, boqItems, boqItems.length)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Active Companies Row */}
                    <div>
                        <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                            <Users className="w-3 h-3" /> Active Companies
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {periods.map(period => {
                                const tacItems = user[`TAC_${period}`] || [];
                                return (
                                    <div key={period} className="bg-muted/40 rounded-md p-2 flex items-center justify-center">
                                        <MetricBadge
                                            count={tacItems.length}
                                            onClick={createDialogHandler(user, 'TAC', period, tacItems, tacItems.length)}
                                            variant="muted"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Loading State
    // ─────────────────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className={cn("bg-background p-4 border border-border/60 rounded-lg", className)}>
                {isMobile ? (
                    <div className="space-y-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <Skeleton key={i} className="h-48 w-full rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <div className="min-w-[900px]">
                            <div className="grid grid-cols-[180px,repeat(6,1fr)] gap-4 py-3 border-b border-border/60">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-full" />
                                ))}
                            </div>
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="grid grid-cols-[180px,repeat(6,1fr)] gap-4 py-4 border-b border-border/30">
                                    <Skeleton className="h-5 w-24" />
                                    {Array.from({ length: 3 }).map((_, j) => (
                                        <Skeleton key={j} className="h-20 w-full" />
                                    ))}
                                    {Array.from({ length: 3 }).map((_, j) => (
                                        <Skeleton key={j} className="h-6 w-8 mx-auto" />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Error State
    // ─────────────────────────────────────────────────────────────────────────

    if (error) {
        return (
            <Alert variant="destructive" className={cn("", className)}>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error loading Sales Performance</AlertTitle>
                <AlertDescription>
                    {error.message || "An unexpected error occurred while loading sales data."}
                </AlertDescription>
            </Alert>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Mobile View
    // ─────────────────────────────────────────────────────────────────────────

    if (isMobile) {
        return (
            <div className={cn("space-y-3", className)}>
                {performanceData.length === 0 ? (
                    <div className="bg-card border border-border/60 rounded-lg p-8 text-center">
                        <p className="text-muted-foreground text-sm">No sales performance data found.</p>
                    </div>
                ) : (
                    performanceData.map((user) => (
                        <MobileUserCard key={user.user_name} user={user} />
                    ))
                )}
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Desktop View
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className={cn("bg-background border border-border/60 rounded-lg overflow-hidden", className)}>
            <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                    {/* Header Row */}
                    <div className="grid grid-cols-[180px,repeat(6,1fr)] border-b border-border/60 bg-muted/30">
                        {/* User Column Header */}
                        <div className="px-4 py-3 flex items-end">
                            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                User
                            </span>
                        </div>

                        {/* In Person Meetings Group */}
                        <div className="col-span-3 border-l border-border/40">
                            <div className="px-4 py-2 border-b border-border/40">
                                <span className="text-[11px] font-medium uppercase tracking-wide text-primary">
                                    In Person Meetings
                                </span>
                            </div>
                            <div className="grid grid-cols-3">
                                {(['this_week', 'last_week', 'last_30_days'] as Period[]).map((period, idx) => (
                                    <div
                                        key={period}
                                        className={cn(
                                            "px-3 py-2 text-center",
                                            idx > 0 && "border-l border-border/40"
                                        )}
                                    >
                                        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                            {getPeriodLabel(period)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* BOQ Group */}
                        <div className="col-span-3 border-l border-border/40">
                            <div className="px-4 py-2 border-b border-border/40">
                                <span className="text-[11px] font-medium uppercase tracking-wide text-primary">
                                    BOQ Received
                                </span>
                            </div>
                            <div className="grid grid-cols-3">
                                {(['this_week', 'last_week', 'last_30_days'] as Period[]).map((period, idx) => (
                                    <div
                                        key={period}
                                        className={cn(
                                            "px-3 py-2 text-center",
                                            idx > 0 && "border-l border-border/40"
                                        )}
                                    >
                                        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                            {getPeriodLabel(period)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Data Rows */}
                    <div className="max-h-[320px] overflow-y-auto">
                        {performanceData.length === 0 ? (
                            <div className="px-4 py-12 text-center">
                                <p className="text-muted-foreground text-sm">No sales performance data found.</p>
                            </div>
                        ) : (
                            performanceData.map((user, index) => (
                                <div
                                    key={user.user_name}
                                    className={cn(
                                        "grid grid-cols-[180px,repeat(6,1fr)] items-center",
                                        "border-b border-border/30 last:border-b-0",
                                        "hover:bg-muted/20 transition-colors"
                                    )}
                                >
                                    {/* User Name */}
                                    <div className="px-4 py-3 bg-muted/20">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Link
                                                        to={`/team?memberId=${user.email}`}
                                                        className="text-primary font-semibold hover:underline block truncate"
                                                    >
                                                        {user.full_name}
                                                    </Link>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{user.email}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>

                                    {/* Meetings Columns */}
                                    {(['this_week', 'last_week', 'last_30_days'] as Period[]).map((period, idx) => (
                                        <div
                                            key={`meetings-${period}`}
                                            className={cn(
                                                "px-3 py-3",
                                                idx === 0 && "border-l border-border/40"
                                            )}
                                        >
                                            <MeetingsCellContent user={user} period={period} />
                                        </div>
                                    ))}

                                    {/* BOQ Columns */}
                                    {(['this_week', 'last_week', 'last_30_days'] as Period[]).map((period, idx) => (
                                        <div
                                            key={`boq-${period}`}
                                            className={cn(
                                                "px-3 py-3",
                                                idx === 0 && "border-l border-border/40"
                                            )}
                                        >
                                            <BoqCellContent user={user} period={period} />
                                        </div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesPerformanceTable;
