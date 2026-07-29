const OutlineButton = ({
  children,
  type = "button",
  onClick,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 ${className}`}
    >
      {children}
    </button>
  );
};

export default OutlineButton;