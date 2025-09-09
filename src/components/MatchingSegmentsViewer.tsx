import React from 'react';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { MatchingSegment } from '../api';

interface MatchingSegmentsViewerProps {
  segments: MatchingSegment[];
}

export default function MatchingSegmentsViewer({ segments }: MatchingSegmentsViewerProps) {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" component="h3" gutterBottom>
        Segmentos Coincidentes
      </Typography>
      {segments.length > 0 ? (
        segments.map((segment, index) => (
          <Accordion key={index} sx={{ mb: 1 }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
            >
              <Typography variant="subtitle1">Similitud: {(segment.score * 100).toFixed(2)}%</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Documento A:</Typography>
                <Typography variant="body2">{segment.textA}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Documento B:</Typography>
                <Typography variant="body2">{segment.textB}</Typography>
              </Paper>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography variant="body1" color="text.secondary">
          No se encontraron segmentos coincidentes significativos.
        </Typography>
      )}
    </Box>
  );
}
