const TextArea = ({
  rows = 5,
  placeholder,
  className = "",
  ...props
}) => {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      className={`w-full border rounded-lg px-4 py-3 outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition ${className}`}
      {...props}
    />
  );
};

export default TextArea;