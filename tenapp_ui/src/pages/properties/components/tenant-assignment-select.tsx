import { useEffect, useRef, useState } from 'react'
import AsyncSelect from 'react-select/async'
import { type SingleValue } from 'react-select'
import { tenantService, type TenantSelect } from '../../../services/tenants/tenant.service.ts'

interface TenantAssignmentSelectProps {
  id: string
  value: string | null | undefined
  onChange: (tenantId: string | null) => void
}

const tenantResultLimit = 50

interface TenantOption {
  value: string
  label: string
}

const toTenantOption = (tenant: TenantSelect): TenantOption => ({
  value: tenant.id,
  label: tenant.name,
})

export function TenantAssignmentSelect({ id, value, onChange }: TenantAssignmentSelectProps) {
  const [selectedOption, setSelectedOption] = useState<TenantOption | null>(null)
  const searchControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!value || selectedOption?.value === value) {
      return
    }

    const controller = new AbortController()

    void tenantService
      .getForSelect(
        {
          limit: 1,
          selectedTenantId: value,
        },
        controller.signal,
      )
      .then((tenants) => {
        if (controller.signal.aborted) {
          return
        }

        const selectedTenant = tenants.find((tenant) => tenant.id === value)
        setSelectedOption(selectedTenant ? toTenantOption(selectedTenant) : null)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        console.error('Failed to load selected tenant:', error)
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

  const loadOptions = async (inputValue: string): Promise<TenantOption[]> => {
    searchControllerRef.current?.abort()

    const controller = new AbortController()
    searchControllerRef.current = controller

    try {
      const tenants = await tenantService.getForSelect(
        {
          search: inputValue.trim(),
          limit: tenantResultLimit,
          selectedTenantId: value,
        },
        controller.signal,
      )

      if (controller.signal.aborted) {
        return []
      }

      return tenants.map(toTenantOption)
    } catch (error: unknown) {
      if (controller.signal.aborted) {
        return []
      }

      throw error
    }
  }

  const handleChange = (option: SingleValue<TenantOption>) => {
    setSelectedOption(option)
    onChange(option?.value ?? null)
  }

  const selectValue = value ? selectedOption : null

  return (
    <div className="w-100">
      <AsyncSelect<TenantOption, false>
        inputId={id}
        cacheOptions
        defaultOptions
        isClearable
        loadOptions={loadOptions}
        name="tenantId"
        noOptionsMessage={({ inputValue }) =>
          inputValue ? 'No tenants match this search.' : 'No tenants found.'
        }
        onChange={handleChange}
        placeholder="Search tenants"
        value={selectValue}
      />
      <div className="form-text">
        Search by name or email. Results are limited to {tenantResultLimit} tenants.
      </div>
    </div>
  )
}
