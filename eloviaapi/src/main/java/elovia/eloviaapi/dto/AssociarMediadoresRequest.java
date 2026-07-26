package elovia.eloviaapi.dto;

import java.util.List;
import java.util.UUID;

public record AssociarMediadoresRequest(List<UUID> mediadorIds) {
}
