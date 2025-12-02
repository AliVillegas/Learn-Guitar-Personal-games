import { describe, it, expect } from 'vitest'
import en from './en.json'
import es from './es.json'

type TranslationObject = { [key: string]: string | TranslationObject }

function getAllKeys(obj: TranslationObject, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null) {
      return [fullKey, ...getAllKeys(value as TranslationObject, fullKey)]
    }
    return [fullKey]
  })
}

function getKeysAtLevel(obj: TranslationObject): string[] {
  return Object.keys(obj)
}

function isSorted(arr: string[]): boolean {
  return arr.every((val, i) => i === 0 || arr[i - 1].localeCompare(val) <= 0)
}

function formatSortError(path: string, keys: string[]): string {
  const sortedKeys = [...keys].sort((a, b) => a.localeCompare(b))
  return `Keys not sorted at "${path || 'root'}": got [${keys.join(', ')}], expected [${sortedKeys.join(', ')}]`
}

function checkNestedObjects(obj: TranslationObject, path: string): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return checkKeysSortedRecursively(value as TranslationObject, path ? `${path}.${key}` : key)
    }
    return []
  })
}

function checkKeysSortedRecursively(obj: TranslationObject, path = ''): string[] {
  const keys = getKeysAtLevel(obj)
  const sortErrors = isSorted(keys) ? [] : [formatSortError(path, keys)]
  return [...sortErrors, ...checkNestedObjects(obj, path)]
}

describe('i18n translations', () => {
  describe('key consistency', () => {
    it('en.json and es.json have the same keys', () => {
      const enKeys = getAllKeys(en as TranslationObject).sort()
      const esKeys = getAllKeys(es as TranslationObject).sort()

      expect(enKeys).toEqual(esKeys)
    })

    it('en.json has no keys missing from es.json', () => {
      const enKeys = new Set(getAllKeys(en as TranslationObject))
      const esKeys = new Set(getAllKeys(es as TranslationObject))

      const missingInEs = [...enKeys].filter((key) => !esKeys.has(key))
      expect(missingInEs).toEqual([])
    })

    it('es.json has no keys missing from en.json', () => {
      const enKeys = new Set(getAllKeys(en as TranslationObject))
      const esKeys = new Set(getAllKeys(es as TranslationObject))

      const missingInEn = [...esKeys].filter((key) => !enKeys.has(key))
      expect(missingInEn).toEqual([])
    })
  })

  describe('key sorting', () => {
    it('en.json keys are sorted alphabetically at all levels', () => {
      const errors = checkKeysSortedRecursively(en as TranslationObject)
      expect(errors).toEqual([])
    })

    it('es.json keys are sorted alphabetically at all levels', () => {
      const errors = checkKeysSortedRecursively(es as TranslationObject)
      expect(errors).toEqual([])
    })
  })

  describe('structure validation', () => {
    it('both files have the same structure depth', () => {
      const enKeys = getAllKeys(en as TranslationObject)
      const esKeys = getAllKeys(es as TranslationObject)

      const enMaxDepth = Math.max(...enKeys.map((k) => k.split('.').length))
      const esMaxDepth = Math.max(...esKeys.map((k) => k.split('.').length))

      expect(enMaxDepth).toBe(esMaxDepth)
    })

    it('both files have the same number of translation keys', () => {
      const enKeys = getAllKeys(en as TranslationObject)
      const esKeys = getAllKeys(es as TranslationObject)

      expect(enKeys.length).toBe(esKeys.length)
    })
  })
})
