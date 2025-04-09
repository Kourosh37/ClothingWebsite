"""Add Category model

Revision ID: 87230d9e21cf
Revises: create_categories
Create Date: 2024-03-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '87230d9e21cf'
down_revision = 'create_categories'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('products') as batch_op:
        batch_op.create_foreign_key('fk_product_category', 'categories', ['category_id'], ['id'])


def downgrade():
    with op.batch_alter_table('products') as batch_op:
        batch_op.drop_constraint('fk_product_category', type_='foreignkey') 