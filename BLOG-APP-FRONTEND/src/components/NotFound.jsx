import React from "react";
import { useNavigate } from "react-router";
import Button from "./ui/Button";
import SEO from "./ui/SEO";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-16">
      <SEO 
        title="404 — Story Lost" 
        description="The story or layout you are looking for has been archived, deleted, or relocated."
      />

      {/* TYPOGRAPHY ARCHITECTURE */}
      <h1 className="font-serif text-[120px] sm:text-[160px] font-black leading-none text-accent/10 dark:text-accent/5 tracking-tighter select-none">
        404
      </h1>

      <div className="-mt-6 sm:-mt-10 max-w-md">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-light-primary dark:text-text-dark-primary mb-3">
          This Story is Lost in the Press
        </h2>
        
        <p className="text-sm sm:text-base text-text-light-secondary/80 dark:text-text-dark-secondary/80 mb-8 leading-relaxed font-sans">
          The layout or editorial you are searching for has been archived, deleted, or relocated. Return to the home feed to discover active dispatches.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            variant="primary" 
            onClick={() => navigate("/")}
            className="px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest w-full sm:w-auto cursor-pointer"
          >
            Back to Editorial Feed
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest w-full sm:w-auto cursor-pointer"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
