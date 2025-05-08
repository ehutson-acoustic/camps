package com.acoustic.camps.graphql;

import com.acoustic.camps.codegen.types.ActionItem;
import com.acoustic.camps.codegen.types.Employee;
import com.acoustic.camps.codegen.types.EmployeeInput;
import com.acoustic.camps.codegen.types.EngagementRating;
import com.acoustic.camps.model.EmployeeModel;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.service.ActionItemService;
import com.acoustic.camps.service.EmployeeService;
import com.acoustic.camps.service.EngagementRatingService;
import com.acoustic.camps.service.TeamService;
import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsData;
import com.netflix.graphql.dgs.DgsDataFetchingEnvironment;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * GraphQL fetchers for Employee queries and mutations
 */
@DgsComponent
@RequiredArgsConstructor
public class EmployeeDataFetcher {

    private final EmployeeService employeeService;
    private final TeamService teamService;
    private final EngagementRatingService ratingService;
    private final ActionItemService actionItemService;

    @DgsQuery
    public List<Employee> employees(@InputArgument String teamId) {
        if (teamId != null && !teamId.isEmpty()) {
            return employeeService.getEmployeesByTeamId(teamId);
        }
        return employeeService.getAllEmployees();
    }

    @DgsQuery
    public Employee employee(@InputArgument String id) {
        return employeeService.getEmployeeById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));
    }

    @DgsData(parentType = "Employee", field = "currentRatings")
    public List<EngagementRating> getCurrentRatings(DgsDataFetchingEnvironment dfe) {
        Employee employee = dfe.getSource();
        assert employee != null;
        return employeeService.getCurrentRatings(UUID.fromString(employee.getId()));
    }

    @DgsData(parentType = "Employee", field = "ratingHistory")
    public List<EngagementRating> getRatingHistory(DgsDataFetchingEnvironment dfe) {
        EmployeeModel employeeModel = dfe.getSource();
        assert employeeModel != null;
        return ratingService.getRatingsByEmployeeId(employeeModel.getId());
    }

    @DgsData(parentType = "Employee", field = "actionItems")
    public List<ActionItem> getActionItems(DgsDataFetchingEnvironment dfe) {
        Employee employeeModel = dfe.getSource();
        assert employeeModel != null;
        return actionItemService.getActionItemsByEmployeeId(UUID.fromString(employeeModel.getId()));
    }

    @DgsData(parentType = "Employee", field = "directReports")
    public List<Employee> getDirectReports(DgsDataFetchingEnvironment dfe) {
        Employee manager = dfe.getSource();
        assert manager != null;
        return employeeService.getDirectReports(UUID.fromString(manager.getId()));
    }

    @DgsMutation
    public Employee createEmployee(@InputArgument EmployeeInput input) {
        return employeeService.createEmployee(getEmployeeModel(input));
    }

    @DgsMutation
    public Employee updateEmployee(@InputArgument String id, @InputArgument EmployeeInput input) {
        return employeeService.updateEmployee(UUID.fromString(id), getEmployeeModel(input));
    }

    @DgsMutation
    public Boolean deleteEmployee(@InputArgument String id) {
        try {
            employeeService.deleteEmployee(UUID.fromString(id));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private EmployeeModel getEmployeeModel(@InputArgument EmployeeInput input) {
        TeamModel teamModel = teamService.getTeamModelById(UUID.fromString(input.getTeamId()));

        EmployeeModel employeeModel = EmployeeModel.builder()
                .name(input.getName())
                .position(input.getPosition())
                .team(teamModel)
                .department(input.getDepartment())
                .startDate(input.getStartDate())
                .build();

        if (input.getManagerId() != null) {
            employeeService.getEmployeeModelById(UUID.fromString(input.getManagerId()))
                    .ifPresent(employeeModel::setManager);
        }

        return employeeModel;
    }
}