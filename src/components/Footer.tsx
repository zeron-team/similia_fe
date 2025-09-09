import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}{' '}
          powered by <Link href="https://zeron.com.ar" target="_blank" rel="noopener">zeron</Link> - SimilIA
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
