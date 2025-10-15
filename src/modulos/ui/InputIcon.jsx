// InputIcon: Campo de formulario con ícono a la izquierda
// - Usa sólo clases Bootstrap y props para configurar el input
// - Ideal para credenciales (usuario/contraseña) u otros campos con ícono

function InputIcon({
  icon, // React node (ej. <User size={18} />)
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  inputClassName = '',
  containerClassName = '',
  style = {},
  inputStyle = {},
}) {
  return (
    <div className={`d-flex align-items-center gap-2 ${containerClassName}`} style={style}>
      <span className="text-white-50 d-flex align-items-center">{icon}</span>
      <input
        type={type}
        className={`form-control rounded-3 text-white ${inputClassName}`}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        style={{ borderColor: 'rgba(255,255,255,.45)', backgroundColor: 'transparent', boxShadow: 'none', ...inputStyle }}
      />
    </div>
  );
}

export default InputIcon;
