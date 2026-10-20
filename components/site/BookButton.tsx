"use client";

import Arrow from "./Arrow";
import { useBooking, type BookingContext } from "./BookingProvider";

export default function BookButton({
  ctx,
  className = "btn btn-red",
  children = "Book Appointment",
}: {
  ctx?: BookingContext;
  className?: string;
  children?: React.ReactNode;
}) {
  const { open } = useBooking();
  return (
    <button type="button" onClick={() => open(ctx)} className={className}>
      {children} <Arrow />
    </button>
  );
}
