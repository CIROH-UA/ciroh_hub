import React, { useEffect } from 'react';

export default function ResourcesRedirect() {
  useEffect(() => {
    // Redirect to the new Community Products page
    window.location.href = '/community_products';
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Redirecting...</h1>
      <p>Taking you to Community Products...</p>
    </div>
  );
}
