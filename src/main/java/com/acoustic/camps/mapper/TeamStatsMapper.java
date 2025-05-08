package com.acoustic.camps.mapper;


import com.acoustic.camps.codegen.types.TeamStats;
import com.acoustic.camps.model.TeamStatsModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * MapStruct mapper for converting between model TeamStats entities and generated DTO objects
 */
@Mapper(componentModel = "spring",
        uses = {CommonTypeMapper.class, TeamMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TeamStatsMapper {

    /**
     * Convert a model TeamStats entity to a generated TeamStats DTO
     *
     * @param teamStatsModel The model entity
     * @return The generated DTO
     */
    @Mapping(target = "id", source = "id")
    @Mapping(target = "team", source = "team", qualifiedByName = "teamToTeamMinimal")
    @Mapping(target = "recordDate", source = "recordDate")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "averageRating", source = "averageRating")
    @Mapping(target = "previousAverageRating", source = "previousAverageRating")
    @Mapping(target = "employeeCount", source = "employeeCount")
    @Mapping(target = "createdAt", source = "createdAt")
    TeamStats toDTO(TeamStatsModel teamStatsModel);

    /**
     * Convert a generated TeamStats DTO to a model TeamStats entity
     *
     * @param teamStatsDTO The generated DTO
     * @return The model entity
     */
    @Mapping(target = "id", source = "id")
    @Mapping(target = "team", source = "team", qualifiedByName = "teamDTOToTeamMinimal")
    @Mapping(target = "recordDate", source = "recordDate")
    @Mapping(target = "category", source = "category")
    @Mapping(target = "averageRating", source = "averageRating")
    @Mapping(target = "previousAverageRating", source = "previousAverageRating")
    @Mapping(target = "employeeCount", source = "employeeCount")
    @Mapping(target = "createdAt", source = "createdAt")
    TeamStatsModel toEntity(TeamStats teamStatsDTO);

    /**
     * Convert a list of model TeamStats entities to a list of generated TeamStats DTOs
     *
     * @param teamStatsModelList List of model entities
     * @return List of generated DTOs
     */
    List<TeamStats> toDTOList(List<TeamStatsModel> teamStatsModelList);

    /**
     * Convert a list of generated TeamStats DTOs to a list of model TeamStats entities
     *
     * @param teamStatsDTOList List of generated DTOs
     * @return List of model entities
     */
    List<TeamStatsModel> toEntityList(List<com.acoustic.camps.codegen.types.TeamStats> teamStatsDTOList);
}