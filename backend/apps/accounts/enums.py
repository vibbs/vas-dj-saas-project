from apps.core.utils.enums import CustomEnum


class TeamRoleTypes(CustomEnum):
    ADMIN = "ADMIN"
    MEMBER = "MEMBER"
    VIEWER = "VIEWER"


class UserRoleTypes(CustomEnum):
    ADMIN = "ADMIN"
    USER = "USER"
    GUEST = "guest"


class GenderTypes(CustomEnum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"
    UNKNOWN = "UNKNOWN"


class UserStatusTypes(CustomEnum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"
    DELETED = "DELETED"
    BANNED = "BANNED"
    PENDING = "PENDING"
