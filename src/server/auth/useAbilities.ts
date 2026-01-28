import { ref, computed } from 'vue'

export interface Ability {
  id: string
  name: string
  description?: string
  action: string
  subject: string
  conditions?: Record<string, any>
  fields?: string[]
}

export interface AbilityRule {
  action: string | string[]
  subject: string | string[]
  conditions?: Record<string, any>
  fields?: string[]
  inverted?: boolean
}

export interface UseAbilitiesOptions {
  manage?: string
  alias?: Record<string, string>
  detectSubjectType?: (subject: any) => string
}

export function useAbilities(options: UseAbilitiesOptions = {}) {
  const {
    manage = 'manage',
    alias = {},
    detectSubjectType = (subject) => typeof subject === 'string' ? subject : subject.constructor.name
  } = options

  const abilities = ref<Ability[]>([])
  const rules = ref<AbilityRule[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const isLoading = computed(() => loading.value)
  const lastError = computed(() => error.value)

  // Convert action aliases
  const normalizeAction = (action: string): string => {
    return alias[action] || action
  }

  // Check if action matches rule
  const matchesAction = (ruleAction: string | string[], action: string): boolean => {
    if (Array.isArray(ruleAction)) {
      return ruleAction.includes(action) || ruleAction.includes(manage)
    }
    return ruleAction === action || ruleAction === manage
  }

  // Check if subject matches rule
  const matchesSubject = (ruleSubject: string | string[], subject: string | any): boolean => {
    const subjectType = typeof subject === 'string' ? subject : detectSubjectType(subject)
    
    if (Array.isArray(ruleSubject)) {
      return ruleSubject.includes(subjectType) || ruleSubject.includes('all')
    }
    return ruleSubject === subjectType || ruleSubject === 'all'
  }

  // Evaluate rule conditions
  const evaluateConditions = (conditions: Record<string, any>, subject: any): boolean => {
    if (!conditions) return true

    for (const [field, value] of Object.entries(conditions)) {
      const subjectValue = subject[field]
      
      if (typeof value === 'function') {
        if (!value(subjectValue, subject)) return false
      } else if (Array.isArray(value)) {
        if (!value.includes(subjectValue)) return false
      } else if (subjectValue !== value) {
        return false
      }
    }

    return true
  }

  // Check if fields are restricted
  const checkFields = (ruleFields: string[] | undefined, subject: any): boolean => {
    if (!ruleFields || ruleFields.length === 0) return true

    return ruleFields.some(field => field in subject)
  }

  // Main ability check
  const can = (action: string, subject: string | any): boolean => {
    const normalizedAction = normalizeAction(action)
    const subjectType = typeof subject === 'string' ? subject : detectSubjectType(subject)

    for (const rule of rules.value) {
      const actionMatches = matchesAction(rule.action, normalizedAction)
      const subjectMatches = matchesSubject(rule.subject, subjectType)
      const conditionsMatch = evaluateConditions(rule.conditions, subject)
      const fieldsMatch = checkFields(rule.fields, subject)

      if (actionMatches && subjectMatches && conditionsMatch && fieldsMatch) {
        return !rule.inverted
      }
    }

    return false
  }

  // Check if cannot perform action
  const cannot = (action: string, subject: string | any): boolean => {
    return !can(action, subject)
  }

  // Check multiple abilities
  const canAny = (actions: string[], subject: string | any): boolean => {
    return actions.some(action => can(action, subject))
  }

  const canAll = (actions: string[], subject: string | any): boolean => {
    return actions.every(action => can(action, subject))
  }

  // Get allowed actions for subject
  const allowedActionsFor = (subject: string | any): string[] => {
    const subjectType = typeof subject === 'string' ? subject : detectSubjectType(subject)
    const actions = new Set<string>()

    for (const rule of rules.value) {
      if (matchesSubject(rule.subject, subjectType) && 
          evaluateConditions(rule.conditions, subject) &&
          !rule.inverted) {
        
        const ruleActions = Array.isArray(rule.action) ? rule.action : [rule.action]
        ruleActions.forEach(action => {
          if (action !== manage) {
            actions.add(action)
          }
        })
      }
    }

    return Array.from(actions)
  }

  // Get forbidden actions for subject
  const forbiddenActionsFor = (subject: string | any): string[] => {
    const subjectType = typeof subject === 'string' ? subject : detectSubjectType(subject)
    const actions = new Set<string>()

    for (const rule of rules.value) {
      if (matchesSubject(rule.subject, subjectType) && 
          evaluateConditions(rule.conditions, subject) &&
          rule.inverted) {
        
        const ruleActions = Array.isArray(rule.action) ? rule.action : [rule.action]
        ruleActions.forEach(action => actions.add(action))
      }
    }

    return Array.from(actions)
  }

  // Define abilities
  const define = (newRules: AbilityRule[]): void => {
    rules.value = [...rules.value, ...newRules]
  }

  // Define abilities for specific user
  const defineFor = (userAbilities: Ability[]): void => {
    abilities.value = userAbilities
    
    const newRules: AbilityRule[] = userAbilities.map(ability => ({
      action: ability.action,
      subject: ability.subject,
      conditions: ability.conditions,
      fields: ability.fields,
      inverted: false
    }))

    rules.value = newRules
  }

  // Clear all rules
  const clear = (): void => {
    abilities.value = []
    rules.value = []
  }

  // Load abilities from API
  const loadAbilities = async (userId?: string): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const url = userId ? `/api/auth/users/${userId}/abilities` : '/api/auth/abilities'
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Failed to load abilities')
      }

      const data = await response.json()
      defineFor(data.abilities || data)

    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
    } finally {
      loading.value = false
    }
  }

  // Create ability builder
  const builder = {
    can: (action: string | string[], subject: string | string[]) => ({
      for: (conditions?: Record<string, any>) => ({
        fields: (fields: string[]) => ({
          define: () => {
            define([{
              action,
              subject,
              conditions,
              fields,
              inverted: false
            }])
          }
        }),
        define: () => {
          define([{
            action,
            subject,
            conditions,
            inverted: false
          }])
        }
      })
    }),

    cannot: (action: string | string[], subject: string | string[]) => ({
      for: (conditions?: Record<string, any>) => ({
        define: () => {
          define([{
            action,
            subject,
            conditions,
            inverted: true
          }])
        }
      })
    }),

    manage: (subject: string | string[]) => ({
      everything: () => ({
        define: () => {
          define([{
            action: 'manage',
            subject,
            inverted: false
          }])
        }
      })
    })
  }

  // Create middleware for route protection
  const createMiddleware = (action: string, subject: string | any) => {
    return (to: any, from: any, next: any) => {
      if (can(action, subject)) {
        next()
      } else {
        next({ path: '/unauthorized' })
      }
    }
  }

  // Create component guard
  const createGuard = (action: string, subject: string | any) => {
    return {
      can: can(action, subject),
      cannot: cannot(action, subject)
    }
  }

  return {
    // State
    abilities,
    rules,
    loading: isLoading,
    error: lastError,
    
    // Core methods
    can,
    cannot,
    canAny,
    canAll,
    
    // Utilities
    allowedActionsFor,
    forbiddenActionsFor,
    
    // Rule management
    define,
    defineFor,
    clear,
    loadAbilities,
    
    // Builder
    builder,
    
    // Guards
    createMiddleware,
    createGuard,
    
    // Config
    normalizeAction,
    detectSubjectType
  }
}
