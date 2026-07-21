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
      className={`bg-[#A67C52] hover:bg-[#8b6542] text-black-300 
        px-6 py-3 rounded-lg font-medium transition-all 
        duration-300 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;