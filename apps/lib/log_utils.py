import logging
from contextvars import ContextVar


TRANSACTION_ID_KEY = "transaction_id"

_transaction_id: ContextVar[str] = ContextVar(TRANSACTION_ID_KEY, default=None)


def set_transaction_id(transaction_id: str):
    """Set transaction ID in context variable."""
    _transaction_id.set(transaction_id)


def get_transaction_id() -> str:
    """Get transaction ID from context variable."""
    return _transaction_id.get()


def clear_transaction_id():
    """Clear transaction ID from context variable."""
    _transaction_id.set(None)


class TransactionIDFilter(logging.Filter):
    """
    Logging filter to add transaction ID to log records.
    """

    def filter(self, record):
        # Get transaction ID from context variable
        transaction_id = get_transaction_id()
        record.transaction_id = transaction_id or "N/A"
        return True
