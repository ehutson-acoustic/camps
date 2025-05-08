package com.acoustic.camps.mapper;

import com.acoustic.camps.codegen.types.Employee;
import com.acoustic.camps.model.EmployeeModel;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.Set;

/**
 * MapStruct mapper for converting between model Employee entities and generated DTO objects
 */
@Mapper(componentModel = "spring",
        uses = {CommonTypeMapper.class, TeamMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EmployeeMapper {

    /**
     * Convert a model Employee entity to a generated Employee DTO
     *
     * @param employee The model entity
     * @return The generated DTO
     */
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "position", source = "position")
    @Mapping(target = "team", source = "team", qualifiedByName = "teamToTeamMinimal")
    @Mapping(target = "department", source = "department")
    @Mapping(target = "startDate", source = "startDate")
    @Mapping(target = "manager", source = "manager")
    //@Mapping(target = "createdAt", source = "createdAt")
    //@Mapping(target = "updatedAt", source = "updatedAt")
    // Skip circular references
    //@Mapping(target = "ratings", ignore = true)
    @Mapping(target = "actionItems", ignore = true)
    Employee toDTO(EmployeeModel employee);

    /**
     * Convert a model Employee entity to a generated Employee DTO - minimal version
     * This method is used when we need only basic employee info without circular references
     *
     * @param employee The model entity
     * @return The generated DTO with minimal information
     */
    @Named("employeeToEmployeeMinimal")
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "position", source = "position")
    @Mapping(target = "team", source = "team", qualifiedByName = "teamToTeamMinimal")
    @Mapping(target = "department", source = "department")
    // Ignore all collections and circular references
    @Mapping(target = "manager", ignore = true)
    //@Mapping(target = "ratings", ignore = true)
    @Mapping(target = "actionItems", ignore = true)
    @Mapping(target = "startDate", ignore = true)
    //@Mapping(target = "createdAt", ignore = true)
    //@Mapping(target = "updatedAt", ignore = true)
    Employee toEmployeeMinimal(EmployeeModel employee);

    /**
     * Convert a generated Employee DTO to a model Employee entity
     *
     * @param employeeDTO The generated DTO
     * @return The model entity
     */
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "position", source = "position")
    @Mapping(target = "team", source = "team", qualifiedByName = "teamDTOToTeamMinimal")
    @Mapping(target = "department", source = "department")
    @Mapping(target = "startDate", source = "startDate")
    @Mapping(target = "manager", source = "manager")
    //@Mapping(target = "createdAt", source = "createdAt")
    //@Mapping(target = "updatedAt", source = "updatedAt")
    // Skip circular references
    //@Mapping(target = "ratings", ignore = true)
    @Mapping(target = "actionItems", ignore = true)
    EmployeeModel toEntity(Employee employeeDTO);

    /**
     * Convert a generated Employee DTO to a model Employee entity - minimal version
     * This method is used when we need only basic employee info without circular references
     *
     * @param employeeDTO The generated DTO
     * @return The model entity with minimal information
     */
    @Named("employeeDTOToEmployeeMinimal")
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "position", source = "position")
    @Mapping(target = "team", source = "team", qualifiedByName = "teamDTOToTeamMinimal")
    @Mapping(target = "department", source = "department")
    // Ignore all collections and circular references
    @Mapping(target = "manager", ignore = true)
    @Mapping(target = "ratings", ignore = true)
    @Mapping(target = "actionItems", ignore = true)
    @Mapping(target = "startDate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    EmployeeModel toEmployeeMinimal(Employee employeeDTO);

    /**
     * Convert a list of model Employee entities to a list of generated Employee DTOs
     *
     * @param employeeList List of model entities
     * @return List of generated DTOs
     */
    List<Employee> toDTOList(List<EmployeeModel> employeeList);

    /**
     * Convert a set of model Employee entities to a list of generated Employee DTOs
     *
     * @param employeeSet Set of model entities
     * @return List of generated DTOs
     */
    List<Employee> toDTOList(Set<EmployeeModel> employeeSet);

    /**
     * Convert a list of generated Employee DTOs to a list of model Employee entities
     *
     * @param employeeDTOList List of generated DTOs
     * @return List of model entities
     */
    List<EmployeeModel> toEntityList(List<Employee> employeeDTOList);

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