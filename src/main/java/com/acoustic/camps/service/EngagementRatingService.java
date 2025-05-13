package com.acoustic.camps.service;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.codegen.types.EngagementRating;
import com.acoustic.camps.mapper.EngagementRatingMapper;
import com.acoustic.camps.model.EmployeeModel;
import com.acoustic.camps.model.EngagementRatingModel;
import com.acoustic.camps.model.TeamModel;
import com.acoustic.camps.model.TeamStatsModel;
import com.acoustic.camps.repository.EmployeeRepository;
import com.acoustic.camps.repository.EngagementRatingRepository;
import com.acoustic.camps.repository.TeamStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service for managing engagement ratings
 */
@Service
@RequiredArgsConstructor
public class EngagementRatingService {

    private final EngagementRatingRepository ratingRepository;
    private final EmployeeRepository employeeRepository;
    private final TeamStatsRepository teamStatsRepository;
    private final EngagementRatingMapper mapper;

    @Transactional(readOnly = true)
    public List<EngagementRating> getRatingsByEmployeeId(UUID employeeId) {
        return mapper.toDTOList(ratingRepository.findByEmployeeIdOrderByRatingDateDesc(employeeId));
    }

    @Transactional(readOnly = true)
    public List<EngagementRating> getRatingsByEmployeeAndCategory(UUID employeeId, CampsCategory category) {
        return mapper.toDTOList(ratingRepository.findByEmployeeIdAndCategoryOrderByRatingDateDesc(employeeId, category));
    }

    @Transactional(readOnly = true)
    public List<EngagementRating> getRatingsByDateRange(OffsetDateTime fromDate, OffsetDateTime toDate) {
        return mapper.toDTOList(ratingRepository.findByRatingDateBetweenOrderByRatingDateDesc(fromDate, toDate));
    }

    @Transactional
    public EngagementRating addRating(EngagementRating rating) {
        // This is now our only method for adding ratings
        EngagementRatingModel newRating = mapper.toEntity(rating);

        // Ensure we're creating a new record
        newRating.setId(null);

        // Save the new rating
        EngagementRatingModel savedRating = ratingRepository.save(newRating);

        // Update team statistics
        //EmployeeModel employee = employeeRepository.findById(UUID.fromString(rating.getEmployee().getId()))
        //        .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + rating.getEmployee().getId()));
        //updateTeamStats(employee.getTeam(), rating.getCategory(), rating.getRatingDate());

        return mapper.toDTO(savedRating);
    }

    /**
     * Updates the team statistics for a given category and date
     */
    private void updateTeamStats(TeamModel team, CampsCategory category, OffsetDateTime date) {
        if (team == null) {
            return;
        }

        // Get all employees in the team
        List<EmployeeModel> teamEmployeeModels = employeeRepository.findByTeam(team);

        // Get current ratings for all employees
        List<EngagementRatingModel> currentRatings = new ArrayList<>();
        for (EmployeeModel employeeModel : teamEmployeeModels) {
            ratingRepository.findTopByEmployeeIdAndCategoryAndRatingDateLessThanEqualOrderByRatingDateDesc(
                            employeeModel.getId(), category, date)
                    .ifPresent(currentRatings::add);
        }

        // Calculate average
        double averageRating = currentRatings.stream()
                .mapToInt(EngagementRatingModel::getRating)
                .average()
                .orElse(0.0);

        // Get previous stats
        TeamStatsModel previousStats = (TeamStatsModel) teamStatsRepository.findTopByTeamAndCategoryAndRecordDateLessThanOrderByRecordDateDesc(
                team, category, date).orElse(null);

        // Create new stats
        TeamStatsModel stats = TeamStatsModel.builder()
                .team(team)
                .category(category)
                .recordDate(date)
                .averageRating(averageRating)
                .previousAverageRating(previousStats != null ? previousStats.getAverageRating() : null)
                .employeeCount(currentRatings.size())
                .build();

        teamStatsRepository.save(stats);
    }
}
