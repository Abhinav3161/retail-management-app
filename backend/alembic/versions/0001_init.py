"""initial schema

Revision ID: 0001_init
Revises: 
Create Date: 2026-02-24
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(), nullable=False, unique=True, index=True),
        sa.Column("full_name", sa.String(), nullable=True),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=True, server_default="staff"),
        sa.Column("created_at", sa.DateTime(), nullable=True, server_default=sa.func.now()),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("sku", sa.String(), nullable=True),
        sa.Column("category", sa.String(), nullable=True),
        sa.Column("cost_price", sa.Float(), nullable=False),
        sa.Column("selling_price", sa.Float(), nullable=False),
        sa.Column("stock", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=True, server_default=sa.func.now()),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("sku"),
    )
    op.create_index("ix_products_name", "products", ["name"], unique=True)
    op.create_index("ix_products_sku", "products", ["sku"], unique=True)

    op.create_table(
        "sales",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("invoice_number", sa.String(), nullable=False, unique=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("customer_name", sa.String(), nullable=True),
        sa.Column("total_amount", sa.Float(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True, server_default=sa.func.now()),
    )
    op.create_index("ix_sales_invoice_number", "sales", ["invoice_number"], unique=True)

    op.create_table(
        "sale_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("sale_id", sa.Integer(), sa.ForeignKey("sales.id"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("products.id"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("selling_price", sa.Float(), nullable=False),
        sa.Column("cost_price", sa.Float(), nullable=False),
    )

    op.create_table(
        "return_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("sale_item_id", sa.Integer(), sa.ForeignKey("sale_items.id"), nullable=False),
        sa.Column("sale_id", sa.Integer(), sa.ForeignKey("sales.id"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("reason", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("return_items")
    op.drop_table("sale_items")
    op.drop_index("ix_sales_invoice_number", table_name="sales")
    op.drop_table("sales")
    op.drop_index("ix_products_sku", table_name="products")
    op.drop_index("ix_products_name", table_name="products")
    op.drop_table("products")
    op.drop_index("ix_users_username", table_name="users")
    op.drop_table("users")
