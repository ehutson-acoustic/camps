package com.acoustic.camps.service;

import com.acoustic.camps.codegen.types.Team;
import com.acoustic.camps.mapper.EmployeeMapper;
import com.acoustic.camps.mapper.TeamMapper;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.repository.EmployeeRepository;
import com.acoustic.camps.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeamService {

    private static final String TEAM_NOT_FOUND_WITH_ID = "Team not found with id: ";
    private final TeamRepository teamRepository;
    private final EmployeeRepository employeeRepository;
    private final TeamMapper teamMapper;
    private final EmployeeMapper employeeMapper;

    /**
     * Get all teams
     *
     * @return List of team DTOs
     */
    @Transactional(readOnly = true)
    public List<Team> getAllTeams() {
        List<TeamModel> teams = teamRepository.findAll();
        return teamMapper.toTeamsList(teams);
    }

    /**
     * Get team by ID
     *
     * @param id Team ID
     * @return Optional containing the team DTO if found
     */
    @Transactional(readOnly = true)
    public Optional<Team> getTeamById(UUID id) {
        return teamRepository.findById(id)
                .map(teamMapper::toTeam);
    }

    /**
     * Get team by name
     *
     * @param name Team name
     * @return Optional containing the team DTO if found
     */
    @Transactional(readOnly = true)
    public Optional<Team> getTeamByName(String name) {
        return teamRepository.findByName(name)
                .map(teamMapper::toTeam);
    }

    /**
     * Create a new team
     *
     * @param team Team data
     * @return Created team DTO with generated ID
     */
    @Transactional
    public Team createTeam(TeamModel team) {
        // Check if a team with the same name already exists
        if (teamRepository.existsByName(team.getName())) {
            throw new IllegalArgumentException("Team with name '" + team.getName() + "' already exists");
        }

        team.setId(null); // Ensure we're creating a new team with generated ID
        TeamModel savedTeam = teamRepository.save(team);
        return teamMapper.toTeam(savedTeam);
    }

    /**
     * Update an existing team
     *
     * @param id   Team ID
     * @param team Updated team data
     * @return Updated team DTO
     */
    @Transactional
    public Team updateTeam(UUID id, TeamModel team) {
        return teamRepository.findById(id)
                .map(existingTeam -> {
                    // Check for name conflicts if name is changing
                    if (!existingTeam.getName().equals(team.getName()) &&
                            teamRepository.existsByName(team.getName())) {
                        throw new IllegalArgumentException("Team with name '" + team.getName() + "' already exists");
                    }

                    // Update fields
                    existingTeam.setName(team.getName());
                    existingTeam.setDescription(team.getDescription());

                    TeamModel updatedTeam = teamRepository.save(existingTeam);
                    return teamMapper.toTeam(updatedTeam);
                })
                .orElseThrow(() -> new IllegalArgumentException(TEAM_NOT_FOUND_WITH_ID + id));
    }

    /**
     * Delete a team
     *
     * @param id Team ID
     * @return true if deleted, false if not found
     */
    @Transactional
    public boolean deleteTeam(UUID id) {
        return teamRepository.findById(id)
                .map(team -> {
                    // Check if the team has members
                    long memberCount = employeeRepository.findByTeam(team).size();
                    if (memberCount > 0) {
                        throw new IllegalStateException("Cannot delete team with existing members. Team has " + memberCount + " members.");
                    }

                    teamRepository.delete(team);
                    return true;
                })
                .orElse(false);
    }

    /**
     * Search for teams by name or description
     *
     * @param searchTerm The search term
     * @return List of matching team DTOs
     */
    @Transactional(readOnly = true)
    public List<Team> searchTeams(String searchTerm) {
        List<TeamModel> teams = teamRepository.findByNameOrDescriptionContainingIgnoreCase(searchTerm);
        return teamMapper.toTeamsList(teams);
    }

    /**
     * Get a team by ID
     *
     * @param id Team ID
     * @return Team model
     */
    @Transactional(readOnly = true)
    public TeamModel getTeamModelById(UUID id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(TEAM_NOT_FOUND_WITH_ID + id));
    }
}
