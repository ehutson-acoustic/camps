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

import java.time.LocalDate;
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
    public List<EngagementRating> getRatingsByDateRange(LocalDate fromDate, LocalDate toDate) {
        return mapper.toDTOList(ratingRepository.findByRatingDateBetweenOrderByRatingDateDesc(fromDate, toDate));
    }

    @Transactional
    public EngagementRating createRating(EngagementRating rating) {
        // Find the previous rating to set the previousRating field
        ratingRepository.findTopByEmployeeIdAndCategoryOrderByRatingDateDesc(UUID.fromString(rating.getEmployee().getId()), rating.getCategory())
                .ifPresent(previousRating -> rating.setPreviousRating(previousRating.getRating()));

        // Save the new rating
        EngagementRatingModel savedRating = ratingRepository.save(mapper.toEntity(rating));

        // Update team statistics
        EmployeeModel employee = employeeRepository.findById(UUID.fromString(rating.getEmployee().getId()))
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + rating.getEmployee().getId()));
        updateTeamStats(employee.getTeam(), rating.getCategory(), rating.getRatingDate());

        return mapper.toDTO(savedRating);
    }

    @Transactional
    public List<EngagementRating> createBatchRatings(List<EngagementRating> ratings) {
        // Process and save each rating
        List<EngagementRating> savedRatings = new ArrayList<>();
        for (EngagementRating rating : ratings) {
            savedRatings.add(createRating(rating));
        }
        return savedRatings;
    }

    @Transactional
    public EngagementRating updateRating(UUID id, EngagementRating updatedRating) {
        return ratingRepository.findById(id)
                .map(rating -> {
                    rating.setPreviousRating(rating.getRating());
                    rating.setRating(updatedRating.getRating());
                    rating.setNotes(updatedRating.getNotes());
                    // Don't update employee, date, category, or previousRating
                    EngagementRatingModel saved = ratingRepository.save(rating);

                    // Update team statistics
                    updateTeamStats(rating.getEmployee().getTeam(), rating.getCategory(), rating.getRatingDate());

                    return mapper.toDTO(saved);
                })
                .orElseThrow(() -> new IllegalArgumentException("Rating not found with id: " + id));
    }

    @Transactional
    public void deleteRating(UUID id) {
        EngagementRatingModel rating = ratingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rating not found with id: " + id));

        ratingRepository.deleteById(id);

        // Update team statistics
        updateTeamStats(rating.getEmployee().getTeam(), rating.getCategory(), rating.getRatingDate());
    }

    /**
     * Updates the team statistics for a given category and date
     */
    private void updateTeamStats(TeamModel team, CampsCategory category, LocalDate date) {
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
