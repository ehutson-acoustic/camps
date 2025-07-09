package com.acoustic.camps;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {"analytics.startup.calculation.enabled=false"})
class CampsApplicationTests {

	@Test
	void contextLoads() {
	}

}
