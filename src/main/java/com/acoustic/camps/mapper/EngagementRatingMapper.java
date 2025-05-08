package com.acoustic.camps.mapper;

import com.acoustic.camps.codegen.types.EngagementRating;
import com.acoustic.camps.model.EngagementRatingModel;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.Set;

/**
 * MapStruct mapper for converting between model EngagementRating entities and generated DTO objects
 */
@Mapper(componentModel = "spring",
        uses = {CommonTypeMapper.class, EmployeeMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EngagementRatingMapper {

    /**
     * Convert a model EngagementRating entity to a generated EngagementRating DTO
     *
     * @param engagementRating The model entity
     * @return The generated DTO
     */
    @Mapping(target = "id", source = "id")
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeToEmployeeMinimal")
    @Mapping(target = "ratingDate", source = "ratingDate")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "rating", source = "rating")
    @Mapping(target = "previousRating", source = "previousRating")
    @Mapping(target = "notes", source = "notes")
    @Mapping(target = "createdBy", source = "createdBy", qualifiedByName = "employeeToEmployeeMinimal")
    @Mapping(target = "createdAt", source = "createdAt")
    //@Mapping(target = "updatedAt", source = "updatedAt")
    EngagementRating toDTO(EngagementRatingModel engagementRating);

    /**
     * Convert a generated EngagementRating DTO to a model EngagementRating entity
     *
     * @param engagementRatingDTO The generated DTO
     * @return The model entity
     */
    @Mapping(target = "id", source = "id")
    @Mapping(target = "employee", source = "employee", qualifiedByName = "employeeDTOToEmployeeMinimal")
    @Mapping(target = "ratingDate", source = "ratingDate")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "rating", source = "rating")
    @Mapping(target = "previousRating", source = "previousRating")
    @Mapping(target = "notes", source = "notes")
    @Mapping(target = "createdBy", source = "createdBy", qualifiedByName = "employeeDTOToEmployeeMinimal")
    @Mapping(target = "createdAt", source = "createdAt")
    //@Mapping(target = "updatedAt", source = "updatedAt")
    EngagementRatingModel toEntity(EngagementRating engagementRatingDTO);

    /**
     * Convert a list of model EngagementRating entities to a list of generated EngagementRating DTOs
     *
     * @param engagementRatingList List of model entities
     * @return List of generated DTOs
     */
    List<EngagementRating> toDTOList(List<EngagementRatingModel> engagementRatingList);

    /**
     * Convert a set of model EngagementRating entities to a list of generated EngagementRating DTOs
     *
     * @param engagementRatingSet Set of model entities
     * @return List of generated DTOs
     */
    List<EngagementRating> toDTOList(Set<EngagementRatingModel> engagementRatingSet);

    /**
     * Convert a list of generated EngagementRating DTOs to a list of model EngagementRating entities
     *
     * @param engagementRatingDTOList List of generated DTOs
     * @return List of model entities
     */
    List<EngagementRatingModel> toEntityList(List<EngagementRating> engagementRatingDTOList);

    /**
     * Helper method to calculate rating change
     */
    @AfterMapping
    default void calculateChange(@MappingTarget EngagementRating engagementRatingDTO) {
        Integer current = engagementRatingDTO.getRating();
        Integer previous = engagementRatingDTO.getPreviousRating();

        if (current != null && previous != null) {
            engagementRatingDTO.setChange(current - previous);
        }
    }
}