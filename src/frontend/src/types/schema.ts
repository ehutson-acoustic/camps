// Enum types
export enum CampsCategory {
    CERTAINTY = 'CERTAINTY',
    AUTONOMY = 'AUTONOMY',
    MEANING = 'MEANING',
    PROGRESS = 'PROGRESS',
    SOCIAL_INCLUSION = 'SOCIAL_INCLUSION'
}

export enum ActionStatus {
    PLANNED = 'PLANNED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum TimePeriod {
    LAST_WEEK = 'LAST_WEEK',
    LAST_2_WEEKS = 'LAST_2_WEEKS',
    LAST_4_WEEKS = 'LAST_4_WEEKS',
    LAST_30_DAYS = 'LAST_30_DAYS',
    LAST_90_DAYS = 'LAST_90_DAYS',
    LAST_6_MONTHS = 'LAST_6_MONTHS',
    LAST_YEAR = 'LAST_YEAR',
    CUSTOM_RANGE = 'CUSTOM_RANGE'
}

// Scalar types
export type ID = string;
export type OffsetDateTime = string;
export type DateTime = string;

// New enums from GraphQL schema
export enum AggregationPeriod {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    YEARLY = 'YEARLY'
}

export enum StabilityRating {
    VERY_STABLE = 'VERY_STABLE',
    STABLE = 'STABLE',
    MODERATE = 'MODERATE',
    VOLATILE = 'VOLATILE',
    VERY_VOLATILE = 'VERY_VOLATILE'
}

export enum TrendDirection {
    STRONGLY_INCREASING = 'STRONGLY_INCREASING',
    INCREASING = 'INCREASING',
    STABLE = 'STABLE',
    DECREASING = 'DECREASING',
    STRONGLY_DECREASING = 'STRONGLY_DECREASING'
}

export enum ChangeType {
    SIGNIFICANT_IMPROVEMENT = 'SIGNIFICANT_IMPROVEMENT',
    MODERATE_IMPROVEMENT = 'MODERATE_IMPROVEMENT',
    STABLE = 'STABLE',
    MODERATE_DECLINE = 'MODERATE_DECLINE',
    SIGNIFICANT_DECLINE = 'SIGNIFICANT_DECLINE'
}

// Statistical types
export interface StatisticalContext {
    sampleSize: number;
    standardDeviation?: number | null;
    variance?: number | null;
    confidenceInterval?: number | null;
    isStatisticallySignificant: boolean;
    significanceLevel?: number | null;
}

export interface RollingAverages {
    fourWeekAverage?: number | null;
    twelveWeekAverage?: number | null;
    sixMonthAverage?: number | null;
}

export interface VolatilityIndicators {
    volatilityScore: number;
    stabilityRating: StabilityRating;
    trendDirection: TrendDirection;
    seasonalityDetected: boolean;
}

export interface Team {
    id: ID;
    name: string;
    description: string | null;
    members: Employee[] | null;
}

// Input types

export interface EmployeeInput {
    name: string;
    position?: string | null;
    teamId?: ID | null;
    department?: string | null;
    startDate?: OffsetDateTime | null;
    managerId?: ID | null;
}

export interface TeamInput {
    name: string;
    description: string;
}

export interface EngagementRatingInput {
    employeeId: ID;
    ratingDate: OffsetDateTime;
    category: CampsCategory;
    rating: number;
    notes?: string | null;
}

export interface ActionItemInput {
    employeeId: ID;
    category?: CampsCategory | null;
    description: string;
    createdDate: OffsetDateTime;
    dueDate?: OffsetDateTime | null;
    status: ActionStatus;
}

export interface DateRangeInput {
    fromDate: OffsetDateTime;
    toDate: OffsetDateTime;
}

// Entity types
export interface Employee {
    id: ID;
    name: string;
    position?: string | null;
    team?: Team | null;
    department?: string | null;
    startDate?: OffsetDateTime | null;
    manager?: Employee | null;
    directReports?: Employee[] | null;
    currentRatings?: EngagementRating[] | null;
    ratingHistory?: EngagementRating[] | null;
    actionItems?: ActionItem[] | null;
}


export interface EngagementRating {
    id: ID;
    employee: Employee;
    ratingDate: OffsetDateTime;
    category: CampsCategory;
    rating: number;
    previousRating?: number | null;
    change?: number | null;
    notes?: string | null;
    createdBy?: Employee | null;
    createdAt?: OffsetDateTime | null;
}

export interface ActionItem {
    id: ID;
    employee: Employee;
    category?: CampsCategory | null;
    description: string;
    createdDate: OffsetDateTime;
    dueDate?: OffsetDateTime | null;
    completedDate?: OffsetDateTime | null;
    status: ActionStatus;
    outcome?: string | null;
    ratingImpact?: number | null;
    createdBy?: Employee | null;
    createdAt?: OffsetDateTime | null;
    updatedAt?: OffsetDateTime | null;
}

export interface TeamStats {
    id: ID;
    team: Team;
    recordDate: DateTime;
    aggregationPeriod: AggregationPeriod;
    category: CampsCategory;
    averageRating: number;
    statisticalContext: StatisticalContext;
    weekOverWeekChange?: number | null;
    monthOverMonthChange?: number | null;
    employeeCount: number;
    participationRate: number;
    createdAt: DateTime;
}

export interface TrendData {
    id: ID;
    employee?: Employee | null;
    team?: Team | null;
    recordDate: DateTime;
    category: CampsCategory;
    averageRating: number;
    weekOverWeekChange?: number | null;
    monthOverMonthChange?: number | null;
    quarterOverQuarterChange?: number | null;
    yearOverYearChange?: number | null;
}

export interface CategoryAverage {
    category: CampsCategory;
    averageRating: number;
    previousAverageRating?: number | null;
    change?: number | null;
    weekOverWeekChange?: number | null;
    statisticalContext: StatisticalContext;
    rollingAverages?: RollingAverages | null;
    volatilityIndicators?: VolatilityIndicators | null;

}

// Enhanced trend data types
export interface EmployeeTrendData {
    id: ID;
    employee: Employee;
    recordDate: DateTime;
    aggregationPeriod: AggregationPeriod;
    category: CampsCategory;
    averageRating: number;
    weekOverWeekChange?: number | null;
    monthOverMonthChange?: number | null;
    quarterOverQuarterChange?: number | null;
    yearOverYearChange?: number | null;
    statisticalContext: StatisticalContext;
    rollingAverages?: RollingAverages | null;
    volatilityIndicators?: VolatilityIndicators | null;
    createdAt: DateTime;
    calculatedAt: DateTime;
}

export interface TeamTrendData {
    id: ID;
    team: Team;
    recordDate: DateTime;
    aggregationPeriod: AggregationPeriod;
    category: CampsCategory;
    averageRating: number;
    weekOverWeekChange?: number | null;
    monthOverMonthChange?: number | null;
    quarterOverQuarterChange?: number | null;
    yearOverYearChange?: number | null;
    statisticalContext: StatisticalContext;
    rollingAverages?: RollingAverages | null;
    volatilityIndicators?: VolatilityIndicators | null;
    participationRate: number;
    teamSize: number;
    createdAt: DateTime;
    calculatedAt: DateTime;
}

// Additional input types
export interface WeekRangeInput {
    startWeek: number;
    endWeek: number;
    year: number;
}

export interface TrendAnalysisInput {
    aggregationPeriod: AggregationPeriod;
    includeStatisticalContext?: boolean;
    includeVolatilityIndicators?: boolean;
    includeRollingAverages?: boolean;
}

// Weekly analytics types
export interface WeeklyTrendSummary {
    weekStartDate: DateTime;
    weekEndDate: DateTime;
    weekNumber: number;
    year: number;
    categoryAverages: CategoryAverage[];
    overallTeamAverage: number;
    participationRate: number;
    significantChanges: SignificantChange[];
    weekOverWeekSummary?: WeekOverWeekSummary | null;
}

export interface WeekOverWeekSummary {
    overallChange: number;
    improvingCategories: CampsCategory[];
    decliningCategories: CampsCategory[];
    stableCategories: CampsCategory[];
    significantChangesCount: number;
}

export interface SignificantChange {
    category: CampsCategory;
    changeType: ChangeType;
    changeMagnitude: number;
    previousValue: number;
    currentValue: number;
    isStatisticallySignificant: boolean;
    confidenceLevel: number;
}

export interface WeeklyAnalysisResult {
    teamId: ID;
    analysisDate: DateTime;
    weeklyTrends: WeeklyTrendSummary[];
    overallTrend: TrendDirection;
    keyInsights: string[];
    recommendedActions: string[];
    statisticalSummary: StatisticalSummary;
}

export interface StatisticalSummary {
    averageVolatility: number;
    mostStableCategory?: CampsCategory | null;
    mostVolatileCategory?: CampsCategory | null;
    overallConfidenceLevel: number;
    dataQualityScore: number;
}

export interface CalculationResult {
    success: boolean;
    message?: string | null;
    calculatedRecords?: number | null;
    errors?: string[] | null;
}