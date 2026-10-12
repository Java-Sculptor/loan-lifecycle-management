package com.example.Loan_Project.Controller;

import com.example.Loan_Project.Entity.CustomerNotification;
import com.example.Loan_Project.Service.CustomerNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class CustomerNotificationController {

    private final CustomerNotificationService notificationService;

    public CustomerNotificationController(
            CustomerNotificationService notificationService) {

        this.notificationService = notificationService;
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<CustomerNotification>> getNotifications(
            @PathVariable Long customerId) {

        return ResponseEntity.ok(
                notificationService.getCustomerNotifications(customerId)
        );
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<CustomerNotification> markAsRead(
            @PathVariable Long notificationId,
            @RequestParam Long customerId) {

        return ResponseEntity.ok(
                notificationService.markAsRead(
                        customerId,
                        notificationId
                )
        );
    }
}