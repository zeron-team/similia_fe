import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Typography, Box, Button, Card, CardContent, Slider, Paper } from '@mui/material';
import type { Document } from '../api';
import { SimilarityGauge } from './SimilarityGauge';

interface CompareResult {
  nearDuplicatePercent: number;
  topicSimilarityPercent: number;
  finalPercent: number;
}

interface ComparisonGraphProps {
  allResults: { doc1: Document; doc2: Document; result: CompareResult }[];
}

// Function to get contrasting text color
function getContrastYIQ(hexcolor: string){
    hexcolor = hexcolor.replace("#", "");
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
}

const Legend = () => (
  <Paper elevation={3} sx={{ p: 2, position: 'absolute', bottom: 16, right: 16, zIndex: 1, backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
    <Typography variant="subtitle2" gutterBottom>Leyenda de Similitud</Typography>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#4caf50', mr: 1 }} />
      <Typography variant="body2"> &gt; 90%</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#ffeb3b', mr: 1 }} />
      <Typography variant="body2"> &gt; 70%</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#ffa500', mr: 1 }} />
      <Typography variant="body2"> &gt; 40%</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: 20, height: 20, backgroundColor: '#f44336', mr: 1 }} />
      <Typography variant="body2"> &lt;= 40%</Typography>
    </Box>
  </Paper>
);

export default function ComparisonGraph({ allResults }: ComparisonGraphProps) {
  const graphRef = useRef();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [selectedNodeComparisons, setSelectedNodeComparisons] = useState<{ doc1: Document; doc2: Document; result: CompareResult }[]>([]);
  const [similarityThreshold, setSimilarityThreshold] = useState(40);
  const [graphDimensions, setGraphDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setGraphDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nodes: any[] = [];
  const links: any[] = [];
  const nodeMap = new Map<string, any>();

  allResults.forEach(item => {
    if (!nodeMap.has(item.doc1.id)) {
      nodeMap.set(item.doc1.id, { id: item.doc1.id, name: item.doc1.filename });
      nodes.push(nodeMap.get(item.doc1.id));
    }
    if (!nodeMap.has(item.doc2.id)) {
      nodeMap.set(item.doc2.id, { id: item.doc2.id, name: item.doc2.filename });
      nodes.push(nodeMap.get(item.doc2.id));
    }

    links.push({
      source: item.doc1.id,
      target: item.doc2.id,
      value: item.result.finalPercent,
      color: item.result.finalPercent > 90 ? '#4caf50' : (item.result.finalPercent > 70 ? '#ffeb3b' : (item.result.finalPercent > 40 ? '#ffa500' : '#f44336')),
      label: `Similitud: ${item.result.finalPercent.toFixed(2)}%`,
    });
  });

  const uniqueLinks = Array.from(new Map(links.map(link => [
    [link.source, link.target].sort().join(), link
  ])).values()).filter(link => link.value >= similarityThreshold);

  const data = { nodes, links: uniqueLinks };

  useEffect(() => {
    if (graphRef.current) {
      // You can access the force-graph instance here if needed for more control
      // For example: graphRef.current.d3Force('charge').strength(-100);
    }
  }, []);

  const handleNodeClick = (node: any) => {
    const comparisons = allResults.filter(r => (r.doc1.id === node.id || r.doc2.id === node.id) && r.result.finalPercent >= similarityThreshold);
    setSelectedNode(node);
    setSelectedNodeComparisons(comparisons);
  };

  const clearSelection = () => {
    setSelectedNode(null);
    setSelectedNodeComparisons([]);
  };

  return (
    <Box sx={{ display: 'flex', width: '100%', mt: 4, flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Typography gutterBottom>Umbral de similitud</Typography>
        <Slider
          value={similarityThreshold}
          onChange={(e, newValue) => setSimilarityThreshold(newValue as number)}
          aria-labelledby="similarity-threshold-slider"
          valueLabelDisplay="auto"
          step={10}
          marks
          min={0}
          max={100}
        />
      </Box>
      <Box sx={{ display: 'flex', width: '100%', position: 'relative' }}>
        <Box ref={containerRef} sx={{ flex: 1, height: '500px', border: '1px solid #ccc', borderRadius: '4px' }}>
          {nodes.length > 0 ? (
            <ForceGraph2D
              ref={graphRef}
              width={graphDimensions.width}
              height={graphDimensions.height}
              graphData={data}
              nodeLabel="name"
              nodeVal={8}
              linkWidth={link => link.value / 15}
              linkDirectionalParticles={link => link.value > 70 ? 2 : 0}
              linkDirectionalParticleWidth={4}
              linkDirectionalParticleSpeed={link => link.value * 0.001}
              linkCurvature={0.25}
              linkColor="color"
              onNodeClick={handleNodeClick}
              linkCanvasObjectMode={() => 'after'}
              linkCanvasObject={(link, ctx, globalScale) => {
                const start = link.source;
                const end = link.target;
                if (typeof start !== 'object' || typeof end !== 'object') return;

                const text = link.label;
                const textPos = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };

                ctx.font = `${12 / globalScale}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillText(text, textPos.x, textPos.y);
              }}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = node.name;
                const fontSize = 14 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;

                const nodeColor = selectedNode && node.id === selectedNode.id ? '#add8e6' : '#666';
                const textColor = getContrastYIQ(nodeColor);

                ctx.fillStyle = nodeColor;
                ctx.beginPath();
                ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
                ctx.fill();

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = textColor;
                ctx.fillText(label, node.x, node.y + 18);
              }}
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography variant="h6" color="text.secondary">
                No hay resultados para mostrar el grafo.
              </Typography>
            </Box>
          )}
        </Box>
        <Legend />
        {selectedNode && (
          <Box sx={{ width: '300px', ml: 2, border: '1px solid #ccc', borderRadius: '4px', p: 2, overflowY: 'auto', height: '500px' }}>
            <Typography variant="h6">{selectedNode.name}</Typography>
            <Button onClick={clearSelection} size="small">Limpiar selección</Button>
            {selectedNodeComparisons.map((item, index) => {
              const otherDoc = item.doc1.id === selectedNode.id ? item.doc2 : item.doc1;
              return (
                <Card key={index} variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1">vs {otherDoc.filename}</Typography>
                    <SimilarityGauge value={item.result.nearDuplicatePercent} label="Casi Duplicado" size="small" />
                    <SimilarityGauge value={item.result.topicSimilarityPercent} label="Tópico" size="small" />
                    <SimilarityGauge value={item.result.finalPercent} label="Final" size="small" />
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
