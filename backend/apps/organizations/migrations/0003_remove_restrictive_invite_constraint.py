# Generated manually to remove restrictive invite constraint

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organizations', '0002_alter_invite_unique_together_alter_invite_email_and_more'),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='invite',
            name='organizations_invite_expires_after_created',
        ),
    ]