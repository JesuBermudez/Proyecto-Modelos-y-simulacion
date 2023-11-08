import "./card.css";

export default function Card({ banner, image, name, about, message, mail }) {
  return (
    <div className="container">
      <div
        className="cover-photo"
        style={{
          background: `url(${banner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <img src={image} className="profile" />
      </div>
      <div className="profile-name">{name}</div>
      <p className="about">{about}</p>
      <button
        className="msg-btn"
        onClick={() => window.open(`${message}`, "_blank")}
      >
        Whatsapp
      </button>
      <button
        className="follow-btn"
        onClick={() =>
          window.open(
            `mailto:${mail}?Subject=Monitor%20financiero%20web`,
            "_blank"
          )
        }
      >
        Email
      </button>
    </div>
  );
}
