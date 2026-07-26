package elovia.eloviaapi.controller;

import java.time.Instant;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

	@GetMapping("/")
	public Map<String, Object> home() {
		return Map.of(
				"app", "Elovia API",
				"status", "UP",
				"timestamp", Instant.now().toString());
	}
}
