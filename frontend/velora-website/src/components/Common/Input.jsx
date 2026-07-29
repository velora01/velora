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
      className={`w-full border rounded-lg px-4 py-3 outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition ${className}`}
      {...props}
    />
  );
};

export default Input;