import React from 'react';
import { Box } from '@mui/material';

interface TrafficLightProps {
  value: number;
}

const TrafficLight: React.FC<TrafficLightProps> = ({ value }) => {
  const getColor = (percentage: number) => {
    if (percentage >= 61) {
      return 'red';
    } else if (percentage >= 31) {
      return 'orange';
    } else {
      return 'green';
    }
  };

  const color = getColor(value);

  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        backgroundColor: color,
        border: '1px solid #555',
      }}
    />
  );
};

export default TrafficLight;
