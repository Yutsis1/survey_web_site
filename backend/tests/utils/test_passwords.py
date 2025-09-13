import pytest
import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import patch
from jose import jwt
from jose.exceptions import JWTError

from backend.routers.auth.security_utl import (
    hash_password,
    verify_password,
    make_access_token,
    make_refresh_token,
    decode
)
from backend.config import settings


def patch_datetime_now(patch_path, user_id,  target_date=datetime(2030, 1, 1, 12, 0, 0, tzinfo=timezone.utc)):
    """Helper function to patch datetime.now() in a target module."""
    with patch(patch_path) as mock_datetime:
        # Mock current time
        mock_now = target_date
        mock_datetime.now.return_value = mock_now

        token, jti = make_refresh_token(user_id)

        payload = jwt.decode(token, settings.JWT_SECRET,
                             algorithms=[settings.JWT_ALG])
        expected_exp = int(
            (mock_now + timedelta(days=settings.REFRESH_EXPIRE_DAYS)).timestamp())
        assert payload[
            "exp"] == expected_exp, f"exp claim does not match expected value. Got {payload['exp']}, expected {expected_exp}"
        assert payload["iat"] == int(mock_now.timestamp(
        )), f"iat claim does not match expected value. Got {payload['iat']}, expected {int(mock_now.timestamp())}"

    return mock_datetime


class TestPasswordHandling:
    """Test password hashing and verification functions."""

    def test_hash_password_success(self):
        """Test that password hashing works correctly."""
        password = "test_password_123"
        hashed = hash_password(password)

        assert hashed is not None, "Hashed password should not be None"
        assert isinstance(
            hashed, str), f"Hashed password should be a string. Value {hashed}"
        assert hashed != password, "Hashed password should not be the same as the plain text"
        assert len(
            hashed) > 20, "Hashed password should be longer than 20 characters"

    def test_hash_password_different_results(self):
        """Test that hashing the same password twice gives different results (salt)."""
        password = "test_password_123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)

        assert hash1 != hash2, "Hashing the same password should produce different results due to salt."

    def test_verify_password_correct(self):
        """Test password verification with correct password."""
        password = "test_password_123"
        hashed = hash_password(password)

        assert verify_password(
            password, hashed) is True, "Password verification should succeed with correct password."

    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password."""
        password = "test_password_123"
        wrong_password = "wrong_password_456"
        hashed = hash_password(password)

        assert verify_password(
            wrong_password, hashed) is False, "Password verification should fail with incorrect password."

    def test_verify_password_empty_strings(self):
        """Test password verification with empty strings."""
        # Hash an empty password
        hashed = hash_password("")

        # Verify with empty password should work
        assert verify_password(
            "", hashed) is True, "Empty password should verify correctly."

        # Verify with non-empty password should fail
        assert verify_password(
            "not_empty", hashed) is False, "Non-empty password should not verify correctly."


class TestAccessToken:
    """Test access token generation and validation."""

    def test_make_access_token_success(self):
        """Test successful access token creation."""
        user_id = uuid.uuid4()
        role = "user"
        token_version = 1

        token = make_access_token(user_id, role, token_version)

        assert isinstance(
            token, str), f"Access token should be a string. Value {token}"
        assert len(
            token) > 50, "Access token should be longer than 50 characters."

        # Decode and verify payload
        payload = jwt.decode(token, settings.JWT_SECRET,
                             algorithms=[settings.JWT_ALG])
        assert payload["sub"] == str(
            user_id), f"Payload sub should be {user_id}, got {payload['sub']}"
        assert payload["role"] == role, f"Payload role should be {role}, got {payload['role']}"
        assert payload[
            "tv"] == token_version, f"Payload token_version should be {token_version}, got {payload['tv']}"
        assert "iat" in payload, f"Payload should contain 'iat', got {payload}"
        assert "exp" in payload, f"Payload should contain 'exp', got {payload}"


    def test_make_access_token_different_roles(self):
        """Test access token creation with different roles."""
        user_id = uuid.uuid4()
        token_version = 1

        for role in ["user", "admin", "moderator"]:
            token = make_access_token(user_id, role, token_version)
            payload = jwt.decode(token, settings.JWT_SECRET,
                                 algorithms=[settings.JWT_ALG])
            assert payload["role"] == role

    def test_make_access_token_different_token_versions(self):
        """Test access token creation with different token versions."""
        user_id = uuid.uuid4()
        role = "user"

        for version in [0, 1, 5, 100]:
            token = make_access_token(user_id, role, version)
            payload = jwt.decode(token, settings.JWT_SECRET,
                                 algorithms=[settings.JWT_ALG])
            assert payload["tv"] == version


class TestRefreshToken:
    """Test refresh token generation and validation."""

    def test_make_refresh_token_success(self):
        """Test successful refresh token creation."""
        user_id = uuid.uuid4()

        token, jti = make_refresh_token(user_id)

        assert isinstance(token, str)
        assert isinstance(jti, uuid.UUID)
        assert len(token) > 50  # JWT tokens are typically long

        # Decode and verify payload
        payload = jwt.decode(token, settings.JWT_SECRET,
                             algorithms=[settings.JWT_ALG])
        assert payload["sub"] == str(user_id)
        assert payload["jti"] == str(jti)
        assert "iat" in payload
        assert "exp" in payload

    def test_make_refresh_token_expiration(self):
        """Test that refresh token has correct expiration time."""
        user_id = uuid.uuid4()
        patch_datetime_now('backend.routers.auth.security_utl.datetime', user_id)


    def test_make_refresh_token_unique_jti(self):
        """Test that different calls generate unique JTIs."""
        user_id = uuid.uuid4()

        token1, jti1 = make_refresh_token(user_id)
        token2, jti2 = make_refresh_token(user_id)

        assert jti1 != jti2
        assert token1 != token2

        payload1 = jwt.decode(token1, settings.JWT_SECRET,
                              algorithms=[settings.JWT_ALG])
        payload2 = jwt.decode(token2, settings.JWT_SECRET,
                              algorithms=[settings.JWT_ALG])
        assert payload1["jti"] != payload2["jti"]

    def test_make_refresh_token_different_users(self):
        """Test refresh token creation for different users."""
        user_id1 = uuid.uuid4()
        user_id2 = uuid.uuid4()

        token1, jti1 = make_refresh_token(user_id1)
        token2, jti2 = make_refresh_token(user_id2)

        payload1 = jwt.decode(token1, settings.JWT_SECRET,
                              algorithms=[settings.JWT_ALG])
        payload2 = jwt.decode(token2, settings.JWT_SECRET,
                              algorithms=[settings.JWT_ALG])

        assert payload1["sub"] == str(user_id1)
        assert payload2["sub"] == str(user_id2)
        assert payload1["sub"] != payload2["sub"]


class TestTokenDecoding:
    """Test token decoding functionality."""

    def test_decode_valid_token(self):
        """Test decoding a valid token."""
        user_id = uuid.uuid4()
        role = "user"
        token_version = 1

        token = make_access_token(user_id, role, token_version)
        decoded = decode(token)

        assert decoded["sub"] == str(user_id)
        assert decoded["role"] == role
        assert decoded["tv"] == token_version

    def test_decode_invalid_token(self):
        """Test decoding an invalid token raises exception."""
        invalid_token = "invalid.jwt.token"

        with pytest.raises(JWTError):
            decode(invalid_token)

    def test_decode_expired_token(self):
        """Test decoding an expired token raises exception."""
        user_id = uuid.uuid4()
        role = "user"
        token_version = 1

        # Create a token that's already expired
        with patch('backend.routers.auth.security_utl.datetime') as mock_datetime:
            # Mock time in the past
            past_time = datetime(2020, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
            mock_datetime.now.return_value = past_time

            token = make_access_token(user_id, role, token_version)

        # Try to decode it now (should be expired)
        with pytest.raises(JWTError):
            decode(token)

    def test_decode_tampered_token(self):
        """Test decoding a tampered token raises exception."""
        user_id = uuid.uuid4()
        role = "user"
        token_version = 1

        token = make_access_token(user_id, role, token_version)

        # Tamper with the token
        tampered_token = token[:-5] + "XXXXX"

        with pytest.raises(JWTError):
            decode(tampered_token)

    def test_decode_wrong_secret(self):
        """Test decoding with wrong secret raises exception."""
        user_id = uuid.uuid4()
        role = "user"
        token_version = 1

        # Create token with one secret
        token = make_access_token(user_id, role, token_version)

        # Try to decode with different secret
        with patch.object(settings, 'JWT_SECRET', 'wrong_secret'):
            with pytest.raises(JWTError):
                decode(token)


class TestEdgeCases:
    """Test edge cases and error conditions."""

    def test_make_access_token_with_special_characters_in_role(self):
        """Test access token creation with special characters in role."""
        user_id = uuid.uuid4()
        role = "admin-user_test@domain.com"
        token_version = 1

        token = make_access_token(user_id, role, token_version)
        payload = jwt.decode(token, settings.JWT_SECRET,
                             algorithms=[settings.JWT_ALG])
        assert payload["role"] == role

    def test_make_refresh_token_with_uuid_edge_cases(self):
        """Test refresh token creation with UUID edge cases."""
        # Test with nil UUID
        nil_uuid = uuid.UUID('00000000-0000-0000-0000-000000000000')
        token, jti = make_refresh_token(nil_uuid)

        payload = jwt.decode(token, settings.JWT_SECRET,
                             algorithms=[settings.JWT_ALG])
        assert payload["sub"] == str(nil_uuid), f"sub claim should be {nil_uuid}, got {payload['sub']}"
        assert isinstance(jti, uuid.UUID), f"JTI should be a valid UUID,. got {jti}"

