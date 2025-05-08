package com.acoustic.camps.repository;

import com.acoustic.camps.codegen.types.Employee;
import com.acoustic.camps.model.EmployeeModel;
import com.acoustic.camps.model.TeamModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Repository for Employee entity
 */
@Repository
public interface EmployeeRepository extends JpaRepository<EmployeeModel, UUID> {

    /**
     * Find all employees in a specific team
     *
     * @param team The team
     * @return List of employees in the team
     */
    List<EmployeeModel> findByTeam(TeamModel team);

    /**
     * Find all employees who report to a specific manager
     *
     * @param managerId The UUID of the manager
     * @return List of direct reports
     */
    List<EmployeeModel> findByManagerId(UUID managerId);

    /**
     * Search for employees by name or position within a team
     *
     * @param team       The team
     * @param searchTerm The search term to match against name or position
     * @return List of matching employees
     */
    @Query("SELECT e FROM EmployeeModel e WHERE e.team = :team AND " +
            "(LOWER(e.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(e.position) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<EmployeeModel> findByTeamAndNameContainingIgnoreCase(
            @Param("team") TeamModel team,
            @Param("searchTerm") String searchTerm);

    /**
     * Search for employees by name or position across all teams
     *
     * @param searchTerm The search term to match against name or position
     * @return List of matching employees
     */
    @Query("SELECT e FROM EmployeeModel e WHERE " +
            "LOWER(e.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(e.position) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Employee> findByNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);

    /**
     * Find employees who started after a specific date in a team
     *
     * @param team      The team
     * @param startDate The minimum start date
     * @return List of employees who joined after the specified date
     */
    List<EmployeeModel> findByTeamAndStartDateGreaterThanEqual(TeamModel team, LocalDate startDate);

    /**
     * Count employees by team
     *
     * @return List of Object[] arrays with team entity and count
     */
    @Query("SELECT e.team, COUNT(e) FROM EmployeeModel e GROUP BY e.team")
    List<Object[]> countByTeam();
}