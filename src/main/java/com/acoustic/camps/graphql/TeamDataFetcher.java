package com.acoustic.camps.graphql;

import com.acoustic.camps.codegen.types.Team;
import com.acoustic.camps.codegen.types.TeamInput;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.service.TeamService;
import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class TeamDataFetcher {
    private final TeamService teamService;

    @DgsQuery
    public List<Team> teams() {
        return teamService.getAllTeams();
    }

    @DgsQuery
    public Team team(@InputArgument(name = "teamId") String id) {
        return teamService.getTeamById(UUID.fromString(id))
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + id));
    }

    @DgsMutation
    public Team createTeam(@InputArgument(name = "input") TeamInput teamInput) {
        return teamService.createTeam(getTeamModel(teamInput));
    }

    @DgsMutation
    public Team updateTeam(@InputArgument(name = "id") String id, @InputArgument(name = "input") TeamInput teamInput) {
        return teamService.updateTeam(UUID.fromString(id), getTeamModel(teamInput));
    }

    @DgsMutation
    public Boolean deleteTeam(@InputArgument String id) {
        return teamService.deleteTeam(UUID.fromString(id));
    }

    private TeamModel getTeamModel(TeamInput teamInput) {
        return TeamModel.builder()
                .name(teamInput.getName())
                .description(teamInput.getDescription())
                .build();
    }
}
