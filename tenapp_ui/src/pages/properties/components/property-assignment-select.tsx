import { useEffect, useRef, useState } from 'react'
import AsyncSelect from 'react-select/async'
import { type SingleValue } from 'react-select'
import { propertyService } from '../services/property.service.ts'
import type { PropertySelect } from '../services/property-select.interfaces.ts'

interface PropertyAssignmentSelectProps {
  id: string
  value: string | null | undefined
  onChange: (propertyId: string | null) => void
}

const propertyResultLimit = 50

interface PropertyOption {
  value: string
  label: string
}

const toPropertyOption = (property: PropertySelect): PropertyOption => ({
  value: property.id,
  label: property.name,
})

export function PropertyAssignmentSelect({ id, value, onChange }: PropertyAssignmentSelectProps) {
  const [selectedOption, setSelectedOption] = useState<PropertyOption | null>(null)
  const searchControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!value || selectedOption?.value === value) {
      return
    }

    const controller = new AbortController()

    void propertyService
      .getForSelect(
        {
          limit: 1,
          selectedPropertyId: value,
        },
        controller.signal,
      )
      .then((properties) => {
        if (controller.signal.aborted) {
          return
        }

        const selectedProperty = properties.find((property) => property.id === value)
        setSelectedOption(selectedProperty ? toPropertyOption(selectedProperty) : null)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        console.error('Failed to load selected property:', error)
        setSelectedOption(null)
      })

    return () => {
      controller.abort()
    }
  }, [selectedOption?.value, value])

  useEffect(() => {
    return () => {
      searchControllerRef.current?.abort()
    }
  }, [])

  const loadOptions = async (inputValue: string): Promise<PropertyOption[]> => {
    searchControllerRef.current?.abort()

    const controller = new AbortController()
    searchControllerRef.current = controller

    try {
      const properties = await propertyService.getForSelect(
        {
          search: inputValue.trim(),
          limit: propertyResultLimit,
          selectedPropertyId: value,
        },
        controller.signal,
      )

      if (controller.signal.aborted) {
        return []
      }

      return properties.map(toPropertyOption)
    } catch (error: unknown) {
      if (controller.signal.aborted) {
        return []
      }

      throw error
    }
  }

  const handleChange = (option: SingleValue<PropertyOption>) => {
    setSelectedOption(option)
    onChange(option?.value ?? null)
  }

  const selectValue = value ? selectedOption : null

  return (
    <div className="w-100">
      <AsyncSelect<PropertyOption, false>
        inputId={id}
        cacheOptions
        defaultOptions
        isClearable
        loadOptions={loadOptions}
        name="propertyId"
        noOptionsMessage={({ inputValue }) =>
          inputValue ? 'No properties match this search.' : 'No properties found.'
        }
        onChange={handleChange}
        placeholder="Search properties"
        value={selectValue}
      />
      <div className="form-text">
        Search by name or address. Results are limited to {propertyResultLimit} properties.
      </div>
    </div>
  )
}
