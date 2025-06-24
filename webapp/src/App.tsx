import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AppRoutes } from "./routes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainContext from "./context";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainContext>
        <TooltipProvider>
          <ThemeProvider defaultTheme="light" storageKey="Momentum-theme">
            <Toaster />
            <Sonner />
            <Router>
              <AppRoutes />
            </Router>
          </ThemeProvider>
        </TooltipProvider>
      </MainContext>
    </QueryClientProvider>
  );
}

export default App;
