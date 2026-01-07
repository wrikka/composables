export interface FormValidationRule<T = any> {
  validate: (value: T) => string | true
  message?: string
}
