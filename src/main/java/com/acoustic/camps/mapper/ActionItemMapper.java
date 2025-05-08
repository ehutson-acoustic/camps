package com.acoustic.camps.mapper;

import com.acoustic.camps.codegen.types.ActionItem;
import com.acoustic.camps.model.ActionItemModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * MapStruct mapper for converting between model ActionItem entities and generated DTO objects
 */
@Mapper(componentModel = "spring",
        uses = {CommonTypeMapper.class, EmployeeMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ActionItemMapper {

    /**
     * Convert a model ActionItem entity to a generated ActionItem DTO
     *
     * @param actionItem The model entity
     * @return The generated DTO
     */
    @Mapping(target = "id", source = "id")
    @Mapping(target = "employee", source = "employee")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "createdDate", source = "createdDate")
    @Mapping(target = "dueDate", source = "dueDate")
    @Mapping(target = "completedDate", source = "completedDate")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "outcome", source = "outcome")
    @Mapping(target = "ratingImpact", source = "ratingImpact")
    @Mapping(target = "createdBy", source = "createdBy")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    ActionItem toDTO(ActionItemModel actionItem);

    /**
     * Convert a generated ActionItem DTO to a model ActionItem entity
     *
     * @param actionItemDTO The generated DTO
     * @return The model entity
     */
    @Mapping(target = "id", source = "id")
    @Mapping(target = "employee", source = "employee")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "createdDate", source = "createdDate")
    @Mapping(target = "dueDate", source = "dueDate")
    @Mapping(target = "completedDate", source = "completedDate")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "outcome", source = "outcome")
    @Mapping(target = "ratingImpact", source = "ratingImpact")
    @Mapping(target = "createdBy", source = "createdBy")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    ActionItemModel toEntity(ActionItem actionItemDTO);

    /**
     * Convert a list of model ActionItem entities to a list of generated ActionItem DTOs
     *
     * @param actionItemList List of model entities
     * @return List of generated DTOs
     */
    List<ActionItem> toDTOList(List<ActionItemModel> actionItemList);

    /**
     * Convert a list of generated ActionItem DTOs to a list of model ActionItem entities
     *
     * @param actionItemDTOList List of generated DTOs
     * @return List of model entities
     */
    List<ActionItemModel> toEntityList(List<ActionItem> actionItemDTOList);

}