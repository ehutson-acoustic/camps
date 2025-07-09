package com.acoustic.camps.mapper;

import com.acoustic.camps.codegen.types.TeamTrendData;
import com.acoustic.camps.codegen.types.TrendData;
import com.acoustic.camps.model.TeamTrendDataModel;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * MapStruct mapper for converting between TeamTrendDataModel entities and TrendData DTOs
 */
@Mapper(componentModel = "spring",
        uses = {CommonTypeMapper.class, BasicTeamMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TeamTrendDataMapper {

    /**
     * Convert a TeamTrendDataModel entity to a TrendData DTO
     *
     * @param trendData The model entity
     * @return The TrendData DTO
     */
    TrendData toTrendData(TeamTrendDataModel trendData);

    /**
     * Convert a list of TeamTrendDataModel entities to a list of TrendData DTOs
     *
     * @param trendDataList List of model entities
     * @return List of TrendData DTOs
     */
    List<TrendData> toTrendDataList(List<TeamTrendDataModel> trendDataList);

    /**
     * Convert a TeamTrendDataModel entity to a TeamTrendData DTO
     *
     * @param trendData The model entity
     * @return The TeamTrendData DTO
     */
    TeamTrendData toTeamTrendData(TeamTrendDataModel trendData);

    /**
     * Convert a list of TeamTrendDataModel entities to a list of TeamTrendData DTOs
     *
     * @param trendDataList List of model entities
     * @return List of TeamTrendData DTOs
     */
    List<TeamTrendData> toTeamTrendDataList(List<TeamTrendDataModel> trendDataList);
}