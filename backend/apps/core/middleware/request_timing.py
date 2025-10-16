import logging
import time

from django.utils.deprecation import MiddlewareMixin


class RequestTimingMiddleware(MiddlewareMixin):
    """
    Middleware to track request processing time.
    Adds timing information to response headers and logs request completion.
    """

    TIMING_HEADER = "X-Response-Time"

    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.logger = logging.getLogger(__name__)

    def process_request(self, request):
        """Record the start time when request begins processing."""
        request._start_time = time.perf_counter()
        return None

    def process_response(self, request, response):
        """Calculate and add timing information to response headers."""
        if hasattr(request, "_start_time"):
            # Calculate duration in milliseconds
            duration = (time.perf_counter() - request._start_time) * 1000

            # Add timing header to response
            response[self.TIMING_HEADER] = f"{duration:.2f}ms"

            # Log request completion with timing
            if duration > 1000:  # Log requests taking more than 1 second
                self.logger.warning(
                    "Slow request: %s %s - %d %s - %.2fms",
                    request.method,
                    request.get_full_path(),
                    response.status_code,
                    response.reason_phrase,
                    duration,
                )
            elif duration > 500:  # Info log for requests over 500ms
                self.logger.info(
                    "Request: %s %s - %d %s - %.2fms",
                    request.method,
                    request.get_full_path(),
                    response.status_code,
                    response.reason_phrase,
                    duration,
                )
            else:
                self.logger.debug(
                    "Request: %s %s - %d %s - %.2fms",
                    request.method,
                    request.get_full_path(),
                    response.status_code,
                    response.reason_phrase,
                    duration,
                )

        return response

    def process_exception(self, request, exception):
        """Log timing information when exceptions occur."""
        if hasattr(request, "_start_time"):
            duration = (time.perf_counter() - request._start_time) * 1000

            self.logger.error(
                "Request failed: %s %s - %.2fms - %s",
                request.method,
                request.get_full_path(),
                duration,
                str(exception),
            )

        return None
