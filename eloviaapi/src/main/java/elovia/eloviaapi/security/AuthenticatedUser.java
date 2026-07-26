package elovia.eloviaapi.security;

import java.util.UUID;

import elovia.eloviaapi.model.Role;

public record AuthenticatedUser(UUID id, String email, Role role) {
}
