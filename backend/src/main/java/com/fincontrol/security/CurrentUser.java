package com.fincontrol.security;

import java.util.UUID;

public record CurrentUser(UUID id, String email) {
}
