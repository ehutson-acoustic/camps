package com.acoustic.camps.mapper;

import com.acoustic.camps.codegen.types.Employee;
import com.acoustic.camps.model.EmployeeModel;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * MapStruct mapper for converting between model Employee entities and generated DTO objects
 */
@Mapper(componentModel = "spring",
        uses = {CommonTypeMapper.class, BasicTeamMapper.class, BasicActionItemMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EmployeeMapper {

    /**
     * Convert a model Employee entity to a generated Employee DTO.
     *
     * @param employee The model entity
     * @return The generated DTO
     */
    Employee toEmployee(EmployeeModel employee);

    /**
     * Convert a generated Employee DTO to a model Employee entity
     *
     * @param employeeDTO The generated DTO
     * @return The model entity
     */
    EmployeeModel toEmployeeEntity(Employee employeeDTO);

    /**
     * Convert a list of model Employee entities to a list of generated Employee DTOs
     *
     * @param employeeList List of model entities
     * @return List of generated DTOs
     */
    List<Employee> toEmployeeList(List<EmployeeModel> employeeList);

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
