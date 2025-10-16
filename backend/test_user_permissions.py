import pytest


@pytest.mark.django_db
def test_user_permissions(user_with_org):
    print(f"\nUser: {user_with_org.email}")
    print(f"is_staff: {user_with_org.is_staff}")
    print(f"is_superuser: {user_with_org.is_superuser}")
    print(f"is_active: {user_with_org.is_active}")
    assert user_with_org.is_staff == False
    assert user_with_org.is_superuser == False
