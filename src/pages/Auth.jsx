import React, { useState } from 'react';

const initialValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student',
};

export default function Auth({ onAuthSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!values.email || !values.password || (isSignup && !values.name) || (isSignup && !values.role)) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isSignup && values.password !== values.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (values.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSuccess(isSignup ? 'Account created successfully.' : 'Signed in successfully.');
    setTimeout(() => {
      setValues(initialValues);
      onAuthSuccess();
    }, 400);
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-panel-copy">
          <div className="auth-panel-brand">UniNest FUW</div>
          <h1>{isSignup ? 'Create an account' : 'Welcome back'}</h1>
          <p>
            {isSignup
              ? 'Sign up to manage student housing, applications, and payments in one place.'
              : 'Sign in to access the management dashboard and keep your housing workflow moving.'}
          </p>
          <div className="auth-panel-notes">
            <div>
              <strong>Secure</strong> access with local auth preview.
            </div>
            <div>
              <strong>Ready</strong> for future backend integration.
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <div>
              <div className="auth-card-title">{isSignup ? 'Sign up' : 'Sign in'}</div>
              <div className="auth-card-sub">
                {isSignup ? 'Enter your details to get started.' : 'Use your account email and password.'}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                setIsSignup((prev) => !prev);
                setError('');
                setSuccess('');
              }}
            >
              {isSignup ? 'Have an account?' : 'Create account'}
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-feedback auth-error">{error}</div>}
            {success && <div className="auth-feedback auth-success">{success}</div>}

            {isSignup && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-control"
                    value={values.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="role">Account type</label>
                  <select
                    id="role"
                    name="role"
                    className="form-control"
                    value={values.role}
                    onChange={handleChange}
                  >
                    <option value="student">Student</option>
                    <option value="landlord">Landlord</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                value={values.email}
                onChange={handleChange}
                placeholder="hello@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                value={values.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            {isSignup && (
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="form-control"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block">
              {isSignup ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="auth-footer">
            <span>By continuing, you agree to our terms of service and privacy policy.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
