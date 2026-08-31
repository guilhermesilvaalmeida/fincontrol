package com.fincontrol.security;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Rate limiter simples em memória, por IP, usando janela deslizante.
 * Suficiente para uma única instância. Se o backend rodar com múltiplas réplicas,
 * troque por um contador centralizado (ex.: Redis) para o limite valer globalmente.
 */
@Component
public class RateLimiter {

    private final ConcurrentHashMap<String, Deque<Instant>> hits = new ConcurrentHashMap<>();

    public boolean allow(String key, int maxAttempts, long windowSeconds) {
        Instant now = Instant.now();
        Deque<Instant> timestamps = hits.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peekFirst().isBefore(now.minusSeconds(windowSeconds))) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= maxAttempts) {
                return false;
            }

            timestamps.addLast(now);
            return true;
        }
    }
}
