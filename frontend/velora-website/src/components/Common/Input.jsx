const Input = ({
  type = "text",
  placeholder,
  className = "",
  ...props
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full border rounded-lg px-4 py-3 outline-none focus:border-[#A67C52] ${className}`}
      {...props}
    />
  );
};

export default Input;