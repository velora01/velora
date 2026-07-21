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
      className={`w-full border rounded-lg px-4 py-3 outline-none focus:border-[#A67C52] ${className}`}
      {...props}
    />
  );
};

export default TextArea;