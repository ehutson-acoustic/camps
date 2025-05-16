package com.acoustic.camps.mapper;

import com.acoustic.camps.codegen.types.TrendData;
import com.acoustic.camps.model.TrendDataModel;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

/**
 * MapStruct mapper for converting between model TrendData entities and generated DTO objects
 */
@Mapper(componentModel = "spring",
        uses = {CommonTypeMapper.class, BasicEmployeeMapper.class, BasicTeamMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TrendDataMapper {

    /**
     * Convert a model TrendData entity to a generated TrendData DTO
     *
     * @param trendData The model entity
     * @return The generated DTO
     */
    TrendData toTrendData(TrendDataModel trendData);

    /**
     * Convert a generated TrendData DTO to a model TrendData entity
     *
     * @param trendDataDTO The generated DTO
     * @return The model entity
     */
    TrendDataModel toTrendDataEntity(TrendData trendDataDTO);

    /**
     * Convert a list of model TrendData entities to a list of generated TrendData DTOs
     *
     * @param trendDataList List of model entities
     * @return List of generated DTOs
     */
    List<TrendData> toTrendDataList(List<TrendDataModel> trendDataList);

    /**
     * Convert a list of generated TrendData DTOs to a list of model TrendData entities
     *
     * @param trendDataDTOList List of generated DTOs
     * @return List of model entities
     */
    List<TrendDataModel> toTrendDataEntityList(List<TrendData> trendDataDTOList);
}