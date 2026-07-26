package elovia.eloviaapi.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import elovia.eloviaapi.model.Usuario;

@Service
public class NotificationService {

	private static final Logger LOGGER = LoggerFactory.getLogger(NotificationService.class);

	public void sendTemporaryPassword(Usuario mediador, String senhaTemporaria) {
		LOGGER.info("Credenciais temporarias para {}: login={}, senhaTemporaria={}",
				mediador.getNome(), mediador.getEmail(), senhaTemporaria);
	}
}
