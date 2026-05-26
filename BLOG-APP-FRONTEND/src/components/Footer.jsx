import React from "react";
import { NavLink } from "react-router";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border-light dark:border-border-dark bg-card-light/20 dark:bg-card-dark/20 mt-20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Footer Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          
          {/* Column 1: Brand & Tagline */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <h3 className="font-serif text-2xl font-bold uppercase tracking-widest text-text-light-primary dark:text-text-dark-primary">
              <span className="text-accent">E</span>ditora
            </h3>
            <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary max-w-sm leading-relaxed">
              Thoughtful essays, independent voices, and elegant reading experiences. Discover ideas worth sharing on the web's premium magazine platform.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent">
              Platform
            </h4>
            <ul className="flex flex-col gap-2">
              <li>
                <NavLink to="/" className="text-sm text-text-light-secondary hover:text-accent dark:text-text-dark-secondary dark:hover:text-accent transition-colors">
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" className="text-sm text-text-light-secondary hover:text-accent dark:text-text-dark-secondary dark:hover:text-accent transition-colors">
                  Register
                </NavLink>
              </li>
              <li>
                <NavLink to="/login" className="text-sm text-text-light-secondary hover:text-accent dark:text-text-dark-secondary dark:hover:text-accent transition-colors">
                  Login
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact/About */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent">
              Topics
            </h4>
            <ul className="flex flex-col gap-2">
              <li className="text-sm text-text-light-secondary/80 dark:text-text-dark-secondary/80">
                Technology
              </li>
              <li className="text-sm text-text-light-secondary/80 dark:text-text-dark-secondary/80">
                Programming
              </li>
              <li className="text-sm text-text-light-secondary/80 dark:text-text-dark-secondary/80">
                Artificial Intelligence
              </li>
              <li className="text-sm text-text-light-secondary/80 dark:text-text-dark-secondary/80">
                Web Development
              </li>
            </ul>
          </div>
          
        </div>

        {/* Divider */}
        <div className="border-t border-border-light dark:border-border-dark pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-text-light-secondary/50 dark:text-text-dark-secondary/50">
            &copy; {currentYear} Editora Inc. All rights reserved.
          </p>
          <p className="text-xs text-text-light-secondary/50 dark:text-text-dark-secondary/50 flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;