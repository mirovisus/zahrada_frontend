import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Field } from '../../../shared/ui/field'
import { Button } from '../../../shared/ui/button'
import { useAuth } from '../../../shared/auth'
import { normalizeFieldErrors } from '../../../shared/api/client'

const initialValues = {
  email: '',
  password: '',
  remember: false,
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values) {
  const errors = {}

  if (!values.email.trim()) errors.email = 'Email je povinný'
  else if (!EMAIL_REGEX.test(values.email)) errors.email = 'Zadejte platný email'

  if (!values.password) errors.password = 'Heslo je povinné'
  else if (values.password.length < 8) errors.password = 'Heslo musí mít alespoň 8 znaků'

  return errors
}

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError('')

    const validationErrors = validate(values)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await login({ email: values.email, password: values.password })
      navigate('/profile')
    } catch (error) {
      if (error.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...normalizeFieldErrors(error.fieldErrors) }))
      }
      setServerError(error.message || 'Přihlášení se nezdařilo')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="content">
      <section className="section section--login container">
        <div className="section__body">
          <div className="login">
            <div className="login__content">
              <h1 className="login__title h2">Přihlášení</h1>
            </div>

            <form className="login__form" onSubmit={handleSubmit} noValidate>
              <Field
                className="login__field"
                transparent
                id="login-email"
                name="email"
                label="Email"
                placeholder="Email"
                type="email"
                value={values.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <Field
                className="login__field"
                transparent
                id="login-password"
                name="password"
                label="Heslo"
                placeholder="Heslo"
                type="password"
                value={values.password}
                onChange={handleChange}
                error={errors.password}
                required
              />

              <div className="login__options">
                <label className="login__remember checkbox">
                  <input
                    className="checkbox__input"
                    type="checkbox"
                    name="remember"
                    checked={values.remember}
                    onChange={handleChange}
                  />
                  <span className="checkbox__text">Pamatovat si mě</span>
                </label>

                <a href="/" className="login__forgot-link">
                  Zapomněli jste heslo?
                </a>
              </div>

              {serverError && <p className="field__error">{serverError}</p>}

              <Button variant="green" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Přihlašování…' : 'Přihlásit se'}
              </Button>
            </form>

            <div className="login__footer">
              <p className="login__footer-text">
                Nemáte účet?{' '}
                <Link className="login__footer-link" to="/signup">
                  Registrovat se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
