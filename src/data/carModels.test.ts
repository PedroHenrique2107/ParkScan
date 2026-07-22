import { describe, expect, it } from 'vitest'
import { CAR_MODEL_OPTIONS, VEHICLE_MODELS, normalizeVehicleModelSearch } from './carModels'

describe('vehicle model catalog', () => {
  it('contains a broad catalog without duplicate persisted values', () => {
    const values = CAR_MODEL_OPTIONS.map(({ value }) => value)

    expect(values.length).toBeGreaterThan(400)
    expect(new Set(values).size).toBe(values.length)
  })

  it('contains only complete brand and model records', () => {
    expect(VEHICLE_MODELS.every(({ brand, model }) => brand.trim() && model.trim())).toBe(true)
  })

  it('normalizes accents, case and repeated whitespace', () => {
    expect(normalizeVehicleModelSearch('  CITROËN   C4  ')).toBe('citroen c4')
  })

  it('indexes brand, model and aliases', () => {
    const haval = CAR_MODEL_OPTIONS.find(({ value }) => value === 'GWM Haval H6')

    expect(haval?.searchText).toContain('gwm')
    expect(haval?.searchText).toContain('haval h6')
    expect(haval?.searchText).toContain('h6')
  })
})
