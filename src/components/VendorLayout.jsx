import React from 'react';
import { Outlet } from 'react-router-dom';
import VendorNavbar from './VendorNavbar';

const VendorLayout = () => {
  return (
    <>
      <VendorNavbar />
      <Outlet />
    </>
  );
};

export default VendorLayout; 