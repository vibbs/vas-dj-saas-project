"""
Onboarding API Views.

DRF ViewSets and views for managing user onboarding progress
and progressive feature enablement.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model
from drf_spectacular.utils import (
    extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
)
from drf_spectacular.types import OpenApiTypes
import logging

from ..models import UserOnboardingProgress
from ..serializers import (
    UserOnboardingProgressSerializer,
    UserOnboardingProgressUpdateSerializer,
    OnboardingStageInfoSerializer
)
from ..services import OnboardingService
from ..enums import OnboardingStageTypes

User = get_user_model()
logger = logging.getLogger(__name__)


@extend_schema_view(
    list=extend_schema(
        summary="List Onboarding Progress",
        description="Retrieve onboarding progress records. Admins see all users, "
                   "organization admins see their org members, users see only their own progress.",
        tags=["Feature Flags"]
    ),
    create=extend_schema(
        summary="Create Onboarding Progress",
        description="Create a new onboarding progress record for a user. "
                   "Only administrators can create progress records.",
        tags=["Feature Flags"]
    ),
    retrieve=extend_schema(
        summary="Get Onboarding Progress Details",
        description="Retrieve detailed onboarding progress information including current stage, "
                   "completed stages, available features, and progression statistics.",
        tags=["Feature Flags"]
    ),
    update=extend_schema(
        summary="Update Onboarding Progress",
        description="Update a user's onboarding progress including stage advancement and custom data. "
                   "Uses onboarding service for proper stage transitions and feature unlocking.",
        tags=["Feature Flags"]
    ),
    partial_update=extend_schema(
        summary="Partially Update Onboarding Progress",
        description="Partially update onboarding progress fields. "
                   "Commonly used for stage advancement and custom data updates.",
        tags=["Feature Flags"]
    ),
    destroy=extend_schema(
        summary="Delete Onboarding Progress",
        description="Delete an onboarding progress record. This will reset the user's "
                   "onboarding state and may affect feature availability.",
        tags=["Feature Flags"]
    )
)
class UserOnboardingProgressViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing user onboarding progress.
    
    Provides CRUD operations for tracking and updating user onboarding
    progression through various stages. Integrates with the progressive
    feature enablement system to unlock features based on user progress.
    """
    
    queryset = UserOnboardingProgress.objects.all()
    serializer_class = UserOnboardingProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter queryset based on user permissions.
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        # Admin users can see all progress records
        if user.is_staff or user.is_superuser:
            return queryset
        
        # Organization admins can see progress for their organization members
        if hasattr(user, 'is_admin') and user.is_admin:
            user_org = user.get_primary_organization()
            if user_org:
                # Get users in the same organization
                org_users = User.objects.filter(
                    organization_memberships__organization=user_org,
                    organization_memberships__status='active'
                )
                return queryset.filter(user__in=org_users)
        
        # Regular users can only see their own progress
        return queryset.filter(user=user)
    
    def get_serializer_class(self):
        """
        Return appropriate serializer based on action.
        """
        if self.action in ['update', 'partial_update']:
            return UserOnboardingProgressUpdateSerializer
        return UserOnboardingProgressSerializer
    
    def get_permissions(self):
        """
        Set permissions based on action.
        """
        if self.action in ['create', 'destroy']:
            # Only admins can create/delete progress records
            permission_classes = [IsAdminUser]
        elif self.action in ['update', 'partial_update']:
            # Users can update their own progress, admins can update any
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def update(self, request, *args, **kwargs):
        """
        Custom update logic with onboarding service integration.
        """
        instance = self.get_object()
        
        # Check if user can update this progress
        if not (request.user.is_staff or request.user.is_superuser or 
                instance.user == request.user or 
                (hasattr(request.user, 'is_admin') and request.user.is_admin)):
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            # Use onboarding service for stage updates
            service = OnboardingService()
            
            new_stage = serializer.validated_data.get('current_stage')
            custom_data = serializer.validated_data.get('custom_data')
            
            if new_stage and new_stage != instance.current_stage:
                success = service.advance_user_stage(
                    instance.user, new_stage, custom_data
                )
                if not success:
                    return Response(
                        {'error': 'Failed to advance onboarding stage'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            elif custom_data:
                # Just update custom data
                instance.custom_data.update(custom_data)
                instance.save()
            
            # Return updated instance
            updated_instance = UserOnboardingProgress.objects.get(id=instance.id)
            response_serializer = UserOnboardingProgressSerializer(
                updated_instance, context={'request': request}
            )
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @extend_schema(
        summary="Get My Onboarding Progress",
        description="Retrieve the authenticated user's onboarding progress including current stage, "
                   "completed stages, available features, next steps, and overall completion percentage.",
        responses={
            200: UserOnboardingProgressSerializer,
            404: OpenApiExample(
                "No Progress Found",
                value={"message": "Onboarding progress created", "current_stage": "SIGNUP_COMPLETE"}
            )
        },
        tags=["Feature Flags"]
    )
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Get onboarding progress for the authenticated user.
        """
        try:
            service = OnboardingService()
            progress = service.get_or_create_progress(request.user)
            
            serializer = UserOnboardingProgressSerializer(
                progress, context={'request': request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error getting onboarding progress for user {request.user.id}: {str(e)}")
            return Response(
                {'error': 'Failed to get onboarding progress'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @extend_schema(
        summary="Auto-Progress Onboarding",
        description="Automatically advance a user to the next onboarding stage if all requirements "
                   "are met. The system evaluates current user state against stage requirements "
                   "and progresses accordingly.",
        responses={
            200: OpenApiExample(
                "Progression Success",
                value={
                    "message": "User progressed to EMAIL_VERIFIED",
                    "new_stage": "EMAIL_VERIFIED",
                    "progress": {"current_stage": "EMAIL_VERIFIED", "progress_percentage": 25}
                }
            ),
            200: OpenApiExample(
                "No Progression",
                value={
                    "message": "No progression possible at this time",
                    "current_stage": "PROFILE_SETUP"
                }
            ),
            403: OpenApiExample(
                "Permission Denied",
                value={"error": "Permission denied"}
            )
        },
        tags=["Feature Flags"]
    )
    @action(detail=True, methods=['post'])
    def auto_progress(self, request, pk=None):
        """
        Attempt to auto-progress user's onboarding.
        """
        try:
            progress = self.get_object()
            
            # Check permissions
            if not (request.user.is_staff or request.user.is_superuser or 
                    progress.user == request.user or 
                    (hasattr(request.user, 'is_admin') and request.user.is_admin)):
                return Response(
                    {'error': 'Permission denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            service = OnboardingService()
            new_stage = service.auto_progress_user(progress.user)
            
            if new_stage:
                updated_progress = UserOnboardingProgress.objects.get(id=progress.id)
                serializer = UserOnboardingProgressSerializer(
                    updated_progress, context={'request': request}
                )
                return Response({
                    'message': f'User progressed to {new_stage}',
                    'new_stage': new_stage,
                    'progress': serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'message': 'No progression possible at this time',
                    'current_stage': progress.current_stage
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error in auto-progression: {str(e)}")
            return Response(
                {'error': 'Failed to auto-progress onboarding'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @extend_schema(
        summary="Get onboarding summary for organization",
        description="Get onboarding statistics for all users in organization",
        responses={200: {'description': 'Onboarding summary'}},
        tags=["Feature Flags"]
    )
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def summary(self, request):
        """
        Get onboarding summary for the organization.
        """
        try:
            user = request.user
            
            # Get organization context
            if user.is_staff or user.is_superuser:
                # Admins can see system-wide summary
                queryset = self.get_queryset()
            else:
                # Regular users see their organization summary
                user_org = user.get_primary_organization()
                if not user_org:
                    return Response({
                        'error': 'User is not associated with an organization'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                org_users = User.objects.filter(
                    organization_memberships__organization=user_org,
                    organization_memberships__status='active'
                )
                queryset = UserOnboardingProgress.objects.filter(user__in=org_users)
            
            # Calculate statistics
            total_users = queryset.count()
            if total_users == 0:
                return Response({
                    'total_users': 0,
                    'stages': {},
                    'completion_rates': {}
                }, status=status.HTTP_200_OK)
            
            # Group by stages
            stage_counts = {}
            for stage_choice in OnboardingStageTypes.choices():
                stage = stage_choice[0]
                count = queryset.filter(current_stage=stage).count()
                stage_counts[stage] = {
                    'count': count,
                    'percentage': round((count / total_users) * 100, 2)
                }
            
            # Completion statistics
            completed_count = queryset.filter(
                current_stage=OnboardingStageTypes.ONBOARDING_COMPLETE.value
            ).count()
            
            avg_progress = queryset.aggregate(
                avg_progress=models.Avg('progress_percentage')
            )['avg_progress'] or 0
            
            return Response({
                'total_users': total_users,
                'completed_onboarding': completed_count,
                'completion_rate': round((completed_count / total_users) * 100, 2),
                'average_progress': round(avg_progress, 2),
                'stage_distribution': stage_counts
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error getting onboarding summary: {str(e)}")
            return Response(
                {'error': 'Failed to get onboarding summary'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema_view(
    post=extend_schema(
        summary="Handle Onboarding Action",
        description="Process a user action that may trigger onboarding progression. "
                   "Actions include email_verified, profile_completed, organization_created, etc. "
                   "The system evaluates the action and advances the user's onboarding stage accordingly.",
        tags=["Feature Flags"]
    )
)
class OnboardingActionView(APIView):
    """
    View for handling onboarding actions and triggers.
    
    Processes user actions that may trigger onboarding progression
    such as email verification, profile completion, team creation, etc.
    Integrates with the onboarding service to handle stage transitions.
    """
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Process Onboarding Action",
        description="Process a user action that may trigger onboarding progression. "
                   "The system maps actions to onboarding stages and advances the user accordingly.",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'action': {
                        'type': 'string',
                        'description': 'Action type that occurred',
                        'enum': [
                            'email_verified',
                            'profile_completed',
                            'organization_created',
                            'first_team_member_added',
                            'first_project_created',
                            'advanced_feature_used'
                        ]
                    },
                    'metadata': {
                        'type': 'object',
                        'description': 'Optional metadata about the action',
                        'additionalProperties': True
                    }
                },
                'required': ['action']
            }
        },
        responses={
            200: OpenApiExample(
                "Action Processed",
                value={
                    "message": "Action 'email_verified' processed successfully",
                    "action": "email_verified",
                    "progress": {
                        "current_stage": "EMAIL_VERIFIED",
                        "progress_percentage": 25
                    }
                }
            ),
            400: OpenApiExample(
                "Invalid Action",
                value={"error": "action field is required"}
            )
        },
        tags=["Feature Flags"]
    )
    def post(self, request):
        """
        Handle an onboarding action.
        """
        try:
            action = request.data.get('action')
            metadata = request.data.get('metadata', {})
            
            if not action:
                return Response(
                    {'error': 'action field is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            service = OnboardingService()
            success = service.handle_user_action(request.user, action, metadata)
            
            if success:
                # Get updated progress
                progress = service.get_or_create_progress(request.user)
                serializer = UserOnboardingProgressSerializer(
                    progress, context={'request': request}
                )
                
                return Response({
                    'message': f'Action "{action}" processed successfully',
                    'action': action,
                    'progress': serializer.data
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': f'Failed to process action "{action}"'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Error handling onboarding action: {str(e)}")
            return Response(
                {'error': 'Failed to process onboarding action'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema_view(
    get=extend_schema(
        summary="Get Onboarding Stage Information",
        description="Retrieve detailed information about onboarding stages including "
                   "requirements, unlocked features, and progression logic. "
                   "Can get info for a specific stage or all stages.",
        tags=["Feature Flags"]
    )
)
class OnboardingStageInfoView(APIView):
    """
    View for getting information about onboarding stages.
    
    Provides comprehensive details about stage requirements,
    unlocked features, progression logic, and stage descriptions
    to help understand the onboarding flow.
    """
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get Stage Information",
        description="Retrieve detailed information about onboarding stages. "
                   "If stage parameter is provided, returns info for that specific stage. "
                   "Otherwise returns information for all stages.",
        parameters=[
            OpenApiParameter(
                name='stage',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Specific onboarding stage to get information about',
                enum=[
                    'SIGNUP_COMPLETE',
                    'EMAIL_VERIFIED',
                    'PROFILE_SETUP',
                    'ORGANIZATION_CREATED',
                    'FIRST_TEAM_MEMBER',
                    'FIRST_PROJECT',
                    'ADVANCED_FEATURES',
                    'ONBOARDING_COMPLETE'
                ]
            )
        ],
        responses={
            200: OpenApiExample(
                "Single Stage Info",
                value={
                    "stage": "EMAIL_VERIFIED",
                    "description": "User has verified their email address",
                    "requirements": ["email_verified"],
                    "unlocked_features": ["basic_dashboard"]
                }
            ),
            200: OpenApiExample(
                "All Stages Info",
                value={
                    "stages": [
                        {
                            "stage": "SIGNUP_COMPLETE",
                            "description": "User has completed registration",
                            "requirements": [],
                            "unlocked_features": []
                        }
                    ],
                    "total_stages": 8
                }
            ),
            400: OpenApiExample(
                "Invalid Stage",
                value={"error": "Invalid stage provided"}
            )
        },
        tags=["Feature Flags"]
    )
    def get(self, request):
        """
        Get information about onboarding stages.
        """
        try:
            stage = request.query_params.get('stage')
            
            if stage:
                # Get info for specific stage
                service = OnboardingService()
                stage_info = service.get_stage_info(stage)
                
                if 'error' in stage_info:
                    return Response(stage_info, status=status.HTTP_400_BAD_REQUEST)
                
                serializer = OnboardingStageInfoSerializer(stage_info)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                # Get info for all stages
                service = OnboardingService()
                all_stages = []
                
                for stage_choice in OnboardingStageTypes.choices():
                    stage_key = stage_choice[0]
                    stage_info = service.get_stage_info(stage_key)
                    all_stages.append(stage_info)
                
                serializer = OnboardingStageInfoSerializer(all_stages, many=True)
                return Response({
                    'stages': serializer.data,
                    'total_stages': len(all_stages)
                }, status=status.HTTP_200_OK)
                
        except Exception as e:
            logger.error(f"Error getting stage information: {str(e)}")
            return Response(
                {'error': 'Failed to get stage information'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )