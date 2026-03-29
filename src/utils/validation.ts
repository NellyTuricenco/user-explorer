import type { UserFormData, ValidationErrors } from '../types/user.types';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[\d\s\-+()]{7,20}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_\-.]{3,30}$/;

interface ValidateUserFormOptions {
  requirePassword?: boolean;
}

export function validateUserForm(
  data: UserFormData,
  options: ValidateUserFormOptions = {}
): ValidationErrors {
  const errors: ValidationErrors = {};
  const { requirePassword = false } = options;

  const firstName = data.firstName.trim();
  if (!firstName) {
    errors.firstName = 'First name is required';
  } else if (firstName.length < 2 || firstName.length > 50) {
    errors.firstName = 'First name must be between 2 and 50 characters';
  } else if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
    errors.firstName = 'First name contains invalid characters';
  }

  const lastName = data.lastName.trim();
  if (!lastName) {
    errors.lastName = 'Last name is required';
  } else if (lastName.length < 2 || lastName.length > 50) {
    errors.lastName = 'Last name must be between 2 and 50 characters';
  } else if (!/^[a-zA-Z\s'-]+$/.test(lastName)) {
    errors.lastName = 'Last name contains invalid characters';
  }

  const email = data.email.trim();
  if (!email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  const username = data.username.trim();
  if (!username) {
    errors.username = 'Username is required';
  } else if (!USERNAME_REGEX.test(username)) {
    errors.username = 'Username must be 3-30 chars (letters, numbers, _, -, .)';
  }

  const age = data.age.trim();
  if (!age) {
    errors.age = 'Age is required';
  } else {
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      errors.age = 'Age should be 18 and older';
    }
  }

  const phone = data.phone.trim();
  if (phone && !PHONE_REGEX.test(phone)) {
    errors.phone = 'Please enter a valid phone number';
  }

  if (requirePassword) {
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (data.confirmPassword !== data.password) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  return errors;
}

export function validateLoginForm(username: string, password: string): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!username.trim()) {
    errors.username = 'Username is required';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 4) {
    errors.password = 'Password must be at least 4 characters';
  }

  return errors;
}
