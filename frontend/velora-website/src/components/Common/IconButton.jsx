const IconButton = ({
  children,
  icon,
  type = "button",
  className = "",
}) => {
  return (
    <button
      type={type}
      className={`flex items-center gap-2 bg-black text-white px-5 py-3 rounded-lg hover:bg-gray-800 transition ${className}`}
    >
      {children}
      {icon}
    </button>
  );
};

export default IconButton;