"""
Comprehensive tests for the code registry system.

Tests the central registry for error codes and problem type definitions,
including app scanning, YAML catalog loading, and validation.
"""

from unittest.mock import Mock, patch

import pytest

from apps.core.code_registry import REGISTRY, CodeRegistry, CodeRegistryError
from apps.core.codes import BaseAPICodeMixin


@pytest.mark.code_registry
class TestCodeRegistry:
    """Test the CodeRegistry class functionality."""

    def test_registry_initialization(self):
        """Test CodeRegistry initialization."""
        registry = CodeRegistry()

        assert isinstance(registry.codes, set)
        assert isinstance(registry.problem_types, dict)
        assert registry._loaded is False

    def test_load_prevents_double_loading(self):
        """Test that load() prevents double loading."""
        registry = CodeRegistry()

        with patch.object(registry, "_load_app_codes") as mock_load_codes:
            with patch.object(registry, "_load_app_error_catalog") as mock_load_catalog:
                # First load
                registry.load()
                assert registry._loaded is True
                initial_call_count = mock_load_codes.call_count

                # Second load should skip
                registry.load()

                # Should not be called again on second load
                assert mock_load_codes.call_count == initial_call_count

    def test_load_app_codes_with_enum(self, mock_codes_module):
        """Test loading codes from app with enum classes."""
        registry = CodeRegistry()

        with patch("apps.core.code_registry.import_module") as mock_import:
            mock_import.return_value = mock_codes_module

            registry._load_app_codes("test_app")

            # Should register codes from enum
            assert "VDJ-TEST-SUCCESS-200" in registry.codes
            assert "VDJ-TEST-ERROR-400" in registry.codes
            assert "VDJ-TEST-SIMPLE-200" in registry.codes

    def test_load_app_codes_no_module(self):
        """Test loading codes when app has no codes module."""
        registry = CodeRegistry()

        with patch("importlib.import_module") as mock_import:
            mock_import.side_effect = ModuleNotFoundError(
                "No module named 'test_app.codes'"
            )

            registry._load_app_codes("test_app")

            # Should handle gracefully
            assert len(registry.codes) == 0

    def test_load_app_codes_import_error(self):
        """Test loading codes when import fails."""
        registry = CodeRegistry()

        with patch("apps.core.code_registry.import_module") as mock_import:
            mock_import.side_effect = ImportError("Import error")

            # Import the module first to avoid recursion, then patch its logger
            import apps.core.code_registry as code_registry_module

            with patch.object(code_registry_module, "logger") as mock_logger:
                registry._load_app_codes("test_app")

                mock_logger.warning.assert_called_once()

    def test_register_code_success(self):
        """Test successful code registration."""
        registry = CodeRegistry()

        registry._register_code("VDJ-TEST-SUCCESS-200", "test_app", "TestCodes.SUCCESS")

        assert "VDJ-TEST-SUCCESS-200" in registry.codes

    def test_register_code_duplicate(self):
        """Test duplicate code registration raises error."""
        registry = CodeRegistry()

        registry._register_code("VDJ-TEST-SUCCESS-200", "test_app", "TestCodes.SUCCESS")

        with pytest.raises(CodeRegistryError) as exc_info:
            registry._register_code(
                "VDJ-TEST-SUCCESS-200", "other_app", "OtherCodes.SUCCESS"
            )

        assert "Duplicate code" in str(exc_info.value)

    def test_register_code_invalid_format(self):
        """Test invalid code format raises error."""
        registry = CodeRegistry()

        with pytest.raises(CodeRegistryError) as exc_info:
            registry._register_code("INVALID-CODE", "test_app", "TestCodes.INVALID")

        assert "Invalid code format" in str(exc_info.value)

    def test_load_app_error_catalog_success(self, sample_error_catalog):
        """Test successful error catalog loading."""
        registry = CodeRegistry()

        # Mock app module
        mock_app = Mock()
        mock_app.__file__ = "/app/test_app/__init__.py"

        # Mock pathlib operations
        mock_catalog_path = Mock()
        mock_catalog_path.exists.return_value = True
        mock_catalog_path.read_text.return_value = "yaml content"

        with patch("apps.core.code_registry.import_module") as mock_import:
            mock_import.return_value = mock_app

            with patch("apps.core.code_registry.pathlib.Path") as mock_path:
                # Set up the parent mock properly
                mock_parent = Mock()
                mock_parent.__truediv__ = Mock(return_value=mock_catalog_path)
                mock_path.return_value.parent = mock_parent

                with patch("apps.core.code_registry.yaml") as mock_yaml:
                    mock_yaml.safe_load.return_value = sample_error_catalog

                    registry._load_app_error_catalog("test_app")

                    # Should register problem types
                    assert "test-error" in registry.problem_types
                    assert "test-success" in registry.problem_types

                    # Check problem type structure
                    error_def = registry.problem_types["test-error"]
                    assert error_def["title"] == "Test Error"
                    assert error_def["default_status"] == 400

    def test_load_app_error_catalog_no_file(self):
        """Test error catalog loading when file doesn't exist."""
        registry = CodeRegistry()

        with patch("importlib.import_module") as mock_import:
            mock_app = Mock()
            mock_app.__file__ = "/app/test_app/__init__.py"
            mock_import.return_value = mock_app

            with patch("pathlib.Path") as mock_path:
                mock_catalog_path = Mock()
                mock_catalog_path.exists.return_value = False

                mock_path_instance = Mock()
                mock_path_instance.parent = Mock()
                mock_path_instance.parent.__truediv__ = Mock(
                    return_value=mock_catalog_path
                )
                mock_path.return_value = mock_path_instance

                registry._load_app_error_catalog("test_app")

                # Should handle gracefully
                assert len(registry.problem_types) == 0

    def test_load_app_error_catalog_yaml_none(self):
        """Test error catalog loading when YAML is not available."""
        registry = CodeRegistry()

        with patch("apps.core.code_registry.yaml", None):
            with patch("apps.core.code_registry.logger") as mock_logger:
                registry._load_app_error_catalog("test_app")

                mock_logger.debug.assert_called_once()

    def test_load_app_error_catalog_invalid_structure(self):
        """Test error catalog loading with invalid structure."""
        registry = CodeRegistry()

        # Mock app module
        mock_app = Mock()
        mock_app.__file__ = "/app/test_app/__init__.py"

        # Mock pathlib operations
        mock_catalog_path = Mock()
        mock_catalog_path.exists.return_value = True
        mock_catalog_path.read_text.return_value = "yaml content"

        with patch("apps.core.code_registry.import_module") as mock_import:
            mock_import.return_value = mock_app

            with patch("apps.core.code_registry.pathlib.Path") as mock_path:
                # Set up the parent mock properly
                mock_parent = Mock()
                mock_parent.__truediv__ = Mock(return_value=mock_catalog_path)
                mock_path.return_value.parent = mock_parent

                with patch("apps.core.code_registry.yaml") as mock_yaml:
                    # Return invalid structure (not a list)
                    mock_yaml.safe_load.return_value = {"invalid": "structure"}

                    import apps.core.code_registry as code_registry_module

                    with patch.object(code_registry_module, "logger") as mock_logger:
                        registry._load_app_error_catalog("test_app")

                        # Should log warning about invalid structure
                        mock_logger.warning.assert_called_once()
                        call_args = mock_logger.warning.call_args[0][0]
                        assert "must be a list" in call_args

    def test_register_problem_type_success(self):
        """Test successful problem type registration."""
        registry = CodeRegistry()

        problem_def = {
            "slug": "test-error",
            "type": "https://docs.yourapp.com/problems/test-error",
            "title": "Test Error",
            "default_status": 400,
            "codes": ["VDJ-TEST-ERROR-400"],
        }

        registry._register_problem_type(problem_def, "test_app")

        assert "test-error" in registry.problem_types
        assert registry.problem_types["test-error"] == problem_def

    def test_register_problem_type_missing_fields(self):
        """Test problem type registration with missing required fields."""
        registry = CodeRegistry()

        problem_def = {
            "slug": "incomplete-error",
            "title": "Incomplete Error",
            # Missing: type, default_status
        }

        with pytest.raises(CodeRegistryError) as exc_info:
            registry._register_problem_type(problem_def, "test_app")

        assert "missing required field" in str(exc_info.value)

    def test_register_problem_type_duplicate_slug(self):
        """Test duplicate problem type slug raises error."""
        registry = CodeRegistry()

        problem_def = {
            "slug": "test-error",
            "type": "https://docs.yourapp.com/problems/test-error",
            "title": "Test Error",
            "default_status": 400,
        }

        registry._register_problem_type(problem_def, "test_app")

        with pytest.raises(CodeRegistryError) as exc_info:
            registry._register_problem_type(problem_def, "other_app")

        assert "Duplicate problem type slug" in str(exc_info.value)

    def test_register_problem_type_invalid_uri(self):
        """Test problem type with invalid URI format."""
        registry = CodeRegistry()

        problem_def = {
            "slug": "test-error",
            "type": "http://docs.yourapp.com/problems/test-error",  # HTTP not HTTPS
            "title": "Test Error",
            "default_status": 400,
        }

        with pytest.raises(CodeRegistryError) as exc_info:
            registry._register_problem_type(problem_def, "test_app")

        assert "must be HTTPS" in str(exc_info.value)

    def test_register_problem_type_invalid_status(self):
        """Test problem type with invalid status code."""
        registry = CodeRegistry()

        problem_def = {
            "slug": "test-error",
            "type": "https://docs.yourapp.com/problems/test-error",
            "title": "Test Error",
            "default_status": 999,  # Invalid status
        }

        with pytest.raises(CodeRegistryError) as exc_info:
            registry._register_problem_type(problem_def, "test_app")

        assert "invalid default_status" in str(exc_info.value)

    def test_register_problem_type_invalid_codes(self):
        """Test problem type with invalid codes."""
        registry = CodeRegistry()

        problem_def = {
            "slug": "test-error",
            "type": "https://docs.yourapp.com/problems/test-error",
            "title": "Test Error",
            "default_status": 400,
            "codes": ["INVALID-CODE-FORMAT"],
        }

        with pytest.raises(CodeRegistryError) as exc_info:
            registry._register_problem_type(problem_def, "test_app")

        assert "invalid code" in str(exc_info.value)

    def test_get_problem_type_exists(self):
        """Test getting existing problem type."""
        registry = CodeRegistry()

        problem_def = {
            "slug": "test-error",
            "type": "https://docs.yourapp.com/problems/test-error",
            "title": "Test Error",
            "default_status": 400,
        }

        registry._register_problem_type(problem_def, "test_app")

        result = registry.get_problem_type("test-error")
        assert result == problem_def

    def test_get_problem_type_not_exists(self):
        """Test getting non-existent problem type."""
        registry = CodeRegistry()

        result = registry.get_problem_type("non-existent")
        assert result is None

    def test_validate_code_exists_true(self):
        """Test validating existing code."""
        registry = CodeRegistry()
        registry._register_code("VDJ-TEST-SUCCESS-200", "test_app", "TestCodes.SUCCESS")

        result = registry.validate_code_exists("VDJ-TEST-SUCCESS-200")
        assert result is True

    def test_validate_code_exists_false(self):
        """Test validating non-existent code."""
        registry = CodeRegistry()

        result = registry.validate_code_exists("VDJ-NONEXISTENT-404")
        assert result is False

    def test_get_stats(self):
        """Test getting registry statistics."""
        registry = CodeRegistry()

        registry._register_code("VDJ-TEST-SUCCESS-200", "test_app", "TestCodes.SUCCESS")

        problem_def = {
            "slug": "test-error",
            "type": "https://docs.yourapp.com/problems/test-error",
            "title": "Test Error",
            "default_status": 400,
        }
        registry._register_problem_type(problem_def, "test_app")

        stats = registry.get_stats()

        assert stats["codes"] == 1
        assert stats["problem_types"] == 1

    def test_full_load_process(self, mock_codes_module, sample_error_catalog):
        """Test complete loading process with multiple apps."""
        registry = CodeRegistry()

        # Mock settings.INSTALLED_APPS
        mock_installed_apps = ["test_app1", "test_app2"]

        with patch("apps.core.code_registry.settings") as mock_settings:
            mock_settings.INSTALLED_APPS = mock_installed_apps

            with patch("apps.core.code_registry.import_module") as mock_import:

                def import_side_effect(module_name):
                    if module_name.endswith(".codes"):
                        # Create different mock modules for different apps to avoid duplicates
                        if "test_app1" in module_name:
                            # Use the original mock_codes_module
                            return mock_codes_module
                        else:
                            # Create a different mock for test_app2 with unique codes
                            app2_module = Mock()
                            app2_member1 = Mock()
                            app2_member1.value = "VDJ-APPB-SUCCESS-200"
                            app2_member1.name = "SUCCESS_200"

                            app2_member2 = Mock()
                            app2_member2.value = "VDJ-APPB-ERROR-400"
                            app2_member2.name = "ERROR_400"

                            # Create metaclass for app2
                            class App2EnumMeta(type):
                                def __iter__(cls):
                                    return iter([cls.SUCCESS_200, cls.ERROR_400])

                            from apps.core.codes import BaseAPICodeMixin

                            class App2TestCodes(
                                BaseAPICodeMixin, metaclass=App2EnumMeta
                            ):
                                __name__ = "TestCodes"
                                SUCCESS_200 = app2_member1
                                ERROR_400 = app2_member2

                            App2TestCodes.__members__ = {
                                "SUCCESS_200": app2_member1,
                                "ERROR_400": app2_member2,
                            }

                            app2_module.TestCodes = App2TestCodes
                            app2_module.SIMPLE_CODE = "VDJ-APPB-SIMPLE-200"
                            app2_module.__name__ = "test_app2.codes"
                            return app2_module
                    else:
                        # Mock app module
                        mock_app = Mock()
                        mock_app.__file__ = (
                            f'/app/{module_name.split(".")[0]}/__init__.py'
                        )
                        return mock_app

                mock_import.side_effect = import_side_effect

                # Mock catalog loading
                with patch("apps.core.code_registry.pathlib.Path") as mock_path:
                    mock_catalog_path = Mock()
                    mock_catalog_path.exists.return_value = True
                    mock_catalog_path.read_text.return_value = "yaml content"

                    # Set up the parent mock properly
                    mock_parent = Mock()
                    mock_parent.__truediv__ = Mock(return_value=mock_catalog_path)
                    mock_path.return_value.parent = mock_parent

                    with patch("apps.core.code_registry.yaml") as mock_yaml:
                        mock_yaml.safe_load.return_value = sample_error_catalog

                        registry.load()

                        # Should load codes and catalogs from both apps
                        assert registry._loaded is True
                        assert (
                            len(registry.codes) == 6
                        )  # 3 codes per app (2 enum + 1 simple)
                        assert (
                            len(registry.problem_types) == 2
                        )  # Only first app's problem types due to duplicates

    def test_enum_iteration_edge_cases(self):
        """Test enum iteration with various edge cases."""
        registry = CodeRegistry()

        # Create a real module-like mock for testing
        module = Mock()

        # Create a proper enum class that raises TypeError when iterated

        class NonIterableEnum(BaseAPICodeMixin):
            __name__ = "NonIterableEnum"

            def __iter__(self):
                raise TypeError("'type' object is not iterable")

            @property
            def __members__(self):
                # Has members but can't iterate over them
                return {"CODE1": "mock_member"}

        # Add to module
        module.NonIterableEnum = NonIterableEnum
        module.__name__ = "test_app.codes"

        with patch("apps.core.code_registry.import_module") as mock_import:
            mock_import.return_value = module

            # Should handle gracefully without raising
            registry._load_app_codes("test_app")

            # Should not register any codes due to iteration error
            assert len(registry.codes) == 0


@pytest.mark.code_registry
class TestGlobalRegistrySingleton:
    """Test the global REGISTRY singleton."""

    def test_global_registry_is_singleton(self):
        """Test that REGISTRY is a singleton instance."""
        from apps.core.code_registry import REGISTRY as registry1
        from apps.core.code_registry import REGISTRY as registry2

        assert registry1 is registry2
        assert isinstance(registry1, CodeRegistry)

    def test_global_registry_methods(self):
        """Test global registry has expected methods."""
        assert hasattr(REGISTRY, "load")
        assert hasattr(REGISTRY, "get_problem_type")
        assert hasattr(REGISTRY, "validate_code_exists")
        assert hasattr(REGISTRY, "get_stats")


@pytest.mark.code_registry
class TestCodeRegistryErrorHandling:
    """Test error handling in various scenarios."""

    def test_yaml_import_error_handling(self):
        """Test handling when YAML module is not available."""
        registry = CodeRegistry()

        with patch("apps.core.code_registry.yaml", None):
            # Should not raise error
            registry._load_app_error_catalog("test_app")

            # Should have no problem types loaded
            assert len(registry.problem_types) == 0

    def test_pathlib_error_handling(self):
        """Test handling of pathlib errors."""
        registry = CodeRegistry()

        # Mock app module
        mock_app = Mock()
        mock_app.__file__ = "/app/test_app/__init__.py"

        with patch("apps.core.code_registry.import_module") as mock_import:
            mock_import.return_value = mock_app

            with patch("apps.core.code_registry.pathlib.Path") as mock_path:
                mock_path.side_effect = OSError("File system error")

                import apps.core.code_registry as code_registry_module

                with patch.object(code_registry_module, "logger") as mock_logger:
                    registry._load_app_error_catalog("test_app")

                    mock_logger.warning.assert_called_once()

    def test_yaml_parsing_error_handling(self):
        """Test handling of YAML parsing errors."""
        registry = CodeRegistry()

        # Mock app module
        mock_app = Mock()
        mock_app.__file__ = "/app/test_app/__init__.py"

        # Mock pathlib operations
        mock_catalog_path = Mock()
        mock_catalog_path.exists.return_value = True
        mock_catalog_path.read_text.return_value = "invalid: yaml: content:"

        with patch("apps.core.code_registry.import_module") as mock_import:
            mock_import.return_value = mock_app

            with patch("apps.core.code_registry.pathlib.Path") as mock_path:
                # Set up the parent mock properly
                mock_parent = Mock()
                mock_parent.__truediv__ = Mock(return_value=mock_catalog_path)
                mock_path.return_value.parent = mock_parent

                with patch("apps.core.code_registry.yaml") as mock_yaml:
                    mock_yaml.safe_load.side_effect = Exception("YAML parsing error")

                    import apps.core.code_registry as code_registry_module

                    with patch.object(code_registry_module, "logger") as mock_logger:
                        registry._load_app_error_catalog("test_app")

                        mock_logger.warning.assert_called_once()

    def test_code_validation_edge_cases(self):
        """Test code validation with edge cases."""
        registry = CodeRegistry()

        # Test with BaseAPICodeMixin validation
        with patch("apps.core.codes.BaseAPICodeMixin.validate_code") as mock_validate:
            mock_validate.return_value = False

            with pytest.raises(CodeRegistryError) as exc_info:
                registry._register_code(
                    "INVALID-FORMAT", "test_app", "TestCodes.INVALID"
                )

            assert "Invalid code format" in str(exc_info.value)
