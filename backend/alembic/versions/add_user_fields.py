"""add email and full_name to users table

Revision ID: add_user_fields
Revises: create_categories
Create Date: 2024-04-09 21:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_user_fields'
down_revision = 'create_categories'
branch_labels = None
depends_on = None


def upgrade():
    # Add email and full_name columns to users table
    op.add_column('users', sa.Column('email', sa.String(), nullable=True))
    op.add_column('users', sa.Column('full_name', sa.String(), nullable=True))
    
    # Make email unique and indexed
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    
    # Update existing admin user
    op.execute("""
        UPDATE users 
        SET email = 'admin@example.com',
            full_name = 'Administrator'
        WHERE username = 'admin'
    """)


def downgrade():
    # Remove the columns
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_column('users', 'email')
    op.drop_column('users', 'full_name') 