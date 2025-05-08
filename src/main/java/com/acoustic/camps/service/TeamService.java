package com.acoustic.camps.service;

import com.acoustic.camps.codegen.types.Employee;
import com.acoustic.camps.codegen.types.Team;
import com.acoustic.camps.mapper.EmployeeMapper;
import com.acoustic.camps.mapper.TeamMapper;
import com.acoustic.camps.model.EmployeeModel;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.repository.EmployeeRepository;
import com.acoustic.camps.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

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
        return teamMapper.toDTOList(teams);
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
                .map(teamMapper::toDTO);
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
                .map(teamMapper::toDTO);
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
        return teamMapper.toDTO(savedTeam);
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
                    return teamMapper.toDTO(updatedTeam);
                })
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + id));
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
     * Get all employees in a team
     *
     * @param teamId Team ID
     * @return List of employee DTOs
     */
    @Transactional(readOnly = true)
    public List<Employee> getTeamMembers(UUID teamId) {
        TeamModel team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + teamId));

        List<EmployeeModel> members = employeeRepository.findByTeam(team);
        return employeeMapper.toDTOList(members);
    }

    /**
     * Get employee distribution across teams
     *
     * @return Map of team name to employee count
     */
    @Transactional(readOnly = true)
    public Map<String, Long> getEmployeeDistributionByTeam() {
        List<Object[]> results = employeeRepository.countByTeam();

        return results.stream()
                .filter(row -> row[0] != null) // Filter out null teams
                .collect(Collectors.toMap(
                        row -> ((Team) row[0]).getName(), // Team name
                        row -> (Long) row[1],             // Count
                        Long::sum                   // Merge function in the case of duplicates
                ));
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
        return teamMapper.toDTOList(teams);
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
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + id));
    }
}
