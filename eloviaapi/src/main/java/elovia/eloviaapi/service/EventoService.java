package elovia.eloviaapi.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import elovia.eloviaapi.dto.EventoRequest;
import elovia.eloviaapi.dto.EventoResponse;
import elovia.eloviaapi.model.EventoAcompanhamento;
import elovia.eloviaapi.repository.EventoAcompanhamentoRepository;

@Service
public class EventoService {

	private final EventoAcompanhamentoRepository eventoRepository;
	private final SessaoService sessaoService;

	public EventoService(EventoAcompanhamentoRepository eventoRepository, SessaoService sessaoService) {
		this.eventoRepository = eventoRepository;
		this.sessaoService = sessaoService;
	}

	public List<EventoResponse> findBySessao(UUID sessaoId) {
		return eventoRepository.findBySessaoIdOrderByOcorridoEmDesc(sessaoId).stream()
				.map(EventoResponse::from)
				.toList();
	}

	@Transactional
	public EventoResponse create(UUID sessaoId, EventoRequest request) {
		var evento = new EventoAcompanhamento();
		evento.setSessao(sessaoService.findEntityById(sessaoId));
		evento.setTipo(request.tipo());
		evento.setObservacoes(request.observacoes());
		return EventoResponse.from(eventoRepository.save(evento));
	}
}
