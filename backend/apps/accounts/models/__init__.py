# Register the models here from accounts app
from .account import Account, AccountAuthProvider
from .team import Team, TeamMembership

# Ensure that the models are imported so they are registered with Django
__all__ = [
    "Account",
    "AccountAuthProvider",
    "Team",
    "TeamMembership",
]
