import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Field } from '../../../shared/ui/field'
import { Button } from '../../../shared/ui/button'
import { useAuth } from '../../../shared/auth'
import { normalizeFieldErrors } from '../../../shared/api/client'

const initialValues = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  role: 'owner',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ROLE_MAP = { owner: 'OWNER', worker: 'WORKER' }

function validate(values) {
  const errors = {}

  if (!values.firstname.trim()) errors.firstname = 'Jméno je povinné'
  if (!values.lastname.trim()) errors.lastname = 'Příjmení je povinné'

  if (!values.email.trim()) errors.email = 'Email je povinný'
  else if (!EMAIL_REGEX.test(values.email)) errors.email = 'Zadejte platný email'

  if (!values.password) errors.password = 'Heslo je povinné'
  else if (values.password.length < 8) errors.password = 'Heslo musí mít alespoň 8 znaků'

  return errors
}

export function SignupPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
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
      await register({
        firstName: values.firstname,
        lastName: values.lastname,
        email: values.email,
        password: values.password,
        role: ROLE_MAP[values.role],
      })
      navigate('/profile')
    } catch (error) {
      if (error.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...normalizeFieldErrors(error.fieldErrors) }))
      }
      setServerError(error.message || 'Registrace se nezdařila')
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
              <h1 className="login__title h2">Registrace</h1>
            </div>

            <form className="login__form" onSubmit={handleSubmit} noValidate>
              <div className="login__name-row">
                <Field
                  className="login__field"
                  transparent
                  id="reg-firstname"
                  name="firstname"
                  label="Jméno"
                  placeholder="Jméno"
                  type="text"
                  value={values.firstname}
                  onChange={handleChange}
                  error={errors.firstname}
                  required
                />

                <Field
                  className="login__field"
                  transparent
                  id="reg-lastname"
                  name="lastname"
                  label="Příjmení"
                  placeholder="Příjmení"
                  type="text"
                  value={values.lastname}
                  onChange={handleChange}
                  error={errors.lastname}
                  required
                />
              </div>

              <Field
                className="login__field"
                transparent
                id="reg-email"
                name="email"
                label="E-mail"
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
                id="reg-password"
                name="password"
                label="Heslo"
                placeholder="Heslo"
                type="password"
                value={values.password}
                onChange={handleChange}
                error={errors.password}
                required
              />

              <div className="login__roles role-selector">
                <label className="role-selector__item">
                  <input
                    className="role-selector__input visually-hidden"
                    type="radio"
                    name="role"
                    value="owner"
                    checked={values.role === 'owner'}
                    onChange={handleChange}
                  />
                  <span className="role-selector__btn">Vlastník</span>
                </label>

                <label className="role-selector__item">
                  <input
                    className="role-selector__input visually-hidden"
                    type="radio"
                    name="role"
                    value="worker"
                    checked={values.role === 'worker'}
                    onChange={handleChange}
                  />
                  <span className="role-selector__btn">Pracovník</span>
                </label>
              </div>

              {serverError && <p className="field__error">{serverError}</p>}

              <Button variant="green" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Registrace…' : 'Registrovat se'}
              </Button>
            </form>

            <div className="login__footer">
              <p className="login__footer-text">
                Máte již účet?{' '}
                <Link className="login__footer-link" to="/login">
                  Přihlásit se
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
