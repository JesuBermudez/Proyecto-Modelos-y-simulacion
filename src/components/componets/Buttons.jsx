import "./button.css";

export function SectionButton({ text, onTap, className = "" }) {
    return <button className={`secction-button ${className}`} onClick={() => onTap()}>
        {text}
    </button>
}

export function HorizontalButton({ text, onTap, className = "" }) {
    return <button className={`horizontal-button ${className}`} onClick={() => onTap()} >
        <span>{text}</span>
    </button>
}