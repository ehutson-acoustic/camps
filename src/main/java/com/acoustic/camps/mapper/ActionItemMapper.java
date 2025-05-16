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
    @Mapping(target = "employee", source = "employee", qualifiedByName = "toEmployeeBasic")
    ActionItem toActionItem(ActionItemModel actionItem);

    /**
     * Convert a generated ActionItem DTO to a model ActionItem entity
     *
     * @param actionItemDTO The generated DTO
     * @return The model entity
     */
    @Mapping(target = "employee", source = "employee")
    ActionItemModel toActionItemEntity(ActionItem actionItemDTO);

    /**
     * Convert a list of model ActionItem entities to a list of generated ActionItem DTOs
     *
     * @param actionItemList List of model entities
     * @return List of generated DTOs
     */
    @Mapping(target = "employee", source = "employee", qualifiedByName = "toEmployeeBasic")
    List<ActionItem> toActionItemList(List<ActionItemModel> actionItemList);

    /**
     * Convert a list of generated ActionItem DTOs to a list of model ActionItem entities
     *
     * @param actionItemDTOList List of generated DTOs
     * @return List of model entities
     */
    List<ActionItemModel> toActionItemEntityList(List<ActionItem> actionItemDTOList);

}