package com.turnbased.server.transport;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Answers "is the server up?". Returns {"status":"ok"} with HTTP 200.
 */
@RestController
public class HealthController {

	@GetMapping("/health")
	public Map<String, String> health() {
		return Map.of("status", "ok");
	}

}
