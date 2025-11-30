export function StaffLines() {
  return (
    <div className="staff-lines">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="staff-line" />
      ))}
    </div>
  )
}
