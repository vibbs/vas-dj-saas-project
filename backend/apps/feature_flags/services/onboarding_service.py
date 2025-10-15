"""
Onboarding Service for Progressive Feature Enablement.

Handles user onboarding progression and feature unlocking based on
user actions and milestones.
"""

from typing import Dict, List, Optional, Any, Tuple
from django.db import transaction
from django.utils import timezone
from django.conf import settings
import logging

from ..models import UserOnboardingProgress
from ..enums import OnboardingStageTypes
from .cache_service import FeatureFlagCacheService

logger = logging.getLogger(__name__)


class OnboardingService:
    """
    Service for managing user onboarding progression and feature unlocking.
    
    Provides methods to:
    - Track user onboarding progress
    - Trigger stage transitions
    - Handle feature unlocking based on actions
    - Manage custom onboarding flows per organization
    """
    
    def __init__(self, use_cache: bool = True):
        """
        Initialize the onboarding service.
        
        Args:
            use_cache: Whether to use caching for performance
        """
        self.use_cache = use_cache
        self.cache_service = FeatureFlagCacheService
    
    def get_or_create_progress(self, user) -> UserOnboardingProgress:
        """
        Get or create onboarding progress for a user.
        
        Args:
            user: User instance
            
        Returns:
            UserOnboardingProgress instance
        """
        try:
            progress, created = UserOnboardingProgress.objects.get_or_create(
                user=user,
                defaults={
                    'current_stage': OnboardingStageTypes.SIGNUP_COMPLETE.value,
                    'completed_stages': [],
                    'progress_percentage': 0
                }
            )
            
            if created:
                logger.info(f"Created onboarding progress for user {user.id}")
            
            return progress
            
        except Exception as e:
            logger.error(f"Error getting/creating progress for user {user.id}: {str(e)}")
            raise
    
    def advance_user_stage(self, user, new_stage: str, 
                          custom_data: Optional[Dict] = None) -> bool:
        """
        Advance user to a new onboarding stage.
        
        Args:
            user: User instance
            new_stage: New stage to advance to
            custom_data: Optional custom data to store
            
        Returns:
            True if advancement was successful
        """
        try:
            with transaction.atomic():
                progress = self.get_or_create_progress(user)
                old_stage = progress.current_stage
                
                # Advance the stage
                progress.advance_to_stage(new_stage, save=True)
                
                # Update custom data if provided
                if custom_data:
                    progress.custom_data.update(custom_data)
                    progress.save()
                
                # Invalidate user caches since stage progression affects feature access
                if self.use_cache:
                    self.cache_service.invalidate_all_user_caches(str(user.id))
                
                logger.info(f"Advanced user {user.id} from {old_stage} to {new_stage}")
                
                # Trigger any post-advancement actions
                self._handle_stage_progression(user, old_stage, new_stage)
                
                return True
                
        except Exception as e:
            logger.error(f"Error advancing user {user.id} to stage {new_stage}: {str(e)}")
            return False
    
    def mark_stage_completed(self, user, stage: str, 
                            custom_data: Optional[Dict] = None) -> bool:
        """
        Mark a specific stage as completed without advancing current stage.
        
        Args:
            user: User instance
            stage: Stage to mark as completed
            custom_data: Optional custom data to store
            
        Returns:
            True if successful
        """
        try:
            with transaction.atomic():
                progress = self.get_or_create_progress(user)
                progress.mark_stage_completed(stage, save=True)
                
                if custom_data:
                    progress.custom_data.update(custom_data)
                    progress.save()
                
                if self.use_cache:
                    self.cache_service.invalidate_all_user_caches(str(user.id))
                
                logger.info(f"Marked stage {stage} as completed for user {user.id}")
                return True
                
        except Exception as e:
            logger.error(f"Error marking stage {stage} completed for user {user.id}: {str(e)}")
            return False
    
    def check_stage_requirements(self, user, target_stage: str) -> Tuple[bool, List[str]]:
        """
        Check if user meets requirements to advance to target stage.
        
        Args:
            user: User instance
            target_stage: Target stage to check requirements for
            
        Returns:
            Tuple of (can_advance, missing_requirements)
        """
        try:
            progress = self.get_or_create_progress(user)
            missing_requirements = []
            
            # Define stage requirements
            stage_requirements = self._get_stage_requirements(target_stage)
            
            for requirement in stage_requirements:
                if not self._check_requirement(user, progress, requirement):
                    missing_requirements.append(requirement)
            
            can_advance = len(missing_requirements) == 0
            
            logger.debug(f"Stage requirements check for {user.id} -> {target_stage}: "
                        f"can_advance={can_advance}, missing={missing_requirements}")
            
            return can_advance, missing_requirements
            
        except Exception as e:
            logger.error(f"Error checking stage requirements for user {user.id}: {str(e)}")
            return False, ['error_checking_requirements']
    
    def auto_progress_user(self, user) -> Optional[str]:
        """
        Automatically progress user based on their current state and completed actions.
        
        Args:
            user: User instance
            
        Returns:
            New stage if progression occurred, None otherwise
        """
        try:
            progress = self.get_or_create_progress(user)
            current_stage = progress.current_stage
            
            # Get next possible stage
            next_stage = progress.get_next_stage()
            if not next_stage:
                return None
            
            # Check if user meets requirements for next stage
            can_advance, missing_requirements = self.check_stage_requirements(user, next_stage)
            
            if can_advance:
                success = self.advance_user_stage(user, next_stage)
                if success:
                    logger.info(f"Auto-progressed user {user.id} to {next_stage}")
                    return next_stage
            else:
                logger.debug(f"User {user.id} cannot auto-progress. Missing: {missing_requirements}")
            
            return None
            
        except Exception as e:
            logger.error(f"Error in auto-progression for user {user.id}: {str(e)}")
            return None
    
    def handle_user_action(self, user, action: str, metadata: Optional[Dict] = None) -> bool:
        """
        Handle a user action and potentially trigger onboarding progression.
        
        Args:
            user: User instance
            action: Action performed (e.g., 'email_verified', 'profile_completed')
            metadata: Optional metadata about the action
            
        Returns:
            True if action was processed successfully
        """
        try:
            progress = self.get_or_create_progress(user)
            
            # Map actions to stage progressions
            action_stage_map = {
                'email_verified': OnboardingStageTypes.EMAIL_VERIFIED.value,
                'profile_completed': OnboardingStageTypes.PROFILE_SETUP.value,
                'organization_created': OnboardingStageTypes.ORGANIZATION_CREATED.value,
                'first_team_member_added': OnboardingStageTypes.FIRST_TEAM_MEMBER.value,
                'first_project_created': OnboardingStageTypes.FIRST_PROJECT.value,
                'advanced_feature_used': OnboardingStageTypes.ADVANCED_FEATURES.value,
            }
            
            if action in action_stage_map:
                target_stage = action_stage_map[action]
                
                # Check if we should advance to this stage
                stages = [choice[0] for choice in OnboardingStageTypes.choices()]
                current_stage_index = stages.index(progress.current_stage)
                target_stage_index = stages.index(target_stage)
                
                # Only advance if target stage is the next logical step
                if target_stage_index == current_stage_index + 1:
                    return self.advance_user_stage(user, target_stage, metadata)
                elif target_stage_index > current_stage_index:
                    # Mark intermediate stages as completed and advance
                    for i in range(current_stage_index + 1, target_stage_index + 1):
                        stage = stages[i]
                        if i == target_stage_index:
                            # Advance to final stage
                            return self.advance_user_stage(user, stage, metadata)
                        else:
                            # Mark intermediate stages as completed
                            self.mark_stage_completed(user, stage)
                    return True
                else:
                    # Already past this stage, just update metadata if needed
                    if metadata and not progress.has_completed_stage(target_stage):
                        progress.mark_stage_completed(target_stage)
                        return True
            
            # For actions that don't map to stages, just log them
            logger.debug(f"Processed action {action} for user {user.id} (no stage change)")
            return True
            
        except Exception as e:
            logger.error(f"Error handling action {action} for user {user.id}: {str(e)}")
            return False
    
    def get_user_progress_summary(self, user) -> Dict[str, Any]:
        """
        Get comprehensive progress summary for a user.
        
        Args:
            user: User instance
            
        Returns:
            Dictionary with progress information
        """
        try:
            progress = self.get_or_create_progress(user)
            
            available_features = progress.get_available_features()
            next_stage = progress.get_next_stage()
            
            # Get requirements for next stage
            next_stage_requirements = []
            if next_stage:
                _, missing_requirements = self.check_stage_requirements(user, next_stage)
                next_stage_requirements = missing_requirements
            
            return {
                'user_id': str(user.id),
                'current_stage': progress.current_stage,
                'completed_stages': progress.completed_stages,
                'progress_percentage': progress.progress_percentage,
                'total_actions_completed': progress.total_actions_completed,
                'is_onboarding_complete': progress.is_onboarding_complete(),
                'onboarding_completed_at': progress.onboarding_completed_at,
                'stage_started_at': progress.stage_started_at,
                'last_activity_at': progress.last_activity_at,
                'available_features': available_features,
                'next_stage': next_stage,
                'next_stage_requirements': next_stage_requirements,
                'custom_data': progress.custom_data,
            }
            
        except Exception as e:
            logger.error(f"Error getting progress summary for user {user.id}: {str(e)}")
            return {'error': str(e)}
    
    def get_stage_info(self, stage: str) -> Dict[str, Any]:
        """
        Get information about a specific onboarding stage.
        
        Args:
            stage: Stage identifier
            
        Returns:
            Dictionary with stage information
        """
        try:
            # Get requirements and features for this stage
            requirements = self._get_stage_requirements(stage)
            unlocked_features = self._get_stage_features(stage)
            
            return {
                'stage': stage,
                'requirements': requirements,
                'unlocked_features': unlocked_features,
                'description': self._get_stage_description(stage),
            }
            
        except Exception as e:
            logger.error(f"Error getting stage info for {stage}: {str(e)}")
            return {'error': str(e)}
    
    def _handle_stage_progression(self, user, old_stage: str, new_stage: str) -> None:
        """
        Handle post-progression actions when user advances stages.
        
        Args:
            user: User instance
            old_stage: Previous stage
            new_stage: New stage
        """
        try:
            # Example: Send welcome emails, trigger notifications, etc.
            logger.info(f"User {user.id} progressed from {old_stage} to {new_stage}")
            
            # Could trigger emails, notifications, analytics events, etc.
            # This is where you'd integrate with your email service or notification system
            
        except Exception as e:
            logger.error(f"Error in post-progression handling: {str(e)}")
    
    def _get_stage_requirements(self, stage: str) -> List[str]:
        """
        Get requirements for a specific stage.
        
        Args:
            stage: Stage identifier
            
        Returns:
            List of requirement identifiers
        """
        requirements_map = {
            OnboardingStageTypes.EMAIL_VERIFIED.value: ['email_verified'],
            OnboardingStageTypes.PROFILE_SETUP.value: ['first_name', 'last_name'],
            OnboardingStageTypes.ORGANIZATION_CREATED.value: ['has_organization'],
            OnboardingStageTypes.FIRST_TEAM_MEMBER.value: ['organization_has_members'],
            OnboardingStageTypes.FIRST_PROJECT.value: ['has_created_project'],
            OnboardingStageTypes.ADVANCED_FEATURES.value: ['has_used_advanced_feature'],
            OnboardingStageTypes.ONBOARDING_COMPLETE.value: ['completed_all_stages'],
        }
        
        return requirements_map.get(stage, [])
    
    def _get_stage_features(self, stage: str) -> List[str]:
        """
        Get features unlocked by a specific stage.
        
        Args:
            stage: Stage identifier
            
        Returns:
            List of feature identifiers
        """
        features_map = {
            OnboardingStageTypes.EMAIL_VERIFIED.value: ['basic_dashboard'],
            OnboardingStageTypes.PROFILE_SETUP.value: ['profile_customization'],
            OnboardingStageTypes.ORGANIZATION_CREATED.value: ['team_features'],
            OnboardingStageTypes.FIRST_TEAM_MEMBER.value: ['collaboration_tools'],
            OnboardingStageTypes.FIRST_PROJECT.value: ['project_management'],
            OnboardingStageTypes.ADVANCED_FEATURES.value: ['advanced_analytics'],
            OnboardingStageTypes.ONBOARDING_COMPLETE.value: ['all_features'],
        }
        
        return features_map.get(stage, [])
    
    def _get_stage_description(self, stage: str) -> str:
        """
        Get human-readable description for a stage.
        
        Args:
            stage: Stage identifier
            
        Returns:
            Stage description
        """
        descriptions = {
            OnboardingStageTypes.SIGNUP_COMPLETE.value: "User has completed registration",
            OnboardingStageTypes.EMAIL_VERIFIED.value: "User has verified their email address",
            OnboardingStageTypes.PROFILE_SETUP.value: "User has completed their profile setup",
            OnboardingStageTypes.ORGANIZATION_CREATED.value: "User has created or joined an organization",
            OnboardingStageTypes.FIRST_TEAM_MEMBER.value: "User has added their first team member",
            OnboardingStageTypes.FIRST_PROJECT.value: "User has created their first project",
            OnboardingStageTypes.ADVANCED_FEATURES.value: "User has explored advanced features",
            OnboardingStageTypes.ONBOARDING_COMPLETE.value: "User has completed full onboarding",
        }
        
        return descriptions.get(stage, f"Stage: {stage}")
    
    def _check_requirement(self, user, progress: UserOnboardingProgress, 
                          requirement: str) -> bool:
        """
        Check if user meets a specific requirement.
        
        Args:
            user: User instance
            progress: User's onboarding progress
            requirement: Requirement identifier
            
        Returns:
            True if requirement is met
        """
        try:
            if requirement == 'email_verified':
                return user.is_email_verified
            elif requirement == 'first_name':
                return bool(user.first_name and user.first_name.strip())
            elif requirement == 'last_name':
                return bool(user.last_name and user.last_name.strip())
            elif requirement == 'has_organization':
                return user.get_primary_organization() is not None
            elif requirement == 'organization_has_members':
                org = user.get_primary_organization()
                return org and org.get_active_members_count() > 1
            elif requirement == 'has_created_project':
                # This would depend on your project model
                return 'project_created' in progress.custom_data
            elif requirement == 'has_used_advanced_feature':
                return 'advanced_feature_used' in progress.custom_data
            elif requirement == 'completed_all_stages':
                all_stages = [choice[0] for choice in OnboardingStageTypes.choices()]
                return len(progress.completed_stages) >= len(all_stages) - 1
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking requirement {requirement}: {str(e)}")
            return False