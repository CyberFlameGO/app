export const IconComponent = ({
  children,
  size = 20,
  paddingTop = 0,
}: {
  children: React.ReactNode;
  size?: number;
  paddingTop?: number;
}) => {
  return (
    <span className="svg-icon" style={{width: size, height: size, paddingTop}}>
      {children}
    </span>
  );
};
