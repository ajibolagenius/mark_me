import { useRef } from 'react';
import { T } from '../constants/tokens';
import { S } from '../constants/styles';

export function Field({ label, type = "text", icon, rightIcon, onRightClick, id: propId, ...props }) {
  const autoId = useRef(`field-${Math.random().toString(36).slice(2,7)}`).current;
  const fieldId = propId || autoId;
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label htmlFor={fieldId} style={{ display:"block", fontSize:11, fontWeight:600, color:T.textMuted, marginBottom:6, fontFamily:T.font, textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</label>}
      <div style={{ position:"relative" }}>
        {icon && <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.textMuted, display:"flex" }} aria-hidden="true">{icon}</div>}
        <input id={fieldId} type={type} aria-label={label || props.placeholder} {...props} style={{ ...S.input, paddingLeft: icon ? 38 : 14, paddingRight: rightIcon ? 38 : 14, ...(props.style||{}) }}
          onFocus={e=>e.target.style.borderColor=T.primary} onBlur={e=>e.target.style.borderColor=T.border} />
        {rightIcon && <button onClick={onRightClick} type="button" aria-label={type==="password"?"Show password":"Toggle visibility"} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:T.textMuted, cursor:"pointer", display:"flex", padding:4 }}>{rightIcon}</button>}
      </div>
    </div>
  );
}
