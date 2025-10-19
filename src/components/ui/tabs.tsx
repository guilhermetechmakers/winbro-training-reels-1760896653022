import React from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value?: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value?: string;
  children: React.ReactNode;
  className?: string;
}

export const Tabs = ({ value, onValueChange, className, children }: TabsProps) => {
  return (
    <div className={className}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList = ({ className, children }: TabsListProps) => {
  return (
    <div className={`flex space-x-1 rounded-lg bg-gray-100 p-1 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ children, className }: TabsTriggerProps) => {
  return (
    <button
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${className}`}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ children, className }: TabsContentProps) => {
  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  );
};
