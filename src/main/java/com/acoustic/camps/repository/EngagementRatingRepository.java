package com.acoustic.camps.repository;

import com.acoustic.camps.codegen.types.CampsCategory;
import com.acoustic.camps.model.EngagementRatingModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for EngagementRating entity
 */
@Repository
public interface EngagementRatingRepository extends JpaRepository<EngagementRatingModel, UUID> {

    List<EngagementRatingModel> findByEmployeeIdOrderByRatingDateDesc(UUID employeeId);

    List<EngagementRatingModel> findByEmployeeIdAndCategoryOrderByRatingDateDesc(
            UUID employeeId, CampsCategory category);

    Optional<EngagementRatingModel> findTopByEmployeeIdAndCategoryOrderByRatingDateDesc(
            UUID employeeId, CampsCategory category);

    Optional<EngagementRatingModel> findTopByEmployeeIdAndCategoryAndRatingDateLessThanEqualOrderByRatingDateDesc(
            UUID employeeId, CampsCategory category, OffsetDateTime maxDate);

    Optional<EngagementRatingModel> findTopByEmployeeIdAndCategoryAndRatingDateLessThanOrderByRatingDateDesc(
            UUID employeeId, CampsCategory category, OffsetDateTime ratingDate);

    List<EngagementRatingModel> findByRatingDateBetweenOrderByRatingDateDesc(
            OffsetDateTime fromDate, OffsetDateTime toDate);

    @Query("SELECT er FROM EngagementRatingModel er " +
            "JOIN er.employee e " +
            "WHERE e.team = :teamName AND er.category = :category AND " +
            "er.ratingDate = (SELECT MAX(er2.ratingDate) FROM EngagementRatingModel er2 " +
            "WHERE er2.employee = er.employee AND er2.category = :category AND " +
            "er2.ratingDate <= :asOfDate)")
    List<EngagementRatingModel> findCurrentTeamRatingsByCategory(
            @Param("teamName") String teamName,
            @Param("category") CampsCategory category,
            @Param("asOfDate") OffsetDateTime asOfDate);

    @Query("SELECT AVG(er.rating) FROM EngagementRatingModel er " +
            "JOIN er.employee e " +
            "WHERE e.team = :teamName AND er.category = :category AND " +
            "er.ratingDate = (SELECT MAX(er2.ratingDate) FROM EngagementRatingModel er2 " +
            "WHERE er2.employee = er.employee AND er2.category = :category AND " +
            "er2.ratingDate <= :asOfDate)")
    Double findAverageTeamRatingByCategory(
            @Param("teamName") String teamName,
            @Param("category") CampsCategory category,
            @Param("asOfDate") OffsetDateTime asOfDate);

    @Query("SELECT er FROM EngagementRatingModel er " +
            "WHERE er.employee.id = :employeeId AND er.ratingDate = :ratingDate")
    List<EngagementRatingModel> findByEmployeeIdAndRatingDate(
            @Param("employeeId") UUID employeeId,
            @Param("ratingDate") OffsetDateTime ratingDate);
}
