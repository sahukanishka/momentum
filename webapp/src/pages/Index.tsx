import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Redirect to app root since we're handling everything in App.tsx
    window.location.href = "/";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Redirecting to Momentum...</h1>
      </div>
    </div>
  );
};

export default Index;
