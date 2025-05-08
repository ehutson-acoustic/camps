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
        uses = {CommonTypeMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TeamMapper {

    /**
     * Convert a model Team entity to a generated Team DTO
     *
     * @param team The model entity
     * @return The generated DTO
     */
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    // Skip circular references
    @Mapping(target = "members", ignore = true)
    Team toDTO(TeamModel team);

    /**
     * Convert a model Team entity to a generated Team DTO - minimal version
     * This method is used when we need only basic team info without circular references
     *
     * @param team The model entity
     * @return The generated DTO with minimal information
     */
    @Named("teamToTeamMinimal")
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    // Ignore all collections and additional fields
    @Mapping(target = "description", ignore = true)
    @Mapping(target = "members", ignore = true)
    Team toTeamMinimal(TeamModel team);

    /**
     * Convert a generated Team DTO to a model Team entity
     *
     * @param team The generated DTO
     * @return The model entity
     */
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    // Skip circular references
    @Mapping(target = "members", ignore = true)
    TeamModel toEntity(Team team);

    /**
     * Convert a generated Team DTO to a model Team entity - minimal version
     * This method is used when we need only basic team info without circular references
     *
     * @param team The generated DTO
     * @return The model entity with minimal information
     */
    @Named("teamDTOToTeamMinimal")
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    // Ignore all collections and additional fields
    @Mapping(target = "description", ignore = true)
    @Mapping(target = "members", ignore = true)
    TeamModel toTeamMinimal(Team team);

    /**
     * Convert a list of model Team entities to a list of generated Team DTOs
     *
     * @param teamList List of model entities
     * @return List of generated DTOs
     */
    List<Team> toDTOList(List<TeamModel> teamList);

    /**
     * Convert a set of model Team entities to a list of generated Team DTOs
     *
     * @param teamSet Set of model entities
     * @return List of generated DTOs
     */
    List<Team> toDTOList(Set<TeamModel> teamSet);

    /**
     * Convert a list of generated Team DTOs to a list of model Team entities
     *
     * @param teamDTOList List of generated DTOs
     * @return List of model entities
     */
    List<TeamModel> toEntityList(List<Team> teamDTOList);
}