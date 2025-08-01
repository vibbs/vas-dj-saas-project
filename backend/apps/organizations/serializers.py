from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Organization


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'slug', 'description', 'logo', 'sub_domain',
            'created_at', 'updated_at', 'creator_email', 'creator_name',
            'is_active', 'paid_until', 'on_trial', 'trial_ends_on'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'slug']
        
    def validate_sub_domain(self, value):
        # Ensure subdomain is unique and valid
        if Organization.objects.filter(sub_domain=value).exists():
            raise serializers.ValidationError(_("This subdomain is already taken."))
        return value


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
            "sub_domain",
        ]

    def create(self, validated_data):
        creator_password = validated_data.pop("creator_password")
        org, creator = Organization.objects.create_with_creator(
            creator_password=creator_password, **validated_data
        )
        return org
