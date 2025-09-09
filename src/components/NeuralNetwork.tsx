import React from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import type { CompareResult } from '../api';

const Node = ({ label, value, color, details }: { label: string; value?: string; color?: string; details?: React.ReactNode }) => (
  <Tooltip title={details} placement="top" arrow>
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 16px' }}>
      <Paper
        elevation={3}
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: color || 'primary.main',
          color: 'white',
          textAlign: 'center',
          p: 1,
          cursor: 'pointer',
        }}
      >
        <Typography variant="caption" sx={{ lineHeight: 1.1 }}>{label}</Typography>
        {value && <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{value}</Typography>}
      </Paper>
    </Box>
  </Tooltip>
);

const Layer = ({ children, sx }: { children: React.ReactNode, sx?: object }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', ...sx }}>
    {children}
  </Box>
);

const Connections = () => (
  <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}>
    {/* Connections from Input to Hidden */}
    <line x1="35%" y1="50" x2="50%" y2="150" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="2" />
    <line x1="65%" y1="50" x2="50%" y2="150" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="2" />
    <line x1="35%" y1="50" x2="50%" y2="250" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="2" />
    <line x1="65%" y1="50" x2="50%" y2="250" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="2" />

    {/* Connections from Hidden to Output */}
    <line x1="50%" y1="150" x2="50%" y2="350" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="2" />
    <line x1="50%" y1="250" x2="50%" y2="350" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="2" />
  </svg>
);

export const NeuralNetwork: React.FC<CompareResult> = (props) => {
  const {
    doc1TextContentLength,
    doc2TextContentLength,
    doc1TokensLength,
    doc2TokensLength,
    doc1ShinglesLength,
    doc2ShinglesLength,
    jaccard,
    cosine,
    nearDuplicatePercent,
    topicSimilarityPercent,
    finalPercent,
  } = props;

  if (!jaccard || !cosine) {
    return null;
  }

  const docADetails = (
    <React.Fragment>
      <Typography color="inherit">Documento A</Typography>
      <b>Text Length:</b> {doc1TextContentLength}<br />
      <b>Tokens:</b> {doc1TokensLength}<br />
      <b>Shingles:</b> {doc1ShinglesLength}
    </React.Fragment>
  );

  const docBDetails = (
    <React.Fragment>
      <Typography color="inherit">Documento B</Typography>
      <b>Text Length:</b> {doc2TextContentLength}<br />
      <b>Tokens:</b> {doc2TokensLength}<br />
      <b>Shingles:</b> {doc2ShinglesLength}
    </React.Fragment>
  );

  const jaccardDetails = (
    <React.Fragment>
      <Typography color="inherit">Jaccard Similarity</Typography>
      <b>Intersection:</b> {jaccard.intersection}<br />
      <b>Union:</b> {jaccard.union}<br />
      <b>Score:</b> {jaccard.score.toFixed(6)}
    </React.Fragment>
  );

  const cosineDetails = (
    <React.Fragment>
      <Typography color="inherit">Cosine Similarity (TF-IDF)</Typography>
      <b>Dot Product:</b> {cosine.dot.toFixed(2)}<br />
      <b>Vector Norm A:</b> {cosine.na2.toFixed(2)}<br />
      <b>Vector Norm B:</b> {cosine.nb2.toFixed(2)}<br />
      <b>Score:</b> {cosine.score.toFixed(6)}
    </React.Fragment>
  );

  return (
    <Box sx={{ position: 'relative', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', p: 2 }}>
      <Connections />
      <Layer sx={{ mb: 4 }}>
        <Node label="Documento A" details={docADetails} />
        <Node label="Documento B" details={docBDetails} />
      </Layer>
      <Layer sx={{ my: 4 }}>
        <Node label="Casi Duplicado" value={`${nearDuplicatePercent.toFixed(2)}%`} color="secondary.main" details={jaccardDetails} />
        <Node label="Tópico" value={`${topicSimilarityPercent.toFixed(2)}%`} color="secondary.main" details={cosineDetails} />
      </Layer>
      <Layer sx={{ mt: 4 }}>
        <Node label="Final" value={`${finalPercent.toFixed(2)}%`} color="success.main" />
      </Layer>
    </Box>
  );
};
