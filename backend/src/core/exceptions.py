class DomainException(Exception):
    """Base exception for domain errors."""
    pass


class EntityNotFoundException(DomainException):
    """Raised when an entity is not found."""
    pass


class ValidationException(DomainException):
    """Raised when validation fails."""
    pass


class ExternalServiceException(Exception):
    """Raised when external service fails."""
    pass

