import { useEffect } from 'react';

const ErrorThrower = () => {
  useEffect(() => {
    throw new Error('Deliberate error for debugging');
  }, []);

  return null;
};

export default ErrorThrower;
