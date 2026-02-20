import hashlib
import hmac
import secrets
import time

from django.conf import settings
from django.db import models


class TOTPDevice(models.Model):
    """
    TOTP device for MFA.
    Stores the shared secret and configuration for time-based one-time passwords.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="totp_device",
    )
    secret = models.CharField(max_length=64)
    confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "accounts_totp_device"

    def __str__(self):
        status = "confirmed" if self.confirmed else "pending"
        return f"TOTP for {self.user.email} ({status})"

    @staticmethod
    def generate_secret() -> str:
        """Generate a base32-encoded random secret."""
        import base64

        random_bytes = secrets.token_bytes(20)
        return base64.b32encode(random_bytes).decode("utf-8").rstrip("=")

    def get_totp_uri(self) -> str:
        """Generate otpauth:// URI for QR code scanning."""
        import urllib.parse

        issuer = getattr(settings, "MFA_ISSUER", "VAS-DJ SaaS")
        label = urllib.parse.quote(f"{issuer}:{self.user.email}")
        params = urllib.parse.urlencode(
            {
                "secret": self.secret,
                "issuer": issuer,
                "algorithm": "SHA1",
                "digits": 6,
                "period": 30,
            }
        )
        return f"otpauth://totp/{label}?{params}"

    def verify_token(self, token: str, tolerance: int = 1) -> bool:
        """
        Verify a TOTP token.
        Args:
            token: The 6-digit TOTP code
            tolerance: Number of 30-second windows to accept (before/after current)
        """
        if not token or len(token) != 6 or not token.isdigit():
            return False

        current_time = int(time.time())
        for offset in range(-tolerance, tolerance + 1):
            expected = self._generate_totp(current_time + offset * 30)
            if hmac.compare_digest(expected, token):
                return True
        return False

    def _generate_totp(self, timestamp: int) -> str:
        """Generate TOTP value for a given timestamp."""
        import base64
        import struct

        # Decode the base32 secret (re-pad if needed)
        padded_secret = self.secret + "=" * (-len(self.secret) % 8)
        key = base64.b32decode(padded_secret, casefold=True)

        # Time step
        counter = struct.pack(">Q", timestamp // 30)

        # HMAC-SHA1
        digest = hmac.new(key, counter, hashlib.sha1).digest()

        # Dynamic truncation
        offset = digest[-1] & 0x0F
        code = struct.unpack(">I", digest[offset : offset + 4])[0]
        code = code & 0x7FFFFFFF
        code = code % 1000000

        return f"{code:06d}"


class BackupCode(models.Model):
    """One-time use backup codes for MFA recovery."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="backup_codes",
    )
    code_hash = models.CharField(max_length=128)
    used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "accounts_backup_code"

    @staticmethod
    def generate_codes(user, count: int = 10) -> list[str]:
        """Generate backup codes for a user, returning the plaintext codes."""
        from django.utils import timezone

        # Delete existing unused codes
        BackupCode.objects.filter(user=user, used=False).delete()

        codes = []
        for _ in range(count):
            code = f"{secrets.randbelow(10**8):08d}"
            code_hash = hashlib.sha256(code.encode()).hexdigest()
            BackupCode.objects.create(user=user, code_hash=code_hash)
            codes.append(f"{code[:4]}-{code[4:]}")

        return codes

    @staticmethod
    def verify_code(user, code: str) -> bool:
        """Verify and consume a backup code."""
        from django.utils import timezone

        clean_code = code.replace("-", "").replace(" ", "")
        code_hash = hashlib.sha256(clean_code.encode()).hexdigest()

        backup = BackupCode.objects.filter(
            user=user, code_hash=code_hash, used=False
        ).first()

        if backup:
            backup.used = True
            backup.used_at = timezone.now()
            backup.save(update_fields=["used", "used_at"])
            return True
        return False
