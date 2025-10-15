"""
Feature Access Rule API Views.

DRF ViewSets and views for managing feature access rules and
bulk operations on user/role access.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Q
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
import logging

from ..models import FeatureAccess, FeatureFlag
from ..serializers import (
    FeatureAccessSerializer,
    FeatureFlagBulkUpdateSerializer
)
from ..services import FeatureFlagService

logger = logging.getLogger(__name__)


@extend_schema_view(
    list=extend_schema(
        summary="List Access Rules",
        description="Retrieve feature access rules visible to the current user. "
                   "Admins see all rules, organization admins see rules for their org, "
                   "regular users see only their own rules.",
        tags=["Feature Flags"]
    ),
    create=extend_schema(
        summary="Create Access Rule",
        description="Create a new feature access rule for a user, role, or organization. "
                   "Only administrators can create access rules.",
        tags=["Feature Flags"]
    ),
    retrieve=extend_schema(
        summary="Get Access Rule Details",
        description="Retrieve detailed information about a specific access rule including "
                   "target, conditions, and metadata.",
        tags=["Feature Flags"]
    ),
    update=extend_schema(
        summary="Update Access Rule",
        description="Update an access rule's settings including enabled state, conditions, "
                   "and reason. Only administrators can update access rules.",
        tags=["Feature Flags"]
    ),
    partial_update=extend_schema(
        summary="Partially Update Access Rule",
        description="Partially update specific fields of an access rule. "
                   "Only administrators can update access rules.",
        tags=["Feature Flags"]
    ),
    destroy=extend_schema(
        summary="Delete Access Rule",
        description="Delete a feature access rule. This will remove the specific "
                   "access override and revert to default flag evaluation logic.",
        tags=["Feature Flags"]
    )
)
class FeatureAccessViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing feature access rules.
    
    Provides CRUD operations for fine-grained feature access control
    based on users, roles, or organizations. Access rules override
    global flag settings and enable precise control over feature visibility.
    """
    
    queryset = FeatureAccess.objects.all()
    serializer_class = FeatureAccessSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter queryset based on user permissions and context.
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        # Admin users can see all access rules
        if user.is_staff or user.is_superuser:
            return queryset
        
        # Organization admins can see rules for their organization
        if hasattr(user, 'is_admin') and user.is_admin:
            user_org = user.get_primary_organization()
            if user_org:
                return queryset.filter(
                    Q(organization=user_org) | 
                    Q(organization__isnull=True) |
                    Q(user=user)
                )
        
        # Regular users can only see their own rules
        return queryset.filter(user=user)
    
    def get_permissions(self):
        """
        Set permissions based on action.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only admins can modify access rules
            permission_classes = [IsAdminUser]
        elif self.action in ['list', 'retrieve']:
            # Authenticated users can view rules they have access to
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        """
        Set created_by field and invalidate caches when creating access rules.
        """
        instance = serializer.save(created_by=self.request.user)
        
        # Invalidate relevant caches
        service = FeatureFlagService()
        if instance.user:
            service.invalidate_user_cache(instance.user)
        service.invalidate_flag_cache(instance.feature.key)
    
    def perform_update(self, serializer):
        """
        Set updated_by field and invalidate caches when updating access rules.
        """
        instance = serializer.save(updated_by=self.request.user)
        
        # Invalidate relevant caches
        service = FeatureFlagService()
        if instance.user:
            service.invalidate_user_cache(instance.user)
        service.invalidate_flag_cache(instance.feature.key)
    
    def perform_destroy(self, instance):
        """
        Invalidate caches when deleting access rules.
        """
        # Store values before deletion
        user = instance.user
        flag_key = instance.feature.key
        
        super().perform_destroy(instance)
        
        # Invalidate relevant caches
        service = FeatureFlagService()
        if user:
            service.invalidate_user_cache(user)
        service.invalidate_flag_cache(flag_key)
    
    @extend_schema(
        summary="Get Access Rules for User",
        description="Retrieve all feature access rules that apply to a specific user, "
                   "including both user-specific rules and role-based rules that affect the user.",
        parameters=[
            OpenApiParameter(
                name='user_id',
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.QUERY,
                description='UUID of the user to get access rules for',
                required=True
            )
        ],
        responses={
            200: OpenApiExample(
                "User Access Rules",
                value={
                    "user_id": "123e4567-e89b-12d3-a456-426614174000",
                    "user_email": "user@example.com",
                    "user_specific_rules": [],
                    "role_based_rules": [],
                    "total_rules": 0
                }
            ),
            400: OpenApiExample(
                "Missing Parameter",
                value={"error": "user_id parameter is required"}
            ),
            404: OpenApiExample(
                "User Not Found",
                value={"error": "User not found"}
            )
        },
        tags=["Feature Flags"]
    )
    @action(detail=False, methods=['get'])
    def for_user(self, request):
        """
        Get all access rules for a specific user.
        """
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            target_user = User.objects.get(id=user_id)
            
            # Get user-specific rules
            user_rules = self.get_queryset().filter(user=target_user)
            
            # Get role-based rules if user has a role
            role_rules = []
            if hasattr(target_user, 'role') and target_user.role:
                role_rules = self.get_queryset().filter(role=target_user.role)
            
            # Serialize the data
            user_rules_data = FeatureAccessSerializer(
                user_rules, many=True, context={'request': request}
            ).data
            role_rules_data = FeatureAccessSerializer(
                role_rules, many=True, context={'request': request}
            ).data
            
            return Response({
                'user_id': user_id,
                'user_email': target_user.email,
                'user_specific_rules': user_rules_data,
                'role_based_rules': role_rules_data,
                'total_rules': len(user_rules_data) + len(role_rules_data)
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error getting access rules for user {user_id}: {str(e)}")
            return Response(
                {'error': 'Failed to get access rules'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @extend_schema(
        summary="Get Access Rules for Feature Flag",
        description="Retrieve all access rules associated with a specific feature flag, "
                   "organized by rule type (user, role, organization).",
        parameters=[
            OpenApiParameter(
                name='flag_key',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Key of the feature flag to get access rules for',
                required=True
            )
        ],
        responses={
            200: OpenApiExample(
                "Flag Access Rules",
                value={
                    "flag_key": "analytics",
                    "flag_name": "Advanced Analytics",
                    "total_rules": 3,
                    "user_rules": [],
                    "role_rules": [],
                    "organization_rules": []
                }
            ),
            400: OpenApiExample(
                "Missing Parameter",
                value={"error": "flag_key parameter is required"}
            ),
            404: OpenApiExample(
                "Feature Flag Not Found",
                value={"error": "Feature flag not found"}
            )
        },
        tags=["Feature Flags"]
    )
    @action(detail=False, methods=['get'])
    def for_flag(self, request):
        """
        Get all access rules for a specific feature flag.
        """
        flag_key = request.query_params.get('flag_key')
        if not flag_key:
            return Response(
                {'error': 'flag_key parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            flag = FeatureFlag.objects.get(key=flag_key)
            
            # Get all rules for this flag
            rules = self.get_queryset().filter(feature=flag)
            
            # Group by type
            user_rules = rules.filter(user__isnull=False)
            role_rules = rules.filter(role__isnull=False)
            org_rules = rules.filter(organization__isnull=False)
            
            return Response({
                'flag_key': flag_key,
                'flag_name': flag.name,
                'total_rules': rules.count(),
                'user_rules': FeatureAccessSerializer(
                    user_rules, many=True, context={'request': request}
                ).data,
                'role_rules': FeatureAccessSerializer(
                    role_rules, many=True, context={'request': request}
                ).data,
                'organization_rules': FeatureAccessSerializer(
                    org_rules, many=True, context={'request': request}
                ).data,
            }, status=status.HTTP_200_OK)
            
        except FeatureFlag.DoesNotExist:
            return Response(
                {'error': 'Feature flag not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error getting access rules for flag {flag_key}: {str(e)}")
            return Response(
                {'error': 'Failed to get access rules'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema_view(
    post=extend_schema(
        summary="Bulk Access Rule Operations",
        description="Perform bulk operations on access rules. Create or update multiple "
                   "access rules in a single operation for improved administrative efficiency. "
                   "Supports operations across multiple flags and multiple targets.",
        tags=["Feature Flags"]
    )
)
class BulkAccessRuleView(APIView):
    """
    View for bulk operations on access rules.
    
    Allows creating or updating multiple access rules in a single operation
    for improved admin efficiency. Supports batch processing of access
    rules across multiple feature flags and targets.
    """
    
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary="Bulk Create/Update Access Rules",
        description="Create or update multiple access rules in a single operation. "
                   "This endpoint allows administrators to efficiently manage access rules "
                   "across multiple feature flags and multiple targets (users/roles/organizations).",
        request=FeatureFlagBulkUpdateSerializer,
        responses={
            200: OpenApiExample(
                "Bulk Operation Success",
                value={
                    "message": "Bulk operation completed",
                    "total_operations": 6,
                    "successful_operations": 5,
                    "failed_operations": 1,
                    "results": [
                        {
                            "flag_key": "analytics",
                            "target_type": "user",
                            "target_id": "123e4567-e89b-12d3-a456-426614174000",
                            "enabled": True,
                            "operation": "created",
                            "success": True
                        }
                    ]
                }
            ),
            207: OpenApiExample(
                "Partial Success",
                value={
                    "message": "Bulk operation completed with errors",
                    "errors": ["Failed to process analytics -> invalid_user_id: User not found"]
                }
            ),
            400: OpenApiExample(
                "Invalid Request",
                value={"error": "Invalid flag keys or target IDs provided"}
            )
        },
        tags=["Feature Flags"]
    )
    def post(self, request):
        """
        Perform bulk operations on access rules.
        """
        serializer = FeatureFlagBulkUpdateSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                data = serializer.validated_data
                service = FeatureFlagService()
                results = []
                errors = []
                
                # Process each flag-target combination
                for flag_key in data['flag_keys']:
                    try:
                        flag = FeatureFlag.objects.get(key=flag_key)
                        
                        for target_id in data['target_ids']:
                            try:
                                result = self._create_or_update_rule(
                                    flag, data, target_id, request.user
                                )
                                results.append(result)
                                
                                # Invalidate caches
                                if data['target_type'] == 'user':
                                    from django.contrib.auth import get_user_model
                                    User = get_user_model()
                                    user = User.objects.get(id=target_id)
                                    service.invalidate_user_cache(user)
                                
                                service.invalidate_flag_cache(flag_key)
                                
                            except Exception as e:
                                error_msg = f"Failed to process {flag_key} -> {target_id}: {str(e)}"
                                errors.append(error_msg)
                                logger.error(error_msg)
                    
                    except FeatureFlag.DoesNotExist:
                        error_msg = f"Feature flag {flag_key} not found"
                        errors.append(error_msg)
                        logger.error(error_msg)
                
                # Prepare response
                response_data = {
                    'message': 'Bulk operation completed',
                    'total_operations': len(data['flag_keys']) * len(data['target_ids']),
                    'successful_operations': len(results),
                    'failed_operations': len(errors),
                    'results': results
                }
                
                if errors:
                    response_data['errors'] = errors
                
                response_status = status.HTTP_200_OK if not errors else status.HTTP_207_MULTI_STATUS
                return Response(response_data, status=response_status)
                
            except Exception as e:
                logger.error(f"Error in bulk access rule operation: {str(e)}")
                return Response(
                    {'error': 'Bulk operation failed'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _create_or_update_rule(self, flag, data, target_id, admin_user):
        """
        Create or update a single access rule.
        
        Args:
            flag: FeatureFlag instance
            data: Validated request data
            target_id: Target ID (user ID, role name, etc.)
            admin_user: User performing the operation
            
        Returns:
            Dictionary with operation result
        """
        target_type = data['target_type']
        enabled = data['enabled']
        reason = data.get('reason', f'Bulk operation by {admin_user.email}')
        
        # Prepare rule data based on target type
        rule_data = {
            'feature': flag,
            'enabled': enabled,
            'reason': reason,
            'created_by': admin_user,
            'updated_by': admin_user
        }
        
        if target_type == 'user':
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(id=target_id)
            rule_data['user'] = user
            
            # Try to update existing rule first
            existing_rule = FeatureAccess.objects.filter(
                feature=flag, user=user
            ).first()
            
        elif target_type == 'role':
            rule_data['role'] = target_id
            
            # Try to update existing rule first
            existing_rule = FeatureAccess.objects.filter(
                feature=flag, role=target_id
            ).first()
            
        elif target_type == 'organization':
            from apps.organizations.models import Organization
            org = Organization.objects.get(id=target_id)
            rule_data['organization'] = org
            
            # Try to update existing rule first
            existing_rule = FeatureAccess.objects.filter(
                feature=flag, organization=org
            ).first()
        
        else:
            raise ValueError(f"Invalid target_type: {target_type}")
        
        # Update existing rule or create new one
        if existing_rule:
            existing_rule.enabled = enabled
            existing_rule.reason = reason
            existing_rule.updated_by = admin_user
            existing_rule.save()
            
            operation = 'updated'
            rule = existing_rule
        else:
            rule = FeatureAccess.objects.create(**rule_data)
            operation = 'created'
        
        return {
            'flag_key': flag.key,
            'target_type': target_type,
            'target_id': str(target_id),
            'enabled': enabled,
            'operation': operation,
            'rule_id': str(rule.id),
            'success': True
        }