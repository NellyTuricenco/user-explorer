import React, { useState, useCallback } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { ChevronDownIcon } from '../../../components/ui/ChevronDownIcon';
import { validateUserForm } from '../../../utils/validation';
import type { UserFormData, ValidationErrors } from '../../../types/user.types';

interface UserFormProps {
  initialValues?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  submitLabel: string;
  isLoading?: boolean;
  includePasswordFields?: boolean;
}

const DEFAULT_VALUES: UserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  age: '',
  phone: '',
  password: '',
  confirmPassword: '',
  gender: '',
  image: '',
};

export function UserForm({
  initialValues,
  onSubmit,
  submitLabel,
  isLoading = false,
  includePasswordFields = false,
}: UserFormProps) {
  const [values, setValues] = useState<UserFormData>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback(
    (field: keyof UserFormData) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setValues((prev) => ({ ...prev, [field]: value }));
        if (touched[field]) {
          const fieldErrors = validateUserForm(
            { ...values, [field]: value },
            { requirePassword: includePasswordFields }
          );
          setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] ?? '' }));
        }
      },
    [values, touched, includePasswordFields]
  );

  const handleBlur = useCallback(
    (field: keyof UserFormData) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const fieldErrors = validateUserForm(values, {
        requirePassword: includePasswordFields,
      });
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] ?? '' }));
    },
    [values, includePasswordFields]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.keys(DEFAULT_VALUES).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    const validationErrors = validateUserForm(values, {
      requirePassword: includePasswordFields,
    });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="First Name"
          value={values.firstName}
          onChange={handleChange('firstName')}
          onBlur={handleBlur('firstName')}
          error={errors.firstName}
          required
          autoComplete="given-name"
          maxLength={50}
        />
        <Input
          label="Last Name"
          value={values.lastName}
          onChange={handleChange('lastName')}
          onBlur={handleBlur('lastName')}
          error={errors.lastName}
          required
          autoComplete="family-name"
          maxLength={50}
        />
      </div>
      <Input
        label="Email"
        type="email"
        value={values.email}
        onChange={handleChange('email')}
        onBlur={handleBlur('email')}
        error={errors.email}
        required
        autoComplete="email"
        maxLength={100}
      />
      <Input
        label="Username"
        value={values.username}
        onChange={handleChange('username')}
        onBlur={handleBlur('username')}
        error={errors.username}
        required
        autoComplete="username"
        maxLength={30}
        hint="3-30 characters: letters, numbers, _, -, ."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Age"
          type="number"
          min={18}
          max={120}
          value={values.age}
          onChange={handleChange('age')}
          onBlur={handleBlur('age')}
          error={errors.age}
          required
        />
        <Input
          label="Phone"
          type="tel"
          value={values.phone}
          onChange={handleChange('phone')}
          onBlur={handleBlur('phone')}
          error={errors.phone}
          autoComplete="tel"
          maxLength={20}
          hint="Optional"
        />
      </div>
      {includePasswordFields && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            value={values.password}
            onChange={handleChange('password')}
            onBlur={handleBlur('password')}
            error={errors.password}
            required
            autoComplete="new-password"
            maxLength={64}
            hint="At least 6 characters"
          />
          <Input
            label="Confirm Password"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange('confirmPassword')}
            onBlur={handleBlur('confirmPassword')}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
            maxLength={64}
          />
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="gender" className="text-sm font-medium text-gray-700">
            Gender<span className="ml-1 text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="gender"
              value={values.gender}
              onChange={handleChange('gender')}
              onBlur={handleBlur('gender')}
              className={[
                'w-full appearance-none rounded-lg border px-3 py-2 pr-12 text-sm text-gray-900',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent',
                errors.gender ? 'border-red-400 focus:ring-red-400' : 'border-gray-300',
              ].join(' ')}
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            />
          </div>
          {errors.gender && (
            <p className="text-xs text-red-600" role="alert">
              {errors.gender}
            </p>
          )}
        </div>
      </div>
      <Input
        label="Avatar Image URL"
        type="url"
        value={values.image}
        onChange={handleChange('image')}
        onBlur={handleBlur('image')}
        error={errors.image}
        autoComplete="url"
        maxLength={300}
        hint="Optional. Example: https://example.com/avatar.jpg"
      />
      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isLoading} size="lg">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
