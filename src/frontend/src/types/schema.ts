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
    LAST_30_DAYS = 'LAST_30_DAYS',
    LAST_90_DAYS = 'LAST_90_DAYS',
    LAST_6_MONTHS = 'LAST_6_MONTHS',
    LAST_YEAR = 'LAST_YEAR'
}

// Scalar types
export type ID = string;
export type OffsetDateTime = string;

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
    recordDate: OffsetDateTime;
    category: CampsCategory;
    averageRating: number;
    previousAverageRating?: number | null;
    employeeCount?: number | null;
    createdAt?: OffsetDateTime | null;
}

export interface TrendData {
    id: ID;
    employee?: Employee | null;
    team?: Team | null;
    recordDate: OffsetDateTime;
    category: CampsCategory;
    averageRating: number;
    monthOverMonthChange?: number | null;
    quarterOverQuarterChange?: number | null;
    yearOverYearChange?: number | null;
}

export interface CategoryAverage {
    category: CampsCategory;
    averageRating: number;
    previousAverageRating?: number | null;
    change?: number | null;
}