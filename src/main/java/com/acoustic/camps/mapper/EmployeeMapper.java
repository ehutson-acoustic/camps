package com.acoustic.camps.mapper;

import com.acoustic.camps.codegen.types.Employee;
import com.acoustic.camps.model.EmployeeModel;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.Collections;
import java.util.List;
import java.util.Set;

/**
 * MapStruct mapper for converting between model Employee entities and generated DTO objects
 */
@Mapper(componentModel = "spring",
        uses = {CommonTypeMapper.class, TeamMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EmployeeMapper {

    @Named("toEmployeeBasic")
    @Mapping(target = "team", ignore = true)
    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "directReports", ignore = true)
    @Mapping(target = "actionItems", ignore = true)
    @Mapping(target = "startDate", ignore = true)
    Employee toEmployeeBasic(EmployeeModel employee);

    @Named("toEmployeeStandard")
    @Mapping(target = "team", source = "team", qualifiedByName = "toTeamBasic")
    @Mapping(target = "manager", source = "manager", qualifiedByName = "toEmployeeBasic")
    //@Mapping(target = "directReports", ignore = true)
    @Mapping(target = "actionItems", ignore = true)
    Employee toEmployeeStandard(EmployeeModel employee);

    @Named("toEmployeeDetailed")
    @Mapping(target = "team", source = "team", qualifiedByName = "toTeamStandard")
    @Mapping(target = "manager", source = "manager", qualifiedByName = "toEmployeeStandard")
    //@Mapping(target = "directReports", source = "directReports", qualifiedByName = "toEmployeeBasicList")
    Employee toEmployeeDetailed(EmployeeModel employee);

    /**
     * Convert a generated Employee DTO to a model Employee entity
     *
     * @param employeeDTO The generated DTO
     * @return The model entity
     */
    @Named("toEmployeeEntity")
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "position", source = "position")
    //@Mapping(target = "team", source = "team", qualifiedByName = "toTeamBasic")
    @Mapping(target = "department", source = "department")
    @Mapping(target = "startDate", source = "startDate")
    @Mapping(target = "manager", source = "manager")
    //@Mapping(target = "createdAt", source = "createdAt")
    //@Mapping(target = "updatedAt", source = "updatedAt")
    // Skip circular references
    //@Mapping(target = "ratings", ignore = true)
    //@Mapping(target = "actionItems", ignore = true)
    EmployeeModel toEmployeeEntity(Employee employeeDTO);


    @Named("toEmployeeBasicList")
    default List<Employee> toEmployeeBasicList(List<EmployeeModel> employees) {
        if (employees == null) {
            return Collections.emptyList();
        }
        return employees.stream()
                .map(this::toEmployeeBasic)
                .toList();
    }

    @Named("toEmployeeStandardList")
    default List<Employee> toEmployeeStandardList(List<EmployeeModel> employees) {
        if (employees == null) {
            return Collections.emptyList();
        }
        return employees.stream()
                .map(this::toEmployeeStandard)
                .toList();
    }

    @Named("toEmployeeDetailedList")
    default List<Employee> toEmployeeDetailedList(List<EmployeeModel> employees) {
        if (employees == null) {
            return Collections.emptyList();
        }
        return employees.stream()
                .map(this::toEmployeeDetailed)
                .toList();
    }




    /**
     * Convert a list of model Employee entities to a list of generated Employee DTOs
     *
     * @param employeeList List of model entities
     * @return List of generated DTOs
     */
    List<Employee> toEmployeeList(List<EmployeeModel> employeeList);

    /**
     * Convert a set of model Employee entities to a list of generated Employee DTOs
     *
     * @param employeeSet Set of model entities
     * @return List of generated DTOs
     */
    List<Employee> toEmployeeList(Set<EmployeeModel> employeeSet);

    /**
     * Convert a list of generated Employee DTOs to a list of model Employee entities
     *
     * @param employeeDTOList List of generated DTOs
     * @return List of model entities
     */
    List<EmployeeModel> toEmployeeEntityList(List<Employee> employeeDTOList);

    /**
     * After mapping callback to handle self-references to avoid stack overflow
     */
    @AfterMapping
    default void handleSelfReference(@MappingTarget Employee target, EmployeeModel source) {
        if (source.getManager() != null && source.getManager().getId().equals(source.getId())) {
            target.setManager(target);
        }
    }

    /**
     * After mapping callback to handle self-references to avoid stack overflow (reverse direction)
     */
    @AfterMapping
    default void handleSelfReference(@MappingTarget EmployeeModel target, Employee source) {
        if (source.getManager() != null && source.getManager().getId().equals(source.getId())) {
            target.setManager(target);
        }
    }
}