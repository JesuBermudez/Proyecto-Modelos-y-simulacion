import "./companyCard.css";
import { BsArrowDownShort, BsArrowUpShort } from "react-icons/bs";

export function CompanyCard({ company, onTap }) {
  const date = new Date(`
    ${company.data.hour
      .split("/")
      .reverse()
      .join("/")}/${new Date().getFullYear()}`);

  return (
    <article className="company-card" onClick={() => onTap()}>
      <div
        className="icon-container"
        style={{
          color: company.data.percentVar[0] != "-" ? "#137333" : "#a50e0e",
          background:
            company.data.percentVar[0] != "-"
              ? "rgba(47, 205, 47, 0.17)"
              : "rgba(205, 47, 47, 0.17)",
        }}
      >
        {company.data.percentVar[0] != "-" ? (
          <BsArrowUpShort className="company-icon" />
        ) : (
          <BsArrowDownShort className="company-icon" />
        )}
      </div>
      <div className="info">
        <h3 className="name">{company.name}</h3>
        <p className="price">${company.data.last}</p>
      </div>
      <div className="date-change">
        <p className="date">
          {date.toLocaleDateString(undefined, { timeZone: "UTC" })}
        </p>
        <p
          className="change"
          style={{
            color: company.data.percentVar[0] != "-" ? "#137333" : "#a50e0e",
          }}
        >
          {company.data.percentVar}
        </p>
      </div>
    </article>
  );
}
