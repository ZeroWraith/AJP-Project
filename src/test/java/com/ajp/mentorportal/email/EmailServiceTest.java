package com.ajp.mentorportal.email;

import com.ajp.mentorportal.email.dto.EmailRequest;
import com.ajp.mentorportal.email.dto.EmailResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender javaMailSender;

    @Mock
    private TemplateEngine templateEngine;

    @Mock
    private MimeMessage mimeMessage;

    private EmailService emailService;

    @BeforeEach
    void setUp() throws Exception {
        lenient().when(javaMailSender.createMimeMessage()).thenReturn(mimeMessage);
        emailService = new EmailService(javaMailSender, templateEngine);
    }

    @Test
    void testSendEmailSuccess() throws Exception {
        when(templateEngine.process(eq("test-template"), any(Context.class))).thenReturn("<html>Hello</html>");
        
        CompletableFuture<EmailResponse> future = emailService.sendEmail("test@example.com", "Subject", "test-template", new Context());
        
        assertNotNull(future);
        EmailResponse response = future.join();
        
        assertTrue(response.isSuccess());
        assertEquals("test@example.com", response.getTo());
        assertEquals("Subject", response.getSubject());
        verify(javaMailSender).send(mimeMessage);
    }

    @Test
    void testSendEmailHandlesException() throws Exception {
        when(templateEngine.process(eq("test-template"), any(Context.class))).thenReturn("<html>Hello</html>");
        doThrow(new RuntimeException("SMTP error")).when(javaMailSender).send(any(MimeMessage.class));
        
        CompletableFuture<EmailResponse> future = emailService.sendEmail("test@example.com", "Subject", "test-template", new Context());
        
        assertNotNull(future);
        EmailResponse response = future.join();
        
        assertFalse(response.isSuccess());
        assertEquals("FAILED", response.getStatus());
        assertEquals("SMTP error", response.getErrorMessage());
    }

    @Test
    void testRenderTemplate() {
        when(templateEngine.process(eq("welcome"), any(Context.class))).thenReturn("<html>Welcome John</html>");
        
        String result = emailService.renderTemplate("welcome", new Context());
        
        assertEquals("<html>Welcome John</html>", result);
    }

    @Test
    void testSendBulkEmail() throws Exception {
        when(templateEngine.process(eq("bulk-template"), any(Context.class))).thenReturn("<html>Bulk</html>");
        
        var emails = java.util.List.of(
            new EmailRequest("a@test.com", "Subject 1", "bulk-template", new Context()),
            new EmailRequest("b@test.com", "Subject 2", "bulk-template", new Context())
        );
        
        CompletableFuture<java.util.List<EmailResponse>> future = emailService.sendBulkEmail(emails);
        
        assertNotNull(future);
        var responses = future.join();
        
        assertEquals(2, responses.size());
        assertTrue(responses.get(0).isSuccess());
        assertTrue(responses.get(1).isSuccess());
        verify(javaMailSender, times(2)).send(any(MimeMessage.class));
    }
}