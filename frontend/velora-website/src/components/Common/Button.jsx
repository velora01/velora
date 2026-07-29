const Button = ({
  children,
  type = "button",
  onClick,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-[#C9A227] hover:bg-[#A8861C] text-white 
        px-6 py-3 rounded-lg font-medium transition-all 
        duration-300 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;