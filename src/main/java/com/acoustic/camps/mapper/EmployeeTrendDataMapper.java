package com.acoustic.camps.mapper;

import com.acoustic.camps.codegen.types.EmployeeTrendData;
import com.acoustic.camps.codegen.types.TrendData;
import com.acoustic.camps.model.EmployeeTrendDataModel;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * MapStruct mapper for converting between EmployeeTrendDataModel entities and TrendData DTOs
 */
@Mapper(componentModel = "spring",
        uses = {CommonTypeMapper.class, BasicEmployeeMapper.class, BasicTeamMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EmployeeTrendDataMapper {

    /**
     * Convert an EmployeeTrendDataModel entity to a TrendData DTO
     *
     * @param trendData The model entity
     * @return The TrendData DTO
     */
    TrendData toTrendData(EmployeeTrendDataModel trendData);

    /**
     * Convert a list of EmployeeTrendDataModel entities to a list of TrendData DTOs
     *
     * @param trendDataList List of model entities
     * @return List of TrendData DTOs
     */
    List<TrendData> toTrendDataList(List<EmployeeTrendDataModel> trendDataList);

    /**
     * Convert an EmployeeTrendDataModel entity to an EmployeeTrendData DTO
     *
     * @param trendData The model entity
     * @return The EmployeeTrendData DTO
     */
    EmployeeTrendData toEmployeeTrendData(EmployeeTrendDataModel trendData);

    /**
     * Convert a list of EmployeeTrendDataModel entities to a list of EmployeeTrendData DTOs
     *
     * @param trendDataList List of model entities
     * @return List of EmployeeTrendData DTOs
     */
    List<EmployeeTrendData> toEmployeeTrendDataList(List<EmployeeTrendDataModel> trendDataList);
}