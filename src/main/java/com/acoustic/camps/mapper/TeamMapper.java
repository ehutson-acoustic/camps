package com.acoustic.camps.mapper;

import com.acoustic.camps.codegen.types.Team;
import com.acoustic.camps.model.TeamModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.Set;

/**
 * MapStruct mapper for converting between model Team entities and generated DTO objects
 */
@Mapper(componentModel = "spring",
        uses = {CommonTypeMapper.class, EmployeeMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TeamMapper {

    @Named("toTeamBasic")
    @Mapping(target = "members", ignore = true)
    Team toTeamBasic(TeamModel teamModel);

    @Named("toTeamStandard")
    @Mapping(target = "members", source = "members", qualifiedByName = "toEmployeeBasicList")
    Team toTeamStandard(TeamModel teamModel);

    @Named("toTeamDetailed")
    @Mapping(target = "members", source = "members", qualifiedByName = "toEmployeeDetailedList")
    Team toTeamDetailed(TeamModel teamModel);





    /**
     * Convert a generated Team DTO to a model Team entity
     *
     * @param team The generated DTO
     * @return The model entity
     */
    @Named("toTeamEntity")
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    // Skip circular references
    //@Mapping(target = "members", ignore = true)
    TeamModel toTeamEntity(Team team);


    /**
     * Convert a list of model Team entities to a list of generated Team DTOs
     *
     * @param teamList List of model entities
     * @return List of generated DTOs
     */
    List<Team> toTeamsList(List<TeamModel> teamList);

    /**
     * Convert a set of model Team entities to a list of generated Team DTOs
     *
     * @param teamSet Set of model entities
     * @return List of generated DTOs
     */
    List<Team> toTeamsList(Set<TeamModel> teamSet);

    /**
     * Convert a list of generated Team DTOs to a list of model Team entities
     *
     * @param teamDTOList List of generated DTOs
     * @return List of model entities
     */
    List<TeamModel> toTeamsEntityList(List<Team> teamDTOList);
}