// src/pages/Home/components/ExceptionReportForCompanies.tsx
// Redesigned with minimalist UI consistent with data-table design system
// Responsive: Desktop table view + Mobile card view

import React, { useState, useEffect } from "react";
import { useFrappeGetCall } from "frappe-react-sdk";
import { ChevronDown, ChevronRight, Building2, CalendarCheck, CalendarX, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TouchTooltip } from "@/components/ui/touch-tooltip";
import { formatDateWithOrdinal } from "@/utils/FormatDate";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CompanyReportRow {
    company_name: string;
    last_meeting_status: 'YES' | 'NO';
    last_meeting_date: string | null;
    next_meeting_status: 'YES' | 'NO';
    next_meeting_date: string | null;
}

interface UserReportGroup {
    user_full_name: string;
    companies: CompanyReportRow[];
}

interface ExceptionReportForCompaniesProps {
    className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Meeting Status Badge Component (matching Company Table pattern)
// ─────────────────────────────────────────────────────────────────────────────

interface MeetingStatusBadgeProps {
    status: 'YES' | 'NO';
    date: string | null;
    variant: 'last' | 'next';
}

const MeetingStatusBadge: React.FC<MeetingStatusBadgeProps> = ({ status, date, variant }) => {
    const isYes = status === 'YES';
    const label = variant === 'last' ? 'Last Meeting' : 'Next Meeting';
    const windowText = variant === 'last' ? 'Meeting done in last 7 days' : 'Meeting scheduled for next 2 weeks';

    // NO status - show warning indicator
    if (!isYes) {
        const tooltipContent = (
            <div className="flex items-start gap-2">
                <CalendarX className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-xs font-semibold mb-0.5">{label}</p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                        {variant === 'last' ? 'No meeting in last 7 days' : 'No meeting scheduled'}
                    </p>
                </div>
            </div>
        );

        return (
            <TouchTooltip content={tooltipContent} side="bottom">
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium cursor-default bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>NO</span>
                </button>
            </TouchTooltip>
        );
    }

    // YES status - show success indicator with date
    const tooltipContent = (
        <div className="flex items-start gap-2">
            <CalendarCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
                <p className="text-xs font-semibold mb-0.5">{label}</p>
                {date && (
                    <p className="text-sm font-medium">
                        {formatDateWithOrdinal(new Date(date), 'dd MMM yyyy')}
                    </p>
                )}
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                    ✓ {windowText}
                </p>
            </div>
        </div>
    );

    return (
        <TouchTooltip content={tooltipContent} side="bottom">
            <button
                type="button"
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium cursor-default bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
            >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {date ? (
                    <span>{formatDateWithOrdinal(new Date(date), 'dd MMM')}</span>
                ) : (
                    <span>YES</span>
                )}
            </button>
        </TouchTooltip>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export const ExceptionReportForCompanies: React.FC<ExceptionReportForCompaniesProps> = ({ className }) => {
    const [isMobile, setIsMobile] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([0]));

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const { data, isLoading, error } = useFrappeGetCall<UserReportGroup[]>(
        "nirmaan_crm.api.users.get__exception_data.get_company_exception_report",
        {}
    );

    const reportGroups = data?.message || [];

    const toggleGroup = (index: number) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    // Calculate summary stats
    const getTotalCompanies = () => reportGroups.reduce((sum, g) => sum + g.companies.length, 0);
    const getExceptionCount = () => reportGroups.reduce((sum, g) =>
        sum + g.companies.filter(c => c.last_meeting_status === 'NO' || c.next_meeting_status === 'NO').length, 0);

    // ─────────────────────────────────────────────────────────────────────────
    // Loading State
    // ─────────────────────────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className={cn("bg-background border border-border/60 rounded-lg p-4", className)}>
                {isMobile ? (
                    <div className="space-y-3">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
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
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error loading Exception Report</AlertTitle>
                <AlertDescription>
                    {error.message || "An unexpected error occurred while loading the report."}
                </AlertDescription>
            </Alert>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Empty State
    // ─────────────────────────────────────────────────────────────────────────

    if (reportGroups.length === 0) {
        return (
            <div className={cn("bg-card border border-border/60 rounded-lg p-8 text-center", className)}>
                <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No exception data found for Sales Users.</p>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Mobile Card Component
    // ─────────────────────────────────────────────────────────────────────────

    const MobileUserCard: React.FC<{ group: UserReportGroup; index: number }> = ({ group, index }) => {
        const isExpanded = expandedGroups.has(index);
        const exceptionsInGroup = group.companies.filter(
            c => c.last_meeting_status === 'NO' || c.next_meeting_status === 'NO'
        ).length;

        return (
            <div className="bg-card border border-border/60 rounded-lg overflow-hidden">
                {/* User Header */}
                <button
                    onClick={() => toggleGroup(index)}
                    className="w-full p-4 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-semibold text-primary">{group.user_full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                            {group.companies.length} companies
                        </span>
                        {exceptionsInGroup > 0 && (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                                {exceptionsInGroup}
                            </span>
                        )}
                    </div>
                </button>

                {/* Companies List */}
                {isExpanded && (
                    <div className="divide-y divide-border/40">
                        {group.companies.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground text-sm italic">
                                No company data found for this user.
                            </div>
                        ) : (
                            group.companies.map((company, idx) => (
                                <div key={idx} className="p-3 space-y-2">
                                    <div className="font-medium text-sm">{company.company_name}</div>
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                                Last Week
                                            </span>
                                            <MeetingStatusBadge
                                                status={company.last_meeting_status}
                                                date={company.last_meeting_date}
                                                variant="last"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1 items-end">
                                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                                Next 2 Weeks
                                            </span>
                                            <MeetingStatusBadge
                                                status={company.next_meeting_status}
                                                date={company.next_meeting_date}
                                                variant="next"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Mobile View
    // ─────────────────────────────────────────────────────────────────────────

    if (isMobile) {
        return (
            <div className={cn("space-y-3", className)}>
                {/* Summary Bar */}
                <div className="flex items-center gap-4 px-1 text-xs text-muted-foreground">
                    <span>{getTotalCompanies()} companies</span>
                    <span className="text-primary font-medium">{getExceptionCount()} exceptions</span>
                </div>

                {reportGroups.map((group, index) => (
                    <MobileUserCard key={index} group={group} index={index} />
                ))}
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Desktop View
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className={cn("bg-background border border-border/60 rounded-lg overflow-hidden", className)}>
            <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                    {/* Header */}
                    <div className="grid grid-cols-[180px,1fr,160px,160px] border-b border-border/60 bg-muted/30">
                        <div className="px-4 py-3">
                            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                User
                            </span>
                        </div>
                        <div className="px-4 py-3 border-l border-border/40">
                            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Company
                            </span>
                        </div>
                        <div className="px-4 py-3 border-l border-border/40 text-center">
                            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Last Week
                            </span>
                        </div>
                        <div className="px-4 py-3 border-l border-border/40 text-center">
                            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                Next 2 Weeks
                            </span>
                        </div>
                    </div>

                    {/* Data Rows */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {reportGroups.map((group, groupIndex) => {
                            const isExpanded = expandedGroups.has(groupIndex);
                            const exceptionsInGroup = group.companies.filter(
                                c => c.last_meeting_status === 'NO' || c.next_meeting_status === 'NO'
                            ).length;

                            return (
                                <div key={groupIndex} className="border-b border-border/40 last:border-b-0">
                                    {/* User Row (Collapsible Header) */}
                                    <button
                                        onClick={() => toggleGroup(groupIndex)}
                                        className={cn(
                                            "w-full grid grid-cols-[180px,1fr,160px,160px] items-center",
                                            "bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                                        )}
                                    >
                                        <div className="px-4 py-3 flex items-center gap-2">
                                            {isExpanded ? (
                                                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            ) : (
                                                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                            )}
                                            <span className="font-semibold text-primary truncate">
                                                {group.user_full_name}
                                            </span>
                                        </div>
                                        <div className="px-4 py-3 border-l border-border/40 text-left">
                                            <span className="text-xs text-muted-foreground">
                                                {group.companies.length} companies
                                            </span>
                                        </div>
                                        <div className="px-4 py-3 border-l border-border/40" />
                                        <div className="px-4 py-3 border-l border-border/40 flex justify-center">
                                            {exceptionsInGroup > 0 && (
                                                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                                                    {exceptionsInGroup}
                                                </span>
                                            )}
                                        </div>
                                    </button>

                                    {/* Company Rows */}
                                    {isExpanded && (
                                        <div className="bg-background">
                                            {group.companies.length === 0 ? (
                                                <div className="px-4 py-6 text-center text-muted-foreground text-sm italic">
                                                    No company data found for this user.
                                                </div>
                                            ) : (
                                                group.companies.map((company, companyIndex) => (
                                                    <div
                                                        key={companyIndex}
                                                        className={cn(
                                                            "grid grid-cols-[180px,1fr,160px,160px] items-center",
                                                            "border-t border-border/20 hover:bg-muted/10 transition-colors"
                                                        )}
                                                    >
                                                        {/* Empty user column */}
                                                        <div className="px-4 py-2.5" />

                                                        {/* Company name */}
                                                        <div className="px-4 py-2.5 border-l border-border/40">
                                                            <span className="text-sm font-medium">
                                                                {company.company_name}
                                                            </span>
                                                        </div>

                                                        {/* Last Meeting Status */}
                                                        <div className="px-4 py-2.5 border-l border-border/40 flex justify-center">
                                                            <MeetingStatusBadge
                                                                status={company.last_meeting_status}
                                                                date={company.last_meeting_date}
                                                                variant="last"
                                                            />
                                                        </div>

                                                        {/* Next Meeting Status */}
                                                        <div className="px-4 py-2.5 border-l border-border/40 flex justify-center">
                                                            <MeetingStatusBadge
                                                                status={company.next_meeting_status}
                                                                date={company.next_meeting_date}
                                                                variant="next"
                                                            />
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExceptionReportForCompanies;
