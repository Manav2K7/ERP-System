package com.erp.exception;

public class InvalidStatusTransitionException extends RuntimeException {
    
    public InvalidStatusTransitionException(String entity, String fromStatus, String toStatus) {
        super(String.format("Invalid status transition for %s: %s → %s", entity, fromStatus, toStatus));
    }
}
