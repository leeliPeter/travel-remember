import { NavBar } from "./_components/navbar";
interface ProtectedLayOutProps {
  children: React.ReactNode;
}

const ProtectedLayOut = ({ children }: ProtectedLayOutProps) => {
  return (
    <div className="h-screen w-full flex flex-col gap-y-10 items-center justify-center bg-sky-300">
      <NavBar />
      {children}
    </div>
  );
};

export default ProtectedLayOut; // Ensure default export
