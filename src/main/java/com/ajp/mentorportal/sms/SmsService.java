package com.ajp.mentorportal.sms;

import com.ajp.mentorportal.sms.provider.SmsProvider;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmsService {

    private final SmsProperties smsProperties;
    private final List<SmsProvider> providers;
    private final Executor taskExecutor;

    private SmsProvider activeProvider;

    @PostConstruct
    public void init() {
        String configuredProvider = smsProperties.getProvider();
        if (configuredProvider == null || configuredProvider.trim().isEmpty()) {
            configuredProvider = "mock";
        }

        final String searchName = configuredProvider.trim().toLowerCase();
        activeProvider = providers.stream()
                .filter(p -> p.getName().equalsIgnoreCase(searchName))
                .findFirst()
                .orElse(null);

        if (activeProvider == null) {
            log.warn("Configured SMS provider '{}' not found. Falling back to MockSmsProvider.", configuredProvider);
            activeProvider = providers.stream()
                    .filter(p -> p.getName().equalsIgnoreCase("mock"))
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("No SmsProvider beans found, not even MockSmsProvider"));
        } else {
            log.info("Initialized SmsService with provider: {}", activeProvider.getName());
        }
    }

    /**
     * Sends an SMS message to a single phone number asynchronously.
     */
    @Async
    public CompletableFuture<SmsResponse> sendSms(String phone, String message) {
        log.debug("Async sending SMS to {}", phone);
        try {
            SmsResponse response = activeProvider.send(phone, message);
            return CompletableFuture.completedFuture(response);
        } catch (Exception e) {
            log.error("Failed to send SMS to {}", phone, e);
            return CompletableFuture.completedFuture(SmsResponse.builder()
                    .phone(phone)
                    .success(false)
                    .status("FAILED")
                    .errorMessage(e.getMessage())
                    .build());
        }
    }

    /**
     * Sends the same SMS message to multiple phone numbers concurrently and asynchronously.
     */
    @Async
    public CompletableFuture<List<SmsResponse>> sendBulkSms(List<String> phones, String message) {
        log.info("Async bulk sending SMS to {} recipients", phones.size());

        List<CompletableFuture<SmsResponse>> futures = phones.stream()
                .map(phone -> CompletableFuture.supplyAsync(() -> {
                    try {
                        return activeProvider.send(phone, message);
                    } catch (Exception e) {
                        log.error("Failed to send bulk SMS to {}", phone, e);
                        return SmsResponse.builder()
                                .phone(phone)
                                .success(false)
                                .status("FAILED")
                                .errorMessage(e.getMessage())
                                .build();
                    }
                }, taskExecutor))
                .toList();

        CompletableFuture<Void> allOf = CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));

        return allOf.thenApply(v -> futures.stream()
                .map(CompletableFuture::join)
                .toList());
    }
}
