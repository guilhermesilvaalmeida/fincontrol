package com.fincontrol.users;

import org.springframework.data.jpa.domain.Specification;

public final class UserSpecifications {

    private UserSpecifications() {
    }

    public static Specification<User> nameOrEmailContains(String query) {
        return (root, cq, cb) -> {
            if (query == null || query.isBlank()) {
                return null;
            }
            String like = "%" + query.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("email")), like)
            );
        };
    }

    public static Specification<User> hasRole(Role role) {
        return (root, cq, cb) -> role == null ? null : cb.equal(root.get("role"), role);
    }

    public static Specification<User> isActive(Boolean active) {
        return (root, cq, cb) -> active == null ? null : cb.equal(root.get("active"), active);
    }
}
