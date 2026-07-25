package elovia.eloviaapi.controller;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

	@GetMapping("/ping")
	public Map<String, Object> ping() {
		return Map.of(
				"message", "Backend Elovia funcionando",
				"timestamp", Instant.now().toString());
	}
}
