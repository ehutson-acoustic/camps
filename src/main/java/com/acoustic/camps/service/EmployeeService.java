package com.acoustic.camps.service;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.codegen.types.Employee;
import com.acoustic.camps.codegen.types.EngagementRating;
import com.acoustic.camps.mapper.EmployeeMapper;
import com.acoustic.camps.mapper.EngagementRatingMapper;
import com.acoustic.camps.model.EmployeeModel;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.repository.EmployeeRepository;
import com.acoustic.camps.repository.EngagementRatingRepository;
import com.acoustic.camps.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing employee data
 */
@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EngagementRatingRepository ratingRepository;
    private final TeamRepository teamRepository;
    private final EmployeeMapper mapper;
    private final EngagementRatingMapper ratingMapper;

    @Transactional(readOnly = true)
    public List<Employee> getAllEmployees() {
        return mapper.toDTOList(employeeRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<Employee> getEmployeesByTeamId(String teamId) {
        return mapper.toDTOList(employeeRepository.findByTeam(getTeamModel(UUID.fromString(teamId))));
    }

    @Transactional(readOnly = true)
    public Optional<EmployeeModel> getEmployeeModelById(UUID id) {
        return employeeRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Employee> getEmployeeById(UUID id) {
        return employeeRepository.findById(id)
                .map(mapper::toDTO);
    }

    @Transactional
    public Employee createEmployee(EmployeeModel employeeModel) {
        return mapper.toDTO(employeeRepository.save(employeeModel));
    }

    @Transactional
    public Employee updateEmployee(UUID id, EmployeeModel updatedEmployeeModel) {
        return employeeRepository.findById(id)
                .map(employee -> {
                    employee.setName(updatedEmployeeModel.getName());
                    employee.setPosition(updatedEmployeeModel.getPosition());
                    employee.setTeam(updatedEmployeeModel.getTeam());
                    employee.setDepartment(updatedEmployeeModel.getDepartment());
                    employee.setStartDate(updatedEmployeeModel.getStartDate());
                    employee.setManager(updatedEmployeeModel.getManager());
                    return mapper.toDTO(employeeRepository.save(employee));
                })
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));
    }

    @Transactional
    public void deleteEmployee(UUID id) {
        employeeRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<EngagementRating> getCurrentRatings(UUID employeeId) {
        // Get the most recent rating for each category
        return ratingMapper.toDTOList(Arrays.stream(CampsCategory.values())
                .map(category -> ratingRepository.findTopByEmployeeIdAndCategoryOrderByRatingDateDesc(employeeId, category))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .toList());
    }

    public List<Employee> getDirectReports(UUID managerId) {
        return mapper.toDTOList(employeeRepository.findByManagerId(managerId));
    }

    private TeamModel getTeamModel(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + teamId));
    }
}