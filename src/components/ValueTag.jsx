export default function ValueTag({ label, type, color }) {
  const isAuthentic = type === "authentic";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "6px 14px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 500,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: isAuthentic ? `${color}18` : "#F5F0EC",
        color: isAuthentic ? color : "#8A7A6A",
        border: isAuthentic ? `1.5px solid ${color}44` : "1.5px solid #DDD5CC",
        transition: "all 0.2s ease",
      }}
    >
      {label}
    </span>
  );
}
