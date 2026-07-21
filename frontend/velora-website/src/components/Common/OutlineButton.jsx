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
      className={`border border-[#A67C52] text-[#A67C52] hover:bg-[#A67C52] hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 ${className}`}
    >
      {children}
    </button>
  );
};

export default OutlineButton;