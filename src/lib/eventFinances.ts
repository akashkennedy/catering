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

export function eventTotalAmount(event: CateringEvent): number {
  return event.totalAmount ?? 0;
}

export function eventBalance(event: CateringEvent): number {
  return eventTotalAmount(event) - (event.advancePaid ?? 0);
}

export function eventEarnings(event: CateringEvent): number {
  return eventTotalAmount(event) - eventTotalCost(event);
}

export function clientPendingAmount(event: CateringEvent): number {
  return event.status === "paid" ? 0 : eventBalance(event);
}