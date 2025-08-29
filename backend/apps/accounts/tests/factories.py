import factory
from factory.django import DjangoModelFactory
from faker import Faker
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from apps.accounts.models import Account, AccountAuthProvider
from apps.accounts.enums import UserRoleTypes, GenderTypes, UserStatusTypes


class AccountFactory(DjangoModelFactory):
    class Meta:
        model = Account
        skip_postgeneration_save = True
    
    email = factory.Faker('email')
    first_name = factory.LazyFunction(lambda: Faker().first_name()[:30])  # Truncate to max 30 chars
    last_name = factory.LazyFunction(lambda: Faker().last_name()[:30])  # Truncate to max 30 chars
    avatar = factory.Faker('url')
    phone = factory.LazyFunction(lambda: Faker().phone_number()[:20])  # Truncate to max 20 chars
    bio = factory.Faker('text', max_nb_chars=200)
    date_of_birth = factory.Faker('date_of_birth', minimum_age=18, maximum_age=80)
    
    gender = factory.Iterator([choice[0] for choice in GenderTypes.choices()])
    role = UserRoleTypes.USER.value
    
    is_active = True
    is_staff = False
    is_2fa_enabled = False
    is_email_verified = True
    is_phone_verified = False
    
    date_joined = factory.LazyFunction(lambda: timezone.now())
    status = UserStatusTypes.ACTIVE.value
    
    is_org_admin = False
    is_org_creator = False
    
    can_invite_users = False
    can_manage_billing = False
    can_delete_org = False
    
    password = factory.LazyFunction(lambda: make_password('testpassword123'))
    
    @factory.post_generation
    def organization(self, create, extracted, **kwargs):
        if extracted:
            self.organization = extracted


class AdminAccountFactory(AccountFactory):
    """Factory for admin users."""
    role = UserRoleTypes.ADMIN.value
    is_org_admin = True
    can_invite_users = True
    can_manage_billing = True


class SuperuserAccountFactory(AccountFactory):
    """Factory for superuser accounts."""
    is_staff = True
    is_superuser = True
    role = UserRoleTypes.ADMIN.value


class UnverifiedAccountFactory(AccountFactory):
    """Factory for unverified accounts."""
    is_email_verified = False
    status = UserStatusTypes.PENDING.value
    email_verification_token = factory.Faker('uuid4')
    email_verification_token_expires = factory.LazyFunction(lambda: timezone.now() + timezone.timedelta(days=1))


class AccountAuthProviderFactory(DjangoModelFactory):
    class Meta:
        model = AccountAuthProvider
        skip_postgeneration_save = True
    
    user = factory.SubFactory(AccountFactory)
    provider = 'email'
    provider_user_id = factory.LazyAttribute(lambda obj: obj.user.email)
    email = factory.LazyAttribute(lambda obj: obj.user.email)
    linked_at = factory.LazyFunction(lambda: timezone.now())
    is_primary = True


class GoogleAuthProviderFactory(AccountAuthProviderFactory):
    """Factory for Google OAuth provider."""
    provider = 'google'
    provider_user_id = factory.Faker('uuid4')
    is_primary = False