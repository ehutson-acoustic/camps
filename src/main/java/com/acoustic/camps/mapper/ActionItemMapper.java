package com.acoustic.camps.mapper;

import com.acoustic.camps.codegen.types.ActionItem;
import com.acoustic.camps.model.ActionItemModel;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * MapStruct mapper for converting between model ActionItem entities and generated DTO objects
 */
@Mapper(componentModel = "spring",
        uses = {CommonTypeMapper.class, BasicEmployeeMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ActionItemMapper {

    /**
     * Convert a model ActionItem entity to a generated ActionItem DTO
     *
     * @param actionItem The model entity
     * @return The generated DTO
     */
    ActionItem toActionItem(ActionItemModel actionItem);

    /**
     * Convert a generated ActionItem DTO to a model ActionItem entity
     *
     * @param actionItemDTO The generated DTO
     * @return The model entity
     */
    ActionItemModel toActionItemEntity(ActionItem actionItemDTO);

    /**
     * Convert a list of model ActionItem entities to a list of generated ActionItem DTOs
     *
     * @param actionItemList List of model entities
     * @return List of generated DTOs
     */
    List<ActionItem> toActionItemList(List<ActionItemModel> actionItemList);

}