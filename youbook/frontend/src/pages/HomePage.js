import React from 'react';
import Header from '../components/Header';
import LoginForm from '../components/LoginForm';
import ImageContainer from '../components/ImageContainer';

function HomePage() {
  return (
    <div className="container">
      <ImageContainer />
      <div className="login-container">
        <Header />
        <LoginForm />
      </div>
    </div>
  );
}

export default HomePage;
