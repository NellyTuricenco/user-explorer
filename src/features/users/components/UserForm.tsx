import React, { useState, useCallback } from 'react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { validateUserForm } from '../../../utils/validation';
import type { UserFormData, ValidationErrors } from '../../../types/user.types';

interface UserFormProps {
  initialValues?: Partial<UserFormData>;
  onSubmit: (data: UserFormData) => Promise<void>;
  submitLabel: string;
  isLoading?: boolean;
}

const DEFAULT_VALUES: UserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  age: '',
  phone: '',
};

export function UserForm({
  initialValues,
  onSubmit,
  submitLabel,
  isLoading = false,
}: UserFormProps) {
  const [values, setValues] = useState<UserFormData>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback(
    (field: keyof UserFormData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setValues((prev) => ({ ...prev, [field]: value }));
        if (touched[field]) {
          const fieldErrors = validateUserForm({ ...values, [field]: value });
          setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] ?? '' }));
        }
      },
    [values, touched]
  );

  const handleBlur = useCallback(
    (field: keyof UserFormData) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const fieldErrors = validateUserForm(values);
      setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] ?? '' }));
    },
    [values]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.keys(DEFAULT_VALUES).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    const validationErrors = validateUserForm(values);
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
      <div className="flex justify-end pt-2">
        <Button type="submit" isLoading={isLoading} size="lg">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
