package com.ajp.mentorportal.sms;

import com.ajp.mentorportal.sms.provider.GenericSmsProvider;
import com.ajp.mentorportal.sms.provider.MockSmsProvider;
import com.ajp.mentorportal.sms.provider.TwilioSmsProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SmsServiceTest {

    @Mock
    private SmsProperties smsProperties;

    @Mock
    private MockSmsProvider mockSmsProvider;

    @Mock
    private TwilioSmsProvider twilioSmsProvider;

    @Mock
    private GenericSmsProvider genericSmsProvider;

    private Executor taskExecutor = Runnable::run; // direct execution for predictable testing

    private SmsService smsService;

    @BeforeEach
    void setUp() {
        lenient().when(mockSmsProvider.getName()).thenReturn("mock");
        lenient().when(twilioSmsProvider.getName()).thenReturn("twilio");
        lenient().when(genericSmsProvider.getName()).thenReturn("generic");
    }

    private void initializeService() {
        smsService = new SmsService(smsProperties, Arrays.asList(mockSmsProvider, twilioSmsProvider, genericSmsProvider), taskExecutor);
        smsService.init();
    }

    @Test
    void testInitResolvesTwilioProvider() {
        when(smsProperties.getProvider()).thenReturn("twilio");
        initializeService();
        
        SmsResponse expectedResponse = SmsResponse.builder().success(true).phone("123").build();
        when(twilioSmsProvider.send("123", "Hello")).thenReturn(expectedResponse);

        CompletableFuture<SmsResponse> future = smsService.sendSms("123", "Hello");
        assertNotNull(future);
        SmsResponse result = future.join();
        
        assertTrue(result.isSuccess());
        assertEquals("123", result.getPhone());
        verify(twilioSmsProvider).send("123", "Hello");
        verifyNoInteractions(mockSmsProvider, genericSmsProvider);
    }

    @Test
    void testInitResolvesGenericProvider() {
        when(smsProperties.getProvider()).thenReturn("GENERIC");
        initializeService();

        SmsResponse expectedResponse = SmsResponse.builder().success(true).phone("456").build();
        when(genericSmsProvider.send("456", "Hello")).thenReturn(expectedResponse);

        CompletableFuture<SmsResponse> future = smsService.sendSms("456", "Hello");
        assertNotNull(future);
        SmsResponse result = future.join();

        assertTrue(result.isSuccess());
        assertEquals("456", result.getPhone());
        verify(genericSmsProvider).send("456", "Hello");
        verifyNoInteractions(mockSmsProvider, twilioSmsProvider);
    }

    @Test
    void testInitFallsBackToMockProviderOnUnknown() {
        when(smsProperties.getProvider()).thenReturn("unknown-provider");
        initializeService();

        SmsResponse expectedResponse = SmsResponse.builder().success(true).phone("789").build();
        when(mockSmsProvider.send("789", "Hello")).thenReturn(expectedResponse);

        CompletableFuture<SmsResponse> future = smsService.sendSms("789", "Hello");
        assertNotNull(future);
        SmsResponse result = future.join();

        assertTrue(result.isSuccess());
        assertEquals("789", result.getPhone());
        verify(mockSmsProvider).send("789", "Hello");
        verifyNoInteractions(twilioSmsProvider, genericSmsProvider);
    }

    @Test
    void testSendSmsHandlesExceptionGracefully() {
        when(smsProperties.getProvider()).thenReturn("twilio");
        initializeService();

        when(twilioSmsProvider.send("123", "Hello")).thenThrow(new RuntimeException("API error"));

        CompletableFuture<SmsResponse> future = smsService.sendSms("123", "Hello");
        assertNotNull(future);
        SmsResponse result = future.join();

        assertFalse(result.isSuccess());
        assertEquals("123", result.getPhone());
        assertEquals("FAILED", result.getStatus());
        assertEquals("API error", result.getErrorMessage());
    }

    @Test
    void testSendBulkSmsSendsToAllRecipients() {
        when(smsProperties.getProvider()).thenReturn("mock");
        initializeService();

        List<String> phones = Arrays.asList("111", "222", "333");
        String message = "Bulk message";

        when(mockSmsProvider.send(anyString(), eq(message))).thenAnswer(invocation -> {
            String phone = invocation.getArgument(0);
            return SmsResponse.builder()
                    .phone(phone)
                    .success(true)
                    .messageId("msg-" + phone)
                    .status("SENT")
                    .build();
        });

        CompletableFuture<List<SmsResponse>> future = smsService.sendBulkSms(phones, message);
        assertNotNull(future);
        List<SmsResponse> results = future.join();

        assertEquals(3, results.size());
        for (int i = 0; i < phones.size(); i++) {
            SmsResponse res = results.get(i);
            assertEquals(phones.get(i), res.getPhone());
            assertTrue(res.isSuccess());
            assertEquals("msg-" + phones.get(i), res.getMessageId());
        }

        verify(mockSmsProvider, times(3)).send(anyString(), eq(message));
    }

    @Test
    void testSendBulkSmsHandlesPartialExceptions() {
        when(smsProperties.getProvider()).thenReturn("mock");
        initializeService();

        List<String> phones = Arrays.asList("111", "222");
        String message = "Bulk message";

        when(mockSmsProvider.send("111", message)).thenReturn(
                SmsResponse.builder().phone("111").success(true).messageId("id1").status("SENT").build()
        );
        when(mockSmsProvider.send("222", message)).thenThrow(new RuntimeException("Network down"));

        CompletableFuture<List<SmsResponse>> future = smsService.sendBulkSms(phones, message);
        assertNotNull(future);
        List<SmsResponse> results = future.join();

        assertEquals(2, results.size());
        
        SmsResponse res1 = results.stream().filter(r -> "111".equals(r.getPhone())).findFirst().orElseThrow();
        assertTrue(res1.isSuccess());
        assertEquals("id1", res1.getMessageId());

        SmsResponse res2 = results.stream().filter(r -> "222".equals(r.getPhone())).findFirst().orElseThrow();
        assertFalse(res2.isSuccess());
        assertEquals("FAILED", res2.getStatus());
        assertEquals("Network down", res2.getErrorMessage());
    }
}
