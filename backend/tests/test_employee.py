import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.models.employee import Employee
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.core.security import Security


@pytest.mark.asyncio
async def test_create_employee_success(
    async_client: AsyncClient,
    db_session: AsyncSession,
    admin_user: User,
    test_organization: Organization,
):
    """Test successful employee creation by admin"""

    employee_data = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "password": "securepassword123",
        "organization_id": test_organization.id,
    }

    response = await async_client.post(
        "/api/v1/employees/",
        json=employee_data,
        headers={"Authorization": f"Bearer {admin_user.id}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == employee_data["name"]
    assert data["email"] == employee_data["email"]
    assert data["organization_id"] == test_organization.id
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_create_employee_unauthorized(
    async_client: AsyncClient,
    db_session: AsyncSession,
    regular_user: User,
    test_organization: Organization,
):
    """Test employee creation by unauthorized user"""

    employee_data = {
        "name": "John Doe",
        "email": "john.doe@example.com",
        "password": "securepassword123",
        "organization_id": test_organization.id,
    }

    response = await async_client.post(
        "/api/v1/employees/",
        json=employee_data,
        headers={"Authorization": f"Bearer {regular_user.id}"},
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_organization_employees(
    async_client: AsyncClient,
    db_session: AsyncSession,
    admin_user: User,
    test_organization: Organization,
):
    """Test getting employees for an organization"""

    response = await async_client.get(
        f"/api/v1/employees/organization/{test_organization.id}",
        headers={"Authorization": f"Bearer {admin_user.id}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "employees" in data
    assert "total" in data
    assert "page" in data
    assert "size" in data


@pytest.mark.asyncio
async def test_update_employee(
    async_client: AsyncClient,
    db_session: AsyncSession,
    admin_user: User,
    test_employee: Employee,
):
    """Test updating an employee"""

    update_data = {"name": "Updated Name", "email": "updated@example.com"}

    response = await async_client.put(
        f"/api/v1/employees/{test_employee.id}",
        json=update_data,
        headers={"Authorization": f"Bearer {admin_user.id}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["email"] == update_data["email"]


@pytest.mark.asyncio
async def test_deactivate_employee(
    async_client: AsyncClient,
    db_session: AsyncSession,
    admin_user: User,
    test_employee: Employee,
):
    """Test deactivating an employee"""

    response = await async_client.patch(
        f"/api/v1/employees/{test_employee.id}/deactivate",
        headers={"Authorization": f"Bearer {admin_user.id}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Employee deactivated successfully"


@pytest.mark.asyncio
async def test_activate_employee(
    async_client: AsyncClient,
    db_session: AsyncSession,
    admin_user: User,
    test_employee: Employee,
):
    """Test activating an employee"""

    # First deactivate
    await async_client.patch(
        f"/api/v1/employees/{test_employee.id}/deactivate",
        headers={"Authorization": f"Bearer {admin_user.id}"},
    )

    # Then activate
    response = await async_client.patch(
        f"/api/v1/employees/{test_employee.id}/activate",
        headers={"Authorization": f"Bearer {admin_user.id}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Employee activated successfully"


@pytest.mark.asyncio
async def test_delete_employee(
    async_client: AsyncClient,
    db_session: AsyncSession,
    admin_user: User,
    test_employee: Employee,
):
    """Test deleting an employee"""

    response = await async_client.delete(
        f"/api/v1/employees/{test_employee.id}",
        headers={"Authorization": f"Bearer {admin_user.id}"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Employee deleted successfully"
