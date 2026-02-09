import logging
from typing import Any

from django.conf import settings
from django.template.exceptions import TemplateDoesNotExist
from django.template.loader import get_template
from jinja2 import BaseLoader, Environment, TemplateNotFound, TemplateSyntaxError

from .models import EmailTemplate

log = logging.getLogger(f"{settings.LOG_APP_PREFIX}.email_service.renderers")


class DatabaseTemplateLoader(BaseLoader):
    """Custom Jinja2 loader that loads templates from database"""

    def __init__(self, organization):
        self.organization = organization

    def get_source(self, environment, template):
        try:
            email_template = EmailTemplate.objects.get(
                organization=self.organization, slug=template, is_active=True
            )
            source = email_template.html_content
            return source, None, lambda: True
        except EmailTemplate.DoesNotExist:
            raise TemplateNotFound(template)


class TemplateRenderer:
    """
    Template rendering system with Jinja2 and Django template support.
    Provides context injection, template overrides, and safe rendering.
    """

    def __init__(self, organization):
        self.organization = organization
        self.jinja_env = self._setup_jinja_environment()

    def _setup_jinja_environment(self):
        """Set up Jinja2 environment with custom loader"""
        loader = DatabaseTemplateLoader(self.organization)
        env = Environment(
            loader=loader,
            autoescape=True,
            trim_blocks=True,
            lstrip_blocks=True,
        )

        # Add custom filters and functions
        env.filters["currency"] = self._currency_filter
        env.globals["site_url"] = getattr(settings, "SITE_URL", "http://localhost:8000")

        return env

    def _currency_filter(self, value, currency="USD"):
        """Jinja2 filter for formatting currency"""
        try:
            amount = float(value)
            if currency.upper() == "USD":
                return f"${amount:,.2f}"
            return f"{amount:,.2f} {currency.upper()}"
        except (ValueError, TypeError):
            return str(value)

    def _get_base_context(self, user=None, organization=None):
        """Get base context available to all templates"""
        context = {
            "organization": organization or self.organization,
            "site_url": getattr(settings, "SITE_URL", "http://localhost:8000"),
            "support_email": getattr(settings, "SUPPORT_EMAIL", "support@example.com"),
        }

        if user:
            context.update(
                {
                    "user": user,
                    "user_name": getattr(user, "full_name", "")
                    or getattr(user, "email", ""),
                    "user_email": getattr(user, "email", ""),
                }
            )

        return context

    def _load_template_from_db(self, template_slug: str) -> EmailTemplate | None:
        """Load email template from database"""
        # Skip database lookup if no organization
        if not self.organization:
            log.debug(
                f"No organization set, skipping database template lookup for '{template_slug}'"
            )
            return None

        try:
            template = EmailTemplate.objects.get(
                organization=self.organization, slug=template_slug, is_active=True
            )
            log.debug(
                f"Found database template '{template_slug}' for organization {self.organization.id}"
            )
            return template
        except EmailTemplate.DoesNotExist:
            log.debug(
                f"Email template '{template_slug}' not found in database for organization {self.organization.id}"
            )
            return None

    def _load_template_from_file(self, template_slug: str) -> dict[str, str] | None:
        """Load default template from file system as fallback"""
        try:
            log.debug(f"Attempting to load file template: {template_slug}")

            # Try to load HTML template
            html_template_path = f"email_service/{template_slug}.html"
            html_template = get_template(html_template_path)
            log.debug(f"Successfully loaded HTML template: {html_template_path}")

            # Try to load text template
            text_template_path = f"email_service/{template_slug}.txt"
            try:
                text_template = get_template(text_template_path)
                text_content = text_template.template.source
                log.debug(f"Successfully loaded text template: {text_template_path}")
            except TemplateDoesNotExist:
                text_content = ""
                log.debug(f"Text template not found: {text_template_path}")

            # Set default subject for file templates
            if template_slug == "email_verification":
                subject_content = "Verify Your Email Address - {% if organization %}{{ organization.name }}{% else %}VAS-DJ Platform{% endif %}"
            else:
                subject_content = "{{ subject | default('Notification from ' + (organization.name if organization else 'VAS-DJ Platform')) }}"

            template_data = {
                "html_content": html_template.template.source,
                "text_content": text_content,
                "subject": subject_content,
            }

            log.debug(
                f"Template data loaded for {template_slug}: subject='{subject_content[:50]}...', html_length={len(template_data['html_content'])}, text_length={len(text_content)}"
            )
            return template_data

        except TemplateDoesNotExist as e:
            log.warning(
                f"Default template '{template_slug}' not found in file system: {e}"
            )
            return None
        except Exception as e:
            log.error(
                f"Error loading template '{template_slug}' from file system: {e}",
                exc_info=True,
            )
            return None

    def render_subject(self, template_slug: str, context: dict[str, Any]) -> str:
        """Render email subject with context"""
        try:
            # Try database template first (use Jinja2)
            email_template = self._load_template_from_db(template_slug)
            if email_template:
                subject_template = email_template.subject
                # Use Jinja2 for database templates
                template = self.jinja_env.from_string(subject_template)
                base_context = self._get_base_context()
                base_context.update(context)
                return template.render(**base_context).strip()
            else:
                # For file templates, use hardcoded subjects or context-based subjects
                if template_slug == "email_verification":
                    org_name = (
                        context.get("organization", {}).get("name")
                        if isinstance(context.get("organization"), dict)
                        else (
                            getattr(context.get("organization"), "name", None)
                            if context.get("organization")
                            else None
                        )
                    )
                    return (
                        f"Verify Your Email Address - {org_name or 'VAS-DJ Platform'}"
                    )
                else:
                    # Default subject from context or fallback
                    return context.get(
                        "subject",
                        f"Notification from {self.organization.name if self.organization else 'VAS-DJ Platform'}",
                    )

        except (TemplateSyntaxError, Exception) as e:
            log.error(
                f"Error rendering subject for template '{template_slug}': {e}",
                exc_info=True,
            )
            return f"Notification from {self.organization.name if self.organization else 'VAS-DJ Platform'}"

    def render_html(self, template_slug: str, context: dict[str, Any]) -> str:
        """Render HTML email content with context"""
        try:
            # Try database template first (use Jinja2)
            email_template = self._load_template_from_db(template_slug)
            if email_template and email_template.html_content:
                html_content = email_template.html_content
                # Use Jinja2 for database templates
                template = self.jinja_env.from_string(html_content)
                base_context = self._get_base_context()
                base_context.update(context)
                return template.render(**base_context)
            else:
                # Try file template (use Django templates)
                try:
                    html_template_path = f"email_service/{template_slug}.html"
                    django_template = get_template(html_template_path)
                    # Merge base context with provided context for Django templates
                    base_context = self._get_base_context()
                    base_context.update(context)
                    return django_template.render(base_context)
                except TemplateDoesNotExist:
                    # Final fallback - basic template with Jinja2
                    html_content = """
                    <html>
                        <body>
                            <h2>{{ subject }}</h2>
                            <p>{{ message | default('No message content available.') }}</p>
                            <hr>
                            <p><small>Sent from {{ organization.name if organization else 'VAS-DJ Platform' }}</small></p>
                        </body>
                    </html>
                    """
                    template = self.jinja_env.from_string(html_content)
                    base_context = self._get_base_context()
                    base_context.update(context)
                    return template.render(**base_context)

        except (TemplateSyntaxError, Exception) as e:
            log.error(
                f"Error rendering HTML for template '{template_slug}': {e}",
                exc_info=True,
            )
            # Return basic HTML as fallback
            return f"""
            <html>
                <body>
                    <h2>Notification from {self.organization.name if self.organization else 'VAS-DJ Platform'}</h2>
                    <p>There was an error rendering this email content.</p>
                </body>
            </html>
            """

    def render_text(self, template_slug: str, context: dict[str, Any]) -> str:
        """Render plain text email content with context"""
        try:
            # Try database template first (use Jinja2)
            email_template = self._load_template_from_db(template_slug)
            if email_template and email_template.text_content:
                text_content = email_template.text_content
                # Use Jinja2 for database templates
                template = self.jinja_env.from_string(text_content)
                base_context = self._get_base_context()
                base_context.update(context)
                return template.render(**base_context)
            else:
                # Try file template (use Django templates)
                try:
                    text_template_path = f"email_service/{template_slug}.txt"
                    django_template = get_template(text_template_path)
                    # Merge base context with provided context for Django templates
                    base_context = self._get_base_context()
                    base_context.update(context)
                    return django_template.render(base_context)
                except TemplateDoesNotExist:
                    # Generate text from HTML as fallback
                    html_content = self.render_html(template_slug, context)
                    # Basic HTML to text conversion
                    import re

                    text_content = re.sub(r"<[^>]+>", "", html_content)
                    text_content = re.sub(r"\s+", " ", text_content).strip()
                    return text_content

        except (TemplateSyntaxError, Exception) as e:
            log.error(
                f"Error rendering text for template '{template_slug}': {e}",
                exc_info=True,
            )
            # Return basic text as fallback
            return f"Notification from {self.organization.name if self.organization else 'VAS-DJ Platform'}\n\n{context.get('message', 'No message content available.')}"

    def render_email(
        self, template_slug: str, context: dict[str, Any], user=None
    ) -> dict[str, str]:
        """
        Render complete email (subject, HTML, text) with context.

        Args:
            template_slug: Template identifier
            context: Template context variables
            user: User object for user-specific context

        Returns:
            Dict with 'subject', 'html_content', 'text_content' keys
        """
        log.debug(
            f"Rendering email template '{template_slug}' with context keys: {list(context.keys())}"
        )

        # Add user to base context
        base_context = self._get_base_context(user=user)
        base_context.update(context)

        rendered_content = {
            "subject": self.render_subject(template_slug, base_context),
            "html_content": self.render_html(template_slug, base_context),
            "text_content": self.render_text(template_slug, base_context),
        }

        log.debug(f"Successfully rendered email template '{template_slug}'")
        return rendered_content
