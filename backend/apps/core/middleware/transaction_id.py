import logging
import uuid

from django.utils.deprecation import MiddlewareMixin

from apps.lib.log_utils import TRANSACTION_ID_KEY, set_transaction_id


# Middleware to handle transaction IDs for logging and request tracking
# This middleware checks for an existing transaction ID in the request headers,
# generates a new one if not present, and sets it in the request context.
class TransactionIDMiddleware(MiddlewareMixin):
    """
    Middleware to add transaction ID to requests for tracking and logging.
    If X-Transaction-ID header is not present, generates a new UUID.
    Adds the transaction ID to both request object and response headers.
    """

    TRANSACTION_ID_HEADER = "X-Transaction-ID"

    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.logger = logging.getLogger(__name__)

    def process_request(self, request):
        """Add transaction ID to request object."""
        # Get transaction ID from header or generate new one
        header_key = f"HTTP_{self.TRANSACTION_ID_HEADER.upper().replace('-', '_')}"
        transaction_id = request.META.get(header_key)

        if not transaction_id:
            transaction_id = str(uuid.uuid4())
            self.logger.debug(f"Generated new transaction ID: {transaction_id}")
        else:
            self.logger.debug(f"Using existing transaction ID: {transaction_id}")

        # Set transaction ID in context variable for logging
        set_transaction_id(transaction_id)

        # Add transaction ID to request object for use in views/other middleware
        setattr(request, TRANSACTION_ID_KEY, transaction_id)

        return None

    def process_response(self, request, response):
        """Add transaction ID to response headers."""
        transaction_id = getattr(request, TRANSACTION_ID_KEY, None)

        if transaction_id:
            response[self.TRANSACTION_ID_HEADER] = transaction_id

        return response
