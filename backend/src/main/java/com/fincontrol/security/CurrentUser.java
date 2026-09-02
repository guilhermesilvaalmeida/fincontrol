package com.fincontrol.security;

import com.fincontrol.users.Role;

import java.util.UUID;

public record CurrentUser(UUID id, String email, Role role) {

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }
}
