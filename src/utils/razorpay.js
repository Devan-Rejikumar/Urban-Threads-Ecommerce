export const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () =>
        console.log('Razorpay SDK loaded successfully');
        resolve(true);
      script.onerror = () =>
        console.error('Failed to load Razorpay SDK');
        resolve(false);
      document.body.appendChild(script);
    });
  };