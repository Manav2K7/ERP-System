package com.erp.exception;

public class DuplicateResourceException extends RuntimeException {
    
    public DuplicateResourceException(String resource, String field, String value) {
        super(String.format("%s with %s '%s' already exists", resource, field, value));
    }
}
