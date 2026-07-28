package elovia.eloviaapi.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import elovia.eloviaapi.model.Usuario;

@Service
public class NotificationService {

	private static final Logger LOGGER = LoggerFactory.getLogger(NotificationService.class);
	private final ObjectProvider<JavaMailSender> mailSenderProvider;
	private final boolean emailEnabled;
	private final String sender;

	public NotificationService(
			ObjectProvider<JavaMailSender> mailSenderProvider,
			@Value("${app.email.enabled:false}") boolean emailEnabled,
			@Value("${app.email.from:no-reply@elovia.com.br}") String sender) {
		this.mailSenderProvider = mailSenderProvider;
		this.emailEnabled = emailEnabled;
		this.sender = sender;
	}

	public void sendTemporaryPassword(Usuario mediador, String senhaTemporaria) {
		var body = "Ola, " + mediador.getNome() + "!\n\n"
				+ "Seu acesso ao Elovia foi criado.\n"
				+ "Login: " + mediador.getEmail() + "\n"
				+ "Senha temporaria: " + senhaTemporaria + "\n\n"
				+ "No primeiro acesso, o aplicativo solicitara a criacao de uma nova senha.\n"
				+ "Por seguranca, nao compartilhe esses dados com outras pessoas.";
		send(mediador.getEmail(), "Seu acesso ao Elovia", body);
	}

	public void sendPasswordResetCode(Usuario usuario, String codigo, int expirationMinutes) {
		var body = "Ola, " + usuario.getNome() + "!\n\n"
				+ "Recebemos uma solicitacao para redefinir sua senha no Elovia.\n"
				+ "Codigo de verificacao: " + codigo + "\n\n"
				+ "Este codigo expira em " + expirationMinutes + " minutos e pode ser usado apenas uma vez.\n"
				+ "Se voce nao solicitou a redefinicao, ignore este e-mail.";
		send(usuario.getEmail(), "Codigo para redefinir sua senha no Elovia", body);
	}

	private void send(String recipient, String subject, String body) {
		if (!emailEnabled) {
			LOGGER.info("Envio de e-mail desativado. Mensagem '{}' destinada a {} nao foi enviada", subject, recipient);
			return;
		}

		var mailSender = mailSenderProvider.getIfAvailable();
		if (mailSender == null) {
			LOGGER.error("Envio de e-mail habilitado, mas o JavaMailSender nao esta configurado");
			return;
		}

		var message = new SimpleMailMessage();
		message.setFrom(sender);
		message.setTo(recipient);
		message.setSubject(subject);
		message.setText(body);
		try {
			mailSender.send(message);
		} catch (MailException exception) {
			LOGGER.error("Falha ao enviar e-mail '{}' para {}", subject, recipient, exception);
		}
	}
}
