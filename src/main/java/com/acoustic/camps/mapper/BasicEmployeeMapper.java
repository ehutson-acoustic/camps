package com.acoustic.camps.mapper;

import com.acoustic.camps.codegen.types.Employee;
import com.acoustic.camps.model.EmployeeModel;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * Mapper class for converting between {@link EmployeeModel} and {@link Employee}.
 */
@Component
public class BasicEmployeeMapper {

    /**
     * Converts an {@link EmployeeModel} to an {@link Employee}.
     *
     * @param employeeModel the model to convert
     * @return the converted {@link Employee}, or {@code null} if the input is {@code null}
     */
    public Employee toBasicEmployee(EmployeeModel employeeModel) {
        if (employeeModel == null) return null;

        Employee employee = new Employee();
        employee.setId(employeeModel.getId().toString());
        employee.setName(employeeModel.getName());
        employee.setPosition(employeeModel.getPosition());
        employee.setDepartment(employeeModel.getDepartment());
        return employee;
    }

    /**
     * Converts a list of {@link EmployeeModel} objects to a list of {@link Employee} objects.
     *
     * @param employees the list of models to convert
     * @return a list of converted {@link Employee} objects, or an empty list if the input is {@code null}
     */
    public List<Employee> toBasicEmployeeList(List<EmployeeModel> employees) {
        if (employees == null) return Collections.emptyList();
        return employees.stream()
                .map(this::toBasicEmployee)
                .toList();
    }
}
