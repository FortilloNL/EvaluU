export default function DomainCard({ domain, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? domain.bgLight : "#FAFAF8",
        border: isSelected ? `2px solid ${domain.color}` : "2px solid transparent",
        borderRadius: 16,
        padding: "20px 22px",
        cursor: "pointer",
        transition: "all 0.3s ease",
        transform: isSelected ? "scale(1.02)" : "scale(1)",
        boxShadow: isSelected
          ? `0 8px 24px ${domain.color}22`
          : "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 24,
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            background: isSelected ? domain.color : "#E8E6E2",
            color: isSelected ? "#fff" : "#666",
            transition: "all 0.3s ease",
            fontWeight: 600,
          }}
        >
          {domain.icon}
        </span>
        <div>
          <div
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 17,
              fontWeight: 600,
              color: "#2A2A28",
              lineHeight: 1.2,
            }}
          >
            {domain.title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#888",
              marginTop: 2,
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            {domain.description}
          </div>
        </div>
      </div>
    </div>
  );
}
