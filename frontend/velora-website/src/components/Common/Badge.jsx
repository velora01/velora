const Badge = ({ children }) => {
  return (
    <span className="bg-[#F6F2EC] text-[#A67C52] px-4 py-1 rounded-full text-sm font-medium">
      {children}
    </span>
  );
};

export default Badge;