package com.acoustic.camps.service;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.codegen.types.Team;
import com.acoustic.camps.codegen.types.TeamStats;
import com.acoustic.camps.mapper.TeamStatsMapper;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.model.TeamStatsModel;
import com.acoustic.camps.repository.TeamRepository;
import com.acoustic.camps.repository.TeamStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service class for managing team statistics
 */
@Service
@RequiredArgsConstructor
public class TeamStatsService {

    private final TeamStatsRepository teamStatsRepository;
    private final TeamRepository teamRepository;
    private final TeamStatsMapper teamStatsMapper;

    /**
     * Get team statistics in DTO format for a specific team and date range
     *
     * @param teamId   Team ID
     * @param fromDate Start date (inclusive)
     * @param toDate   End date (inclusive)
     * @return List of TeamStatsDTO objects
     */
    @Transactional(readOnly = true)
    public List<TeamStats> getTeamStatsByDateRange(UUID teamId, OffsetDateTime fromDate, OffsetDateTime toDate) {
        TeamModel team = getTeamModel(teamId);

        // Fetch entities from a repository
        List<TeamStatsModel> teamStatsList = teamStatsRepository
                .findByTeamAndRecordDateBetweenOrderByRecordDateAsc(team, fromDate, toDate);

        // Convert entities to DTOs using the mapper
        return teamStatsMapper.toTeamStatsList(teamStatsList);
    }


    /**
     * Get team statistics for a specific team and category within a date range
     *
     * @param teamId   Team ID
     * @param category CAMPS category
     * @param fromDate Start date (inclusive)
     * @param toDate   End date (inclusive)
     * @return List of TeamStatsDTO objects
     */
    @Transactional(readOnly = true)
    public List<TeamStats> getTeamStatsByCategoryAndDateRange(
            UUID teamId, CampsCategory category, OffsetDateTime fromDate, OffsetDateTime toDate) {

        TeamModel team = getTeamModel(teamId);

        List<TeamStatsModel> teamStatsList = teamStatsRepository
                .findByTeamAndCategoryAndRecordDateBetweenOrderByRecordDateAsc(team, category, fromDate, toDate);

        return teamStatsMapper.toTeamStatsList(teamStatsList);
    }

    /**
     * Save team statistics from DTO
     *
     * @param teamStatsDTO DTO containing team statistics data
     * @return Saved DTO with generated ID
     */
    @Transactional
    public TeamStats saveTeamStats(TeamStats teamStatsDTO) {
        // Convert DTO to entity
        TeamStatsModel teamStats = teamStatsMapper.toTeamStatsEntity(teamStatsDTO);

        // Ensure a team exists
        if (teamStats.getTeam() == null || teamStats.getTeam().getId() == null) {
            throw new IllegalArgumentException("Team is required");
        }

        // Verify a team exists in a database
        TeamModel team = getTeamModel(teamStats.getTeam().getId());

        // Set the full team entity
        teamStats.setTeam(team);

        // If it's a new entity, generate a new ID
        if (teamStats.getId() == null) {
            teamStats.setId(UUID.randomUUID());
        }

        // Save the entity
        TeamStatsModel savedTeamStats = teamStatsRepository.save(teamStats);

        // Convert the saved entity back to DTO
        return teamStatsMapper.toTeamStats(savedTeamStats);
    }

    /**
     * Get current team averages for all CAMPS categories
     *
     * @param teamId Team ID
     * @param date   The reference date (default to current date if null)
     * @return Map of category to average rating
     */
    @Transactional(readOnly = true)
    public Map<CampsCategory, Double> getTeamAverages(UUID teamId, OffsetDateTime date) {
        TeamModel team = getTeamModel(teamId);

        if (date == null) {
            date = OffsetDateTime.now();
        }

        Map<CampsCategory, Double> averages = new EnumMap<>(CampsCategory.class);

        for (CampsCategory category : CampsCategory.values()) {
            TeamStatsModel stats = teamStatsRepository
                    .findTopByTeamAndCategoryAndRecordDateLessThanEqualOrderByRecordDateDesc(
                            team, category, date)
                    .orElse(null);

            if (stats != null) {
                averages.put(category, stats.getAverageRating());
            } else {
                averages.put(category, 0.0);
            }
        }

        return averages;
    }

    /**
     * Bulk save team statistics from DTOs
     *
     * @param teamStatsDTOList List of DTOs containing team statistics data
     * @return List of saved DTOs with generated IDs
     */
    @Transactional
    public List<TeamStats> saveAllTeamStats(List<TeamStats> teamStatsDTOList) {
        // Convert DTOs to entities
        List<TeamStatsModel> teamStatsList = teamStatsMapper.toTeamStatsEntityList(teamStatsDTOList);

        // Verify and update team references
        for (TeamStatsModel teamStats : teamStatsList) {
            if (teamStats.getTeam() == null || teamStats.getTeam().getId() == null) {
                throw new IllegalArgumentException("Team is required for all team statistics");
            }

            // Ensure the team exists
            TeamModel team = getTeamModel(teamStats.getTeam().getId());

            // Set the full team entity
            teamStats.setTeam(team);

            // Ensure ID is present
            if (teamStats.getId() == null) {
                teamStats.setId(UUID.randomUUID());
            }
        }

        // Save all entities
        List<TeamStatsModel> savedTeamStatsList = teamStatsRepository.saveAll(teamStatsList);

        // Convert saved entities back to DTOs
        return teamStatsMapper.toTeamStatsList(savedTeamStatsList);
    }

    /**
     * Find teams with the highest average in a specific category
     *
     * @param category The CAMPS category to analyze
     * @param date     The reference date (default to current date if null)
     * @return Map of team name to average rating, sorted by the highest rating first
     */
    @Transactional(readOnly = true)
    public Map<String, Double> getTeamsWithHighestAverageByCategory(CampsCategory category, OffsetDateTime date) {
        if (date == null) {
            date = OffsetDateTime.now();
        }

        List<Object[]> results = teamStatsRepository.findTeamsWithHighestAverageByCategory(category, date);

        return results.stream()
                .collect(Collectors.toMap(
                        row -> ((Team) row[0]).getName(),  // Team name
                        row -> (Double) row[1],           // Average rating
                        (a, b) -> a,                      // Keep first in case of duplicates
                        LinkedHashMap::new                // Preserve order
                ));
    }

    private TeamModel getTeamModel(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + teamId));
    }
}