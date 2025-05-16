package com.acoustic.camps.mapper;

import com.acoustic.camps.codegen.types.EngagementRating;
import com.acoustic.camps.model.EngagementRatingModel;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.Set;

/**
 * MapStruct mapper for converting between model EngagementRating entities and generated DTO objects
 */
@Mapper(componentModel = "spring",
        uses = {CommonTypeMapper.class, BasicEmployeeMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EngagementRatingMapper {

    /**
     * Convert a model EngagementRating entity to a generated EngagementRating DTO
     *
     * @param engagementRating The model entity
     * @return The generated DTO
     */
    EngagementRating toEmployeeRating(EngagementRatingModel engagementRating);

    /**
     * Convert a generated EngagementRating DTO to a model EngagementRating entity
     *
     * @param engagementRatingDTO The generated DTO
     * @return The model entity
     */
    EngagementRatingModel toEngagementRatingEntity(EngagementRating engagementRatingDTO);

    /**
     * Convert a list of model EngagementRating entities to a list of generated EngagementRating DTOs
     *
     * @param engagementRatingList List of model entities
     * @return List of generated DTOs
     */
    List<EngagementRating> toEngagementRatingList(List<EngagementRatingModel> engagementRatingList);

    /**
     * Convert a set of model EngagementRating entities to a list of generated EngagementRating DTOs
     *
     * @param engagementRatingSet Set of model entities
     * @return List of generated DTOs
     */
    List<EngagementRating> toEngagementRatingList(Set<EngagementRatingModel> engagementRatingSet);

    /**
     * Convert a list of generated EngagementRating DTOs to a list of model EngagementRating entities
     *
     * @param engagementRatingDTOList List of generated DTOs
     * @return List of model entities
     */
    List<EngagementRatingModel> toEngagementRatingEntityList(List<EngagementRating> engagementRatingDTOList);
}