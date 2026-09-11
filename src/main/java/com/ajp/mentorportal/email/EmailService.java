package com.ajp.mentorportal.email;

import com.ajp.mentorportal.email.dto.EmailRequest;
import com.ajp.mentorportal.email.dto.EmailResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.internet.MimeMessage;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    @Async("emailExecutor")
    public CompletableFuture<EmailResponse> sendEmail(String to, String subject, String templateName, Context context) {
        log.debug("Async sending email to {}", to);
        try {
            String htmlBody = templateEngine.process(templateName, context);
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            javaMailSender.send(message);
            
            return CompletableFuture.completedFuture(EmailResponse.builder()
                    .to(to)
                    .subject(subject)
                    .success(true)
                    .status("SENT")
                    .build());
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
            return CompletableFuture.completedFuture(EmailResponse.builder()
                    .to(to)
                    .subject(subject)
                    .success(false)
                    .status("FAILED")
                    .errorMessage(e.getMessage())
                    .build());
        }
    }

    public String renderTemplate(String templateName, Context context) {
        return templateEngine.process(templateName, context);
    }

    @Async("emailExecutor")
    public CompletableFuture<List<EmailResponse>> sendBulkEmail(List<EmailRequest> emails) {
        log.info("Async bulk sending email to {} recipients", emails.size());
        
        List<CompletableFuture<EmailResponse>> futures = emails.stream()
                .map(req -> CompletableFuture.supplyAsync(() -> {
                    try {
                        String htmlBody = templateEngine.process(req.getTemplateName(), req.getContext());
                        MimeMessage message = javaMailSender.createMimeMessage();
                        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                        helper.setTo(req.getTo());
                        helper.setSubject(req.getSubject());
                        helper.setText(htmlBody, true);
                        javaMailSender.send(message);
                        
                        return EmailResponse.builder()
                                .to(req.getTo())
                                .subject(req.getSubject())
                                .success(true)
                                .status("SENT")
                                .build();
                    } catch (Exception e) {
                        log.error("Failed to send bulk email to {}", req.getTo(), e);
                        return EmailResponse.builder()
                                .to(req.getTo())
                                .subject(req.getSubject())
                                .success(false)
                                .status("FAILED")
                                .errorMessage(e.getMessage())
                                .build();
                    }
                }))
                .collect(Collectors.toList());

        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenApply(v -> futures.stream()
                        .map(CompletableFuture::join)
                        .collect(Collectors.toList()));
    }
}