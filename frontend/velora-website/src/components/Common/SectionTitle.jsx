const SectionTitle = ({ title, subtitle }) => {
  return (
    <div className="text-center mb-14">
      <h2 className="text-4xl font-bold">{title}</h2>

      <p className="text-gray-500 mt-3 max-w-xl mx-auto">
        {subtitle}
      </p>
    </div>
  );
};

export default SectionTitle;