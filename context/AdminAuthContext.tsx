"use client";

import React, { createContext, useContext } from "react";

const AdminAuthContext = createContext<boolean>(false);

export function AdminAuthProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  return (
    <AdminAuthContext.Provider value={isAdmin}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
