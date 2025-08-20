interface ContainerProps {
  children: React.ReactNode;
}

export function Container({ children }: ContainerProps) {
  return (
    <div className="h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-2 flex flex-col overflow-hidden">
      <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}