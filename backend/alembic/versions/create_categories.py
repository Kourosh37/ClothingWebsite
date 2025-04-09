"""create categories table and update products table

Revision ID: create_categories
Revises: 
Create Date: 2024-04-09 20:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'create_categories'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Drop categories table if it exists
    op.execute("DROP TABLE IF EXISTS categories")

    # Create categories table
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create a temporary table for products with the new schema
    op.create_table(
        'products_new',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('image', sa.String(), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('stock', sa.Integer(), server_default='0', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Insert default category
    op.execute("""
        INSERT INTO categories (name)
        VALUES ('عمومی')
    """)

    # Copy data from old table to new table (if it exists)
    op.execute("""
        INSERT INTO products_new (id, name, description, price, image, category_id, stock, created_at)
        SELECT id, name, description, price, image, 1, stock, created_at
        FROM products
        WHERE EXISTS (SELECT 1 FROM products)
    """)

    # Drop the old table (if it exists)
    op.execute("DROP TABLE IF EXISTS products")

    # Rename the new table to the original name
    op.rename_table('products_new', 'products')


def downgrade():
    # Create a temporary table for products with the old schema
    op.create_table(
        'products_old',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('image', sa.String(), nullable=True),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('stock', sa.Integer(), server_default='0', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Copy data from new table to old table
    op.execute("""
        INSERT INTO products_old (id, name, description, price, image, category, stock, created_at)
        SELECT p.id, p.name, p.description, p.price, p.image, c.name, p.stock, p.created_at
        FROM products p
        JOIN categories c ON p.category_id = c.id
    """)

    # Drop the new table
    op.drop_table('products')

    # Rename the old table to the original name
    op.rename_table('products_old', 'products')

    # Drop the categories table
    op.drop_table('categories') 