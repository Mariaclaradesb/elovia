package elovia.eloviaapi.config;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import elovia.eloviaapi.model.Aluno;
import elovia.eloviaapi.model.Role;
import elovia.eloviaapi.model.Usuario;
import elovia.eloviaapi.repository.AlunoRepository;
import elovia.eloviaapi.repository.UsuarioRepository;

@Component
public class TestDataInitializer implements ApplicationRunner {

	private final boolean testDataEnabled;
	private final String adminEmail;
	private final String adminPassword;
	private final UsuarioRepository usuarioRepository;
	private final AlunoRepository alunoRepository;
	private final PasswordEncoder passwordEncoder;

	public TestDataInitializer(
			@Value("${app.test-data.enabled:true}") boolean testDataEnabled,
			@Value("${app.admin.email:admin@elovia.test}") String adminEmail,
			@Value("${app.admin.password:Admin12345}") String adminPassword,
			UsuarioRepository usuarioRepository,
			AlunoRepository alunoRepository,
			PasswordEncoder passwordEncoder) {
		this.testDataEnabled = testDataEnabled;
		this.adminEmail = adminEmail;
		this.adminPassword = adminPassword;
		this.usuarioRepository = usuarioRepository;
		this.alunoRepository = alunoRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		if (!testDataEnabled) {
			return;
		}

		var admin = usuarioRepository.findByEmailIgnoreCase(adminEmail)
				.orElseGet(this::createAdmin);
		admin.setPrimeiroAcesso(false);

		var mediador = usuarioRepository.findByEmailIgnoreCase("mediador@elovia.test")
				.orElseGet(this::createMediador);

		if (alunoRepository.count() == 0) {
			var aluno = createAluno();
			mediador.getAlunos().add(aluno);
			aluno.getMediadores().add(mediador);
		}
	}

	private Usuario createAdmin() {
		var admin = new Usuario();
		admin.setNome("Administrador Elovia");
		admin.setCpf("00000000000");
		admin.setEmail(adminEmail);
		admin.setTelefone("00000000000");
		admin.setSenha(passwordEncoder.encode(adminPassword));
		admin.setRole(Role.ADMIN);
		admin.setPrimeiroAcesso(false);
		admin.setAtivo(true);
		admin.setEscola("Escola Demo");
		admin.setCargo("Administrador");
		return usuarioRepository.save(admin);
	}

	private Usuario createMediador() {
		var mediador = new Usuario();
		mediador.setNome("Mediador Demo");
		mediador.setCpf("11111111111");
		mediador.setEmail("mediador@elovia.test");
		mediador.setTelefone("11999999999");
		mediador.setSenha(passwordEncoder.encode("Mediador12345"));
		mediador.setRole(Role.MEDIADOR);
		mediador.setPrimeiroAcesso(true);
		mediador.setAtivo(true);
		mediador.setEscola("Escola Demo");
		mediador.setCargo("Mediador Escolar");
		mediador.setMatricula("MED-001");
		return usuarioRepository.save(mediador);
	}

	private Aluno createAluno() {
		var aluno = new Aluno();
		aluno.setNome("Aluno Demo");
		aluno.setDataNascimento(LocalDate.of(2016, 3, 12));
		aluno.setSexo("Masculino");
		aluno.setEscola("Escola Demo");
		aluno.setTurma("3 ano A");
		aluno.setTurno("Manha");
		aluno.setResponsavel("Responsavel Demo");
		aluno.setTelefoneResponsavel("11988888888");
		aluno.setEmailResponsavel("responsavel@elovia.test");
		aluno.setDiagnostico("TEA");
		aluno.setCid("F84.0");
		aluno.setNecessitaMediador(true);
		aluno.setObservacoesIniciais("Cadastro de teste criado automaticamente.");
		return alunoRepository.save(aluno);
	}
}
