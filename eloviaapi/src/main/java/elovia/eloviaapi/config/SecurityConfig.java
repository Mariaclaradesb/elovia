package elovia.eloviaapi.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import elovia.eloviaapi.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {

	@Value("${app.cors.allowed-origin-patterns:https://snack.expo.dev,http://localhost:8081,http://localhost:19006,http://localhost:3000,https://*.vercel.app}")
	private String allowedOriginPatterns;

	@Bean
	SecurityFilterChain securityFilterChain(
			HttpSecurity http,
			JwtAuthenticationFilter jwtAuthenticationFilter,
			@Value("${app.security.enabled:true}") boolean securityEnabled)
			throws Exception {
		if (!securityEnabled) {
			return http
					.csrf(csrf -> csrf.disable())
					.cors(cors -> cors.configurationSource(corsConfigurationSource()))
					.formLogin(form -> form.disable())
					.httpBasic(basic -> basic.disable())
					.logout(logout -> logout.disable())
					.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
					.authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
					.build();
		}

		return http
				.csrf(csrf -> csrf.disable())
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))
				.formLogin(form -> form.disable())
				.httpBasic(basic -> basic.disable())
				.logout(logout -> logout.disable())
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.exceptionHandling(exception -> exception
						.authenticationEntryPoint((request, response, authException) ->
								response.sendError(HttpStatus.UNAUTHORIZED.value(), "Não autenticado"))
						.accessDeniedHandler((request, response, accessDeniedException) ->
								response.sendError(HttpStatus.FORBIDDEN.value(), "Acesso negado")))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/", "/actuator/health", "/actuator/info", "/api/test/**").permitAll()
						.requestMatchers("/api/auth/login", "/auth/login").permitAll()
						.requestMatchers("/api/auth/cadastrar-admin", "/auth/cadastrar-admin").permitAll()
						.requestMatchers(HttpMethod.POST,
								"/api/auth/esqueci-senha", "/auth/esqueci-senha",
								"/api/auth/redefinir-senha", "/auth/redefinir-senha").permitAll()
						.requestMatchers("/api/admin/**", "/admin/**").hasRole("ADMIN")
						.requestMatchers("/api/mediadores/**", "/mediadores/**").hasRole("ADMIN")
						.requestMatchers("/api/documentos/**", "/documentos/**").hasAnyRole("ADMIN", "MEDIADOR")
						.requestMatchers(HttpMethod.POST, "/api/alunos/*/portfolio/evidencias").hasRole("MEDIADOR")
						.requestMatchers(HttpMethod.PUT, "/api/portfolio/evidencias/**").hasRole("MEDIADOR")
						.requestMatchers(HttpMethod.DELETE, "/api/portfolio/evidencias/**").hasRole("MEDIADOR")
						.requestMatchers(HttpMethod.GET, "/api/portfolio/**").hasAnyRole("ADMIN", "MEDIADOR")
						.requestMatchers(HttpMethod.PUT, "/api/alunos/*/anamnese/etapas/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/alunos/*/anamnese/anexos").hasRole("ADMIN")
						.requestMatchers(HttpMethod.POST, "/api/alunos/*/anamnese/relatorio").hasAnyRole("ADMIN", "MEDIADOR")
						.requestMatchers(HttpMethod.GET, "/api/alunos/*/anamnese/**").hasAnyRole("ADMIN", "MEDIADOR")
						.requestMatchers(HttpMethod.POST, "/api/alunos", "/alunos").hasRole("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/alunos/**", "/alunos/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.PATCH, "/api/alunos/*/observacoes", "/alunos/*/observacoes").hasAnyRole("ADMIN", "MEDIADOR")
						.requestMatchers(HttpMethod.PATCH, "/api/alunos/**", "/alunos/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/alunos/**", "/alunos/**").hasRole("ADMIN")
						.requestMatchers("/api/alunos/**", "/alunos/**").hasAnyRole("ADMIN", "MEDIADOR")
						.requestMatchers(HttpMethod.POST, "/api/sessoes", "/sessoes").hasRole("MEDIADOR")
						.requestMatchers(HttpMethod.POST, "/api/observacoes", "/observacoes").hasRole("MEDIADOR")
						.requestMatchers(HttpMethod.PUT, "/api/observacoes/**", "/observacoes/**").hasRole("MEDIADOR")
						.requestMatchers(HttpMethod.DELETE, "/api/observacoes/**", "/observacoes/**").hasRole("MEDIADOR")
						.requestMatchers("/api/sessoes/**", "/sessoes/**").hasAnyRole("ADMIN", "MEDIADOR")
						.requestMatchers("/api/observacoes/**", "/observacoes/**").hasAnyRole("ADMIN", "MEDIADOR")
						.requestMatchers(
								"/api/auth/alterar-senha", "/auth/alterar-senha",
								"/api/auth/me", "/auth/me").authenticated()
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.anyRequest().authenticated())
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
				.build();
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource() {
		var config = new CorsConfiguration();
		config.setAllowedOriginPatterns(parseCsv(allowedOriginPatterns));
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));

		var source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}

	private List<String> parseCsv(String value) {
		return Arrays.stream(value.split(","))
				.map(String::trim)
				.filter(item -> !item.isBlank())
				.toList();
	}
}
