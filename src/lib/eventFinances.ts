import type { CateringEvent } from "@/store/events";

export function eventIngredientCost(event: CateringEvent): number {
  return (event.ingredients ?? []).reduce((sum, line) => sum + line.price, 0);
}

export function eventEmployeeToPay(event: CateringEvent): number {
  return (event.employees ?? []).reduce((sum, line) => sum + line.toPay, 0);
}

export function eventEmployeePaid(event: CateringEvent): number {
  return (event.employees ?? []).reduce((sum, line) => sum + line.paid, 0);
}

export function eventEmployeePending(event: CateringEvent): number {
  return eventEmployeeToPay(event) - eventEmployeePaid(event);
}

export function eventRentalCost(event: CateringEvent): number {
  return (event.utensils ?? []).reduce(
    (sum, line) => sum + line.qty * line.rentalPrice,
    0
  );
}

export function eventTotalCost(event: CateringEvent): number {
  return (
    eventIngredientCost(event) +
    eventEmployeeToPay(event) +
    eventRentalCost(event)
  );
}

export function eventEarnings(event: CateringEvent): number {
  return (event.totalQuoted ?? 0) - eventTotalCost(event);
}

export function clientPendingAmount(event: CateringEvent): number {
  return event.clientPaymentStatus === "pending" || event.clientPaymentStatus === "partial"
    ? event.totalQuoted ?? 0
    : 0;
}