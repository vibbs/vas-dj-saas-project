"""
Test cases for core models and utilities.
"""

import pytest
from enum import Enum
from django.core.exceptions import ValidationError
from apps.core.models import TenantAwareModel, BaseFields
from apps.core.utils.enums import CustomEnum
from apps.accounts.tests.factories import AccountFactory
from apps.organizations.tests.factories import OrganizationFactory
from apps.accounts.enums import TeamRoleTypes, UserRoleTypes, GenderTypes, UserStatusTypes


@pytest.mark.django_db
@pytest.mark.unit
class TestTenantAwareModel:
    """Test cases for TenantAwareModel."""

    def test_tenant_aware_model_creation(self):
        """Test creating a tenant-aware model instance."""
        org = OrganizationFactory()
        
        # Since TenantAwareModel is abstract, we can't instantiate it directly
        # But we can test through a model that inherits from it
        user = AccountFactory(organization=org)
        
        assert user.organization == org

    def test_tenant_aware_model_without_organization(self):
        """Test creating a tenant-aware model without organization."""
        user = AccountFactory(organization=None)
        
        assert user.organization is None

    def test_base_fields_auto_timestamps(self):
        """Test that BaseFields automatically sets timestamps."""
        user = AccountFactory()
        
        assert user.created_at is not None
        assert user.updated_at is not None
        assert user.id is not None

    def test_base_fields_created_by(self):
        """Test BaseFields created_by functionality."""
        creator = AccountFactory()
        org = OrganizationFactory(created_by=creator)
        
        assert org.created_by == creator


@pytest.mark.django_db
@pytest.mark.unit
class TestCoreUtilities:
    """Test cases for core utilities and managers."""

    def test_uuid_generation(self):
        """Test UUID generation for models."""
        user1 = AccountFactory()
        user2 = AccountFactory()
        
        assert user1.id != user2.id
        assert len(str(user1.id)) == 36  # UUID4 format


@pytest.mark.unit
@pytest.mark.enums
class TestCustomEnum:
    """Comprehensive tests for the CustomEnum class."""
    
    def test_enum_inheritance(self):
        """Test that CustomEnum properly inherits from Enum."""
        assert issubclass(CustomEnum, Enum)
        assert isinstance(TeamRoleTypes.ADMIN, CustomEnum)
        assert isinstance(TeamRoleTypes.ADMIN, Enum)
    
    def test_choices_method(self):
        """Test the choices() class method."""
        choices = TeamRoleTypes.choices()
        
        assert isinstance(choices, list)
        assert len(choices) == 3  # ADMIN, MEMBER, VIEWER
        
        # Each choice should be a tuple of (value, value)
        for choice in choices:
            assert isinstance(choice, tuple)
            assert len(choice) == 2
            assert choice[0] == choice[1]  # value is used for both key and display
        
        # Check specific values
        assert ("ADMIN", "ADMIN") in choices
        assert ("MEMBER", "MEMBER") in choices
        assert ("VIEWER", "VIEWER") in choices
    
    def test_str_representation(self):
        """Test the __str__ method."""
        assert str(TeamRoleTypes.ADMIN) == "ADMIN"
        assert str(UserRoleTypes.USER) == "USER"
        assert str(GenderTypes.MALE) == "MALE"
        assert str(UserStatusTypes.ACTIVE) == "ACTIVE"
        
        # Test case with lowercase value
        assert str(UserRoleTypes.GUEST) == "guest"
    
    def test_equality_with_string(self):
        """Test the __eq__ method with string comparison."""
        # Test equality with strings
        assert TeamRoleTypes.ADMIN == "ADMIN"
        assert TeamRoleTypes.MEMBER == "MEMBER"
        assert UserRoleTypes.GUEST == "guest"
        
        # Test inequality with strings
        assert TeamRoleTypes.ADMIN != "MEMBER"
        assert TeamRoleTypes.ADMIN != "admin"  # Case sensitive
        assert UserRoleTypes.USER != "USER "  # Whitespace sensitive
    
    def test_equality_with_enum(self):
        """Test the __eq__ method with enum comparison."""
        # Test equality with same enum
        assert TeamRoleTypes.ADMIN == TeamRoleTypes.ADMIN
        assert UserRoleTypes.USER == UserRoleTypes.USER
        
        # Test inequality with different enum values
        assert TeamRoleTypes.ADMIN != TeamRoleTypes.MEMBER
        assert UserRoleTypes.ADMIN != UserRoleTypes.USER
        
        # Test inequality with different enum types (but same value)
        assert TeamRoleTypes.ADMIN != UserRoleTypes.ADMIN  # Different enum classes
    
    def test_equality_with_other_types(self):
        """Test __eq__ method with other types."""
        # Test with numbers
        assert TeamRoleTypes.ADMIN != 1
        assert TeamRoleTypes.ADMIN != 0
        
        # Test with None
        assert TeamRoleTypes.ADMIN != None
        
        # Test with lists/objects
        assert TeamRoleTypes.ADMIN != ["ADMIN"]
        assert TeamRoleTypes.ADMIN != {"value": "ADMIN"}
    
    def test_check_value_method(self):
        """Test the check_value instance method."""
        admin_role = TeamRoleTypes.ADMIN
        
        # Test with valid values
        assert admin_role.check_value("ADMIN") is True
        assert admin_role.check_value("MEMBER") is True
        assert admin_role.check_value("VIEWER") is True
        
        # Test with invalid values
        assert admin_role.check_value("INVALID") is False
        assert admin_role.check_value("admin") is False  # Case sensitive
        assert admin_role.check_value("") is False
        assert admin_role.check_value(None) is False
    
    def test_check_value_with_different_enums(self):
        """Test check_value method with values from different enums."""
        team_role = TeamRoleTypes.ADMIN
        
        # Should only check against its own enum values
        assert team_role.check_value("ADMIN") is True  # Valid for TeamRoleTypes
        assert team_role.check_value("USER") is False  # From UserRoleTypes
        assert team_role.check_value("MALE") is False  # From GenderTypes
        assert team_role.check_value("ACTIVE") is False  # From UserStatusTypes
    
    def test_enum_values_and_access(self):
        """Test accessing enum values and members."""
        # Test value access
        assert TeamRoleTypes.ADMIN.value == "ADMIN"
        assert UserRoleTypes.GUEST.value == "guest"
        assert GenderTypes.OTHER.value == "OTHER"
        assert UserStatusTypes.PENDING.value == "PENDING"
        
        # Test member access
        assert hasattr(TeamRoleTypes, 'ADMIN')
        assert hasattr(TeamRoleTypes, 'MEMBER')
        assert hasattr(TeamRoleTypes, 'VIEWER')
    
    def test_enum_iteration(self):
        """Test iterating over enum members."""
        team_roles = list(TeamRoleTypes)
        assert len(team_roles) == 3
        assert TeamRoleTypes.ADMIN in team_roles
        assert TeamRoleTypes.MEMBER in team_roles
        assert TeamRoleTypes.VIEWER in team_roles
        
        gender_types = list(GenderTypes)
        assert len(gender_types) == 4
        assert all(isinstance(g, GenderTypes) for g in gender_types)
    
    def test_user_status_enum_completeness(self):
        """Test that UserStatusTypes has all expected status values."""
        expected_statuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "DELETED", "BANNED", "PENDING"]
        actual_values = [status.value for status in UserStatusTypes]
        
        for expected in expected_statuses:
            assert expected in actual_values
        
        assert len(actual_values) == len(expected_statuses)
    
    def test_role_types_hierarchy(self):
        """Test role type enums for admin/user hierarchy."""
        # Both should have ADMIN
        assert hasattr(TeamRoleTypes, 'ADMIN')
        assert hasattr(UserRoleTypes, 'ADMIN')
        
        # TeamRoleTypes has MEMBER and VIEWER for finer control
        assert hasattr(TeamRoleTypes, 'MEMBER')
        assert hasattr(TeamRoleTypes, 'VIEWER')
        
        # UserRoleTypes has USER and GUEST for broader categories
        assert hasattr(UserRoleTypes, 'USER')
        assert hasattr(UserRoleTypes, 'GUEST')
    
    def test_gender_types_inclusivity(self):
        """Test that GenderTypes includes inclusive options."""
        gender_values = [g.value for g in GenderTypes]
        
        # Should include standard options
        assert "MALE" in gender_values
        assert "FEMALE" in gender_values
        
        # Should include inclusive options
        assert "OTHER" in gender_values
        assert "UNKNOWN" in gender_values
    
    def test_enum_in_collections(self):
        """Test enum behavior in collections like sets and dicts."""
        # Test in sets
        role_set = {TeamRoleTypes.ADMIN, TeamRoleTypes.MEMBER}
        assert len(role_set) == 2
        assert TeamRoleTypes.ADMIN in role_set
        
        # Test as dict keys
        role_permissions = {
            TeamRoleTypes.ADMIN: ["read", "write", "delete"],
            TeamRoleTypes.MEMBER: ["read", "write"],
            TeamRoleTypes.VIEWER: ["read"]
        }
        assert len(role_permissions) == 3
        assert role_permissions[TeamRoleTypes.ADMIN] == ["read", "write", "delete"]
    
    def test_enum_serialization_behavior(self):
        """Test how enums behave for serialization contexts."""
        # Test that str() gives the value (important for JSON serialization)
        assert str(TeamRoleTypes.ADMIN) == "ADMIN"
        assert str(UserRoleTypes.GUEST) == "guest"
        
        # Test that == works with strings (important for form validation)
        assert TeamRoleTypes.ADMIN == "ADMIN"
        assert UserRoleTypes.GUEST == "guest"
    
    def test_enum_edge_cases(self):
        """Test edge cases and error conditions."""
        # Test with empty string
        assert TeamRoleTypes.ADMIN != ""
        assert not TeamRoleTypes.ADMIN.check_value("")
        
        # Test case sensitivity
        assert TeamRoleTypes.ADMIN != "admin"
        assert not TeamRoleTypes.ADMIN.check_value("admin")
        
        # Test whitespace
        assert TeamRoleTypes.ADMIN != " ADMIN "
        assert not TeamRoleTypes.ADMIN.check_value(" ADMIN ")
        
        # Test special characters
        assert not TeamRoleTypes.ADMIN.check_value("ADMIN\n")
        assert not TeamRoleTypes.ADMIN.check_value("ADMIN\t")
    
    def test_check_value_method_instance_vs_class(self):
        """Test that check_value works correctly as an instance method."""
        admin_instance = TeamRoleTypes.ADMIN
        member_instance = TeamRoleTypes.MEMBER
        
        # Both instances should check against the same enum class
        assert admin_instance.check_value("ADMIN") == member_instance.check_value("ADMIN")
        assert admin_instance.check_value("INVALID") == member_instance.check_value("INVALID")
    
    def test_custom_enum_method_inheritance(self):
        """Test that all custom methods are properly inherited."""
        # Test that all concrete enums have the custom methods
        for enum_class in [TeamRoleTypes, UserRoleTypes, GenderTypes, UserStatusTypes]:
            instance = list(enum_class)[0]  # Get first member
            
            # Should have choices class method
            assert hasattr(enum_class, 'choices')
            assert callable(enum_class.choices)
            
            # Should have check_value instance method
            assert hasattr(instance, 'check_value')
            assert callable(instance.check_value)
            
            # Should have custom __str__ and __eq__
            assert hasattr(instance, '__str__')
            assert hasattr(instance, '__eq__')


@pytest.mark.unit
@pytest.mark.enums
@pytest.mark.integration
class TestCustomEnumIntegration:
    """Integration tests for CustomEnum with Django models and forms."""
    
    def test_choices_for_django_model_fields(self):
        """Test that choices() method works with Django model fields."""
        choices = UserStatusTypes.choices()
        
        # Should be in the format Django expects: [(value, display), ...]
        assert all(isinstance(choice, tuple) and len(choice) == 2 for choice in choices)
        
        # Should include all enum values
        enum_values = [status.value for status in UserStatusTypes]
        choice_values = [choice[0] for choice in choices]
        
        for enum_value in enum_values:
            assert enum_value in choice_values
    
    def test_enum_with_model_validation(self):
        """Test enum usage in model field validation context."""
        # Simulate Django model field validation
        valid_statuses = [status.value for status in UserStatusTypes]
        
        # Test valid values
        assert "ACTIVE" in valid_statuses
        assert "PENDING" in valid_statuses
        
        # Test invalid values
        assert "INVALID_STATUS" not in valid_statuses
        assert "active" not in valid_statuses  # Case sensitive
    
    def test_enum_consistency_across_apps(self):
        """Test that enum definitions are consistent for cross-app usage."""
        # TeamRoleTypes and UserRoleTypes both have ADMIN
        assert TeamRoleTypes.ADMIN.value == UserRoleTypes.ADMIN.value
        
        # But they are different enum instances
        assert TeamRoleTypes.ADMIN is not UserRoleTypes.ADMIN
        assert type(TeamRoleTypes.ADMIN) != type(UserRoleTypes.ADMIN)