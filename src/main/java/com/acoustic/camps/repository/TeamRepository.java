package com.acoustic.camps.repository;

import com.acoustic.camps.model.TeamModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamRepository extends JpaRepository<TeamModel, UUID> {
    /**
     * Find a team by its name
     *
     * @param name Team name
     * @return The team if found
     */
    Optional<TeamModel> findByName(String name);

    /**
     * Search for teams by name or description
     *
     * @param searchTerm Search term to match against name or description
     * @return List of matching teams
     */
    @Query("SELECT t FROM TeamModel t WHERE " +
            "LOWER(t.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(t.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<TeamModel> findByNameOrDescriptionContainingIgnoreCase(@Param("searchTerm") String searchTerm);

    /**
     * Check if a team with the given name exists
     *
     * @param name Team name
     * @return True if the team exists
     */
    boolean existsByName(String name);
}
