package com.acoustic.camps.mapper;

import com.acoustic.camps.codegen.types.Team;
import com.acoustic.camps.model.TeamModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * MapStruct mapper for converting between model Team entities and generated DTO objects
 */
@Mapper(componentModel = "spring",
        uses = {CommonTypeMapper.class, BasicEmployeeMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TeamMapper {

    Team toTeam(TeamModel teamModel);

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
    TeamModel toTeamEntity(Team team);


    /**
     * Convert a list of model Team entities to a list of generated Team DTOs
     *
     * @param teamList List of model entities
     * @return List of generated DTOs
     */
    List<Team> toTeamsList(List<TeamModel> teamList);

    /**
     * Convert a list of generated Team DTOs to a list of model Team entities
     *
     * @param teamDTOList List of generated DTOs
     * @return List of model entities
     */
    List<TeamModel> toTeamsEntityList(List<Team> teamDTOList);
}