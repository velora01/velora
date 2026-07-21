const CardButton = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

export default CardButton;