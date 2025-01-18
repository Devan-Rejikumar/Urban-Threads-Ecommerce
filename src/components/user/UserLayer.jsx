import React from "react";
import Header from '../user/Header.jsx';
import Footer from '../user/Footer.jsx';

const UserLayout = ({ children }) => {
    const layoutStyle = {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    };
  
    const mainStyle = {
      flexGrow: 1,
    };
  
    return (
      <div style={layoutStyle}>
        <Header />
        <main style={mainStyle}>{children}</main>
        <Footer />
      </div>
    );
  };
  
  export default UserLayout;