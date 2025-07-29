from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from drf_spectacular.utils import extend_schema, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import serializers

from apps.accounts.models import Account
from apps.accounts.serializers import AccountSerializer
from apps.core.exceptions import (
    MissingRequiredFieldException,
    InvalidCredentialsException,
    AccountDisabledException,
    InvalidRefreshTokenException,
)


# Serializers for documentation purposes
class LoginRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(help_text="User's email address")
    password = serializers.CharField(write_only=True, help_text="User's password")


class LoginResponseSerializer(serializers.Serializer):
    access = serializers.CharField(help_text="JWT access token")
    refresh = serializers.CharField(help_text="JWT refresh token")
    user = AccountSerializer(help_text="User information")


class RefreshTokenRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField(help_text="JWT refresh token")


class RefreshTokenResponseSerializer(serializers.Serializer):
    access = serializers.CharField(help_text="New JWT access token")
    refresh = serializers.CharField(help_text="New JWT refresh token")


class LogoutRequestSerializer(serializers.Serializer):
    refresh = serializers.CharField(help_text="JWT refresh token to blacklist")


class LogoutResponseSerializer(serializers.Serializer):
    message = serializers.CharField(help_text="Success message")


class TokenVerifyResponseSerializer(serializers.Serializer):
    valid = serializers.BooleanField(help_text="Whether the token is valid")
    user = AccountSerializer(help_text="User information if token is valid", required=False)




@extend_schema(
    summary="User Login",
    description="Authenticate user with email and password, returns JWT access and refresh tokens along with user information.",
    request=LoginRequestSerializer,
    responses={
        200: LoginResponseSerializer,
    },
    examples=[
        OpenApiExample(
            "Login Request",
            summary="Example login request",
            description="Login with email and password",
            value={
                "email": "user@example.com",
                "password": "securepassword123"
            },
            request_only=True,
        ),
        OpenApiExample(
            "Login Success Response",
            summary="Successful login response",
            description="Returns JWT tokens and user information",
            value={
                "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                "user": {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "email": "user@example.com",
                    "first_name": "John",
                    "last_name": "Doe",
                    "role": "USER",
                    "is_admin": False
                }
            },
            response_only=True,
            status_codes=["200"],
        ),
    ],
    tags=["Authentication"],
)
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login endpoint that returns JWT tokens and user information
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        raise MissingRequiredFieldException(
            detail="Email and password are required",
            extra_data={"missing_fields": ["email", "password"]}
        )
    
    user = authenticate(email=email, password=password)
    
    if user is None:
        raise InvalidCredentialsException()
    
    if not user.is_active:
        raise AccountDisabledException()
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    
    # Add custom claims
    access['email'] = user.email
    access['role'] = user.role
    access['is_admin'] = user.is_admin
    access['org_id'] = str(user.organization.id) if hasattr(user, 'organization') and user.organization else None
    
    # Update last login
    update_last_login(None, user)
    
    # Serialize user data
    user_serializer = AccountSerializer(user)
    
    return Response({
        'access': str(access),
        'refresh': str(refresh),
        'user': user_serializer.data
    }, status=status.HTTP_200_OK)


@extend_schema(
    summary="Refresh JWT Token",
    description="Generate a new access token using a valid refresh token. Also returns a new refresh token if rotation is enabled.",
    request=RefreshTokenRequestSerializer,
    responses={
        200: RefreshTokenResponseSerializer,
    },
    examples=[
        OpenApiExample(
            "Refresh Token Request",
            summary="Example refresh token request",
            description="Provide refresh token to get new access token",
            value={
                "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
            },
            request_only=True,
        ),
        OpenApiExample(
            "Refresh Token Success Response",
            summary="Successful refresh response",
            description="Returns new access and refresh tokens",
            value={
                "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
            },
            response_only=True,
            status_codes=["200"],
        ),
    ],
    tags=["Authentication"],
)
@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """
    Refresh JWT token endpoint
    """
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        raise MissingRequiredFieldException(
            detail="Refresh token is required",
            extra_data={"missing_fields": ["refresh"]}
        )
    
    try:
        refresh = RefreshToken(refresh_token)
        access = refresh.access_token
        
        # Get user and add custom claims
        user = Account.objects.get(id=refresh['user_id'])
        access['email'] = user.email
        access['role'] = user.role
        access['is_admin'] = user.is_admin
        access['org_id'] = str(user.organization.id) if hasattr(user, 'organization') and user.organization else None
        
        return Response({
            'access': str(access),
            'refresh': str(refresh)
        }, status=status.HTTP_200_OK)
        
    except Exception:
        raise InvalidRefreshTokenException()


@extend_schema(
    summary="User Logout",
    description="Logout user by blacklisting the provided refresh token. This prevents the refresh token from being used again.",
    request=LogoutRequestSerializer,
    responses={
        200: LogoutResponseSerializer,
    },
    examples=[
        OpenApiExample(
            "Logout Request",
            summary="Example logout request",
            description="Provide refresh token to logout",
            value={
                "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
            },
            request_only=True,
        ),
        OpenApiExample(
            "Logout Success Response",
            summary="Successful logout response",
            description="Confirms successful logout",
            value={
                "message": "Successfully logged out"
            },
            response_only=True,
            status_codes=["200"],
        ),
    ],
    tags=["Authentication"],
)
@api_view(['POST'])
def logout(request):
    """
    Logout endpoint that blacklists the refresh token
    """
    refresh_token = request.data.get('refresh')
    
    if not refresh_token:
        raise MissingRequiredFieldException(
            detail="Refresh token is required",
            extra_data={"missing_fields": ["refresh"]}
        )
    
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response(
            {'message': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )
    except Exception:
        raise InvalidRefreshTokenException()


@extend_schema(
    summary="Verify JWT Token",
    description="Verify if the current JWT token in the Authorization header is valid and return user information. Requires 'Bearer <token>' in Authorization header.",
    request=None,
    responses={
        200: TokenVerifyResponseSerializer,
    },
    examples=[
        OpenApiExample(
            "Token Verify Success Response",
            summary="Valid token response",
            description="Returns token validity and user information",
            value={
                "valid": True,
                "user": {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "email": "user@example.com",
                    "first_name": "John",
                    "last_name": "Doe",
                    "role": "USER",
                    "is_admin": False
                }
            },
            response_only=True,
            status_codes=["200"],
        ),
        OpenApiExample(
            "Token Verify Invalid Response",
            summary="Invalid token response",
            description="Returns when token is invalid or expired",
            value={
                "valid": False,
                "error": "Token is invalid or expired"
            },
            response_only=True,
            status_codes=["401"],
        ),
    ],
    tags=["Authentication"],
)
@api_view(['GET'])
def verify_token(request):
    """
    Verify if the current JWT token is valid and return user info
    """
    if request.user.is_authenticated:
        user_serializer = AccountSerializer(request.user)
        return Response({
            'valid': True,
            'user': user_serializer.data
        }, status=status.HTTP_200_OK)
    
    return Response({
        'valid': False,
        'error': 'Token is invalid or expired'
    }, status=status.HTTP_401_UNAUTHORIZED)