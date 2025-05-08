import {gql} from '@apollo/client';
import {Employee, EmployeeInput} from '@/types/schema.ts';
import {TEAM_FIELDS} from "@/api/operations/team";

// Fragment for common employee fields
export const EMPLOYEE_FIELDS = gql`
    fragment EmployeeFields on Employee {
        id
        name
        position
        team {
            ...TeamFields
        }
        department
        startDate
    }
    ${TEAM_FIELDS}
`;

export const EMPLOYEE_WITH_RELATIONSHIPS = gql`
    fragment EmployeeWithRelationships on Employee{
        ...EmployeeFields
        manager {
            ...EmployeeFields
        }
        directReports {
            ...EmployeeFields
        }
    }  
    ${EMPLOYEE_FIELDS}
`;

// Queries
export const GET_EMPLOYEES = gql`
    query GetEmployees($teamId: ID) {
        employees(teamId: $teamId) {
            ...EmployeeFields
        }
    }
    ${EMPLOYEE_FIELDS}
`;

export const GET_EMPLOYEE = gql`
    query GetEmployee($id: ID!) {
        employee(id: $id) {
            ...EmployeeWithRelationships
            currentRatings {
                id
                category
                rating
                ratingDate
            }
            actionItems {
                id
                description
                category
                status
                dueDate
            }
        }
    }
    ${EMPLOYEE_WITH_RELATIONSHIPS}
`;

export const CREATE_EMPLOYEE = gql`
    mutation CreateEmployee($input: EmployeeInput!) {
        createEmployee(input: $input) {
            ...EmployeeFields
        }
    }
    ${EMPLOYEE_FIELDS}
`;

export const UPDATE_EMPLOYEE = gql`
    mutation UpdateEmployee($id: ID!, $input: EmployeeInput!) {
        updateEmployee(id: $id, input: $input) {
            ...EmployeeFields
        }
    }
    ${EMPLOYEE_FIELDS}
`;

export const DELETE_EMPLOYEE = gql`
    mutation DeleteEmployee($id: ID!) {
        deleteEmployee(id: $id)
    }
`;

// Types for query results and variables
export interface GetEmployeesData {
    employees: Employee[];
}

export interface GetEmployeesVars {
    teamId?: string;
}

export interface GetEmployeeData {
    employee: Employee;
}

export interface GetEmployeeVars {
    id: string;
}

export interface CreateEmployeeData {
    createEmployee: Employee;
}

export interface CreateEmployeeVars {
    input: EmployeeInput;
}

export interface UpdateEmployeeData {
    updateEmployee: Employee;
}

export interface UpdateEmployeeVars {
    id: string;
    input: EmployeeInput;
}

export interface DeleteEmployeeData {
    deleteEmployee: boolean;
}

export interface DeleteEmployeeVars {
    id: string;
}