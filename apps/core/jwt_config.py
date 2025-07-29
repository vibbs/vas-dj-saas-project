from datetime import timedelta
from decouple import config


def get_jwt_settings(secret_key):
    """
    JWT configuration settings for django-rest-framework-simplejwt
    """
    return {
        "ACCESS_TOKEN_LIFETIME": timedelta(minutes=config("JWT_ACCESS_TOKEN_LIFETIME_MINUTES", default=60, cast=int)),
        "REFRESH_TOKEN_LIFETIME": timedelta(days=config("JWT_REFRESH_TOKEN_LIFETIME_DAYS", default=7, cast=int)),
        "ROTATE_REFRESH_TOKENS": config("JWT_ROTATE_REFRESH_TOKENS", default=True, cast=bool),
        "BLACKLIST_AFTER_ROTATION": config("JWT_BLACKLIST_AFTER_ROTATION", default=True, cast=bool),
        "UPDATE_LAST_LOGIN": config("JWT_UPDATE_LAST_LOGIN", default=True, cast=bool),
        "ALGORITHM": config("JWT_ALGORITHM", default="HS256"),
        "SIGNING_KEY": secret_key,
        "VERIFYING_KEY": None,
        "AUTH_HEADER_TYPES": ("Bearer",),
        "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
        "USER_ID_FIELD": "id",
        "USER_ID_CLAIM": "user_id",
        "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
        "TOKEN_TYPE_CLAIM": "token_type",
        "JTI_CLAIM": "jti",
        "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",
    }