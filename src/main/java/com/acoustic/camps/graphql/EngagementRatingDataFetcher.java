package com.acoustic.camps.graphql;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.codegen.types.DateRangeInput;
import com.acoustic.camps.codegen.types.Employee;
import com.acoustic.camps.codegen.types.EngagementRating;
import com.acoustic.camps.codegen.types.EngagementRatingInput;
import com.acoustic.camps.service.EmployeeService;
import com.acoustic.camps.service.EngagementRatingService;
import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import lombok.RequiredArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@DgsComponent
@RequiredArgsConstructor
public class EngagementRatingDataFetcher {

    private final EngagementRatingService ratingService;
    private final EmployeeService employeeService;

    @DgsQuery
    public List<EngagementRating> ratings(
            @InputArgument String employeeId,
            @InputArgument CampsCategory category,
            @InputArgument DateRangeInput dateRange) {

        if (employeeId != null) {
            if (category != null) {
                return ratingService.getRatingsByEmployeeAndCategory(
                        UUID.fromString(employeeId), category);
            } else {
                return ratingService.getRatingsByEmployeeId(UUID.fromString(employeeId));
            }
        }

        if (dateRange != null) {
            return ratingService.getRatingsByDateRange(dateRange.getFromDate(), dateRange.getToDate());
        }

        throw new IllegalArgumentException("At least one filter must be provided");
    }

    @DgsQuery
    public List<EngagementRating> currentRatings(@InputArgument String employeeId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Employee ID must be provided");
        }

        return employeeService.getCurrentRatings(UUID.fromString(employeeId));
    }

    @DgsMutation
    public EngagementRating createRating(@InputArgument EngagementRatingInput input) {
        Employee employee = getEmployee(input);

        EngagementRating rating = EngagementRating.newBuilder()
                .employee(employee)
                .ratingDate(input.getRatingDate())
                .category(input.getCategory())
                .rating(input.getRating())
                .previousRating(input.getPreviousRating())
                .notes(input.getNotes())
                .build();

        return ratingService.createRating(rating);
    }

    @DgsMutation
    public EngagementRating updateRating(@InputArgument String id, @InputArgument EngagementRatingInput input) {
        Employee employee = getEmployee(input);

        EngagementRating rating = EngagementRating.newBuilder()
                .employee(employee)
                .ratingDate(input.getRatingDate())
                .category(input.getCategory())
                .rating(input.getRating())
                .previousRating(input.getPreviousRating())
                .notes(input.getNotes())
                .build();

        return ratingService.updateRating(UUID.fromString(id), rating);
    }

    @DgsMutation
    public boolean deleteRating(@InputArgument String id) {
        try {
            ratingService.deleteRating(UUID.fromString(id));
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @DgsMutation
    public List<EngagementRating> createRatingsBatch(@InputArgument List<EngagementRatingInput> inputs) {
        List<EngagementRating> ratings = new ArrayList<>();

        for (EngagementRatingInput input : inputs) {
            Employee employee = getEmployee(input);

            EngagementRating rating = EngagementRating.newBuilder()
                    .employee(employee)
                    .ratingDate(input.getRatingDate())
                    .category(input.getCategory())
                    .rating(input.getRating())
                    .previousRating(input.getPreviousRating())
                    .notes(input.getNotes())
                    .build();

            ratings.add(rating);
        }

        return ratingService.createBatchRatings(ratings);
    }

    private Employee getEmployee(EngagementRatingInput input) {
        return employeeService.getEmployeeById(UUID.fromString(input.getEmployeeId()))
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
    }
}