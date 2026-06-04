import type { Property } from './property.interfaces.ts'

const THREE_MONTHS_FROM_NOW = 3

export interface PropertyStatus {
  className: string
  label: string
}

function isContractExpiringSoon(endDate?: string | null): boolean {
  if (!endDate) {
    return false
  }

  const contractEndDate = new Date(endDate)
  if (Number.isNaN(contractEndDate.getTime())) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expiresBefore = new Date(today)
  expiresBefore.setMonth(expiresBefore.getMonth() + THREE_MONTHS_FROM_NOW)

  return contractEndDate >= today && contractEndDate <= expiresBefore
}

export function getPropertyStatus(property: Property): PropertyStatus {
  if (property.tenantId && isContractExpiringSoon(property.endDate)) {
    return {
      className: 'property-status-dot property-status-dot-expiring',
      label: 'Expiring',
    }
  }

  if (property.tenantId) {
    return {
      className: 'property-status-dot property-status-dot-occupied',
      label: 'Occupied',
    }
  }

  return {
    className: 'property-status-dot property-status-dot-available',
    label: 'Available',
  }
}
