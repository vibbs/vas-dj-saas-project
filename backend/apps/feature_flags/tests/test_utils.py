"""
Feature Flag Utilities Tests.

Comprehensive tests for decorators, mixins, and helper functions.
"""

import pytest
from unittest.mock import Mock, patch, MagicMock
from django.http import Http404, JsonResponse
from django.core.exceptions import PermissionDenied
from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser
from django.views.generic import TemplateView
from django.contrib.auth import get_user_model

from ..utils.decorators import (
    require_feature_flag, feature_flag_required, multiple_feature_flags,
    onboarding_stage_required, feature_flag_context
)
from ..utils.mixins import (
    FeatureGatedMixin, MultipleFeatureGatedMixin, OnboardingStageRequiredMixin,
    FeatureContextMixin, FeatureRequiredMixin
)
from ..utils.helpers import (
    is_feature_enabled_for_user, get_user_feature_flags, get_enabled_features_for_user,
    check_multiple_features, get_user_onboarding_info, trigger_onboarding_action,
    create_feature_flag, enable_flag_for_user, disable_flag_for_user,
    get_feature_flag_statistics, clear_feature_flag_cache
)
from ..models import FeatureFlag, UserOnboardingProgress
from ..enums import OnboardingStageTypes
from .factories import (
    FeatureFlagFactory, FeatureAccessFactory, UserOnboardingProgressFactory,
    UserFactory, OrganizationFactory
)

User = get_user_model()


@pytest.mark.django_db
class TestRequireFeatureFlagDecorator:
    """Test suite for require_feature_flag decorator."""
    
    def test_decorator_allows_access_when_flag_enabled(self, user):
        """Test decorator allows access when feature flag is enabled."""
        flag = FeatureFlagFactory(key='test_feature', is_enabled_globally=True)

        @require_feature_flag('test_feature')
        def test_view(request):
            return 'success'

        # Use RequestFactory for proper request object
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user

        result = test_view(request)

        assert result == 'success'
    
    def test_decorator_denies_access_when_flag_disabled(self, user):
        """Test decorator denies access when feature flag is disabled."""
        flag = FeatureFlagFactory(key='test_feature', is_enabled_globally=False)
        
        @require_feature_flag('test_feature')
        def test_view(request):
            return 'success'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        
        with pytest.raises(PermissionDenied):
            test_view(request)
    
    def test_decorator_fail_silently_raises_404(self, user):
        """Test decorator raises 404 when fail_silently is True."""
        flag = FeatureFlagFactory(key='test_feature', is_enabled_globally=False)
        
        @require_feature_flag('test_feature', fail_silently=True)
        def test_view(request):
            return 'success'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        
        with pytest.raises(Http404):
            test_view(request)
    
    def test_decorator_ajax_request_returns_json(self, user):
        """Test decorator returns JSON response for AJAX requests."""
        flag = FeatureFlagFactory(key='test_feature', is_enabled_globally=False)
        
        @require_feature_flag('test_feature')
        def test_view(request):
            return 'success'
        
        factory = RequestFactory()
        request = factory.get('/', HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        request.user = user
        
        result = test_view(request)
        
        assert isinstance(result, JsonResponse)
        assert result.status_code == 403
    
    def test_decorator_with_custom_response(self, user):
        """Test decorator with custom response handler."""
        flag = FeatureFlagFactory(key='test_feature', is_enabled_globally=False)
        
        def custom_response(request, flag_key):
            return f'Custom denied response for {flag_key}'
        
        @require_feature_flag('test_feature', custom_response=custom_response)
        def test_view(request):
            return 'success'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        
        result = test_view(request)
        
        assert result == 'Custom denied response for test_feature'
    
    def test_decorator_requires_authentication(self):
        """Test decorator requires authentication."""
        flag = FeatureFlagFactory(key='test_feature', is_enabled_globally=True)
        
        @require_feature_flag('test_feature')
        def test_view(request):
            return 'success'
        
        # This would be handled by @login_required in real usage
        # Here we test the metadata is set correctly
        assert hasattr(test_view, 'required_feature_flag')
        assert test_view.required_feature_flag == 'test_feature'
    
    def test_decorator_metadata(self):
        """Test decorator sets correct metadata."""
        @require_feature_flag('test_feature', fail_silently=True, cache_enabled=False)
        def test_view(request):
            return 'success'
        
        assert test_view.required_feature_flag == 'test_feature'
        assert test_view.feature_flag_options['fail_silently'] is True
        assert test_view.feature_flag_options['cache_enabled'] is False


@pytest.mark.django_db
class TestMultipleFeatureFlagsDecorator:
    """Test suite for multiple_feature_flags decorator."""
    
    def test_decorator_require_all_success(self, user):
        """Test decorator with require_all=True and all flags enabled."""
        flag1 = FeatureFlagFactory(key='feature1', is_enabled_globally=True)
        flag2 = FeatureFlagFactory(key='feature2', is_enabled_globally=True)
        
        @multiple_feature_flags(['feature1', 'feature2'], require_all=True)
        def test_view(request):
            return 'success'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        
        result = test_view(request)
        
        assert result == 'success'
        assert hasattr(request, 'enabled_feature_flags')
        assert 'feature1' in request.enabled_feature_flags
        assert 'feature2' in request.enabled_feature_flags
    
    def test_decorator_require_all_failure(self, user):
        """Test decorator with require_all=True and some flags disabled."""
        flag1 = FeatureFlagFactory(key='feature1', is_enabled_globally=True)
        flag2 = FeatureFlagFactory(key='feature2', is_enabled_globally=False)
        
        @multiple_feature_flags(['feature1', 'feature2'], require_all=True)
        def test_view(request):
            return 'success'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        
        with pytest.raises(PermissionDenied):
            test_view(request)
    
    def test_decorator_require_any_success(self, user):
        """Test decorator with require_all=False and one flag enabled."""
        flag1 = FeatureFlagFactory(key='feature1', is_enabled_globally=True)
        flag2 = FeatureFlagFactory(key='feature2', is_enabled_globally=False)
        
        @multiple_feature_flags(['feature1', 'feature2'], require_all=False)
        def test_view(request):
            return 'success'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        
        result = test_view(request)
        
        assert result == 'success'
        assert 'feature1' in request.enabled_feature_flags
        assert 'feature2' not in request.enabled_feature_flags
    
    def test_decorator_ajax_response(self, user):
        """Test decorator AJAX response includes flag details."""
        flag1 = FeatureFlagFactory(key='feature1', is_enabled_globally=False)
        flag2 = FeatureFlagFactory(key='feature2', is_enabled_globally=False)
        
        @multiple_feature_flags(['feature1', 'feature2'], require_all=True)
        def test_view(request):
            return 'success'
        
        factory = RequestFactory()
        request = factory.get('/', HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        request.user = user
        
        result = test_view(request)
        
        assert isinstance(result, JsonResponse)
        response_data = result.content.decode()
        assert 'required_flags' in response_data
        assert 'missing_flags' in response_data
        assert 'require_all' in response_data


@pytest.mark.django_db
class TestOnboardingStageRequiredDecorator:
    """Test suite for onboarding_stage_required decorator."""
    
    def test_decorator_allows_access_correct_stage(self, user):
        """Test decorator allows access when user is at correct stage."""
        UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.EMAIL_VERIFIED.value
        )
        
        @onboarding_stage_required(OnboardingStageTypes.EMAIL_VERIFIED.value)
        def test_view(request):
            return 'success'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        
        result = test_view(request)
        
        assert result == 'success'
        assert hasattr(request, 'user_onboarding_progress')
    
    def test_decorator_allows_advanced_stage(self, user):
        """Test decorator allows advanced stages when allow_advanced=True."""
        UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.PROFILE_SETUP.value
        )
        
        @onboarding_stage_required(
            OnboardingStageTypes.EMAIL_VERIFIED.value,
            allow_advanced=True
        )
        def test_view(request):
            return 'success'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        
        result = test_view(request)
        
        assert result == 'success'
    
    def test_decorator_denies_early_stage(self, user):
        """Test decorator denies access for early stages."""
        UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.SIGNUP_COMPLETE.value
        )
        
        @onboarding_stage_required(OnboardingStageTypes.EMAIL_VERIFIED.value)
        def test_view(request):
            return 'success'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        
        with pytest.raises(PermissionDenied):
            test_view(request)
    
    def test_decorator_no_onboarding_progress(self, user):
        """Test decorator handles missing onboarding progress."""
        @onboarding_stage_required(OnboardingStageTypes.EMAIL_VERIFIED.value)
        def test_view(request):
            return 'success'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        
        with pytest.raises(PermissionDenied):
            test_view(request)


@pytest.mark.django_db
class TestFeatureGatedMixin:
    """Test suite for FeatureGatedMixin."""
    
    def test_mixin_allows_access_when_flag_enabled(self, user):
        """Test mixin allows access when feature flag is enabled."""
        flag = FeatureFlagFactory(key='test_feature', is_enabled_globally=True)
        
        class TestView(FeatureGatedMixin, TemplateView):
            required_feature_flag = 'test_feature'
            template_name = 'test.html'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        request.method = 'GET'
        
        view = TestView()
        # Mock the parent dispatch method
        with patch('django.views.generic.base.TemplateView.dispatch') as mock_dispatch:
            mock_dispatch.return_value = 'success'
            result = view.dispatch(request)
        
        assert result == 'success'
    
    def test_mixin_denies_access_when_flag_disabled(self, user):
        """Test mixin denies access when feature flag is disabled."""
        flag = FeatureFlagFactory(key='test_feature', is_enabled_globally=False)
        
        class TestView(FeatureGatedMixin, TemplateView):
            required_feature_flag = 'test_feature'
            template_name = 'test.html'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        
        view = TestView()
        
        with pytest.raises(PermissionDenied):
            view.dispatch(request)
    
    def test_mixin_requires_required_feature_flag(self):
        """Test mixin raises error when required_feature_flag is not set."""
        class TestView(FeatureGatedMixin, TemplateView):
            template_name = 'test.html'
            # Missing required_feature_flag
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = Mock()
        request.user.is_authenticated = True
        
        view = TestView()
        
        with pytest.raises(ValueError, match="must define required_feature_flag"):
            view.dispatch(request)
    
    def test_mixin_custom_response_method(self, user):
        """Test mixin with custom response method."""
        flag = FeatureFlagFactory(key='test_feature', is_enabled_globally=False)
        
        class TestView(FeatureGatedMixin, TemplateView):
            required_feature_flag = 'test_feature'
            feature_flag_custom_response_method = 'custom_denied_response'
            template_name = 'test.html'
            
            def custom_denied_response(self, request, flag_key):
                return f'Custom response for {flag_key}'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        
        view = TestView()
        result = view.dispatch(request)
        
        assert result == 'Custom response for test_feature'


@pytest.mark.django_db
class TestMultipleFeatureGatedMixin:
    """Test suite for MultipleFeatureGatedMixin."""
    
    def test_mixin_require_all_success(self, user):
        """Test mixin with require_all=True and all flags enabled."""
        flag1 = FeatureFlagFactory(key='feature1', is_enabled_globally=True)
        flag2 = FeatureFlagFactory(key='feature2', is_enabled_globally=True)
        
        class TestView(MultipleFeatureGatedMixin, TemplateView):
            required_feature_flags = ['feature1', 'feature2']
            feature_flags_require_all = True
            template_name = 'test.html'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        request.method = 'GET'
        
        view = TestView()
        
        with patch('django.views.generic.base.TemplateView.dispatch') as mock_dispatch:
            mock_dispatch.return_value = 'success'
            result = view.dispatch(request)
        
        assert result == 'success'
        assert hasattr(request, 'enabled_feature_flags')
        assert 'feature1' in request.enabled_feature_flags
        assert 'feature2' in request.enabled_feature_flags
    
    def test_mixin_require_all_failure(self, user):
        """Test mixin with require_all=True and missing flags."""
        flag1 = FeatureFlagFactory(key='feature1', is_enabled_globally=True)
        flag2 = FeatureFlagFactory(key='feature2', is_enabled_globally=False)
        
        class TestView(MultipleFeatureGatedMixin, TemplateView):
            required_feature_flags = ['feature1', 'feature2']
            feature_flags_require_all = True
            template_name = 'test.html'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        
        view = TestView()
        
        with pytest.raises(PermissionDenied):
            view.dispatch(request)
    
    def test_mixin_require_any_success(self, user):
        """Test mixin with require_all=False and one flag enabled."""
        flag1 = FeatureFlagFactory(key='feature1', is_enabled_globally=True)
        flag2 = FeatureFlagFactory(key='feature2', is_enabled_globally=False)
        
        class TestView(MultipleFeatureGatedMixin, TemplateView):
            required_feature_flags = ['feature1', 'feature2']
            feature_flags_require_all = False
            template_name = 'test.html'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        request.method = 'GET'
        
        view = TestView()
        
        with patch('django.views.generic.base.TemplateView.dispatch') as mock_dispatch:
            mock_dispatch.return_value = 'success'
            result = view.dispatch(request)
        
        assert result == 'success'


@pytest.mark.django_db
class TestFeatureContextMixin:
    """Test suite for FeatureContextMixin."""
    
    def test_mixin_adds_context_for_authenticated_user(self, user):
        """Test mixin adds feature flag context for authenticated users."""
        flag1 = FeatureFlagFactory(key='feature1', is_enabled_globally=True)
        flag2 = FeatureFlagFactory(key='feature2', is_enabled_globally=False)
        
        class TestView(FeatureContextMixin, TemplateView):
            template_name = 'test.html'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = user
        request.method = 'GET'
        
        view = TestView()
        
        with patch('django.views.generic.base.TemplateView.dispatch') as mock_dispatch:
            mock_dispatch.return_value = 'success'
            result = view.dispatch(request)
        
        assert hasattr(request, 'feature_flags')
        assert hasattr(request, 'enabled_feature_flags')
        assert isinstance(request.feature_flags, dict)
        assert isinstance(request.enabled_feature_flags, list)
    
    def test_mixin_skips_context_for_anonymous_user(self):
        """Test mixin skips context for anonymous users."""
        class TestView(FeatureContextMixin, TemplateView):
            template_name = 'test.html'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.user = AnonymousUser()
        request.method = 'GET'
        
        view = TestView()
        
        with patch('django.views.generic.base.TemplateView.dispatch') as mock_dispatch:
            mock_dispatch.return_value = 'success'
            result = view.dispatch(request)
        
        assert not hasattr(request, 'feature_flags')
    
    def test_mixin_get_context_data(self, user):
        """Test mixin adds feature flags to template context."""
        flag = FeatureFlagFactory(key='test_feature', is_enabled_globally=True)
        
        class TestView(FeatureContextMixin, TemplateView):
            template_name = 'test.html'
        
        factory = RequestFactory()
        request = factory.get('/')
        request.feature_flags = {'test_feature': True}
        request.enabled_feature_flags = ['test_feature']

        view = TestView()
        view.request = request
        
        with patch('django.views.generic.base.TemplateView.get_context_data') as mock_context:
            mock_context.return_value = {}
            context = view.get_context_data()
        
        assert 'feature_flags' in context
        assert 'enabled_feature_flags' in context
        assert context['feature_flags'] == {'test_feature': True}
        assert context['enabled_feature_flags'] == ['test_feature']


@pytest.mark.django_db
class TestHelperFunctions:
    """Test suite for helper functions."""
    
    def test_is_feature_enabled_for_user_with_user_object(self, user):
        """Test helper function with user object."""
        flag = FeatureFlagFactory(key='test_feature', is_enabled_globally=True)
        
        result = is_feature_enabled_for_user(user, 'test_feature')
        
        assert result is True
    
    def test_is_feature_enabled_for_user_with_user_id(self, user):
        """Test helper function with user ID."""
        flag = FeatureFlagFactory(key='test_feature', is_enabled_globally=True)
        
        result = is_feature_enabled_for_user(str(user.id), 'test_feature')
        
        assert result is True
    
    def test_is_feature_enabled_for_user_nonexistent_user(self):
        """Test helper function with nonexistent user ID."""
        flag = FeatureFlagFactory(key='test_feature', is_enabled_globally=True)
        
        result = is_feature_enabled_for_user('nonexistent-id', 'test_feature')
        
        assert result is False
    
    def test_get_user_feature_flags_success(self, user):
        """Test getting user feature flags."""
        flag1 = FeatureFlagFactory(key='flag1', is_enabled_globally=True)
        flag2 = FeatureFlagFactory(key='flag2', is_enabled_globally=False)
        
        result = get_user_feature_flags(user)
        
        assert isinstance(result, dict)
        assert 'flag1' in result
        assert 'flag2' in result
        assert result['flag1'] is True
        assert result['flag2'] is False
    
    def test_get_user_feature_flags_with_specific_keys(self, user):
        """Test getting specific feature flags."""
        flag1 = FeatureFlagFactory(key='flag1', is_enabled_globally=True)
        flag2 = FeatureFlagFactory(key='flag2', is_enabled_globally=False)
        flag3 = FeatureFlagFactory(key='flag3', is_enabled_globally=True)
        
        result = get_user_feature_flags(user, flag_keys=['flag1', 'flag2'])
        
        assert len(result) == 2
        assert 'flag1' in result
        assert 'flag2' in result
        assert 'flag3' not in result
    
    def test_get_enabled_features_for_user(self, user):
        """Test getting only enabled features."""
        flag1 = FeatureFlagFactory(key='flag1', is_enabled_globally=True)
        flag2 = FeatureFlagFactory(key='flag2', is_enabled_globally=False)
        
        result = get_enabled_features_for_user(user)
        
        assert isinstance(result, list)
        assert 'flag1' in result
        assert 'flag2' not in result
    
    def test_check_multiple_features_require_all(self, user):
        """Test checking multiple features with require_all=True."""
        flag1 = FeatureFlagFactory(key='flag1', is_enabled_globally=True)
        flag2 = FeatureFlagFactory(key='flag2', is_enabled_globally=True)
        
        result = check_multiple_features(user, ['flag1', 'flag2'], require_all=True)
        
        assert result['access_granted'] is True
        assert result['enabled_flags'] == ['flag1', 'flag2']
        assert result['missing_flags'] == []
    
    def test_check_multiple_features_require_any(self, user):
        """Test checking multiple features with require_all=False."""
        flag1 = FeatureFlagFactory(key='flag1', is_enabled_globally=True)
        flag2 = FeatureFlagFactory(key='flag2', is_enabled_globally=False)
        
        result = check_multiple_features(user, ['flag1', 'flag2'], require_all=False)
        
        assert result['access_granted'] is True
        assert result['enabled_flags'] == ['flag1']
        assert result['missing_flags'] == ['flag2']
    
    def test_get_user_onboarding_info(self, user):
        """Test getting user onboarding info."""
        progress = UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.EMAIL_VERIFIED.value,
            progress_percentage=25
        )
        
        result = get_user_onboarding_info(user)
        
        assert isinstance(result, dict)
        assert result['user_id'] == str(user.id)
        assert result['current_stage'] == OnboardingStageTypes.EMAIL_VERIFIED.value
        assert result['progress_percentage'] == 25
    
    def test_trigger_onboarding_action(self, user):
        """Test triggering onboarding action."""
        UserOnboardingProgressFactory(
            user=user,
            current_stage=OnboardingStageTypes.SIGNUP_COMPLETE.value
        )
        
        result = trigger_onboarding_action(
            user, 
            'email_verified', 
            {'method': 'email_link'}
        )
        
        assert result is True
        
        progress = UserOnboardingProgress.objects.get(user=user)
        assert progress.current_stage == OnboardingStageTypes.EMAIL_VERIFIED.value
    
    def test_create_feature_flag_helper(self):
        """Test creating feature flag via helper."""
        result = create_feature_flag(
            key='helper_flag',
            name='Helper Flag',
            description='Created via helper',
            enabled_globally=True
        )
        
        assert result is not None
        assert result.key == 'helper_flag'
        assert result.name == 'Helper Flag'
        assert result.is_enabled_globally is True
    
    def test_enable_flag_for_user_helper(self, user):
        """Test enabling flag for user via helper."""
        flag = FeatureFlagFactory(key='test_flag')
        
        result = enable_flag_for_user('test_flag', user, 'Test enabling')
        
        assert result is True
        
        # Check that access rule was created
        from ..models import FeatureAccess
        rule = FeatureAccess.objects.filter(feature=flag, user=user, enabled=True).first()
        assert rule is not None
        assert rule.reason == 'Test enabling'
    
    def test_disable_flag_for_user_helper(self, user):
        """Test disabling flag for user via helper."""
        flag = FeatureFlagFactory(key='test_flag')
        
        result = disable_flag_for_user('test_flag', user, 'Test disabling')
        
        assert result is True
        
        # Check that disabled access rule was created
        from ..models import FeatureAccess
        rule = FeatureAccess.objects.filter(feature=flag, user=user, enabled=False).first()
        assert rule is not None
        assert rule.reason == 'Test disabling'
    
    def test_get_feature_flag_statistics_helper(self, user):
        """Test getting feature flag statistics via helper."""
        flag = FeatureFlagFactory(key='test_flag', is_enabled_globally=True)
        FeatureAccessFactory(feature=flag, user=user, enabled=True)
        
        result = get_feature_flag_statistics('test_flag')
        
        assert isinstance(result, dict)
        assert result['flag_key'] == 'test_flag'
        assert result['is_enabled_globally'] is True
        assert result['total_access_rules'] == 1
    
    def test_clear_feature_flag_cache_user(self, user):
        """Test clearing feature flag cache for user."""
        with patch('apps.feature_flags.services.FeatureFlagService.invalidate_user_cache') as mock_clear:
            result = clear_feature_flag_cache(user=user)
            
            assert result is True
            mock_clear.assert_called_once_with(user)
    
    def test_clear_feature_flag_cache_flag(self):
        """Test clearing feature flag cache for specific flag."""
        with patch('apps.feature_flags.services.FeatureFlagService.invalidate_flag_cache') as mock_clear:
            result = clear_feature_flag_cache(flag_key='test_flag')
            
            assert result is True
            mock_clear.assert_called_once_with('test_flag')
    
    def test_clear_feature_flag_cache_both(self, user):
        """Test clearing both user and flag cache."""
        with patch('apps.feature_flags.services.FeatureFlagService.invalidate_user_cache') as mock_user:
            with patch('apps.feature_flags.services.FeatureFlagService.invalidate_flag_cache') as mock_flag:
                result = clear_feature_flag_cache(user=user, flag_key='test_flag')
                
                assert result is True
                mock_user.assert_called_once_with(user)
                mock_flag.assert_called_once_with('test_flag')
    
    def test_clear_feature_flag_cache_all(self):
        """Test clearing all feature flag cache (not implemented)."""
        result = clear_feature_flag_cache()
        
        assert result is False  # Not implemented yet


@pytest.mark.django_db
class TestErrorHandling:
    """Test error handling in utilities."""
    
    def test_helper_function_error_handling(self):
        """Test helper functions handle errors gracefully."""
        # Test with service errors
        with patch('apps.feature_flags.services.FeatureFlagService') as mock_service:
            mock_service.side_effect = Exception('Service error')
            
            result = is_feature_enabled_for_user('user-id', 'flag-key')
            assert result is False
            
            result = get_user_feature_flags('user-id')
            assert result == {}
    
    def test_decorator_error_handling_development(self, user):
        """Test decorator error handling in development mode."""
        flag = FeatureFlagFactory(key='test_feature')

        @require_feature_flag('test_feature')
        def test_view(request):
            return 'success'

        factory = RequestFactory()
        request = factory.get('/')
        request.user = user

        # Mock the feature service to raise an error
        with patch('apps.feature_flags.services.feature_service.FeatureFlagService.is_feature_enabled') as mock_service:
            mock_service.side_effect = Exception('Org error')

            # In development, errors should propagate
            with patch('django.conf.settings.DEBUG', True):
                with pytest.raises(Exception, match='Org error'):
                    test_view(request)
    
    def test_decorator_error_handling_production(self, user):
        """Test decorator error handling in production mode."""
        flag = FeatureFlagFactory(key='test_feature')

        @require_feature_flag('test_feature')
        def test_view(request):
            return 'success'

        factory = RequestFactory()
        request = factory.get('/')
        request.user = user

        # Mock the feature service to raise an error
        with patch('apps.feature_flags.services.feature_service.FeatureFlagService.is_feature_enabled') as mock_service:
            mock_service.side_effect = Exception('Org error')

            # In production, should fail securely with PermissionDenied
            with patch('django.conf.settings.DEBUG', False):
                with pytest.raises(PermissionDenied, match='Feature access could not be verified'):
                    test_view(request)
    
    def test_mixin_error_handling(self, user):
        """Test mixin error handling."""
        flag = FeatureFlagFactory(key='test_feature')

        class TestView(FeatureGatedMixin, TemplateView):
            required_feature_flag = 'test_feature'
            template_name = 'test.html'

        factory = RequestFactory()
        request = factory.get('/')
        request.user = user

        view = TestView()

        # Mock the feature service to raise an error
        with patch('apps.feature_flags.services.feature_service.FeatureFlagService.is_feature_enabled') as mock_service:
            mock_service.side_effect = Exception('Error')

            # In production mode, should fail securely
            with patch('django.conf.settings.DEBUG', False):
                with pytest.raises(PermissionDenied):
                    view.dispatch(request)


class TestFeatureRequiredMixin:
    """Test suite for FeatureRequiredMixin (alias)."""
    
    def test_mixin_is_alias(self):
        """Test that FeatureRequiredMixin inherits from FeatureGatedMixin."""
        assert issubclass(FeatureRequiredMixin, FeatureGatedMixin)