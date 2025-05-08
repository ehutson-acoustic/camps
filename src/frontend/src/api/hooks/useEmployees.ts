// src/api/hooks/useEmployees.ts
import {MutationHookOptions, QueryHookOptions, useMutation, useQuery} from '@apollo/client';
import {
    CREATE_EMPLOYEE,
    CreateEmployeeData,
    CreateEmployeeVars,
    DELETE_EMPLOYEE,
    DeleteEmployeeData,
    DeleteEmployeeVars,
    GET_EMPLOYEE,
    GET_EMPLOYEES,
    GetEmployeeData,
    GetEmployeesData,
    GetEmployeesVars,
    GetEmployeeVars,
    UPDATE_EMPLOYEE,
    UpdateEmployeeData,
    UpdateEmployeeVars
} from '@/api';

// Query hooks
export const useGetEmployees = (
    options?: QueryHookOptions<GetEmployeesData, GetEmployeesVars>
) => {
    return useQuery<GetEmployeesData, GetEmployeesVars>(GET_EMPLOYEES, options);
};

export const useGetEmployee = (
    options?: QueryHookOptions<GetEmployeeData, GetEmployeeVars>
) => {
    return useQuery<GetEmployeeData, GetEmployeeVars>(GET_EMPLOYEE, options);
};

// Mutation hooks
export const useCreateEmployee = (
    options?: MutationHookOptions<CreateEmployeeData, CreateEmployeeVars>
) => {
    return useMutation<CreateEmployeeData, CreateEmployeeVars>(CREATE_EMPLOYEE, options);
};

export const useUpdateEmployee = (
    options?: MutationHookOptions<UpdateEmployeeData, UpdateEmployeeVars>
) => {
    return useMutation<UpdateEmployeeData, UpdateEmployeeVars>(UPDATE_EMPLOYEE, options);
};

export const useDeleteEmployee = (
    options?: MutationHookOptions<DeleteEmployeeData, DeleteEmployeeVars>
) => {
    return useMutation<DeleteEmployeeData, DeleteEmployeeVars>(DELETE_EMPLOYEE, options);
};