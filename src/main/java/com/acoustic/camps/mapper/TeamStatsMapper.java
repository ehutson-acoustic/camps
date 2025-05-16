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
    @Mapping(target = "team", source = "team", qualifiedByName = "toTeamBasic")
    TeamStats toTeamStats(TeamStatsModel teamStatsModel);

    /**
     * Convert a generated TeamStats DTO to a model TeamStats entity
     *
     * @param teamStatsDTO The generated DTO
     * @return The model entity
     */
    //@Mapping(target = "team", source = "team", qualifiedByName = "toTeamBasic")
    TeamStatsModel toTeamStatsEntity(TeamStats teamStatsDTO);

    /**
     * Convert a list of model TeamStats entities to a list of generated TeamStats DTOs
     *
     * @param teamStatsModelList List of model entities
     * @return List of generated DTOs
     */
    @Mapping(target = "team", source = "team", qualifiedByName = "toTeamBasic")
    List<TeamStats> toTeamStatsList(List<TeamStatsModel> teamStatsModelList);

    /**
     * Convert a list of generated TeamStats DTOs to a list of model TeamStats entities
     *
     * @param teamStatsDTOList List of generated DTOs
     * @return List of model entities
     */
    List<TeamStatsModel> toTeamStatsEntityList(List<com.acoustic.camps.codegen.types.TeamStats> teamStatsDTOList);
}