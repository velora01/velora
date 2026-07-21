const Container = ({ children, className = "" }) => {
  return (
    <div className={`max-w-7xl mx-auto px-5 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

export default Container;