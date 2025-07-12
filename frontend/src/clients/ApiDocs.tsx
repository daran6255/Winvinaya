import { useEffect, useState } from 'react';
import { RedocStandalone } from 'redoc';
import yaml from 'js-yaml';

const ApiDocs = () => {
  const [spec, setSpec] = useState<unknown>(null);

  useEffect(() => {
    // Load YAML file directly
    const fetchSwagger = async () => {
      try {
        const response = await fetch('/swagger.yaml'); // Correct path to the public folder
        const text = await response.text(); // Fetch as text
        const json = yaml.load(text); // Convert YAML to JSON
        setSpec(json);
      } catch (error) {
        console.error('Error loading Swagger YAML:', error);
      }
    };

    fetchSwagger();
  }, []);

  if (!spec) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ height: '100vh' }}>
      <RedocStandalone spec={spec} />
    </div>
  );
};

export default ApiDocs;
