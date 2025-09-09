import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import type { CompareResult } from '../api';

export const ComparisonDetailsViewer: React.FC<{ result: CompareResult }> = ({ result }) => {
  if (!result) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Detalles de la Comparación
      </Typography>
      <Box sx={{ fontFamily: 'monospace' }}>
        <Typography>Doc1 TextContent length: {result.doc1TextContentLength}, Doc2 TextContent length: {result.doc2TextContentLength}</Typography>
        <Typography>Doc1 tokens length: {result.doc1TokensLength}, Doc2 tokens length: {result.doc2TokensLength}</Typography>
        <Typography>Doc1 shingles length: {result.doc1ShinglesLength}, Doc2 shingles length: {result.doc2ShinglesLength}</Typography>
        <Typography>Jaccard: intersection={result.jaccard.intersection}, union={result.jaccard.union}, score={result.jaccard.score.toFixed(6)}</Typography>
        <Typography>CosineTFIDF: dot={result.cosine.dot.toFixed(6)}, na2={result.cosine.na2.toFixed(6)}, nb2={result.cosine.nb2.toFixed(6)}, score={result.cosine.score.toFixed(6)}</Typography>
        <Typography>Near: {result.nearDuplicate.toFixed(6)}, Topic: {result.topicSimilarity.toFixed(6)}, Final: {result.final.toFixed(6)}</Typography>
        <Typography>Found {result.matchingSegments ? result.matchingSegments.length : 0} matching segments</Typography>
      </Box>
    </Paper>
  );
};