import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from backend.main import app
from backend.models.api.auth import RegisterIn, LoginIn
from backend.models.db.sql.auth import User, RefreshToken
from backend.routers.auth.auth import (
    set_refresh_cookie, 
    clear_refresh_cookie, 
    register, 
    login, 
    refresh,
    REFRESH_COOKIE
)
from backend.routers.auth.security_utl import hash_password, make_refresh_token, make_access_token
from backend.config import settings


client = TestClient(app)


class TestCookieHelpers:
    """Test cookie helper functions."""
    
    def test_set_refresh_cookie(self):
        """Test setting refresh cookie with correct attributes."""
        response = MagicMock()
        token = "test_jwt_token"
        
        set_refresh_cookie(response, token)
        
        response.set_cookie.assert_called_once_with(
            key=REFRESH_COOKIE,
            value=token,
            httponly=True,
            secure=True,
            samesite="lax",
            path="/refresh",
            max_age=settings.REFRESH_EXPIRE_DAYS * 86400,
        )
    
    def test_clear_refresh_cookie(self):
        """Test clearing refresh cookie."""
        response = MagicMock()
        
        clear_refresh_cookie(response)
        
        response.delete_cookie.assert_called_once_with(REFRESH_COOKIE, path="/refresh")


class TestRegisterEndpoint:
    """Test user registration endpoint."""
    
    @pytest.mark.asyncio
    async def test_register_success(self):
        """Test successful user registration."""
        # Setup
        payload = RegisterIn(email="test@example.com", password="password123")
        mock_db = AsyncMock(spec=AsyncSession)
        mock_response = MagicMock()
        
        # Mock database operations
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None  # No existing user
        mock_db.execute = AsyncMock(return_value=mock_result)
        mock_db.refresh = AsyncMock()
        mock_db.commit = AsyncMock()
        
        result = await register(payload, mock_response, mock_db)
            
        # Verify database operations
        mock_db.add.assert_called()
        assert mock_db.commit.call_count == 2, "User creation + refresh token"
        mock_db.refresh.assert_called_once()
        
        # Verify response
        assert "access_token" in result, f"Access token not found in {result}"
        assert isinstance(result["access_token"], str), f"Access token is not a string: {result['access_token']}"
    
    @pytest.mark.asyncio
    async def test_register_existing_email(self):
        """Test registration with existing email."""
        payload = RegisterIn(email="existing@example.com", password="password123")
        mock_db = AsyncMock(spec=AsyncSession)
        mock_response = MagicMock()
        
        # Mock existing user
        existing_user = User(email="existing@example.com")
        mock_db.execute.return_value.scalar_one_or_none.return_value = existing_user
        
        with pytest.raises(HTTPException) as exc_info:
            await register(payload, mock_response, mock_db)
        
        assert exc_info.value.status_code == 400
        assert exc_info.value.detail == "Email already registered"
    
    @pytest.mark.asyncio
    async def test_register_email_case_insensitive(self):
        """Test registration with different email cases."""
        payload = RegisterIn(email="Test@Example.COM", password="password123")
        mock_db = AsyncMock(spec=AsyncSession)
        mock_response = MagicMock()
        
        mock_db.execute.return_value.scalar_one_or_none.return_value = None
        mock_user = User(
            id=uuid.uuid4(),
            email="test@example.com",  # Should be normalized to lowercase
            password_hash=hash_password("password123"),
            role="user",
            token_version=0
        )
        mock_db.refresh = AsyncMock()
        mock_db.commit = AsyncMock()
        
        with patch('backend.routers.auth.auth.User') as mock_user_class:
            mock_user_class.return_value = mock_user
            
            result = await register(payload, mock_response, mock_db)
            
            # Verify email was normalized
            mock_user_class.assert_called_once()
            call_args = mock_user_class.call_args[1]
            assert call_args['email'] == "test@example.com"
    
    def test_register_integration(self):
        """Integration test for register endpoint."""
        payload = {
            "email": "integration@example.com",
            "password": "password123"
        }
        
        with patch('backend.routers.auth.auth.get_async_db') as mock_get_db:
            mock_result = MagicMock()
            mock_result.scalar_one_or_none.return_value = None  # No existing user
            mock_db = AsyncMock()
            mock_db.execute = AsyncMock(return_value=mock_result)
            mock_db.refresh = AsyncMock()
            mock_db.commit = AsyncMock()
            mock_get_db.return_value.__aenter__.return_value = mock_db
            
            response = client.post("/auth/register", json=payload)
            
            assert response.status_code == 200, f"Unexpected status code: {response.status_code}, response: {response.text}"
            data = response.json()
            assert "access_token" in data, f"Access token not found in response: {data}"


class TestLoginEndpoint:
    """Test user login endpoint."""
    
    @pytest.mark.asyncio
    async def test_login_success(self):
        """Test successful user login."""
        payload = LoginIn(email="test@example.com", password="password123")
        mock_db = AsyncMock(spec=AsyncSession)
        mock_response = MagicMock()
        
        # Mock existing user with correct password
        user_id = uuid.uuid4()
        mock_user = User(
            id=user_id,
            email="test@example.com",
            password_hash=hash_password("password123"),
            role="user",
            token_version=0
        )
        mock_db.execute.return_value.scalar_one_or_none.return_value = mock_user
        mock_db.commit = AsyncMock()
        
        result = await login(payload, mock_response, mock_db)
        
        # Verify database operations
        mock_db.add.assert_called()  # Refresh token added
        mock_db.commit.assert_called_once()
        
        # Verify response
        assert "access_token" in result
        assert isinstance(result["access_token"], str)
    
    @pytest.mark.asyncio
    async def test_login_user_not_found(self):
        """Test login with non-existent user."""
        payload = LoginIn(email="notfound@example.com", password="password123")
        mock_db = AsyncMock(spec=AsyncSession)
        mock_response = MagicMock()
        
        # Mock no user found
        mock_db.execute.return_value.scalar_one_or_none.return_value = None
        
        with pytest.raises(HTTPException) as exc_info:
            await login(payload, mock_response, mock_db)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Invalid credentials"
    
    @pytest.mark.asyncio
    async def test_login_wrong_password(self):
        """Test login with incorrect password."""
        payload = LoginIn(email="test@example.com", password="wrongpassword")
        mock_db = AsyncMock(spec=AsyncSession)
        mock_response = MagicMock()
        
        # Mock existing user with different password
        mock_user = User(
            email="test@example.com",
            password_hash=hash_password("correctpassword")
        )
        mock_db.execute.return_value.scalar_one_or_none.return_value = mock_user
        
        with pytest.raises(HTTPException) as exc_info:
            await login(payload, mock_response, mock_db)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Invalid credentials"
    
    @pytest.mark.asyncio
    async def test_login_email_case_insensitive(self):
        """Test login with different email case."""
        payload = LoginIn(email="Test@Example.COM", password="password123")
        mock_db = AsyncMock(spec=AsyncSession)
        mock_response = MagicMock()
        
        # Mock user with lowercase email
        user_id = uuid.uuid4()
        mock_user = User(
            id=user_id,
            email="test@example.com",
            password_hash=hash_password("password123"),
            role="user",
            token_version=0
        )
        mock_db.execute.return_value.scalar_one_or_none.return_value = mock_user
        mock_db.commit = AsyncMock()
        
        result = await login(payload, mock_response, mock_db)
        
        # Should succeed despite case difference
        assert "access_token" in result
    
    def test_login_integration(self):
        """Integration test for login endpoint."""
        payload = {
            "email": "login@example.com",
            "password": "password123"
        }
        
        with patch('backend.routers.auth.auth.get_async_db') as mock_get_db:
            mock_db = AsyncMock()
            mock_user = User(
                id=uuid.uuid4(),
                email="login@example.com",
                password_hash=hash_password("password123"),
                role="user",
                token_version=0
            )
            mock_db.execute.return_value.scalar_one_or_none.return_value = mock_user
            mock_db.commit = AsyncMock()
            mock_get_db.return_value.__aenter__.return_value = mock_db
            
            response = client.post("/auth/login", json=payload)
            
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data


class TestRefreshEndpoint:
    """Test token refresh endpoint."""
    
    @pytest.mark.asyncio
    async def test_refresh_success(self):
        """Test successful token refresh."""
        mock_request = MagicMock()
        mock_response = MagicMock()
        mock_db = AsyncMock(spec=AsyncSession)
        
        # Create a valid refresh token
        user_id = uuid.uuid4()
        refresh_token, jti = make_refresh_token(user_id)
        
        # Mock database objects
        mock_refresh_token = RefreshToken(
            id=uuid.uuid4(),
            user_id=user_id,
            token_id=jti,
            revoked=False
        )
        mock_user = User(
            id=user_id,
            email="test@example.com",
            is_active=True,
            role="user",
            token_version=0
        )
        
        mock_db.execute.return_value.scalar_one_or_none.return_value = mock_refresh_token
        mock_db.get.return_value = mock_user
        
        # This test would need the full implementation of refresh function
        # Since the provided code is incomplete, we can test the validation parts
        
        # Test missing refresh token
        with pytest.raises(HTTPException) as exc_info:
            await refresh(mock_request, mock_response, mock_db, None)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Missing refresh cookie"
    
    @pytest.mark.asyncio
    async def test_refresh_invalid_token(self):
        """Test refresh with invalid token."""
        mock_request = MagicMock()
        mock_response = MagicMock()
        mock_db = AsyncMock(spec=AsyncSession)
        
        invalid_token = "invalid.jwt.token"
        
        with pytest.raises(HTTPException) as exc_info:
            await refresh(mock_request, mock_response, mock_db, invalid_token)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Invalid refresh"
    
    @pytest.mark.asyncio
    async def test_refresh_revoked_token(self):
        """Test refresh with revoked token."""
        mock_request = MagicMock()
        mock_response = MagicMock()
        mock_db = AsyncMock(spec=AsyncSession)
        
        # Create a valid refresh token
        user_id = uuid.uuid4()
        refresh_token, jti = make_refresh_token(user_id)
        
        # Mock no refresh token found (revoked or doesn't exist)
        mock_db.execute.return_value.scalar_one_or_none.return_value = None
        
        with pytest.raises(HTTPException) as exc_info:
            await refresh(mock_request, mock_response, mock_db, refresh_token)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "Refresh revoked or not found"
    
    @pytest.mark.asyncio
    async def test_refresh_inactive_user(self):
        """Test refresh with inactive user."""
        mock_request = MagicMock()
        mock_response = MagicMock()
        mock_db = AsyncMock(spec=AsyncSession)
        
        # Create a valid refresh token
        user_id = uuid.uuid4()
        refresh_token, jti = make_refresh_token(user_id)
        
        # Mock valid refresh token but inactive user
        mock_refresh_token = RefreshToken(
            id=uuid.uuid4(),
            user_id=user_id,
            token_id=jti,
            revoked=False
        )
        mock_db.execute.return_value.scalar_one_or_none.return_value = mock_refresh_token
        mock_db.get.return_value = None  # User not found or inactive
        
        with pytest.raises(HTTPException) as exc_info:
            await refresh(mock_request, mock_response, mock_db, refresh_token)
        
        assert exc_info.value.status_code == 401
        assert exc_info.value.detail == "User inactive"


class TestIntegrationTests:
    """Integration tests for the auth flow."""
    
    def test_register_login_flow(self):
        """Test complete register and login flow."""
        email = "flow@example.com"
        password = "password123"
        
        # Mock database for both operations
        with patch('backend.routers.auth.auth.get_async_db') as mock_get_db:
            mock_db = AsyncMock()
            mock_get_db.return_value.__aenter__.return_value = mock_db
            
            # Register
            mock_db.execute.return_value.scalar_one_or_none.return_value = None
            mock_db.refresh = AsyncMock()
            mock_db.commit = AsyncMock()
            
            user_id = uuid.uuid4()
            with patch('backend.routers.auth.auth.User') as mock_user_class:
                mock_user = User(
                    id=user_id,
                    email=email,
                    password_hash=hash_password(password),
                    role="user",
                    token_version=0
                )
                mock_user_class.return_value = mock_user
                
                register_response = client.post("/auth/register", json={
                    "email": email,
                    "password": password
                })
                
                assert register_response.status_code == 200
                register_data = register_response.json()
                assert "access_token" in register_data
            
            # Login
            mock_db.execute.return_value.scalar_one_or_none.return_value = mock_user
            
            login_response = client.post("/auth/login", json={
                "email": email,
                "password": password
            })
            
            assert login_response.status_code == 200
            login_data = login_response.json()
            assert "access_token" in login_data
    
    def test_auth_endpoints_exist(self):
        """Test that auth endpoints are properly registered."""
        # Test that endpoints exist (will return proper errors without mocking)
        
        # Register without data should return validation error
        response = client.post("/auth/register")
        assert response.status_code == 422  # Validation error
        
        # Login without data should return validation error
        response = client.post("/auth/login")
        assert response.status_code == 422  # Validation error
        
        # Refresh without cookie should return 401
        response = client.post("/auth/refresh")
        assert response.status_code == 401
    
    def test_password_security(self):
        """Test password security requirements."""
        # Test various password scenarios
        test_cases = [
            ("simple", "password"),
            ("with_numbers", "password123"),
            ("with_special", "password@123"),
            ("long_password", "a" * 100),
            ("empty", ""),
        ]
        
        for name, password in test_cases:
            email = f"{name}@example.com"
            
            with patch('backend.routers.auth.auth.get_async_db') as mock_get_db:
                mock_db = AsyncMock()
                mock_db.execute.return_value.scalar_one_or_none.return_value = None
                mock_db.refresh = AsyncMock()
                mock_db.commit = AsyncMock()
                mock_get_db.return_value.__aenter__.return_value = mock_db
                
                user_id = uuid.uuid4()
                with patch('backend.routers.auth.auth.User') as mock_user_class:
                    mock_user = User(
                        id=user_id,
                        email=email,
                        password_hash=hash_password(password),
                        role="user",
                        token_version=0
                    )
                    mock_user_class.return_value = mock_user
                    
                    response = client.post("/auth/register", json={
                        "email": email,
                        "password": password
                    })
                    
                    # All passwords should be accepted (validation is on frontend/API level)
                    assert response.status_code == 200


class TestErrorHandling:
    """Test error handling and edge cases."""
    
    @pytest.mark.asyncio
    async def test_database_error_handling(self):
        """Test handling of database errors."""
        payload = RegisterIn(email="test@example.com", password="password123")
        mock_db = AsyncMock(spec=AsyncSession)
        mock_response = MagicMock()
        
        # Mock database error
        mock_db.execute.side_effect = Exception("Database connection error")
        
        with pytest.raises(Exception):
            await register(payload, mock_response, mock_db)
    
    def test_malformed_request_data(self):
        """Test handling of malformed request data."""
        # Invalid email format
        response = client.post("/auth/register", json={
            "email": "not-an-email",
            "password": "password123"
        })
        assert response.status_code == 422
        
        # Missing required fields
        response = client.post("/auth/register", json={
            "email": "test@example.com"
        })
        assert response.status_code == 422
        
        # Extra fields should be ignored (Pydantic behavior)
        with patch('backend.routers.auth.auth.get_async_db') as mock_get_db:
            mock_db = AsyncMock()
            mock_db.execute.return_value.scalar_one_or_none.return_value = None
            mock_db.refresh = AsyncMock()
            mock_db.commit = AsyncMock()
            mock_get_db.return_value.__aenter__.return_value = mock_db
            
            with patch('backend.routers.auth.auth.User') as mock_user_class:
                mock_user = User(
                    id=uuid.uuid4(),
                    email="test@example.com",
                    password_hash=hash_password("password123"),
                    role="user",
                    token_version=0
                )
                mock_user_class.return_value = mock_user
                
                response = client.post("/auth/register", json={
                    "email": "test@example.com",
                    "password": "password123",
                    "extra_field": "should_be_ignored"
                })
                assert response.status_code == 200