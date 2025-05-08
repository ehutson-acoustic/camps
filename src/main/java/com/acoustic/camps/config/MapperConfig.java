package com.acoustic.camps.config;

import com.acoustic.camps.mapper.CommonTypeMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for registering MapStruct mappers in Spring context
 */
@Configuration
public class MapperConfig {

    /**
     * Bean for common type mapper
     * This bean handles shared type conversions across multiple mappers
     *
     * @return CommonTypeMapper instance
     */
    @Bean
    public CommonTypeMapper commonTypeMapper() {
        return new CommonTypeMapper();
    }


}