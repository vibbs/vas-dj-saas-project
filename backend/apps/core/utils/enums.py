

# We want to create a custom enum class which can used across the project
from enum import Enum

class CustomEnum(Enum):
    """
    Custom Enum class to provide additional functionality if needed.
    This can be extended with methods or properties that are common to all enums in the project.
    """
    
    @classmethod
    def choices(cls):
        """
        Returns a list of tuples for use in model fields.
        Each tuple contains the enum value and its name.
        """
        return [(tag.value, tag.value) for tag in cls]
    

    def __str__(self):
        return self.value

    def __eq__(self, other):
        if isinstance(other, str):
            return self.value == other
        return super().__eq__(other)
    
    def check_value(self, value):
        """
        Check if the provided value is a valid choice for this enum.
        """
        return value in [tag.value for tag in self]