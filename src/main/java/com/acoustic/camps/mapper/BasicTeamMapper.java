package com.acoustic.camps.mapper;

import com.acoustic.camps.codegen.types.Team;
import com.acoustic.camps.model.TeamModel;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

/**
 * Mapper class for converting between {@link TeamModel} and {@link Team}.
 */
@Component
public class BasicTeamMapper {

    /**
     * Converts a {@link TeamModel} to a {@link Team}.
     *
     * @param teamModel the model to convert
     * @return the converted {@link Team}, or {@code null} if the input is {@code null}
     */
    public Team toBasicTeam(TeamModel teamModel) {
        if (teamModel == null) return null;

        Team team = new Team();
        team.setId(teamModel.getId().toString());
        team.setName(teamModel.getName());
        team.setDescription(teamModel.getDescription());
        return team;
    }

    /**
     * Converts a list of {@link TeamModel} objects to a list of {@link Team} objects.
     *
     * @param teams the list of models to convert
     * @return a list of converted {@link Team} objects, or an empty list if the input is {@code null}
     */
    public List<Team> toBasicTeamList(List<TeamModel> teams) {
        if (teams == null) return Collections.emptyList();
        return teams.stream()
                .map(this::toBasicTeam)
                .toList();
    }
}
