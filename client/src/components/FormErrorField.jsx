

const FormErrorField = ({ error }) => {
  if (!error) return null;
  return (
    <p className="text-red-500 text-xs mt-1 font-medium" role="alert">
      {error}
    </p>
  );
};

export default FormErrorField;
