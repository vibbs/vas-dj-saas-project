from rest_framework import serializers
from .models import Organization


class OrganizationCreateSerializer(serializers.ModelSerializer):
    creator_password = serializers.CharField(write_only=True)

    class Meta:
        model = Organization
        fields = [
            "name",
            "slug",
            "creator_email",
            "creator_name",
            "creator_password",
            "description",
        ]

    def create(self, validated_data):
        creator_password = validated_data.pop("creator_password")
        org, creator = Organization.objects.create_with_creator(
            creator_password=creator_password, **validated_data
        )
        return org
