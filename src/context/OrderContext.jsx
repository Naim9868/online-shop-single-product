'use client';
import { createContext, useContext, useState } from "react";

const OrderContext = createContext();

export function OrderDataProvider({ value, children }) {
    
    const [orderData, setOrderData] = useState({});

  return (
    <OrderContext.Provider value={{orderData, setOrderData}}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrderData() {
  return useContext(OrderContext);
}