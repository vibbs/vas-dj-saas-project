import os
import logging
from typing import Dict, Any, Optional
from django.conf import settings
from django.template import Template, Context
from django.template.loader import get_template
from django.template.exceptions import TemplateDoesNotExist
from jinja2 import Environment, BaseLoader, TemplateNotFound, TemplateSyntaxError
from .models import EmailTemplate

logger = logging.getLogger(__name__)


class DatabaseTemplateLoader(BaseLoader):
    """Custom Jinja2 loader that loads templates from database"""
    
    def __init__(self, organization):
        self.organization = organization
    
    def get_source(self, environment, template):
        try:
            email_template = EmailTemplate.objects.get(
                organization=self.organization,
                slug=template,
                is_active=True
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
        env.filters['currency'] = self._currency_filter
        env.globals['site_url'] = getattr(settings, 'SITE_URL', 'http://localhost:8000')
        
        return env
    
    def _currency_filter(self, value, currency='USD'):
        """Jinja2 filter for formatting currency"""
        try:
            amount = float(value)
            if currency.upper() == 'USD':
                return f"${amount:,.2f}"
            return f"{amount:,.2f} {currency.upper()}"
        except (ValueError, TypeError):
            return str(value)
    
    def _get_base_context(self, user=None, organization=None):
        """Get base context available to all templates"""
        context = {
            'organization': organization or self.organization,
            'site_url': getattr(settings, 'SITE_URL', 'http://localhost:8000'),
            'support_email': getattr(settings, 'SUPPORT_EMAIL', 'support@example.com'),
        }
        
        if user:
            context.update({
                'user': user,
                'user_name': getattr(user, 'full_name', '') or getattr(user, 'email', ''),
                'user_email': getattr(user, 'email', ''),
            })
        
        return context
    
    def _load_template_from_db(self, template_slug: str) -> Optional[EmailTemplate]:
        """Load email template from database"""
        try:
            return EmailTemplate.objects.get(
                organization=self.organization,
                slug=template_slug,
                is_active=True
            )
        except EmailTemplate.DoesNotExist:
            logger.warning(f"Email template '{template_slug}' not found in database")
            return None
    
    def _load_template_from_file(self, template_slug: str) -> Optional[Dict[str, str]]:
        """Load default template from file system as fallback"""
        try:
            # Try to load HTML template
            html_template_path = f"email_service/{template_slug}.html"
            html_template = get_template(html_template_path)
            
            # Try to load text template
            text_template_path = f"email_service/{template_slug}.txt"
            try:
                text_template = get_template(text_template_path)
                text_content = text_template.template.source
            except TemplateDoesNotExist:
                text_content = ""
            
            return {
                'html_content': html_template.template.source,
                'text_content': text_content,
                'subject': f"{{{{ subject | default('Notification from {self.organization.name}') }}}}",
            }
            
        except TemplateDoesNotExist:
            logger.warning(f"Default template '{template_slug}' not found in file system")
            return None
    
    def render_subject(self, template_slug: str, context: Dict[str, Any]) -> str:
        """Render email subject with context"""
        try:
            # Try database template first
            email_template = self._load_template_from_db(template_slug)
            if email_template:
                subject_template = email_template.subject
            else:
                # Fallback to file template
                file_template = self._load_template_from_file(template_slug)
                if file_template:
                    subject_template = file_template['subject']
                else:
                    return f"Notification from {self.organization.name}"
            
            # Render with Jinja2
            template = self.jinja_env.from_string(subject_template)
            base_context = self._get_base_context()
            base_context.update(context)
            
            return template.render(**base_context).strip()
            
        except (TemplateSyntaxError, Exception) as e:
            logger.error(f"Error rendering subject for template '{template_slug}': {e}")
            return f"Notification from {self.organization.name}"
    
    def render_html(self, template_slug: str, context: Dict[str, Any]) -> str:
        """Render HTML email content with context"""
        try:
            # Try database template first
            email_template = self._load_template_from_db(template_slug)
            if email_template and email_template.html_content:
                html_content = email_template.html_content
            else:
                # Fallback to file template
                file_template = self._load_template_from_file(template_slug)
                if file_template:
                    html_content = file_template['html_content']
                else:
                    # Final fallback - basic template
                    html_content = """
                    <html>
                        <body>
                            <h2>{{ subject }}</h2>
                            <p>{{ message | default('No message content available.') }}</p>
                            <hr>
                            <p><small>Sent from {{ organization.name }}</small></p>
                        </body>
                    </html>
                    """
            
            # Render with Jinja2
            template = self.jinja_env.from_string(html_content)
            base_context = self._get_base_context()
            base_context.update(context)
            
            return template.render(**base_context)
            
        except (TemplateSyntaxError, Exception) as e:
            logger.error(f"Error rendering HTML for template '{template_slug}': {e}")
            # Return basic HTML as fallback
            return f"""
            <html>
                <body>
                    <h2>Notification from {self.organization.name}</h2>
                    <p>There was an error rendering this email content.</p>
                </body>
            </html>
            """
    
    def render_text(self, template_slug: str, context: Dict[str, Any]) -> str:
        """Render plain text email content with context"""
        try:
            # Try database template first
            email_template = self._load_template_from_db(template_slug)
            if email_template and email_template.text_content:
                text_content = email_template.text_content
            else:
                # Fallback to file template
                file_template = self._load_template_from_file(template_slug)
                if file_template and file_template['text_content']:
                    text_content = file_template['text_content']
                else:
                    # Generate text from HTML
                    html_content = self.render_html(template_slug, context)
                    # Basic HTML to text conversion
                    import re
                    text_content = re.sub(r'<[^>]+>', '', html_content)
                    text_content = re.sub(r'\s+', ' ', text_content).strip()
            
            # Render with Jinja2
            template = self.jinja_env.from_string(text_content)
            base_context = self._get_base_context()
            base_context.update(context)
            
            return template.render(**base_context)
            
        except (TemplateSyntaxError, Exception) as e:
            logger.error(f"Error rendering text for template '{template_slug}': {e}")
            # Return basic text as fallback
            return f"Notification from {self.organization.name}\n\n{context.get('message', 'No message content available.')}"
    
    def render_email(self, template_slug: str, context: Dict[str, Any], user=None) -> Dict[str, str]:
        """
        Render complete email (subject, HTML, text) with context.
        
        Args:
            template_slug: Template identifier
            context: Template context variables
            user: User object for user-specific context
            
        Returns:
            Dict with 'subject', 'html_content', 'text_content' keys
        """
        # Add user to base context
        base_context = self._get_base_context(user=user)
        base_context.update(context)
        
        return {
            'subject': self.render_subject(template_slug, base_context),
            'html_content': self.render_html(template_slug, base_context),
            'text_content': self.render_text(template_slug, base_context),
        }