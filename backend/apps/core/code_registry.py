"""
Central registry for error codes and problem types.

Scans all installed Django apps for:
- `BaseAPICodeEnum`/`BaseAPICodeMixin` subclasses
- String constants that match the code format
- `error_catalog.yml` problem definitions

Validates uniqueness and format compliance for RFC 7807 usage.
"""

import logging
import pathlib
from importlib import import_module
from typing import Any

from django.conf import settings

from apps.core.codes import BaseAPICodeMixin

# Handle optional YAML dependency
try:
    import yaml
except ImportError:
    yaml = None

logger = logging.getLogger(__name__)


class CodeRegistryError(Exception):
    """Exception raised when there are issues with the code registry."""

    pass


class CodeRegistry:
    """
    Central registry for error codes and problem type definitions.

    Scans Django apps for code enums and YAML error catalogs,
    validates format compliance, and provides lookup methods.
    """

    def __init__(self):
        self.codes: set[str] = set()
        self.problem_types: dict[str, dict[str, Any]] = {}
        self._loaded = False

    def load(self) -> None:
        """Load all codes and error catalogs from installed apps."""
        if self._loaded:
            logger.debug("Code registry already loaded, skipping")
            return

        logger.info("Loading code registry...")

        for app_name in settings.INSTALLED_APPS:
            try:
                self._load_app_codes(app_name)
                self._load_app_error_catalog(app_name)
            except Exception as e:
                logger.warning(f"Failed to load codes/catalog from {app_name}: {e}")
                continue

        self._loaded = True
        logger.info(
            f"Code registry loaded: {len(self.codes)} codes, {len(self.problem_types)} problem types"
        )

    def _load_app_codes(self, app_name: str) -> None:
        """Import `codes.py` from an app and register all codes."""
        try:
            codes_module = import_module(f"{app_name}.codes")
        except ModuleNotFoundError:
            return
        except Exception as e:
            logger.warning(f"Error importing codes from {app_name}: {e}")
            return

        for attr_name in dir(codes_module):
            if attr_name.startswith("_"):
                continue

            attr_value = getattr(codes_module, attr_name)

            # Case 1: Enum subclass of BaseAPICodeMixin
            if isinstance(attr_value, type) and issubclass(
                attr_value, BaseAPICodeMixin
            ):
                try:
                    # Check if it's actually an enum-like class that can be iterated
                    if hasattr(attr_value, "__members__"):
                        # It's a proper enum with members
                        for member in attr_value:
                            self._register_code(
                                member.value, app_name, f"{attr_name}.{member.name}"
                            )
                    elif hasattr(attr_value, "__iter__") and not isinstance(
                        attr_value, (str, bytes)
                    ):
                        # It's iterable but not a string
                        for member in attr_value:
                            self._register_code(
                                member.value, app_name, f"{attr_name}.{member.name}"
                            )
                    else:
                        # It's a class but not iterable, skip it
                        logger.debug(
                            f"Skipping non-iterable enum class: {attr_name} in {app_name}"
                        )
                except TypeError as e:
                    logger.warning(
                        f"Cannot iterate over {attr_name} in {app_name}: {e}"
                    )
                    continue

            # Case 2: Plain string constant that looks like a code
            elif isinstance(attr_value, str) and BaseAPICodeMixin.validate_code(
                attr_value
            ):
                self._register_code(attr_value, app_name, attr_name)

    def _load_app_error_catalog(self, app_name: str) -> None:
        """Load `error_catalog.yml` from the app directory if present."""
        if yaml is None:
            logger.debug(f"YAML not available, skipping error catalog for {app_name}")
            return

        try:
            app_module = import_module(app_name)
            app_path = pathlib.Path(app_module.__file__).parent
            catalog_path = app_path / "error_catalog.yml"

            if not catalog_path.exists():
                return

            catalog_data = yaml.safe_load(catalog_path.read_text()) or []
            if not isinstance(catalog_data, list):
                raise CodeRegistryError(
                    f"Error catalog in {app_name} must be a list of problem type definitions"
                )

            for problem_def in catalog_data:
                self._register_problem_type(problem_def, app_name)

        except Exception as e:
            logger.warning(f"Error loading error catalog from {app_name}: {e}")

    def _register_code(self, code: str, app_name: str, source_name: str) -> None:
        """Register a code string and check for duplicates/format errors."""
        if code in self.codes:
            raise CodeRegistryError(
                f"Duplicate code '{code}' found in {app_name}.{source_name}"
            )

        if not BaseAPICodeMixin.validate_code(code):
            raise CodeRegistryError(
                f"Invalid code format '{code}' in {app_name}.{source_name}"
            )

        self.codes.add(code)
        logger.debug(f"Registered code: {code} from {app_name}.{source_name}")

    def _register_problem_type(
        self, problem_def: dict[str, Any], app_name: str
    ) -> None:
        """Register a problem type and validate its structure."""
        required_fields = ["slug", "type", "title", "default_status"]
        for field in required_fields:
            if field not in problem_def:
                raise CodeRegistryError(
                    f"Problem type in {app_name} missing required field: {field}"
                )

        slug = problem_def["slug"]

        if slug in self.problem_types:
            raise CodeRegistryError(
                f"Duplicate problem type slug '{slug}' found in {app_name}"
            )

        type_uri = problem_def["type"]
        if not type_uri.startswith("https://") or not type_uri.endswith(
            f"/problems/{slug}"
        ):
            raise CodeRegistryError(
                f"Problem type URI '{type_uri}' must be HTTPS and end with '/problems/{slug}'"
            )

        default_status = problem_def["default_status"]
        if not isinstance(default_status, int) or not (100 <= default_status <= 599):
            raise CodeRegistryError(
                f"Problem type '{slug}' has invalid default_status: {default_status}"
            )

        if "codes" in problem_def:
            codes = problem_def["codes"]
            if not isinstance(codes, list):
                raise CodeRegistryError(f"Problem type '{slug}' codes must be a list")

            for code in codes:
                if not BaseAPICodeMixin.validate_code(code):
                    raise CodeRegistryError(
                        f"Problem type '{slug}' contains invalid code: {code}"
                    )

        self.problem_types[slug] = problem_def
        logger.debug(f"Registered problem type: {slug} from {app_name}")

    def get_problem_type(self, slug: str) -> dict[str, Any] | None:
        return self.problem_types.get(slug)

    def validate_code_exists(self, code: str) -> bool:
        return code in self.codes

    def get_stats(self) -> dict[str, int]:
        return {
            "codes": len(self.codes),
            "problem_types": len(self.problem_types),
        }


# Global singleton registry
REGISTRY = CodeRegistry()
